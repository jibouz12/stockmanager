import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Package, Calendar, TriangleAlert as AlertTriangle, Plus, Minus } from 'lucide-react-native';
import { Product } from '@/types/Product';
import { StockService } from '@/services/StockService';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onQuantityChange?: () => void;
}

export default function ProductCard({ product, onPress, onQuantityChange }: ProductCardProps) {
  const isLowStock = product.quantity <= product.minStock && product.quantity > 0;
  const isOutOfStock = product.quantity === 0;
  const isExpiring = product.expiryDate && new Date(product.expiryDate) <= new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  const getStatusColor = () => {
    if (isOutOfStock) return '#EF4444';
    if (isLowStock) return '#F97316';
    if (isExpiring) return '#EAB308';
    return '#10B981';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleAddQuantity = async () => {
    try {
      await StockService.addStock(product.barcode, 1);
      onQuantityChange?.();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'ajouter le produit');
    }
  };

  const handleRemoveQuantity = async () => {
    if (product.quantity <= 0) {
      Alert.alert('Attention', 'Ce produit est déjà en rupture de stock');
      return;
    }

    try {
      await StockService.removeStock(product.barcode, 1);
      onQuantityChange?.();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de retirer le produit');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: getStatusColor() }]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Package color="#6B7280" size={32} />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          {product.brand && (
            <Text style={styles.productBrand} numberOfLines={1}>
              {product.brand}
            </Text>
          )}

          <View style={styles.detailsRow}>
            <View style={styles.quantityContainer}>
              <Text style={[styles.quantity, { color: getStatusColor() }]}>
                {product.quantity}
              </Text>
              <Text style={styles.unit}>{product.unit || 'unité(s)'}</Text>
            </View>

            {product.expiryDate && (
              <View style={styles.expiryContainer}>
                <Calendar color="#6B7280" size={14} />
                <Text style={styles.expiryDate}>
                  {formatDate(product.expiryDate)}
                </Text>
                {isExpiring && (
                  <AlertTriangle color="#EAB308" size={14} />
                )}
              </View>
            )}
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.statusBar}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {isOutOfStock ? 'Rupture de stock' : 
                 isLowStock ? 'Stock bas' :
                 isExpiring ? 'Expire bientôt' : 
                 'En stock'}
              </Text>
            </View>

            <View style={styles.quantityActions}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleRemoveQuantity}
                disabled={product.quantity <= 0}
              >
                <Minus 
                  color={product.quantity <= 0 ? '#D1D5DB' : '#EF4444'} 
                  size={24} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quantityButton, styles.addButton]}
                onPress={handleAddQuantity}
              >
                <Plus color="#10B981" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
  },
  unit: {
    fontSize: 12,
    color: '#6B7280',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quantityActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#ECFDF5',
  },
});