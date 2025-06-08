import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { TrendingDown } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StockService } from '@/services/StockService';
import ProductCard from '@/components/ProductCard';
import ProductEditModal from '@/components/ProductEditModal';

export default function LowStockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadLowStockProducts = async () => {
    try {
      const lowStockProducts = await StockService.getLowStockProducts();
      setProducts(lowStockProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits en stock bas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLowStockProducts();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadLowStockProducts();
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setEditModalVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <TrendingDown color="#F97316" size={28} />
        <View style={styles.titleText}>
          <Text style={styles.title}>Stock Bas</Text>
        </View>
      </View>
      
      {products.length > 0 && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Ces produits atteignent leur stock minimum
          </Text>
        </View>
      )}
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard 
      product={item} 
      onPress={handleProductPress}
      onQuantityChange={loadLowStockProducts}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des produits en stock bas...</Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F97316"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={products.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <TrendingDown color="#10B981" size={64} />
            <Text style={styles.emptyTitle}>Aucun produit en stock bas</Text>
            <Text style={styles.emptyText}>
              Tous vos produits ont un stock suffisant par rapport au minimum défini
            </Text>
          </View>
        }
      />

      <ProductEditModal
        visible={editModalVisible}
        product={selectedProduct}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedProduct(null);
        }}
        onSave={loadLowStockProducts}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
    height: 172
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
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
});