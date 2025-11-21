import { SafeHtml } from "@angular/platform-browser";

export interface OrderDetails {
  products: OrderDetailsProduct[];
}

export interface OrderDetailsProduct {
  id: number;
  product_name: string;
  product_image: string;
  brand: string;
  color?: string;
  category?: string;
  price: number;
  discount_price?: number;
  quantity: number;
  total_quantity: number;
  sub_total: number;
  is_checked?: boolean;
}