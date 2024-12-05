import { createElement, ensureElement, formatNumber } from "../../utils/utils";
import { Component } from "../base/component";
import { IEvents } from "../base/events";

interface IBasket {
  items: HTMLElement[];
  total: number;
}

export class Basket extends Component<IBasket> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', container);
    this._total = ensureElement<HTMLElement>('.basket__price', container);
    this._button = ensureElement<HTMLButtonElement>('.basket__button', container);
    if(this._button)
      this._button.addEventListener('click', () => { events.emit('order:open') });
    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if(items.length) {
      this._list.replaceChildren(...items);
      this.setDisabled(this._button, false);
    } else {
      this._list.replaceChildren(createElement<HTMLElement>('div', {
        className: 'basket__empty',
        textContent: 'В корзине пусто :('
      }));
      this.setDisabled(this._button, true);
    }
  }

  set total(value: number) {
    this.setText(this._total, `${formatNumber(value)} синапсов`);
  }
}