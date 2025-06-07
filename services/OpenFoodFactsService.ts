import { OpenFoodFactsProduct } from '@/types/Product';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

export class OpenFoodFactsService {
  static async getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
    try {
      const response = await fetch(`${BASE_URL}/product/${barcode}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data: OpenFoodFactsProduct = await response.json();
      
      if (data.status === 1 && data.product) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la recherche par code-barre:', error);
      throw new Error('Impossible de récupérer les informations du produit');
    }
  }

  static async searchProductsByName(name: string): Promise<OpenFoodFactsProduct[]> {
    try {
      const response = await fetch(`${BASE_URL}/search?brands_tags=${encodeURIComponent(name)}&page_size=20`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.products && Array.isArray(data.products)) {
        return data.products.map((product: any) => ({
          code: product.code,
          product: product,
          status: 1,
          status_verbose: 'product found'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la recherche par nom:', error);
      throw new Error('Impossible de rechercher les produits');
    }
  }
}