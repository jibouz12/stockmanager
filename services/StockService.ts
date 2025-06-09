import { Product, StockMovement } from '@/types/Product';
import { StorageService } from './StorageService';
import { OpenFoodFactsService } from './OpenFoodFactsService';

export class StockService {
  static async addStock(barcode: string, quantity: number, expiryDate?: string): Promise<Product> {
    try {
      // Vérifier si le produit existe déjà
      const products = await StorageService.getProducts();
      const existingProduct = products.find(p => p.barcode === barcode);

      if (existingProduct) {
        // Augmenter la quantité
        const newQuantity = existingProduct.quantity + quantity;
        await StorageService.updateProductQuantity(existingProduct.id, newQuantity);

        // Enregistrer le mouvement
        const movement: StockMovement = {
          id: Date.now().toString(),
          productId: existingProduct.id,
          type: 'in',
          quantity,
          date: new Date().toISOString(),
          reason: 'Ajout de stock'
        };
        await StorageService.saveMovement(movement);

        return { ...existingProduct, quantity: newQuantity };
      } else {
        // Essayer de récupérer les informations du produit depuis OpenFoodFacts
        let productInfo = null;
        try {
          productInfo = await OpenFoodFactsService.getProductByBarcode(barcode);
        } catch (error) {
          console.warn('Impossible de récupérer les informations depuis OpenFoodFacts, création avec informations minimales');
        }
        
        const newProduct: Product = {
          id: Date.now().toString(),
          barcode,
          name: productInfo?.product?.product_name || `Produit ${barcode}`,
          brand: productInfo?.product?.brands || undefined,
          quantity,
          minStock: 5, // Valeur par défaut
          expiryDate,
          imageUrl: productInfo?.product?.image_url || undefined,
          category: productInfo?.product?.categories || undefined,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        await StorageService.saveProduct(newProduct);

        // Enregistrer le mouvement
        const movement: StockMovement = {
          id: Date.now().toString(),
          productId: newProduct.id,
          type: 'in',
          quantity,
          date: new Date().toISOString(),
          reason: 'Nouveau produit'
        };
        await StorageService.saveMovement(movement);

        return newProduct;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de stock:', error);
      throw error;
    }
  }

  static async removeStock(barcode: string, quantity: number): Promise<Product | null> {
    try {
      const products = await StorageService.getProducts();
      const product = products.find(p => p.barcode === barcode);

      if (!product) {
        throw new Error('Produit non trouvé dans le stock');
      }

      if (product.quantity < quantity) {
        throw new Error('Quantité insuffisante en stock');
      }

      const newQuantity = product.quantity - quantity;
      await StorageService.updateProductQuantity(product.id, newQuantity);

      // Enregistrer le mouvement
      const movement: StockMovement = {
        id: Date.now().toString(),
        productId: product.id,
        type: 'out',
        quantity,
        date: new Date().toISOString(),
        reason: 'Sortie de stock'
      };
      await StorageService.saveMovement(movement);

      return { ...product, quantity: newQuantity };
    } catch (error) {
      console.error('Erreur lors de la sortie de stock:', error);
      throw error;
    }
  }

  static async getAllProducts(): Promise<Product[]> {
    return await StorageService.getProducts();
  }

  static async getLowStockProducts(): Promise<Product[]> {
    const products = await StorageService.getProducts();
    return products.filter(p => p.quantity > 0 && p.quantity <= p.minStock);
  }

  static async getOutOfStockProducts(): Promise<Product[]> {
    const products = await StorageService.getProducts();
    return products.filter(p => p.quantity === 0);
  }

  static async getExpiringProducts(): Promise<Product[]> {
    const products = await StorageService.getProducts();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    return products.filter(p => {
      if (!p.expiryDate) return false;
      const expiryDate = new Date(p.expiryDate);
      return expiryDate <= fiveDaysFromNow && expiryDate >= new Date();
    });
  }

  static async searchProductsInStock(query: string): Promise<Product[]> {
    const products = await StorageService.getProducts();
    const searchTerm = query.toLowerCase().trim();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
      product.barcode.includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm))
    );
  }
}