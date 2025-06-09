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
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, Camera, Plus, Calendar, Search, Package, ScanLine, FileText } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { OpenFoodFactsService } from '@/services/OpenFoodFactsService';
import { OpenFoodFactsProduct } from '@/types/Product';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import ProductCreationModal from './ProductCreationModal';


interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string, quantity: number, expiryDate?: string) => void;
}

export default function ScannerModal({ visible, onClose, onScan }: ScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [expiryDateObj, setExpiryDateObj] = useState<Date | undefined>(undefined);
  const [productInfo, setProductInfo] = useState<OpenFoodFactsProduct | null>(null);
  const [loadingProductInfo, setLoadingProductInfo] = useState<boolean>(false);
  const [showProductCreation, setShowProductCreation] = useState<boolean>(false);


  useEffect(() => {
    if (!visible) {
      setScannedBarcode('');
      setQuantity(1);
      setExpiryDate('');
      setShowForm(false);
      setManualMode(false);
      setSearchQuery('');
      setSearchResults([]);
      setExpiryDateObj(undefined);
      setProductInfo(null);
      setLoadingProductInfo(false);
      setShowProductCreation(false);
    }
  }, [visible]);

  useEffect(() => {
    if (scannedBarcode && showForm) {
      loadProductInfo();
    }
  }, [scannedBarcode, showForm]);

  const loadProductInfo = async () => {
    if (!scannedBarcode.trim()) return;

    setLoadingProductInfo(true);
    try {
      const info = await OpenFoodFactsService.getProductByBarcode(scannedBarcode);
      setProductInfo(info);
    } catch (error) {
      console.error('Erreur lors du chargement des informations produit:', error);
      setProductInfo(null);
    } finally {
      setLoadingProductInfo(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannedBarcode(data);
    setShowForm(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await OpenFoodFactsService.searchProductsByName(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      Alert.alert('Erreur', 'Impossible de rechercher les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: OpenFoodFactsProduct) => {
    setScannedBarcode(product.code);
    setProductInfo(product);
    setSearchResults([]);
    setSearchQuery('');
    setShowForm(true);
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

  const handleConfirm = () => {
    if (!scannedBarcode.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un code-barre valide');
      return;
    }

    if (quantity <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à zéro');
      return;
    }

    onScan(scannedBarcode, quantity, expiryDate || undefined);
    onClose();
  };

  const handleCreateProduct = () => {
    setShowProductCreation(true);
  };

  const handleProductCreated = () => {
    setShowProductCreation(false);
    // Recharger les informations du produit
    if (scannedBarcode) {
      loadProductInfo();
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const renderProductItem = ({ item }: { item: OpenFoodFactsProduct }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleSelectProduct(item)}
    >
      <View style={styles.productImageContainer}>
        {item.product.image_url ? (
          <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Package color="#6B7280" size={24} />
          </View>
        )}
      </View>
      
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product.product_name || `Produit ${item.code}`}
        </Text>
        {item.product.brands && (
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.product.brands}
          </Text>
        )}
        <Text style={styles.productCode}>Code: {item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Camera color="#3B82F6" size={64} />
            <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
            <Text style={styles.permissionText}>
              Pour scanner les codes-barres, nous avons besoin d'accéder à votre caméra.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
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
          <Text style={styles.headerTitle}>Ajouter au stock</Text>
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
                Positionnez le code-barre dans le cadre
              </Text>
            </View>
            
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={() => setManualMode(true)}
              >
                <Text style={styles.manualButtonText}>Saisie manuelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : manualMode && !showForm ? (
          <ScrollView style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Rechercher un produit</Text>
              
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

              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Code-barre manuel</Text>
                <TextInput
                  style={styles.input}
                  value={scannedBarcode}
                  onChangeText={setScannedBarcode}
                  placeholder="Saisissez le code-barre"
                  keyboardType="numeric"
                />
                {scannedBarcode && (
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => setShowForm(true)}
                  >
                    <Text style={styles.continueButtonText}>Continuer</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.createProductButton}
                onPress={handleCreateProduct}
              >
                <FileText color="#FFFFFF" size={20} />
                <Text style={styles.createProductButtonText}>Créer une nouvelle fiche produit</Text>
              </TouchableOpacity>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>Recherche en cours...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <View style={styles.resultsContainer}>
                  <Text style={styles.resultsTitle}>Résultats de recherche</Text>
                  <FlatList
                    data={searchResults}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.code}
                    showsVerticalScrollIndicator={false}
                    style={styles.resultsList}
                  />
                </View>
              ) : null}
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Informations du produit</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Code-barre</Text>
                <TextInput
                  style={styles.input}
                  value={scannedBarcode}
                  onChangeText={(text) => {
                    setScannedBarcode(text);
                    setProductInfo(null);
                  }}
                  placeholder="Saisissez le code-barre"
                  keyboardType="numeric"
                />
              </View>

              {loadingProductInfo ? (
                <View style={styles.productInfoContainer}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text style={styles.productInfoLoading}>Chargement des informations...</Text>
                </View>
              ) : productInfo ? (
                <View style={styles.productInfoContainer}>
                  <Text style={styles.productInfoLabel}>Nom du produit</Text>
                  <Text style={styles.productInfoText}>
                    {productInfo.product.product_name || `Produit ${scannedBarcode}`}
                  </Text>
                  {productInfo.product.brands && (
                    <>
                      <Text style={styles.productInfoLabel}>Marque</Text>
                      <Text style={styles.productInfoText}>{productInfo.product.brands}</Text>
                    </>
                  )}
                </View>
              ) : scannedBarcode ? (
                <View style={styles.productInfoContainer}>
                  <Text style={styles.productInfoText}>
                    Produit inexistant
                  </Text>
                  <Text style={styles.productInfoSubtext}>
                    Informations non disponibles
                  </Text>
                  <TouchableOpacity
                    style={styles.createProductSmallButton}
                    onPress={handleCreateProduct}
                  >
                    <FileText color="#3B82F6" size={16} />
                    <Text style={styles.createProductSmallButtonText}>Créer une fiche produit</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantité</Text>
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date de péremption (optionnel)</Text>
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

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelFormButton} onPress={onClose}>
                  <Text style={styles.cancelFormButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                  <Text style={styles.confirmButtonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        <ProductCreationModal
          visible={showProductCreation}
          barcode={scannedBarcode}
          onClose={() => setShowProductCreation(false)}
          onSave={handleProductCreated}
        />
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
    backgroundColor: '#3B82F6',
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
    borderColor: '#3B82F6',
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
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
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
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  continueButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  createProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createProductSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF8FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  createProductSmallButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
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
  resultsContainer: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  resultsList: {
    maxHeight: 300,
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
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  productCode: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  productInfoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  productInfoText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  productInfoSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  productInfoLoading: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
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
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});