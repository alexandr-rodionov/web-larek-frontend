import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { ShopAPI } from './components/ShopAPI';
import { EventEmitter } from './components/base/events';
import { AppData } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Card, CardBasket, CardPreview } from './components/Card';
import { IContactsForm, IOrderForm, IOrderResult, IProduct } from './types';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';

const api = new ShopAPI(CDN_URL, API_URL);
const events = new EventEmitter();

// Templates
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Container for Modal
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// Model
const appData = new AppData({}, events);

// Global container
const page = new Page(document.body, events);
const modal = new Modal(modalContainer, events);

// Reused components
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events , {
  onClick: name => {
    events.emit('order.payment:changed', { field: 'payment', value: name });
  }
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => modal.close()
});

// Rendering Card on Main
events.on('items:changed', () => {
  page.catalog = appData.catalog.map(item => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      category: item.category,
      title: item.title,
      image: item.image,
      price: item.price
    });
  });
  page.counter = appData.getBasketItems().length;
});

// Card for Preview
events.on('card:select', (item: IProduct) => {
   appData.setPreview(item);
});

// Open Preview Card
events.on('preview:changed', (item: IProduct) => {
  const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
    onClick: () => {
      appData.inOrder(item.id, !appData.isInOrder(item.id));
      events.emit('preview:changed', item);
    }
  });
  card.toggleButton(appData.isInOrder(item.id));
  modal.render({
    content: card.render({
      category: item.category,
      title: item.title,
      description: item.description,
      image: item.image,
      price: item.price
    })
  });
});

// Add to Basket
events.on('basket:changed', () => {
  page.counter = appData.getBasketItems().length;
  basket.total = appData.getTotal();
  basket.items = appData.getBasketItems().map((item, indx) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        appData.inOrder(item.id, !appData.isInOrder(item.id));
      }
    });

    return card.render({
      index: indx + 1,
      title: item.title,
      price: item.price
    });
  });
});

// Open Basket
events.on('basket:open', () => {
  modal.render({
    content: basket.render()
  });
});

// Open Order (payment & address)
events.on('order:open', () => {
  const formErrors = appData.formErrors;
  modal.render({
    content: order.render({
      payment: appData.order.payment,
      address: appData.order.address,
      valid: appData.validateOrder(),
      errors: []
    })
  });
});

// Open Contacts (email & phone)
events.on('order:submit', () => {
  modal.render({
    content: contacts.render({
      email: appData.order.email,
      phone: appData.order.phone,
      valid: appData.validateContacts(),
      errors: []
    })
  });
});

// Change Order field
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
  appData.validateOrder();
});

// Change validation of Order Form
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
  const { payment, address } = errors;
  order.valid = !payment && !address;
  if(!payment)
    order.setPayment(appData.order.payment);
  order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
});

// Change Contacts field
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
  appData.validateContacts();
});

// Change validation of Contacts Form
 events.on('contactsFormErrors:change', (errors: Partial<IContactsForm>) => {
   const { email, phone } = errors;
   contacts.valid = !email && !phone;
   contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

// Send data to server & open Success
events.on('contacts:submit', () => {
  const order = appData.order;
  order.total = appData.getTotal();
  api.postOrder(order)
    .then((result: IOrderResult) => {
      appData.clearBasket();
      modal.render({
        content: success.render({
          total: result.total
        })
      });
    })
    .catch(err => console.error(err));
})

// Blocked/unblocked scroll when open/close modal
events.on('modal:open', () => { page.locked = true });
events.on('modal:close', () => { page.locked = false });

// Get item from server
api.getProductList()
  .then(res => appData.setCatalog(res))
  .catch(err => console.error(err));