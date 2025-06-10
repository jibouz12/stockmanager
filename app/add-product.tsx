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
  Minus,
  Check
} from 'lucide-react-native';
import { OrderItem } from '@/types/Product';
import { OrderService } from '@/services/OrderService';
import { OpenFoodFactsService } from '@/services/OpenFoodFactsService';

export default function AddProductScreen() {
  const router = useRouter();
  
  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // États pour la création de produit
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductBrand, setNewProductBrand] = useState<string>('');
  const [newProductQuantity, setNewProductQuantity] = useState<number>(1);

  // États pour la gestion des quantités dans les résultats de recherche
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set());
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Rediriger vers la page de recherche avec la query
    router.push({
      pathname: '/search',
      params: { query: searchQuery }
    });
  };

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const results = await OpenFoodFactsService.searchProductsByName(searchQuery);
      // Limiter à 3 résultats pour l'aperçu
      setSearchResults(results.slice(0, 3));
      
      // Initialiser les quantités à 1 pour chaque produit trouvé
      const initialQuantities: { [key: string]: number } = {};
      results.slice(0, 3).forEach(result => {
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
      setSearchLoading(false);
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
      if (typeof window !== 'undefined') {
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

      // Notifier la page de commande via un événement personnalisé
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderUpdated', { 
          detail: { type: 'add', item: orderItem } 
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le produit');
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
              <ActivityIndicator size="small" color="#FFFFFF" />
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
        <Text style={styles.title}>Ajouter produit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Rechercher produit */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Search color="#3B82F6" size={24} />
            <Text style={styles.sectionTitle}>Rechercher produit</Text>
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
            <View style={styles.searchButtons}>
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Recherche complète</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickSearchButton} onPress={handleQuickSearch}>
                <Text style={styles.quickSearchButtonText}>Aperçu rapide</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Aperçu des résultats de recherche */}
          {searchLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Recherche en cours...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <View style={styles.searchResultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  Aperçu des résultats ({searchResults.length}/3)
                </Text>
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleSearch}
                >
                  <Text style={styles.viewAllButtonText}>Voir tous les résultats</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={(item) => item.code}
                style={styles.searchResults}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : searchQuery && !searchLoading ? (
            <View style={styles.noResultsContainer}>
              <Package color="#6B7280" size={32} />
              <Text style={styles.noResultsText}>Aucun produit trouvé</Text>
              <TouchableOpacity
                style={styles.fullSearchButton}
                onPress={handleSearch}
              >
                <Text style={styles.fullSearchButtonText}>Recherche complète</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Séparateur OU */}
        <View style={styles.orDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Section Créer nouveau produit */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Plus color="#10B981" size={24} />
            <Text style={styles.sectionTitle}>Créer nouveau produit</Text>
          </View>

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
                  style={styles.quantityButtonLarge}
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
                  style={styles.quantityButtonLarge}
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
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  searchContainer: {
    marginBottom: 16,
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
  searchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickSearchButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  quickSearchButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  searchResultsContainer: {
    marginTop: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllButton: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  viewAllButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  searchResults: {
    maxHeight: 300,
  },
  searchItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchItemImageContainer: {
    marginRight: 12,
  },
  searchItemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  searchItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  searchItemBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  searchItemCode: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  searchItemActions: {
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addedButton: {
    backgroundColor: '#059669',
  },
  addingButton: {
    backgroundColor: '#6B7280',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 12,
  },
  fullSearchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  fullSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
  },
  createForm: {
    marginTop: 8,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  quantityButtonLarge: {
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
    marginTop: 16,
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