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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Chrome as Home, Search, Plus, Package, Save, Minus } from 'lucide-react-native';
import { OrderItem } from '@/types/Product';
import { OrderService } from '@/services/OrderService';
import { OpenFoodFactsService } from '@/services/OpenFoodFactsService';

export default function AddProductScreen() {
  const router = useRouter();
  
  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState<string>('');

  // États pour la création de produit
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductBrand, setNewProductBrand] = useState<string>('');
  const [newProductQuantity, setNewProductQuantity] = useState<number>(1);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Rediriger vers la page de recherche avec la query
    router.push({
      pathname: '/search',
      params: { query: searchQuery }
    });
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
        { text: 'OK', onPress: () => router.push('/') }
      ]);

      // Notifier la page de commande via un événement personnalisé
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderUpdated', { 
          detail: { type: 'add', item: orderItem } 
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le produit');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Home color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Ajouter produit</Text>
        </View>
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
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Rechercher</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.searchDescription}>
            Recherchez dans la base de données OpenFoodFacts pour trouver des produits existants
          </Text>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 42,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  homeButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
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
    marginBottom: 12,
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
  searchDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
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