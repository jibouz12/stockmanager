import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Package,
  Save,
  Minus
} from 'lucide-react-native';
import { OrderItem } from '@/types/Product';
import { OrderService } from '@/services/OrderService';
import { OpenFoodFactsService } from '@/services/OpenFoodFactsService';

export default function AddProductScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');
  
  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // États pour la création de produit
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductBrand, setNewProductBrand] = useState<string>('');
  const [newProductQuantity, setNewProductQuantity] = useState<number>(1);

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
      Alert.alert('Succès', 'Produit ajouté à la commande', [
        { text: 'OK', onPress: () => router.back() }
      ]);
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
      Alert.alert('Succès', 'Produit créé et ajouté à la commande', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le produit');
    }
  };

  const renderSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleAddFromSearch(item)}
    >
      <View style={styles.searchItemImageContainer}>
        {item.product.image_url ? (
          <Image source={{ uri: item.product.image_url }} style={styles.searchItemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Package color="#6B7280" size={24} />
          </View>
        )}
      </View>
      
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
      
      <Plus color="#10B981" size={24} />
    </TouchableOpacity>
  );

  const renderSearchTab = () => (
    <View style={styles.tabContent}>
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

      {searchLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          keyExtractor={(item) => item.code}
          style={styles.searchResults}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery && !searchLoading ? (
              <View style={styles.emptySearchState}>
                <Package color="#6B7280" size={48} />
                <Text style={styles.emptySearchTitle}>Aucun produit trouvé</Text>
                <Text style={styles.emptySearchText}>
                  Essayez avec un autre terme de recherche ou créez un nouveau produit
                </Text>
              </View>
            ) : (
              <View style={styles.emptySearchState}>
                <Search color="#6B7280" size={48} />
                <Text style={styles.emptySearchTitle}>Rechercher des produits</Text>
                <Text style={styles.emptySearchText}>
                  Saisissez le nom ou la marque d'un produit pour commencer la recherche
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );

  const renderCreateTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.createForm}>
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
          <Text style={styles.createProductButtonText}>Créer et ajouter à la commande</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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
          <Text style={styles.title}>Ajouter produit</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Search color={activeTab === 'search' ? '#3B82F6' : '#6B7280'} size={20} />
            <Text style={[
              styles.tabText,
              activeTab === 'search' && styles.activeTabText
            ]}>
              Rechercher
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'create' && styles.activeTab]}
            onPress={() => setActiveTab('create')}
          >
            <Plus color={activeTab === 'create' ? '#3B82F6' : '#6B7280'} size={20} />
            <Text style={[
              styles.tabText,
              activeTab === 'create' && styles.activeTabText
            ]}>
              Créer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'search' ? renderSearchTab() : renderCreateTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  searchResults: {
    flex: 1,
  },
  searchItem: {
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
  searchItemImageContainer: {
    marginRight: 12,
  },
  searchItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchItemInfo: {
    flex: 1,
    marginRight: 12,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySearchText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  createForm: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  quantityButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  quantityInputField: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 14,
  },
  createProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});