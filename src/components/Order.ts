import { IOrderForm } from "../types";
import { ensureAllElements } from "../utils/utils";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export type PaymentActions = {
  onClick: (payment: string) => void;
}

export class Order extends Form<IOrderForm> {
  protected _buttons: HTMLButtonElement[];

  constructor(container: HTMLFormElement, events: IEvents, actions?: PaymentActions) {
    super(container, events);

    this._buttons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
    this._buttons.forEach(button => {
      button.addEventListener('click', () => {
        actions?.onClick?.(button.name);
      });
    });
  }

  setPayment(name: string) {
    this._buttons.forEach(button => {
      this.toggleClass(button, 'button_alt-active', button.name === name);
    });
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }
}