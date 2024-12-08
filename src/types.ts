export interface Part {
  id: number;
  description: string;
  price: number;
  quantity: number;
}

export interface LineItem {
  partId: number;
  quantity: number;
}

export interface Order {
  id: number;
  lineItems: {
    partId: number;
    quantity: number;
    description: string;
    price: number;
    lineItemTotal: number;
  }[];
  totalCost: number;
}
