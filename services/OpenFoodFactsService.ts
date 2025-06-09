import { OpenFoodFactsProduct } from '@/types/Product';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

export class OpenFoodFactsService {
  static async getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
    try {
      const response = await fetch(`${BASE_URL}/product/${barcode}`);
      
      // Si le produit n'est pas trouvé (404), retourner null au lieu de lever une erreur
      if (response.status === 404) {
        console.log(`Produit non trouvé dans OpenFoodFacts: ${barcode}`);
        return null;
      }
      
      if (!response.ok) {
        console.warn(`Erreur API OpenFoodFacts: ${response.status} - ${response.statusText}`);
        return null;
      }
      
      const data: OpenFoodFactsProduct = await response.json();
      
      if (data.status === 1 && data.product) {
        return data;
      }
      
      // Si le statut indique que le produit n'existe pas
      console.log(`Produit non trouvé dans la base OpenFoodFacts: ${barcode}`);
      return null;
    } catch (error) {
      console.warn('Erreur lors de la recherche par code-barre:', error);
      // Retourner null au lieu de lever une erreur pour permettre la création manuelle
      return null;
    }
  }

  static async searchProductsByName(name: string): Promise<OpenFoodFactsProduct[]> {
    try {
      const response = await fetch(`${BASE_URL}/search?brands_tags=${encodeURIComponent(name)}&page_size=20`);
      
      if (!response.ok) {
        console.warn(`Erreur API OpenFoodFacts search: ${response.status} - ${response.statusText}`);
        return [];
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
      console.warn('Erreur lors de la recherche par nom:', error);
      // Retourner un tableau vide au lieu de lever une erreur
      return [];
    }
  }
}