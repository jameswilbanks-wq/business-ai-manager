export interface SupplierListItem {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  leadTimeDays: number | null;
  productCount: number;
}

export interface SupplierDetail extends SupplierListItem {
  notes: string | null;
  products: { id: string; name: string; category: string | null }[];
}
