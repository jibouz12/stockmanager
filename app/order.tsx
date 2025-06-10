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
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  Package,
  X,
  Save
} from 'lucide-react-native';
import { Product, OrderItem } from '@/types/Product';
import { StockService } from '@/services/StockService';
import { OrderService } from '@/services/OrderService';
import { OpenFoodFactsService } from '@/services/OpenFoodFactsService';

export default function OrderScreen() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [createProductModalVisible, setCreateProductModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // États pour la création de produit
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductBrand, setNewProductBrand] = useState<string>('');
  const [newProductQuantity, setNewProductQuantity] = useState<number>(1);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const results = await OpenFoodFactsService.searchProductsByName(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      Alert.alert('Erreur', 'Impossible de rechercher les produits');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddFromSearch = async (product: any) => {
    try {
      const orderItem: OrderItem = {
        id: Date.now().toString(),
        name: product.product.product_name || `Produit ${product.code}`,
        brand: product.product.brands || undefined,
        quantity: 1,
        barcode: product.code,
        imageUrl: product.product.image_url || undefined,
        addedAt: new Date().toISOString(),
      };

      await OrderService.addOrderItem(orderItem);
      setSearchModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
      loadOrderItems();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
    }
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est obligatoire');
      return;
    }

    if (newProductQuantity <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à zéro');
      return;
    }

    try {
      const orderItem: OrderItem = {
        id: Date.now().toString(),
        name: newProductName.trim(),
        brand: newProductBrand.trim() || undefined,
        quantity: newProductQuantity,
        addedAt: new Date().toISOString(),
      };

      await OrderService.addOrderItem(orderItem);
      setCreateProductModalVisible(false);
      setNewProductName('');
      setNewProductBrand('');
      setNewProductQuantity(1);
      loadOrderItems();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le produit');
    }
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

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setSearchModalVisible(true)}
        >
          <Search color="#3B82F6" size={20} />
          <Text style={styles.actionButtonText}>Rechercher produit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.createButton]}
          onPress={() => setCreateProductModalVisible(true)}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text style={[styles.actionButtonText, styles.createButtonText]}>Créer produit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.brand && (
          <Text style={styles.itemBrand} numberOfLines={1}>
            {item.brand}
          </Text>
        )}
        {item.barcode && (
          <Text style={styles.itemCode}>Code: {item.barcode}</Text>
        )}
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          >
            <Minus color="#EF4444" size={18} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus color="#10B981" size={18} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <X color="#EF4444" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleAddFromSearch(item)}
    >
      <View style={styles.searchItemInfo}>
        <Text style={styles.searchItemName} numberOfLines={2}>
          {item.product.product_name || `Produit ${item.code}`}
        </Text>
        {item.product.brands && (
          <Text style={styles.searchItemBrand} numberOfLines={1}>
            {item.product.brands}
          </Text>
        )}
        <Text style={styles.searchItemCode}>Code: {item.code}</Text>
      </View>
      <Plus color="#3B82F6" size={24} />
    </TouchableOpacity>
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
              Ajoutez des produits à commander en utilisant les boutons ci-dessus
            </Text>
          </View>
        }
      />

      {/* Modal de recherche */}
      <Modal visible={searchModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rechercher un produit</Text>
            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search color="#6B7280" size={20} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Nom ou marque du produit"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Rechercher</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={searchResults}
            renderItem={renderSearchItem}
            keyExtractor={(item) => item.code}
            style={styles.searchResults}
            ListEmptyComponent={
              searchQuery && !searchLoading ? (
                <View style={styles.emptySearchState}>
                  <Text style={styles.emptySearchText}>Aucun produit trouvé</Text>
                </View>
              ) : null
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Modal de création de produit */}
      <Modal visible={createProductModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Créer un nouveau produit</Text>
            <TouchableOpacity onPress={() => setCreateProductModalVisible(false)}>
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.createForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du produit *</Text>
              <TextInput
                style={styles.input}
                value={newProductName}
                onChangeText={setNewProductName}
                placeholder="Nom du produit"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Marque (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={newProductBrand}
                onChangeText={setNewProductBrand}
                placeholder="Marque du produit"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantité *</Text>
              <View style={styles.quantityInputContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setNewProductQuantity(Math.max(1, newProductQuantity - 1))}
                >
                  <Minus color="#EF4444" size={18} />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.quantityInputField}
                  value={newProductQuantity.toString()}
                  onChangeText={(text) => setNewProductQuantity(Math.max(1, parseInt(text) || 1))}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setNewProductQuantity(newProductQuantity + 1)}
                >
                  <Plus color="#10B981" size={18} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.createProductButton} onPress={handleCreateProduct}>
              <Save color="#FFFFFF" size={20} />
              <Text style={styles.createProductButtonText}>Créer le produit</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF8FF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  createButtonText: {
    color: '#FFFFFF',
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
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResults: {
    flex: 1,
  },
  searchItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchItemInfo: {
    flex: 1,
  },
  searchItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  searchItemBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  searchItemCode: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptySearchState: {
    padding: 32,
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 16,
    color: '#6B7280',
  },
  createForm: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  quantityInputField: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 12,
  },
  createProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  createProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});