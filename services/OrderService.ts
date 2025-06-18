import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderItem, Product } from '@/types/Product';
import { StockService } from './StockService';

const ORDER_ITEMS_KEY = 'order_items';
const AUTO_ORDER_OVERRIDES_KEY = 'auto_order_overrides';

interface AutoOrderOverride {
  productId: string;
  customQuantity?: number;
  isHidden?: boolean;
}

export class OrderService {
  static async getOrderItems(): Promise<OrderItem[]> {
    try {
      // Récupérer les articles de commande manuels
      const manualOrdersData = await AsyncStorage.getItem(ORDER_ITEMS_KEY);
      const manualOrders: OrderItem[] = manualOrdersData ? JSON.parse(manualOrdersData) : [];

      // Récupérer les produits automatiques à commander
      const autoOrderItems = await this.getAutoOrderItems();

      // Combiner les deux listes
      return [...autoOrderItems, ...manualOrders];
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return [];
    }
  }

  static async getAutoOrderItems(): Promise<OrderItem[]> {
    try {
      const products = await StockService.getAllProducts();
      const overrides = await this.getAutoOrderOverrides();
      const autoOrderItems: OrderItem[] = [];

      products.forEach(product => {
        const override = overrides.find(o => o.productId === product.id);

        // Si le produit est masqué, ne pas l'inclure
        if (override?.isHidden) {
          return;
        }

        let quantityToOrder = 0;

        if (product.quantity === 0) {
          // Produit en rupture : commander jusqu'au stock minimum
          quantityToOrder = product.minStock;
        } else if (product.quantity <= product.minStock) {
          // Produit en stock bas : commander pour atteindre le stock minimum
          quantityToOrder = product.minStock - product.quantity;
        }

        // Utiliser la quantité personnalisée si elle existe
        if (override?.customQuantity !== undefined) {
          quantityToOrder = override.customQuantity;
        }

        if (quantityToOrder > 0) {
          autoOrderItems.push({
            id: `auto_${product.id}`,
            name: product.name,
            brand: product.brand,
            quantity: quantityToOrder,
            barcode: product.barcode,
            imageUrl: product.imageUrl,
            addedAt: new Date().toISOString(),
          });
        }
      });

      return autoOrderItems;
    } catch (error) {
      console.error('Erreur lors de la génération des commandes automatiques:', error);
      return [];
    }
  }

  static async addOrderItem(orderItem: OrderItem): Promise<void> {
    try {
      // Vérifier d'abord s'il existe déjà dans les commandes automatiques
      if (orderItem.barcode) {
        const autoOrderItems = await this.getAutoOrderItems();
        const existingAutoItem = autoOrderItems.find(item => 
          item.barcode === orderItem.barcode
        );
        
        if (existingAutoItem) {
          // Le produit existe déjà dans les commandes automatiques
          // On peut soit ignorer l'ajout, soit mettre à jour la quantité automatique
          // Ici, on met à jour la quantité de la commande automatique
          const productId = existingAutoItem.id.replace('auto_', '');
          const newQuantity = existingAutoItem.quantity + orderItem.quantity;
          await this.setAutoOrderOverride(productId, { customQuantity: newQuantity });
          return;
        }
      }

      // Vérifier ensuite dans les commandes manuelles
      const orderItems = await this.getManualOrderItems();
      
      if (orderItem.barcode) {
        const existingItemIndex = orderItems.findIndex(item => 
          item.barcode === orderItem.barcode
        );
        
        if (existingItemIndex >= 0) {
          // Ajouter la quantité au produit existant dans les commandes manuelles
          orderItems[existingItemIndex].quantity += orderItem.quantity;
          orderItems[existingItemIndex].addedAt = new Date().toISOString(); // Mettre à jour la date
          await AsyncStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(orderItems));
          return;
        }
      }
      
      // Si aucun produit existant trouvé, ajouter le nouveau produit aux commandes manuelles
      orderItems.push(orderItem);
      await AsyncStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(orderItems));
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      throw error;
    }
  }

  static async updateOrderItemQuantity(itemId: string, newQuantity: number): Promise<void> {
    try {
      if (itemId.startsWith('auto_')) {
        // Pour les articles automatiques, sauvegarder comme override
        const productId = itemId.replace('auto_', '');
        await this.setAutoOrderOverride(productId, { customQuantity: newQuantity });
      } else {
        // Pour les articles manuels, mise à jour normale
        const orderItems = await this.getManualOrderItems();
        const itemIndex = orderItems.findIndex(item => item.id === itemId);

        if (itemIndex >= 0) {
          orderItems[itemIndex].quantity = newQuantity;
          await AsyncStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(orderItems));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  }

  static async removeOrderItem(itemId: string): Promise<void> {
    try {
      if (itemId.startsWith('auto_')) {
        // Pour les articles automatiques, les marquer comme masqués
        const productId = itemId.replace('auto_', '');
        await this.setAutoOrderOverride(productId, { isHidden: true });
      } else {
        // Pour les articles manuels, suppression normale
        const orderItems = await this.getManualOrderItems();
        const filteredItems = orderItems.filter(item => item.id !== itemId);
        await AsyncStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(filteredItems));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      throw error;
    }
  }

  static async restoreAutoOrderItem(productId: string): Promise<void> {
    try {
      const overrides = await this.getAutoOrderOverrides();
      const filteredOverrides = overrides.filter(o => o.productId !== productId);
      await AsyncStorage.setItem(AUTO_ORDER_OVERRIDES_KEY, JSON.stringify(filteredOverrides));
    } catch (error) {
      console.error('Erreur lors de la restauration de l\'article automatique:', error);
      throw error;
    }
  }

  private static async getManualOrderItems(): Promise<OrderItem[]> {
    try {
      const data = await AsyncStorage.getItem(ORDER_ITEMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes manuelles:', error);
      return [];
    }
  }

  private static async getAutoOrderOverrides(): Promise<AutoOrderOverride[]> {
    try {
      const data = await AsyncStorage.getItem(AUTO_ORDER_OVERRIDES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des overrides:', error);
      return [];
    }
  }

  private static async setAutoOrderOverride(productId: string, override: Partial<AutoOrderOverride>): Promise<void> {
    try {
      const overrides = await this.getAutoOrderOverrides();
      const existingIndex = overrides.findIndex(o => o.productId === productId);

      if (existingIndex >= 0) {
        // Mettre à jour l'override existant
        overrides[existingIndex] = { ...overrides[existingIndex], ...override };
      } else {
        // Créer un nouvel override
        overrides.push({ productId, ...override });
      }

      await AsyncStorage.setItem(AUTO_ORDER_OVERRIDES_KEY, JSON.stringify(overrides));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'override:', error);
      throw error;
    }
  }

  static async clearAllOrders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ORDER_ITEMS_KEY);
      await AsyncStorage.removeItem(AUTO_ORDER_OVERRIDES_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des commandes:', error);
      throw error;
    }
  }

  static async getHiddenAutoOrderItems(): Promise<Product[]> {
    try {
      const products = await StockService.getAllProducts();
      const overrides = await this.getAutoOrderOverrides();

      return products.filter(product => {
        const override = overrides.find(o => o.productId === product.id);
        return override?.isHidden === true;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des articles masqués:', error);
      return [];
    }
  }
}