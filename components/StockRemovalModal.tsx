import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, Camera, Minus, Search, Package, ScanLine } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Product } from '@/types/Product';
import { StockService } from '@/services/StockService';
import { useTranslation } from '@/hooks/useTranslation';

interface StockRemovalModalProps {
  visible: boolean;
  onClose: () => void;
  onRemove: (barcode: string, quantity: number) => void;
}

export default function StockRemovalModal({ visible, onClose, onRemove }: StockRemovalModalProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [removingProducts, setRemovingProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) {
      setScannedBarcode('');
      setQuantity(1);
      setShowForm(false);
      setManualMode(false);
      setSearchQuery('');
      setSearchResults([]);
      setRemovingProducts(new Set());
    }
  }, [visible]);

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
      const results = await StockService.searchProductsForRemoval(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      Alert.alert(t('error.title'), t('error.searchProducts'));
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannedBarcode(data);
    setShowForm(true);
  };

  const handleSelectProduct = (product: Product) => {
    setScannedBarcode(product.barcode);
    setSearchResults([]);
    setSearchQuery('');
    setShowForm(true);
  };

  const handleRemoveQuantity = async (product: Product, quantityToRemove: number = 1) => {
    if (product.quantity <= 0) {
      Alert.alert(t('error.title'), t('removeStock.alreadyOutOfStock'));
      return;
    }

    if (quantityToRemove > product.quantity) {
      Alert.alert(t('error.title'), t('removeStock.insufficientStock', { available: product.quantity }));
      return;
    }

    setRemovingProducts(prev => new Set(prev).add(product.id));

    try {
      await StockService.removeStock(product.barcode, quantityToRemove);
      
      setSearchResults(prevResults => 
        prevResults.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity - quantityToRemove }
            : p
        ).filter(p => p.quantity > 0)
      );

      Alert.alert(t('success.title'), t('success.productRemoved', { quantity: quantityToRemove }));
    } catch (error: any) {
      Alert.alert(t('error.title'), error.message || t('error.removeProduct'));
    } finally {
      setRemovingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const showCustomQuantityDialog = (product: Product) => {
    Alert.prompt(
      t('removeStock.quantityToRemove'),
      t('removeStock.availableStock', { stock: product.quantity }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.remove'), 
          onPress: (value) => {
            const quantityToRemove = parseInt(value || '0');
            if (quantityToRemove > 0) {
              handleRemoveQuantity(product, quantityToRemove);
            }
          }
        },
      ],
      'plain-text',
      '1'
    );
  };

  const handleConfirm = () => {
    if (!scannedBarcode.trim()) {
      Alert.alert(t('error.title'), t('scanner.invalidBarcode'));
      return;
    }

    if (quantity <= 0) {
      Alert.alert(t('error.title'), t('scanner.invalidQuantity'));
      return;
    }

    onRemove(scannedBarcode, quantity);
    onClose();
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const renderProductItem = (item: Product) => {
    const isRemoving = removingProducts.has(item.id);
    
    return (
      <TouchableOpacity
        key={item.id}
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
              {t('order.stock')}: {item.quantity}
            </Text>
            <Text style={styles.productCode}>{t('scanner.code')}: {item.barcode}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Camera color="#EF4444" size={64} />
            <Text style={styles.permissionTitle}>{t('scanner.cameraPermission')}</Text>
            <Text style={styles.permissionText}>
              {t('scanner.cameraPermissionDesc')}
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>{t('scanner.allowAccess')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('removeStock.title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#6B7280" size={24} />
          </TouchableOpacity>
        </View>

        {!showForm && !manualMode ? (
          <View style={styles.scannerContainer}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'code128', 'code39'],
              }}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>
                {t('scanner.scanInstruction')}
              </Text>
            </View>
            
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={() => setManualMode(true)}
              >
                <Text style={styles.manualButtonText}>{t('removeStock.manualSearch')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : manualMode && !showForm ? (
          <View style={styles.formContainer}>
            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>{t('removeStock.searchInStock')}</Text>
              
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search color="#6B7280" size={20} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('removeStock.searchPlaceholder')}
                    returnKeyType="search"
                  />
                </View>
              </View>

              {searchQuery.trim() && (
                <Text style={styles.resultsTitle}>{t('removeStock.availableProducts')}</Text>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator key={loading.toString()} size="large" color="#EF4444" />
                <Text style={styles.loadingText}>{t('scanner.searching')}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
                {searchResults.map(renderProductItem)}
              </ScrollView>
            ) : searchQuery && !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('removeStock.noProductsFound')}</Text>
                <Text style={styles.emptySubtext}>
                  {t('removeStock.noProductsDesc')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <ScrollView style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>{t('removeStock.title')}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('scanner.code')}</Text>
                <TextInput
                  style={styles.input}
                  value={scannedBarcode}
                  onChangeText={setScannedBarcode}
                  placeholder={t('scanner.barcodePlaceholder')}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('removeStock.quantityToRemove')}</Text>
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

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelFormButton} onPress={onClose}>
                  <Text style={styles.cancelFormButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                  <Minus color="#FFFFFF" size={20} />
                  <Text style={styles.confirmButtonText}>{t('common.remove')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 24,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  manualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  manualButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
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
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
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
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    padding: 12,
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
  inputGroup: {
    marginBottom: 16,
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
  cancelFormButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelFormButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});