import { ensureElement, formatNumber } from "../../utils/utils";
import { Component } from "../base/component";

interface ISuccess {
  total: number;
}

interface ISuccessActions {
  onClick: () => void;
}

export class Success extends Component<ISuccess> {
  protected _close: HTMLButtonElement;
  protected _total: HTMLElement;

  constructor(container: HTMLElement, actions: ISuccessActions) {
    super(container);

    this._close = ensureElement<HTMLButtonElement>('.order-success__close', container);
    this._total = ensureElement<HTMLElement>('.order-success__description', container)

    if(actions?.onClick)
      this._close.addEventListener('click', actions.onClick);
  }

  set total(value: number) {
    this.setText(this._total, `Списано ${formatNumber(value)} синапсов`);
  }
}