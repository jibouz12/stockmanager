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
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Plus, Package, Save, Minus } from 'lucide-react-native';
import { OrderItem } from '@/types/Product';
import { OrderService } from '@/services/OrderService';
import { OpenFoodFactsService } from '@/services/OpenFoodFactsService';
import { useTranslation } from '@/hooks/useTranslation';

export default function AddProductScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
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
      Alert.alert(t('error.title'), 'Le nom du produit est obligatoire');
      return;
    }

    if (newProductQuantity <= 0) {
      Alert.alert(t('error.title'), 'La quantité doit être supérieure à zéro');
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
      
      Alert.alert(t('success.title'), 'Produit créé et ajouté à la commande', [
        { text: t('common.ok'), onPress: () => router.push('/order') }
      ]);

      // Notifier la page de commande via un événement personnalisé
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderUpdated', { 
          detail: { type: 'add', item: orderItem } 
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert(t('error.title'), 'Impossible de créer le produit');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/order')}
        >
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('addProduct.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* Section Créer nouveau produit */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Plus color="#10B981" size={20} />
              <Text style={styles.sectionTitle}>{t('addProduct.createNewProduct')}</Text>
            </View>

            <View style={styles.createForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('addProduct.productName')}</Text>
                <TextInput
                  style={styles.input}
                  value={newProductName}
                  onChangeText={setNewProductName}
                  placeholder={t('addProduct.productNamePlaceholder')}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('addProduct.brand')}</Text>
                <TextInput
                  style={styles.input}
                  value={newProductBrand}
                  onChangeText={setNewProductBrand}
                  placeholder={t('addProduct.brandPlaceholder')}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('quantity.label')} *</Text>
                <View style={styles.quantityInputContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setNewProductQuantity(Math.max(1, newProductQuantity - 1))}
                  >
                    <Minus color="#EF4444" size={16} />
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
                    <Plus color="#10B981" size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.createProductButton} onPress={handleCreateProduct}>
                <Save color="#FFFFFF" size={18} />
                <Text style={styles.createProductButtonText}>{t('addProduct.createAndAdd')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 42,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
  },
  createForm: {
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  quantityInputField: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 10,
  },
  createProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createProductButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});