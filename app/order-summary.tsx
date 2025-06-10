import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package } from 'lucide-react-native';
import { OrderItem } from '@/types/Product';
import { OrderService } from '@/services/OrderService';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    }
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, styles.productColumn]}>Produit</Text>
      <Text style={[styles.tableHeaderText, styles.brandColumn]}>Marque</Text>
      <Text style={[styles.tableHeaderText, styles.quantityColumn]}>Quantité</Text>
    </View>
  );

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCellText, styles.productColumn]} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={[styles.tableCellText, styles.brandColumn]} numberOfLines={1}>
        {item.brand || '-'}
      </Text>
      <Text style={[styles.tableCellText, styles.quantityColumn]}>
        {item.quantity}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du résumé...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Résumé de commande</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {orderItems.length > 0 ? (
          <>

            {/* Tableau */}
            <View style={styles.tableContainer}>
              <FlatList
                data={orderItems}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderTableHeader}
                showsVerticalScrollIndicator={false}
                style={styles.table}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Package color="#6B7280" size={64} />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptyText}>
              Aucun produit n'est actuellement dans votre commande
            </Text>
          </View>
        )}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 120,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
  },
  table: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableCellText: {
    fontSize: 14,
    color: '#111827',
  },
  productColumn: {
    flex: 2,
    marginRight: 12,
  },
  brandColumn: {
    flex: 1,
    marginRight: 12,
  },
  quantityColumn: {
    flex: 0.5,
    textAlign: 'center',
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