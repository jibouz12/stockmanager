export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  quantity: number;
  minStock: number;
  expiryDate?: string;
  imageUrl?: string;
  category?: string;
  unit?: string;
  addedAt: string;
  lastUpdated: string;
}

export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name: string;
    brands?: string;
    image_url?: string;
    categories?: string;
    serving_size?: string;
    nutriments?: any;
  };
  status: number;
  status_verbose: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason?: string;
}