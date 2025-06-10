import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Minus, Search, ScanLine, ShoppingCart } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StockService } from '@/services/StockService';
import ProductCard from '@/components/ProductCard';
import ScannerModal from '@/components/ScannerModal';
import SearchModal from '@/components/SearchModal';
import ProductEditModal from '@/components/ProductEditModal';
import StockRemovalModal from '@/components/StockRemovalModal';

export default function AllStockScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [scannerVisible, setScannerVisible] = useState<boolean>(false);
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockRemovalVisible, setStockRemovalVisible] = useState<boolean>(false);

  const loadProducts = async () => {
    try {
      const allProducts = await StockService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleScan = async (barcode: string, quantity: number, expiryDate?: string) => {
    try {
      await StockService.addStock(barcode, quantity, expiryDate);
      Alert.alert('Succès', `${quantity} produit(s) ajouté(s) au stock`);
      loadProducts();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
  };

  const handleRemoveStock = async (barcode: string, quantity: number) => {
    try {
      await StockService.removeStock(barcode, quantity);
      Alert.alert('Succès', `${quantity} produit(s) retiré(s) du stock`);
      loadProducts();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
  };

  const handleSearchSelect = (product: Product) => {
    setSelectedProduct(product);
    setEditModalVisible(true);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setEditModalVisible(true);
  };

  // Nouvelle fonction pour gérer la création de produit
  const handleProductCreated = () => {
    loadProducts(); // Recharger la liste des produits
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Gestion de Stock</Text>
      </View>
      
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {products.filter(p => p.quantity > 0).length}
          </Text>
          <Text style={styles.statLabel}>En stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F97316' }]}>
            {products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length}
          </Text>
          <Text style={styles.statLabel}>Stock bas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>
            {products.filter(p => p.quantity === 0).length}
          </Text>
          <Text style={styles.statLabel}>Rupture</Text>
        </View>
      </View>

      {/* Nouvelle bannière Commande */}
      <TouchableOpacity 
        style={styles.orderBanner}
        onPress={() => router.push('/order')}
      >
        <View style={styles.orderBannerContent}>
          <ShoppingCart color="#FFFFFF" size={24} />
          <View style={styles.orderBannerText}>
            <Text style={styles.orderBannerTitle}>Commandes</Text>
            <Text style={styles.orderBannerSubtitle}>
              Gérer les produits à commander
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      onQuantityChange={loadProducts}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={products.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ScanLine color="#6B7280" size={64} />
            <Text style={styles.emptyTitle}>Aucun produit en stock</Text>
            <Text style={styles.emptyText}>
              Commencez par scanner un code-barre pour ajouter vos premiers produits
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setScannerVisible(true)}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.emptyButtonText}>Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Boutons d'action fixes en bas */}
      <View style={styles.fixedActionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.lessButton]}
          onPress={() => setStockRemovalVisible(true)}
        >
          <Minus color="#FFFFFF" size={20} />
          <Text style={[styles.actionButtonText, styles.addButtonText]}>Retirer du Stock</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => setScannerVisible(true)}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text style={[styles.actionButtonText, styles.addButtonText]}>Ajouter au Stock</Text>
        </TouchableOpacity>
      </View>

      <ScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScan}
        onProductCreated={handleProductCreated} // Passer la fonction de callback
      />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelectProduct={handleSearchSelect}
        mode="remove"
      />

      <StockRemovalModal
        visible={stockRemovalVisible}
        onClose={() => setStockRemovalVisible(false)}
        onRemove={handleRemoveStock}
      />

      <ProductEditModal
        visible={editModalVisible}
        product={selectedProduct}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedProduct(null);
        }}
        onSave={loadProducts}
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
    paddingTop: 42,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  orderBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#3B82F6',
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
  orderBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  orderBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  orderBannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  orderBannerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  listContainer: {
    paddingBottom: 100, // Espace pour les boutons fixes
  },
  emptyContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Espace pour les boutons fixes
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
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fixedActionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButton: {
    backgroundColor: '#10B981',
  },
  lessButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  addButtonText: {
    color: '#FFFFFF',
  },
});