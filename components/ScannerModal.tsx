import React, { useState, useEffect } from 'react';
import { X, Camera, Search, Package, Calendar, Plus, Minus, Loader2 } from 'lucide-react';
import { OpenFoodFactsService } from '../services/OpenFoodFactsService';
import { OpenFoodFactsProduct, ProductInfo } from '../types/Product';

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (productInfo: ProductInfo) => void;
}

export default function ScannerModal({ visible, onClose, onScan }: ScannerModalProps) {
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [productBrand, setProductBrand] = useState<string>('');
  const [productImage, setProductImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingProduct, setFetchingProduct] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setScannedBarcode('');
    setProductName('');
    setProductBrand('');
    setProductImage('');
    setQuantity(1);
    setExpiryDate('');
    setShowForm(false);
    setManualMode(false);
    setSearchQuery('');
    setSearchResults([]);
    setFetchingProduct(false);
  };

  const fetchProductInfo = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    setFetchingProduct(true);
    try {
      const product = await OpenFoodFactsService.getProductByBarcode(barcode);
      if (product) {
        setProductName(product.product.product_name || '');
        setProductBrand(product.product.brands || '');
        setProductImage(product.product.image_url || '');
      } else {
        setProductName('');
        setProductBrand('');
        setProductImage('');
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleBarcodeChange = (barcode: string) => {
    setScannedBarcode(barcode);
    if (barcode.length >= 8) {
      fetchProductInfo(barcode);
    } else {
      setProductName('');
      setProductBrand('');
      setProductImage('');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await OpenFoodFactsService.searchProductsByName(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Impossible de rechercher les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: OpenFoodFactsProduct) => {
    setScannedBarcode(product.code);
    setProductName(product.product.product_name || '');
    setProductBrand(product.product.brands || '');
    setProductImage(product.product.image_url || '');
    setSearchResults([]);
    setSearchQuery('');
    setShowForm(true);
  };

  const handleConfirm = () => {
    if (!scannedBarcode.trim()) {
      alert('Veuillez saisir un code-barre valide');
      return;
    }

    if (quantity <= 0) {
      alert('La quantité doit être supérieure à zéro');
      return;
    }

    const productInfo: ProductInfo = {
      barcode: scannedBarcode,
      name: productName,
      brand: productBrand,
      imageUrl: productImage,
      quantity,
      expiryDate: expiryDate || undefined
    };

    onScan(productInfo);
    onClose();
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Ajouter au stock</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {!showForm && !manualMode ? (
            /* Scanner View */
            <div className="p-6 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Camera size={48} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Scanner un code-barre</h3>
                <p className="text-gray-600">
                  Utilisez votre caméra pour scanner le code-barre du produit
                </p>
              </div>
              
              <button
                onClick={() => setManualMode(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Saisie manuelle
              </button>
            </div>
          ) : manualMode && !showForm ? (
            /* Manual Entry View */
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Rechercher un produit</h3>
              
              {/* Search Section */}
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nom ou marque du produit"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Rechercher'}
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.code}
                        onClick={() => handleSelectProduct(product)}
                        className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {product.product.image_url ? (
                            <img
                              src={product.product.image_url}
                              alt={product.product.product_name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {product.product.product_name || `Produit ${product.code}`}
                            </p>
                            {product.product.brands && (
                              <p className="text-sm text-gray-500 truncate">{product.product.brands}</p>
                            )}
                            <p className="text-xs text-gray-400">Code: {product.code}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 font-medium">OU</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Manual Barcode Entry */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code-barre manuel
                  </label>
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => handleBarcodeChange(e.target.value)}
                    placeholder="Saisissez le code-barre"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Section d'affichage du nom du produit scanné */}
                {scannedBarcode && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      Informations du produit
                    </h4>
                    
                    {fetchingProduct ? (
                      <div className="flex items-center gap-3 text-blue-700">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm font-medium">Récupération des informations...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-14 h-14 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package size={24} className="text-blue-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {productName ? (
                              <div>
                                <p className="font-semibold text-gray-900 text-base leading-tight">
                                  {productName}
                                </p>
                                {productBrand && (
                                  <p className="text-sm text-blue-600 font-medium mt-1">
                                    {productBrand}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Code: {scannedBarcode}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-gray-600 italic text-sm">
                                  Produit non trouvé dans la base de données
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Code: {scannedBarcode}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {scannedBarcode && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Continuer
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Product Form View */
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations du produit</h3>
              
              <div className="space-y-6">
                {/* Barcode Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code-barre
                  </label>
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => handleBarcodeChange(e.target.value)}
                    placeholder="Saisissez le code-barre"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Section d'affichage du nom du produit dans le formulaire */}
                {(fetchingProduct || productName || productBrand || scannedBarcode) && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Package size={16} className="text-gray-600" />
                      Produit scanné
                    </h4>
                    
                    {fetchingProduct ? (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Loader2 size={18} className="animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Récupération des informations...</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {productName ? (
                            <div>
                              <p className="font-semibold text-gray-900 text-lg leading-tight">
                                {productName}
                              </p>
                              {productBrand && (
                                <p className="text-sm text-blue-600 font-medium mt-1">
                                  {productBrand}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-600 italic">
                              Nom du produit non trouvé
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Code-barre: {scannedBarcode}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => adjustQuantity(-1)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} className="text-gray-600" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-3 text-center border-0 focus:ring-0"
                      min="1"
                    />
                    <button
                      onClick={() => adjustQuantity(1)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Expiry Date Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de péremption (optionnel)
                  </label>
                  <div className="relative">
                    <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}