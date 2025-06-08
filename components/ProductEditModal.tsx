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
import { X, Save, Trash2, Calendar, Package, Plus, Minus } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StorageService } from '@/services/StorageService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface ProductEditModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductEditModal({ visible, product, onClose, onSave }: ProductEditModalProps) {
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [expiryDateObj, setExpiryDateObj] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBrand(product.brand || '');
      setQuantity(product.quantity);
      setMinStock(product.minStock);
      setExpiryDate(product.expiryDate || '');
      setUnit(product.unit || '');
    }
  }, [product]);

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(0, quantity + delta));
  };

  const adjustMinStock = (delta: number) => {
    setMinStock(Math.max(0, minStock + delta));
  };

  const handleSave = async () => {
    if (!product) return;

    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est obligatoire');
      return;
    }

    if (quantity < 0) {
      Alert.alert('Erreur', 'La quantité ne peut pas être négative');
      return;
    }

    if (minStock < 0) {
      Alert.alert('Erreur', 'Le stock minimum ne peut pas être négatif');
      return;
    }

    try {
      const updatedProduct: Product = {
        ...product,
        name: name.trim(),
        brand: brand.trim() || undefined,
        quantity,
        minStock,
        expiryDate: expiryDate.trim() || undefined,
        unit: unit.trim() || undefined,
        lastUpdated: new Date().toISOString(),
      };

      await StorageService.saveProduct(updatedProduct);
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleDelete = () => {
    if (!product) return;

    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${product.name}" du stock ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteProduct(product.id);
              onSave();
              onClose();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          },
        },
      ]
    );
  };

  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Modifier le produit</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#6B7280" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du produit</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nom du produit"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Marque</Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Marque du produit"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Quantité</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => adjustQuantity(-1)}
                  >
                    <Minus color="#EF4444" size={18} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity.toString()}
                    onChangeText={(text) => setQuantity(Math.max(0, parseInt(text) || 0))}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => adjustQuantity(1)}
                  >
                    <Plus color="#10B981" size={18} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Stock minimum</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => adjustMinStock(-1)}
                  >
                    <Minus color="#EF4444" size={18} />
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
                    <Plus color="#10B981" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date de péremption (optionnel)</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: expiryDate ? '#111827' : '#9CA3AF' }}>
                    {expiryDate || 'Choisir une date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={expiryDateObj || new Date()}
                    placeholder="JJ-MM-AAAA"
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        const formatted = selectedDate.toString();
                        setExpiryDateObj(selectedDate);
                        setExpiryDate(formatted);
                      }
                    }}
                  />
                )}
              </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Unité</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="unité(s), kg, L, etc."
              />
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Informations</Text>
              <Text style={styles.infoText}>Code-barre: {product.barcode}</Text>
              <Text style={styles.infoText}>
                Ajouté le: {new Date(product.addedAt).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={styles.infoText}>
                Dernière modification: {new Date(product.lastUpdated).toLocaleDateString('fr-FR')}
              </Text>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Trash2 color="#FFFFFF" size={20} />
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save color="#FFFFFF" size={20} />
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 12,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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