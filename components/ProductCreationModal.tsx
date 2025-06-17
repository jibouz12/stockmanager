import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { X, Save, Calendar, Package } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StorageService } from '@/services/StorageService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductCreationModalProps {
  visible: boolean;
  barcode?: string;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export default function ProductCreationModal({ 
  visible, 
  barcode = '', 
  onClose, 
  onSave 
}: ProductCreationModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [minStock, setMinStock] = useState<number>(5);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [productBarcode, setProductBarcode] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [expiryDateObj, setExpiryDateObj] = useState<Date | undefined>(undefined);
  const [isManualCreation, setIsManualCreation] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      // Réinitialiser les champs
      setName('');
      setBrand('');
      setQuantity(1);
      setMinStock(5);
      setExpiryDate('');
      setUnit('');
      setExpiryDateObj(undefined);
      
      // Déterminer si c'est une création manuelle ou depuis un scan
      const isManual = !barcode || barcode.trim() === '';
      setIsManualCreation(isManual);
      
      if (isManual) {
        // Générer un code-barre unique pour la création manuelle
        const timestamp = Date.now().toString();
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setProductBarcode(`MANUAL${timestamp}${randomSuffix}`);
      } else {
        setProductBarcode(barcode);
      }
    }
  }, [visible, barcode]);

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const adjustMinStock = (delta: number) => {
    setMinStock(Math.max(0, minStock + delta));
  };

  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDateObj(selectedDate);
      setExpiryDate(selectedDate.toISOString());
    }
  };

  const getDisplayDate = (): string => {
    if (expiryDateObj) {
      return formatDateToDDMMYYYY(expiryDateObj);
    }
    if (expiryDate) {
      const date = new Date(expiryDate);
      return formatDateToDDMMYYYY(date);
    }
    return 'Choisir une date';
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est obligatoire');
      return;
    }

    if (quantity <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à zéro');
      return;
    }

    if (minStock < 0) {
      Alert.alert('Erreur', 'Le stock minimum ne peut pas être négatif');
      return;
    }

    try {
      // Pour les créations manuelles, vérifier l'unicité du nom plutôt que du code-barre
      const existingProducts = await StorageService.getProducts();
      
      if (!isManualCreation) {
        // Pour les produits scannés, vérifier le code-barre
        const existingProduct = existingProducts.find(p => p.barcode === productBarcode);
        if (existingProduct) {
          Alert.alert('Erreur', 'Un produit avec ce code-barre existe déjà');
          return;
        }
      } else {
        // Pour les créations manuelles, vérifier si un produit avec le même nom existe déjà
        const existingProduct = existingProducts.find(p => 
          p.name.toLowerCase().trim() === name.toLowerCase().trim() &&
          (brand.trim() === '' || p.brand?.toLowerCase().trim() === brand.toLowerCase().trim())
        );
        if (existingProduct) {
          Alert.alert(
            'Produit similaire trouvé', 
            `Un produit "${existingProduct.name}"${existingProduct.brand ? ` de la marque "${existingProduct.brand}"` : ''} existe déjà. Voulez-vous continuer ?`,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Continuer', onPress: () => createProduct() }
            ]
          );
          return;
        }
      }

      await createProduct();
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      Alert.alert('Erreur', 'Impossible de créer le produit');
    }
  };

  const createProduct = async () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      barcode: productBarcode,
      name: name.trim(),
      brand: brand.trim() || undefined,
      quantity,
      minStock,
      expiryDate: expiryDate.trim() || undefined,
      unit: unit.trim() || undefined,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await StorageService.saveProduct(newProduct);
    onSave(newProduct);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isManualCreation ? t('addProduct.createNewProduct') : 'Créer une fiche produit'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#6B7280" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.form}>
            {!isManualCreation && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Code-barre</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyText}>{productBarcode}</Text>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('addProduct.productNamePlaceholder')} *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('addProduct.productNamePlaceholder')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('addProduct.brandPlaceholder')}</Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder={t('addProduct.brandPlaceholder')}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Quantité initiale</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => adjustQuantity(-1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity.toString()}
                    onChangeText={(text) => setQuantity(Math.max(1, parseInt(text) || 1))}
                    placeholder="1"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => adjustQuantity(1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>{t('quantity.minimum')}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => adjustMinStock(-1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={minStock.toString()}
                    onChangeText={(text) => setMinStock(Math.max(0, parseInt(text) || 0))}
                    placeholder="5"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => adjustMinStock(1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('scanner.expiryDate')}</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar color="#6B7280" size={20} />
                <Text style={[
                  styles.dateText,
                  { color: expiryDate || expiryDateObj ? '#111827' : '#9CA3AF' }
                ]}>
                  {getDisplayDate()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={expiryDateObj || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('unit.units')}</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="unité(s), kg, L, etc."
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save color="#FFFFFF" size={20} />
                <Text style={styles.saveButtonText}>Créer le produit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  formContainer: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 12,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});