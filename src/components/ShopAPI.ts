import { Api, ApiListResponse } from "./base/api";
import { IOrder, IOrderResult, IProduct } from "../types";


export interface IShopAPI {
  getProductList: () => Promise<IProduct[]>;
  postOrder: (order: IOrder) => Promise<IOrderResult>;
}

export class ShopAPI extends Api implements IShopAPI {
  readonly cdn: string;

  constructor(cdn: string, baseURL: string, options?: RequestInit) {
    super(baseURL, options);
    this.cdn = cdn;
  }

  getProductList(): Promise<IProduct[]> {
    return this.get('/product')
      .then((data: ApiListResponse<IProduct>) =>
        data.items.map(item => ({
          ...item,
          image: this.cdn + item.image
        }))
      );
  }

  postOrder(order: IOrder): Promise<IOrderResult> {
    return this.post('/order', order)
      .then(
        (data: IOrderResult) => data
      );
  }
}