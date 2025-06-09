import React, { useState, useEffect } from 'react';
import { X, Camera, Calendar, Search, Package, Loader2 } from 'lucide-react';
import { OpenFoodFactsService } from './services/OpenFoodFactsService';
import { OpenFoodFactsProduct } from './types/Product';

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string, quantity: number, expiryDate?: string) => void;
}

export default function ScannerModal({ visible, onClose, onScan }: ScannerModalProps) {
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) {
      setScannedBarcode('');
      setProductName('');
      setQuantity(1);
      setExpiryDate('');
      setShowForm(false);
      setManualMode(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (scannedBarcode && showForm) {
      fetchProductInfo(scannedBarcode);
    }
  }, [scannedBarcode, showForm]);

  const fetchProductInfo = async (barcode: string) => {
    setLoadingProduct(true);
    try {
      const product = await OpenFoodFactsService.getProductByBarcode(barcode);
      if (product && product.product.product_name) {
        setProductName(product.product.product_name);
      } else {
        setProductName('Produit non trouvé');
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
      setProductName('Erreur lors de la récupération');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await OpenFoodFactsService.searchProductsByName(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      alert('Impossible de rechercher les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: OpenFoodFactsProduct) => {
    setScannedBarcode(product.code);
    setProductName(product.product.product_name || 'Produit sans nom');
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

    onScan(scannedBarcode, quantity, expiryDate || undefined);
    onClose();
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleBarcodeChange = (value: string) => {
    setScannedBarcode(value);
    setProductName('');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ajouter au stock</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {!showForm && !manualMode ? (
            /* Scanner Mode */
            <div className="p-6 text-center">
              <div className="mb-6">
                <Camera size={64} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Scanner un code-barre
                </h3>
                <p className="text-gray-600">
                  Utilisez votre caméra pour scanner le code-barre du produit
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setManualMode(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Saisie manuelle
                </button>
                <p className="text-sm text-gray-500">
                  Scanner de code-barre non disponible dans cette version web
                </p>
              </div>
            </div>
          ) : manualMode && !showForm ? (
            /* Manual Mode */
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rechercher un produit
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nom ou marque du produit"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Rechercher'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-sm text-gray-500 font-medium">OU</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Manual Barcode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code-barre manuel
                </label>
                <input
                  type="text"
                  value={scannedBarcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Saisissez le code-barre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {scannedBarcode && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Continuer
                  </button>
                )}
              </div>

              {/* Search Results */}
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 size={32} className="animate-spin mx-auto text-blue-500 mb-2" />
                  <p className="text-gray-600">Recherche en cours...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Résultats de recherche</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleSelectProduct(item)}
                        className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 mr-3">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.product_name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.product.product_name || `Produit ${item.code}`}
                          </p>
                          {item.product.brands && (
                            <p className="text-sm text-gray-500 truncate">
                              {item.product.brands}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">Code: {item.code}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* Form Mode */
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations du produit
              </h3>
              
              <div className="space-y-4">
                {/* Barcode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code-barre
                  </label>
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => handleBarcodeChange(e.target.value)}
                    placeholder="Saisissez le code-barre"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Product Name */}
                {scannedBarcode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du produit
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {loadingProduct ? (
                        <div className="flex items-center text-gray-500">
                          <Loader2 size={16} className="animate-spin mr-2" />
                          Recherche du produit...
                        </div>
                      ) : (
                        <span className="text-gray-900">{productName || 'Nom non disponible'}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => adjustQuantity(-1)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-2 text-center border-0 focus:ring-0"
                      min="1"
                    />
                    <button
                      onClick={() => adjustQuantity(1)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Expiry Date */}
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}