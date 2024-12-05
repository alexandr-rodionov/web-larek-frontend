import { ensureElement, formatNumber } from "../utils/utils";
import { Component } from "./base/component";

interface ICardActions {
  onClick: (events: MouseEvent) => void;
}

export interface ICard {
  category: string;
  title: string;
  image: string;
  price: number | null;
  description?: string;
}

export class Card extends Component<ICard> {
  protected _category: HTMLElement;
  protected _title: HTMLElement;
  protected _image: HTMLImageElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._category = ensureElement<HTMLElement>('.card__category', container);
    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._image = ensureElement<HTMLImageElement>('.card__image', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);

    if(actions?.onClick)
      container.addEventListener('click', actions.onClick);
  }

  set category(value: string) {
    this.setText(this._category, value);
    switch(value) {
      case 'софт-скил':
        this._category.classList.add('card__category_soft');
        break;
      case 'хард-скил':
        this._category.classList.add('card__category_hard');
        break;
      case 'другое':
        this._category.classList.add('card__category_other');
        break;
      case 'дополнительное':
        this._category.classList.add('card__category_additional');
        break;
      case 'кнопка':
        this._category.classList.add('card__category_button');
        break;
    }
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set image(value: string) {
    this.setImage(this._image, value, this._title.textContent);
  }

  set price(value: number | null) {
    this.setText(this._price, value ? `${formatNumber(value)} синапсов` : 'Бесценно');
  }
}

export class CardPreview extends Card {
  protected _description: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._description = ensureElement<HTMLElement>('.card__text', container);
    this._button = ensureElement<HTMLButtonElement>('.card__button', container);

    if(actions?.onClick)
      this._button.addEventListener('click', actions.onClick);

    this._price ? this.setDisabled(this._button, false) : this.setDisabled(this._button, true);
    console.log(this._price);
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  set price(value: number | null) {
    super.price = value;
    value ? this.setDisabled(this._button, false) : this.setDisabled(this._button, true);
  }

  toggleButton(value: boolean) {
    if(value)
      this.setText(this._button, 'В корзину');
    else
      this.setText(this._button, 'Купить');
  };
}

export interface ICardBasket {
  index: number;
  title: string;
  price: number | null;
}

export class CardBasket extends Component<ICardBasket> {
  protected _index: HTMLElement;
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._index = ensureElement<HTMLElement>('.basket__item-index', container);
    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._button = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    if(actions?.onClick)
      this._button.addEventListener('click', actions.onClick);
  }

  set index(value: number) {
    this.setText(this._index, String(value));
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set price(value: number | null) {
    this.setText(this._price, value ? `${formatNumber(value)} синапсов` : 'Бесценно');
  }
}