import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { ShopAPI } from './components/ShopAPI';
import { EventEmitter } from './components/base/events';
import { AppData } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Card, CardBasket, CardPreview } from './components/Card';
import { IContactsForm, IOrderForm, IProduct } from './types';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/common/Success';

const api = new ShopAPI(CDN_URL, API_URL);
const events = new EventEmitter();

// Debug all events
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Templates
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

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
    order.setPayment(name);
  }
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

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
      if(!appData.checkInOrder(item.id)) {
        appData.inOrder(item.id, true);
        events.emit('preview:changed', item);
      }
      else
        events.emit('basket:open', item);
    }
  });
  card.toggleButton(appData.checkInOrder(item.id));
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
  basket.items = appData.getBasketItems().map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        appData.inOrder(item.id, false);
      }
    });
    return card.render({
      index: index + 1,
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
  appData.setOrderTotal();
  modal.render({
    content: order.render({
      payment: '',
      address: '',
      valid: false,
      errors: []
    })
  });
});

// Open Contacts (email & phone)
events.on('order:submit', () => {
  modal.render({
    content: contacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  });
});

// Change validation of Order Form
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const { payment, address } = errors;
  order.valid = !payment && !address;
  order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
});

// Change Order field
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

// Change validation of Contacts Form
events.on('formErrors:change', (errors: Partial<IContactsForm>) => {
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

// Change Contacts field
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
  appData.setContactsField(data.field, data.value);
});

// Send data to server & open Success
events.on('contacts:submit', () => {
  api.postOrder(appData.order)
    .then(result => {
      const success = new Success(cloneTemplate(successTemplate), {
        onClick: () => {
          modal.close();
          appData.clearBasket();
        }
      });
      modal.render({
        content: success.render({
          total: appData.getTotal()
        })
      });
      console.log(result);
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