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
import { Calendar } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StockService } from '@/services/StockService';
import ProductCard from '@/components/ProductCard';
import ProductEditModal from '@/components/ProductEditModal';
import { useTranslation } from '@/hooks/useTranslation';

export default function ExpiringScreen() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadExpiringProducts = async () => {
    try {
      const expiringProducts = await StockService.getExpiringProducts();
      setProducts(expiringProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits périmés:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpiringProducts();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadExpiringProducts();
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setEditModalVisible(true);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryText = (daysLeft: number) => {
    if (daysLeft === 0) return t('expiring.expiresToday');
    if (daysLeft === 1) return t('expiring.expiresTomorrow');
    return t('expiring.expiresIn', { days: daysLeft });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Calendar color="#EAB308" size={28} />
        <View style={styles.titleText}>
          <Text style={styles.title}>{t('expiring.title')}</Text>
        </View>
      </View>
      
      {products.length > 0 && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            {t('expiring.warning')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const daysLeft = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : 0;
    
    return (
      <View style={styles.productContainer}>
        <ProductCard 
          product={item} 
          onPress={handleProductPress}
          onQuantityChange={loadExpiringProducts}
        />
        <View style={[
          styles.expiryBadge,
          {
            backgroundColor: daysLeft <= 1 ? '#FEE2E2' : daysLeft <= 3 ? '#FEF3C7' : '#ECFDF5',
          }
        ]}>
          <Text style={[
            styles.expiryBadgeText,
            {
              color: daysLeft <= 1 ? '#991B1B' : daysLeft <= 3 ? '#92400E' : '#065F46',
            }
          ]}>
            {getExpiryText(daysLeft)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('expiring.loading')}</Text>
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
            tintColor="#EAB308"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={products.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar color="#10B981" size={64} />
            <Text style={styles.emptyTitle}>{t('expiring.noProducts')}</Text>
            <Text style={styles.emptyText}>
              {t('expiring.noProductsDesc')}
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
        onSave={loadExpiringProducts}
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
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EAB308',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  productContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  expiryBadge: {
    position: 'absolute',
    top: 8,
    right: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  expiryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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