import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, Share } from 'lucide-react-native';
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

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generatePDFContent = () => {
    const currentDate = getCurrentDate();
    const title = `Commande du ${currentDate}`;
    
    let content = `${title}\n\n`;
    
    orderItems.forEach((item) => {
      content += `${item.name}\n`;
      if (item.brand) {
        content += `${item.brand}\n`;
      }
      content += `Quantité: ${item.quantity}\n\n`;
    });
    
    return { title, content };
  };

  const handleSharePDF = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Erreur', 'Aucun produit dans la commande à partager');
      return;
    }

    try {
      const { title, content } = generatePDFContent();
      
      if (Platform.OS === 'web') {
        // Pour le web, utiliser l'API Web Share si disponible
        if (navigator.share) {
          await navigator.share({
            title: title,
            text: content,
          });
        } else {
          // Fallback: copier dans le presse-papiers
          await navigator.clipboard.writeText(content);
          Alert.alert('Succès', 'Commande copiée dans le presse-papiers');
        }
      } else {
        // Pour mobile, utiliser l'API Share de React Native
        const Share = require('react-native').Share;
        await Share.share({
          title: title,
          message: content,
        });
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager la commande');
    }
  };

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
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Résumé de commande</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Bannière Passer la commande */}
        {orderItems.length > 0 && (
          <View style={styles.orderActionBanner}>
            <Text style={styles.bannerTitle}>Passer la commande</Text>
            <Text style={styles.bannerSubtitle}>
              Partagez votre liste de commande
            </Text>
            
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleSharePDF}
            >
              <Share color="#FFFFFF" size={20} />
              <Text style={styles.shareButtonText}>Partager</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#FFFFFF',
    paddingTop: 42,
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
  orderActionBanner: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
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