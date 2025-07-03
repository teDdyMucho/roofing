export interface ProductVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  category: string;
}

export interface Product {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  variants: ProductVariant[];
}

export interface ProductListProps {
  products: Product[];
}
