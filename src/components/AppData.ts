import _ from "lodash";

import { FormErrors, IAppData, IContactsForm, IOrder, IOrderForm, IProduct } from "../types";
import { Model } from "./base/model";

export class AppData extends Model<IAppData> {
  catalog: IProduct[];
  preview: string | null;
  loading: boolean;
  order: IOrder = {
    payment: '',
    address: '',
    email: '',
    phone: '',
    total: 0,
    items: []
  };
  formErrors: FormErrors = {};

  setCatalog(items: IProduct[]) {
    this.catalog = Object.values(items);
    this.emitChanges('items:changed', { catalog: this.catalog });
  }

  setPreview(item: IProduct) {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  getBasketItems(): IProduct[] {
    return this.catalog.filter(item =>
      _.includes(this.order.items, item.id));
  }

  getTotal() {
    return _.sumBy(this.order.items, id =>
      this.catalog.find(item => item.id === id).price);
  }

  inOrder(id: string, isIn: boolean) {
    if(isIn)
      this.order.items = _.uniq([...this.order.items, id]);
    else
      this.order.items = _.without(this.order.items, id);
    this.emitChanges('basket:changed');
  }

  checkInOrder(id: string): boolean {
    return _.includes(this.order.items, id);
  }

  setOrderTotal() {
    this.order.total = this.getTotal();
  }

  clearBasket() {
    this.order.items.forEach(id =>
      this.inOrder(id, false)
    );
  }

  setOrderField(field: keyof IOrderForm, value: string) {
    this.order[field] = value;
    if(this.validateOrder())
      this.events.emit('order:ready', this.order);
  }

  setContactsField(field: keyof IContactsForm, value: string) {
    this.order[field] = value;
    if(this.validateContacts())
      this.events.emit('contacts:ready', this.order);
  }

  validateOrder() {
    const errors: typeof this.formErrors = {};
    if(!this.order.payment)
      errors.payment = 'Необходимо выбрать способ оплаты'
    if(!this.order.address)
      errors.address = 'Необходимо указать адрес'
    this.formErrors = errors;
    this.emitChanges('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  validateContacts() {
    const errors: typeof this.formErrors = {};
    if(!this.order.email)
      errors.email = 'Необходимо указать email'
    if(!this.order.phone)
      errors.phone = 'Необходимо указать телефон'
    this.formErrors = errors;
    this.emitChanges('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}