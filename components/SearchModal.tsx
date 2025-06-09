import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { X, Search, Package, Minus, Plus } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StockService } from '@/services/StockService';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  mode?: 'edit' | 'remove'; // Nouveau prop pour définir le mode
}

export default function SearchModal({ visible, onClose, onSelectProduct, mode = 'edit' }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [removingProducts, setRemovingProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      // Utiliser la méthode appropriée selon le mode
      const results = mode === 'remove' 
        ? await StockService.searchProductsForRemoval(searchQuery)
        : await StockService.searchProductsInStock(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    if (mode === 'edit') {
      onSelectProduct(product);
      onClose();
    }
    // En mode 'remove', on ne ferme pas la modal et on ne sélectionne pas le produit
  };

  const handleRemoveQuantity = async (product: Product, quantity: number = 1) => {
    if (product.quantity <= 0) {
      Alert.alert('Attention', 'Ce produit est déjà en rupture de stock');
      return;
    }

    if (quantity > product.quantity) {
      Alert.alert('Erreur', `Quantité insuffisante en stock (disponible: ${product.quantity})`);
      return;
    }

    setRemovingProducts(prev => new Set(prev).add(product.id));

    try {
      await StockService.removeStock(product.barcode, quantity);
      
      // Mettre à jour les résultats de recherche
      setSearchResults(prevResults => 
        prevResults.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity - quantity }
            : p
        ).filter(p => p.quantity > 0) // Retirer les produits qui passent à 0
      );

      Alert.alert('Succès', `${quantity} produit(s) retiré(s) du stock`);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de retirer le produit');
    } finally {
      setRemovingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const showRemoveQuantityDialog = (product: Product) => {
    Alert.alert(
      'Retirer du stock',
      `Combien d'unités de "${product.name}" voulez-vous retirer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: '1 unité', 
          onPress: () => handleRemoveQuantity(product, 1) 
        },
        { 
          text: 'Quantité personnalisée', 
          onPress: () => showCustomQuantityDialog(product) 
        },
      ]
    );
  };

  const showCustomQuantityDialog = (product: Product) => {
    Alert.prompt(
      'Quantité à retirer',
      `Stock disponible: ${product.quantity}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Retirer', 
          onPress: (value) => {
            const quantity = parseInt(value || '0');
            if (quantity > 0) {
              handleRemoveQuantity(product, quantity);
            }
          }
        },
      ],
      'plain-text',
      '1'
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isRemoving = removingProducts.has(item.id);
    
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleSelectProduct(item)}
        disabled={isRemoving}
      >
        <View style={styles.productImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Package color="#6B7280" size={24} />
            </View>
          )}
        </View>
        
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.brand && (
            <Text style={styles.productBrand} numberOfLines={1}>
              {item.brand}
            </Text>
          )}
          <View style={styles.productInfo}>
            <Text style={[
              styles.productQuantity,
              { color: item.quantity <= item.minStock ? '#F97316' : '#10B981' }
            ]}>
              Stock: {item.quantity}
            </Text>
            <Text style={styles.productCode}>Code: {item.barcode}</Text>
          </View>
        </View>

        {mode === 'remove' && (
          <View style={styles.removeActions}>
            {isRemoving ? (
              <ActivityIndicator size="small\" color="#EF4444" />
            ) : (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => showRemoveQuantityDialog(item)}
              >
                <Minus color="#FFFFFF" size={18} />
                <Text style={styles.removeButtonText}>Retirer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getTitle = () => {
    switch (mode) {
      case 'remove':
        return 'Retirer du stock';
      default:
        return 'Rechercher dans le stock';
    }
  };

  const getEmptyText = () => {
    switch (mode) {
      case 'remove':
        return 'Recherchez un produit à retirer du stock';
      default:
        return 'Recherchez un produit';
    }
  };

  const getEmptySubtext = () => {
    switch (mode) {
      case 'remove':
        return 'Saisissez le nom, la marque ou le code-barre du produit à retirer';
      default:
        return 'Saisissez le nom, la marque ou le code-barre';
    }
  };

  const getNoResultsText = () => {
    switch (mode) {
      case 'remove':
        return 'Aucun produit disponible trouvé';
      default:
        return 'Aucun produit trouvé';
    }
  };

  const getNoResultsSubtext = () => {
    switch (mode) {
      case 'remove':
        return 'Aucun produit en stock ne correspond à votre recherche';
      default:
        return 'Essayez avec un autre terme de recherche';
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
              placeholder="Nom, marque ou code-barre du produit"
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Recherche en cours...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : searchQuery && !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{getNoResultsText()}</Text>
              <Text style={styles.emptySubtext}>
                {getNoResultsSubtext()}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{getEmptyText()}</Text>
              <Text style={styles.emptySubtext}>
                {getEmptySubtext()}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
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
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
  },
  resultsContainer: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productQuantity: {
    fontSize: 12,
    fontWeight: '500',
  },
  productCode: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  removeActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});