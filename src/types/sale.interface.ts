export interface SaleItem {
  id?: number;
  productId: number;
  price: number;
  qty: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Sale {
  id?: number;
  userId: number;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
