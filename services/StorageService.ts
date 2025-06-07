import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, StockMovement } from '@/types/Product';

const PRODUCTS_KEY = 'stock_products';
const MOVEMENTS_KEY = 'stock_movements';

export class StorageService {
  static async getProducts(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return [];
    }
  }

  static async saveProduct(product: Product): Promise<void> {
    try {
      const products = await this.getProducts();
      const existingIndex = products.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        products[existingIndex] = { ...product, lastUpdated: new Date().toISOString() };
      } else {
        products.push(product);
      }
      
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
      throw error;
    }
  }

  static async updateProductQuantity(productId: string, newQuantity: number): Promise<void> {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex >= 0) {
        products[productIndex].quantity = newQuantity;
        products[productIndex].lastUpdated = new Date().toISOString();
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      const products = await this.getProducts();
      const filteredProducts = products.filter(p => p.id !== productId);
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(filteredProducts));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  }

  static async getMovements(): Promise<StockMovement[]> {
    try {
      const data = await AsyncStorage.getItem(MOVEMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      return [];
    }
  }

  static async saveMovement(movement: StockMovement): Promise<void> {
    try {
      const movements = await this.getMovements();
      movements.push(movement);
      await AsyncStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mouvement:', error);
      throw error;
    }
  }
}