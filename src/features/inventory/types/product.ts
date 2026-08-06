export interface ProductListItem {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  price: number;
  currency: string;
  isActive: boolean;
  quantityOnHand: number;
  reorderThreshold: number;
}

export interface StockLevel extends ProductListItem {
  description: string | null;
}
