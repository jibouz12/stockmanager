import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderItem, Product } from '@/types/Product';
import { StockService } from './StockService';

const ORDER_ITEMS_KEY = 'order_items';

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
      const autoOrderItems: OrderItem[] = [];

      products.forEach(product => {
        let quantityToOrder = 0;

        if (product.quantity === 0) {
          // Produit en rupture : commander jusqu'au stock minimum
          quantityToOrder = product.minStock;
        } else if (product.quantity <= product.minStock) {
          // Produit en stock bas : commander pour atteindre le stock minimum
          quantityToOrder = product.minStock - product.quantity;
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
      const orderItems = await this.getManualOrderItems();
      orderItems.push(orderItem);
      await AsyncStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(orderItems));
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      throw error;
    }
  }

  static async updateOrderItemQuantity(itemId: string, newQuantity: number): Promise<void> {
    try {
      // Si c'est un article automatique, on ne peut pas le modifier directement
      if (itemId.startsWith('auto_')) {
        return;
      }

      const orderItems = await this.getManualOrderItems();
      const itemIndex = orderItems.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        orderItems[itemIndex].quantity = newQuantity;
        await AsyncStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(orderItems));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  }

  static async removeOrderItem(itemId: string): Promise<void> {
    try {
      // Si c'est un article automatique, on ne peut pas le supprimer directement
      if (itemId.startsWith('auto_')) {
        return;
      }

      const orderItems = await this.getManualOrderItems();
      const filteredItems = orderItems.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(filteredItems));
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
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

  static async clearAllOrders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ORDER_ITEMS_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des commandes:', error);
      throw error;
    }
  }
}