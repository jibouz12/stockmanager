import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Package,
  X
} from 'lucide-react-native';
import { OrderItem } from '@/types/Product';
import { StockService } from '@/services/StockService';
import { OrderService } from '@/services/OrderService';

// Composant séparé pour chaque item de commande
function OrderItemComponent({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem 
}: { 
  item: OrderItem;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [stockQuantity, setStockQuantity] = useState<number>(0);

  useEffect(() => {
    const getStockQuantity = async () => {
      if (!item.barcode) {
        setStockQuantity(0);
        return;
      }
      
      try {
        const products = await StockService.getAllProducts();
        const product = products.find(p => p.barcode === item.barcode);
        setStockQuantity(product ? product.quantity : 0);
      } catch (error) {
        setStockQuantity(0);
      }
    };

    getStockQuantity();
  }, [item.barcode]);

  return (
    <View style={styles.orderItem}>
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Package color="#6B7280" size={24} />
          </View>
        )}
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.brand && (
          <Text style={styles.itemBrand} numberOfLines={1}>
            {item.brand}
          </Text>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.stockInfo}>
            En stock: {stockQuantity}
          </Text>
          <Text style={styles.quantityToOrder}>
            À commander: {item.quantity}
          </Text>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            <Minus color="#EF4444" size={18} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus color="#10B981" size={18} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveItem(item.id)}
        >
          <X color="#EF4444" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OrderScreen() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadOrderItems();
  }, []);

  const loadOrderItems = async () => {
    try {
      const items = await OrderService.getOrderItems();
      setOrderItems(items);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrderItems();
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await OrderService.removeOrderItem(itemId);
    } else {
      await OrderService.updateOrderItemQuantity(itemId, newQuantity);
    }
    loadOrderItems();
  };

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article de la commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            await OrderService.removeOrderItem(itemId);
            loadOrderItems();
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Commandes</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <ShoppingCart color="#3B82F6" size={20} />
          <Text style={styles.statText}>
            {orderItems.length} article{orderItems.length > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Package color="#10B981" size={20} />
          <Text style={styles.statText}>
            {orderItems.reduce((sum, item) => sum + item.quantity, 0)} unités
          </Text>
        </View>
      </View>

      {/* Bannière unique "Ajouter produit" */}
      <TouchableOpacity 
        style={styles.addProductBanner}
        onPress={() => router.push('/add-product')}
      >
        <View style={styles.addProductBannerContent}>
          <Plus color="#FFFFFF" size={24} />
          <View style={styles.addProductBannerText}>
            <Text style={styles.addProductBannerTitle}>Ajouter produit</Text>
            <Text style={styles.addProductBannerSubtitle}>
              Rechercher ou créer un nouveau produit
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <OrderItemComponent
      item={item}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orderItems}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={orderItems.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ShoppingCart color="#6B7280" size={64} />
            <Text style={styles.emptyTitle}>Aucune commande en cours</Text>
            <Text style={styles.emptyText}>
              Ajoutez des produits à commander en utilisant le bouton ci-dessus
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  addProductBanner: {
    marginHorizontal: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addProductBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addProductBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  addProductBannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  addProductBannerSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockInfo: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  quantityToOrder: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 32,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
});