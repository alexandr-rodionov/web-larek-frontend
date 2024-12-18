export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IAppData {
  catalog: IProduct[];
  preview: string | null;
  loading: boolean;
  order: IOrder | null;
}

export interface IOrderForm {
  payment: string;
  address: string;
}

export interface IContactsForm {
  email: string;
  phone: string;
}

export type IConcatForm = IOrderForm & IContactsForm;

export interface IOrder extends IConcatForm {
  total?: number;
  items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
  id: string;
  total: number;
}