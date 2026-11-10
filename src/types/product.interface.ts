export interface Inventory {
  id?: number;
  productId: number;
  quantity: number;
  location?: string;
}
export interface Attribute {
  id?: number;
  productId: number;
}

export interface SoldItem {
  id?: number;
  productId: number;
}  

export interface Product {
  id: number;
  name: string;
  identifier: string;
  description: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  qty: number;
  unitId: number;
  unit?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  attributes?: Attribute[];
  inventory?: Inventory[];
  soldItems?: SoldItem[];
}