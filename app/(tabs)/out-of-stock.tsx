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
import { CircleAlert as AlertCircle } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StockService } from '@/services/StockService';
import ProductCard from '@/components/ProductCard';
import ProductEditModal from '@/components/ProductEditModal';
import { useTranslation } from '@/hooks/useTranslation';

export default function OutOfStockScreen() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadOutOfStockProducts = async () => {
    try {
      const outOfStockProducts = await StockService.getOutOfStockProducts();
      setProducts(outOfStockProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits en rupture:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOutOfStockProducts();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadOutOfStockProducts();
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setEditModalVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <AlertCircle color="#EF4444" size={28} />
        <View style={styles.titleText}>
          <Text style={styles.title}>{t('outOfStock.title')}</Text>
        </View>
      </View>
      
      {products.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {t('outOfStock.warning')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard 
      product={item} 
      onPress={handleProductPress}
      onQuantityChange={loadOutOfStockProducts}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('outOfStock.loading')}</Text>
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
            tintColor="#EF4444"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={products.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AlertCircle color="#10B981" size={64} />
            <Text style={styles.emptyTitle}>{t('outOfStock.noProducts')}</Text>
            <Text style={styles.emptyText}>
              {t('outOfStock.noProductsDesc')}
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
        onSave={loadOutOfStockProducts}
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
    height: 148,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titleText: {
    marginLeft: 12,
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
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
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