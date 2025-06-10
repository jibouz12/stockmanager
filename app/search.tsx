import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Minus,
  Package,
  Check
} from 'lucide-react-native';
import { OrderItem } from '@/types/Product';
import { OrderService } from '@/services/OrderService';
import { OpenFoodFactsService } from '@/services/OpenFoodFactsService';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = params.query as string || '';
  
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set());
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  // Effectuer la recherche automatiquement si une query initiale est fournie
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await OpenFoodFactsService.searchProductsByName(searchQuery);
      setSearchResults(results);
      
      // Initialiser les quantités à 1 pour chaque produit trouvé
      const initialQuantities: { [key: string]: number } = {};
      results.forEach(result => {
        initialQuantities[result.code] = 1;
      });
      setProductQuantities(initialQuantities);
      
      // Réinitialiser les états d'ajout
      setAddingProducts(new Set());
      setAddedProducts(new Set());
    } catch (error) {
      console.error('Erreur de recherche:', error);
      Alert.alert('Erreur', 'Impossible de rechercher les produits');
    } finally {
      setLoading(false);
    }
  };

  const updateProductQuantity = (productCode: string, delta: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productCode]: Math.max(1, (prev[productCode] || 1) + delta)
    }));
  };

  const setProductQuantity = (productCode: string, quantity: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productCode]: Math.max(1, quantity)
    }));
  };

  const handleAddFromSearch = async (product: any) => {
    const productCode = product.code;
    const quantity = productQuantities[productCode] || 1;

    setAddingProducts(prev => new Set(prev).add(productCode));

    try {
      const orderItem: OrderItem = {
        id: Date.now().toString(),
        name: product.product.product_name || `Produit ${product.code}`,
        brand: product.product.brands || undefined,
        quantity: quantity,
        barcode: product.code,
        imageUrl: product.product.image_url || undefined,
        addedAt: new Date().toISOString(),
      };

      await OrderService.addOrderItem(orderItem);
      
      // Marquer le produit comme ajouté
      setAddedProducts(prev => new Set(prev).add(productCode));
      
      // Afficher un message de succès discret
      Alert.alert('Succès', `${quantity} x "${orderItem.name}" ajouté à la commande`);
      
      // Notifier la page de commande via un événement personnalisé
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderUpdated', { 
          detail: { type: 'add', item: orderItem } 
        }));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
    } finally {
      setAddingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productCode);
        return newSet;
      });
    }
  };

  const renderSearchItem = ({ item }: { item: any }) => {
    const productCode = item.code;
    const quantity = productQuantities[productCode] || 1;
    const isAdding = addingProducts.has(productCode);
    const isAdded = addedProducts.has(productCode);

    return (
      <View style={styles.searchItem}>
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
        
        <View style={styles.searchItemActions}>
          {/* Contrôles de quantité */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateProductQuantity(productCode, -1)}
              disabled={isAdding}
            >
              <Minus color="#EF4444" size={16} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={(text) => setProductQuantity(productCode, parseInt(text) || 1)}
              keyboardType="numeric"
              editable={!isAdding}
            />
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateProductQuantity(productCode, 1)}
              disabled={isAdding}
            >
              <Plus color="#10B981" size={16} />
            </TouchableOpacity>
          </View>

          {/* Bouton d'ajout */}
          <TouchableOpacity
            style={[
              styles.addButton,
              isAdded && styles.addedButton,
              isAdding && styles.addingButton
            ]}
            onPress={() => handleAddFromSearch(item)}
            disabled={isAdding || isAdded}
          >
            {isAdding ? (
              <ActivityIndicator key={isAdding.toString()} size="small" color="#FFFFFF" />
            ) : isAdded ? (
              <Check color="#FFFFFF" size={18} />
            ) : (
              <Plus color="#FFFFFF" size={18} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <Text style={styles.title}>Recherche de produits</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchSection}>
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
              autoFocus={!initialQuery}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator key={loading.toString()} size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Recherche en cours...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Résultats trouvés ({searchResults.length})
              </Text>
              <Text style={styles.resultsSubtitle}>
                Ajustez les quantités et ajoutez à votre commande
              </Text>
            </View>
            <FlatList
              data={searchResults}
              renderItem={renderSearchItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          </View>
        ) : searchQuery && !loading ? (
          <View style={styles.noResultsContainer}>
            <Package color="#6B7280" size={64} />
            <Text style={styles.noResultsTitle}>Aucun produit trouvé</Text>
            <Text style={styles.noResultsText}>
              Essayez avec d'autres mots-clés ou créez un nouveau produit
            </Text>
            <TouchableOpacity
              style={styles.createProductButton}
              onPress={() => router.push('/add-product')}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.createProductButtonText}>Créer un nouveau produit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Search color="#6B7280" size={64} />
            <Text style={styles.emptyTitle}>Recherchez des produits</Text>
            <Text style={styles.emptyText}>
              Saisissez le nom ou la marque d'un produit pour commencer
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultsList: {
    paddingVertical: 8,
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
  searchItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  searchItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  searchItemBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  searchItemCode: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchItemActions: {
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  quantityInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
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
  addedButton: {
    backgroundColor: '#059669',
  },
  addingButton: {
    backgroundColor: '#6B7280',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
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