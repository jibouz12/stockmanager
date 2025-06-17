import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LANGUAGE_KEY = 'selected_language';

export type Language = 'fr' | 'en' | 'es';

export interface Translations {
  [key: string]: {
    fr: string;
    en: string;
    es: string;
  };
}

const translations: Translations = {
  // Navigation et onglets
  'tabs.stock': {
    fr: 'Stock',
    en: 'Stock',
    es: 'Stock'
  },
  'tabs.lowStock': {
    fr: 'Stock Bas',
    en: 'Low Stock',
    es: 'Stock Bajo'
  },
  'tabs.outOfStock': {
    fr: 'Rupture',
    en: 'Out of Stock',
    es: 'Sin Stock'
  },
  'tabs.expiring': {
    fr: 'DLC 5 jours',
    en: 'Expiring Soon',
    es: 'Caduca Pronto'
  },

  // Écran principal
  'main.title': {
    fr: 'Gestion de Stock',
    en: 'Stock Management',
    es: 'Gestión de Stock'
  },
  'main.inStock': {
    fr: 'En stock',
    en: 'In stock',
    es: 'En stock'
  },
  'main.lowStock': {
    fr: 'Stock bas',
    en: 'Low stock',
    es: 'Stock bajo'
  },
  'main.outOfStock': {
    fr: 'Rupture',
    en: 'Out of stock',
    es: 'Sin stock'
  },
  'main.orderTitle': {
    fr: 'Commande',
    en: 'Order',
    es: 'Pedido'
  },
  'main.orderSubtitle': {
    fr: 'Gérer les produits à commander',
    en: 'Manage products to order',
    es: 'Gestionar productos a pedir'
  },
  'main.addToStock': {
    fr: 'Ajouter au Stock',
    en: 'Add to Stock',
    es: 'Añadir al Stock'
  },
  'main.removeFromStock': {
    fr: 'Retirer du Stock',
    en: 'Remove from Stock',
    es: 'Quitar del Stock'
  },
  'main.noProducts': {
    fr: 'Aucun produit en stock',
    en: 'No products in stock',
    es: 'No hay productos en stock'
  },
  'main.noProductsDesc': {
    fr: 'Commencez par scanner un code-barre pour ajouter vos premiers produits',
    en: 'Start by scanning a barcode to add your first products',
    es: 'Comience escaneando un código de barras para añadir sus primeros productos'
  },
  'main.addProduct': {
    fr: 'Ajouter un produit',
    en: 'Add a product',
    es: 'Añadir un producto'
  },
  'main.loadingProducts': {
    fr: 'Chargement des produits...',
    en: 'Loading products...',
    es: 'Cargando productos...'
  },

  // Stock bas
  'lowStock.title': {
    fr: 'Stock Bas',
    en: 'Low Stock',
    es: 'Stock Bajo'
  },
  'lowStock.warning': {
    fr: '⚠️ Ces produits atteignent leur stock minimum',
    en: '⚠️ These products are reaching their minimum stock',
    es: '⚠️ Estos productos están alcanzando su stock mínimo'
  },
  'lowStock.noProducts': {
    fr: 'Aucun produit en stock bas',
    en: 'No products with low stock',
    es: 'No hay productos con stock bajo'
  },
  'lowStock.noProductsDesc': {
    fr: 'Tous vos produits ont un stock suffisant par rapport au minimum défini',
    en: 'All your products have sufficient stock compared to the defined minimum',
    es: 'Todos sus productos tienen stock suficiente comparado con el mínimo definido'
  },
  'lowStock.loading': {
    fr: 'Chargement des produits en stock bas...',
    en: 'Loading low stock products...',
    es: 'Cargando productos con stock bajo...'
  },

  // Rupture de stock
  'outOfStock.title': {
    fr: 'Rupture de Stock',
    en: 'Out of Stock',
    es: 'Sin Stock'
  },
  'outOfStock.warning': {
    fr: '🚨 Ces produits ne sont plus disponibles en stock',
    en: '🚨 These products are no longer available in stock',
    es: '🚨 Estos productos ya no están disponibles en stock'
  },
  'outOfStock.noProducts': {
    fr: 'Aucune rupture de stock',
    en: 'No out of stock products',
    es: 'No hay productos sin stock'
  },
  'outOfStock.noProductsDesc': {
    fr: 'Tous vos produits sont disponibles en stock',
    en: 'All your products are available in stock',
    es: 'Todos sus productos están disponibles en stock'
  },
  'outOfStock.loading': {
    fr: 'Chargement des produits en rupture...',
    en: 'Loading out of stock products...',
    es: 'Cargando productos sin stock...'
  },

  // Produits expirant
  'expiring.title': {
    fr: 'DLC 5 jours',
    en: 'Expiring Soon',
    es: 'Caduca Pronto'
  },
  'expiring.warning': {
    fr: '📅 Ces produits expirent dans les 5 prochains jours',
    en: '📅 These products expire in the next 5 days',
    es: '📅 Estos productos caducan en los próximos 5 días'
  },
  'expiring.noProducts': {
    fr: 'Aucun produit à expiration proche',
    en: 'No products expiring soon',
    es: 'No hay productos que caduquen pronto'
  },
  'expiring.noProductsDesc': {
    fr: 'Tous vos produits ont une date de péremption supérieure à 5 jours',
    en: 'All your products have an expiration date greater than 5 days',
    es: 'Todos sus productos tienen una fecha de caducidad superior a 5 días'
  },
  'expiring.loading': {
    fr: 'Chargement des produits périmés...',
    en: 'Loading expiring products...',
    es: 'Cargando productos que caducan...'
  },
  'expiring.expiresIn': {
    fr: 'Expire dans {days} jours',
    en: 'Expires in {days} days',
    es: 'Caduca en {days} días'
  },
  'expiring.expiresToday': {
    fr: 'Expire aujourd\'hui',
    en: 'Expires today',
    es: 'Caduca hoy'
  },
  'expiring.expiresTomorrow': {
    fr: 'Expire demain',
    en: 'Expires tomorrow',
    es: 'Caduca mañana'
  },

  // Commandes
  'order.title': {
    fr: 'Commande',
    en: 'Order',
    es: 'Pedido'
  },
  'order.placeOrder': {
    fr: 'Passer la Commande',
    en: 'Place Order',
    es: 'Realizar Pedido'
  },
  'order.addProduct': {
    fr: 'Ajouter produit',
    en: 'Add product',
    es: 'Añadir producto'
  },
  'order.addProductDesc': {
    fr: 'Rechercher ou créer un nouveau produit',
    en: 'Search or create a new product',
    es: 'Buscar o crear un nuevo producto'
  },
  'order.autoSuggestions': {
    fr: 'Suggestions automatiques',
    en: 'Automatic suggestions',
    es: 'Sugerencias automáticas'
  },
  'order.autoSuggestionsDesc': {
    fr: 'Basées sur votre stock actuel',
    en: 'Based on your current stock',
    es: 'Basadas en su stock actual'
  },
  'order.manualItems': {
    fr: 'Articles ajoutés manuellement',
    en: 'Manually added items',
    es: 'Artículos añadidos manualmente'
  },
  'order.manualItemsDesc': {
    fr: 'Produits que vous avez ajoutés',
    en: 'Products you have added',
    es: 'Productos que ha añadido'
  },
  'order.hiddenSuggestions': {
    fr: 'Suggestions masquées',
    en: 'Hidden suggestions',
    es: 'Sugerencias ocultas'
  },
  'order.hiddenSuggestionsDesc': {
    fr: 'Suggestions que vous avez masquées',
    en: 'Suggestions you have hidden',
    es: 'Sugerencias que ha ocultado'
  },
  'order.noOrder': {
    fr: 'Aucune commande en cours',
    en: 'No order in progress',
    es: 'No hay pedido en curso'
  },
  'order.noOrderDesc': {
    fr: 'Ajoutez des produits à commander en utilisant le bouton ci-dessus',
    en: 'Add products to order using the button above',
    es: 'Añada productos a pedir usando el botón de arriba'
  },
  'order.loading': {
    fr: 'Chargement des commandes...',
    en: 'Loading orders...',
    es: 'Cargando pedidos...'
  },
  'order.stock': {
    fr: 'Stock',
    en: 'Stock',
    es: 'Stock'
  },
  'order.restore': {
    fr: 'Restaurer',
    en: 'Restore',
    es: 'Restaurar'
  },
  'order.hiddenSuggestion': {
    fr: 'Suggestion masquée',
    en: 'Hidden suggestion',
    es: 'Sugerencia oculta'
  },
  'order.hidden': {
    fr: 'masqué',
    en: 'hidden',
    es: 'oculto'
  },
  'order.hiddens': {
    fr: 'masqués',
    en: 'hidden',
    es: 'ocultos'
  },

  // Statuts des produits
  'product.inStock': {
    fr: 'En stock',
    en: 'In stock',
    es: 'En stock'
  },
  'product.lowStock': {
    fr: 'Stock bas',
    en: 'Low stock',
    es: 'Stock bajo'
  },
  'product.outOfStock': {
    fr: 'Rupture de stock',
    en: 'Out of stock',
    es: 'Sin stock'
  },
  'product.expiringSoon': {
    fr: 'Expire bientôt',
    en: 'Expires soon',
    es: 'Caduca pronto'
  },

  // Messages d'erreur et succès
  'error.title': {
    fr: 'Erreur',
    en: 'Error',
    es: 'Error'
  },
  'success.title': {
    fr: 'Succès',
    en: 'Success',
    es: 'Éxito'
  },
  'error.loadProducts': {
    fr: 'Impossible de charger les produits',
    en: 'Unable to load products',
    es: 'No se pueden cargar los productos'
  },
  'error.addProduct': {
    fr: 'Impossible d\'ajouter le produit',
    en: 'Unable to add product',
    es: 'No se puede añadir el producto'
  },
  'error.removeProduct': {
    fr: 'Impossible de retirer le produit',
    en: 'Unable to remove product',
    es: 'No se puede quitar el producto'
  },
  'success.productAdded': {
    fr: '{quantity} produit(s) ajouté(s) au stock',
    en: '{quantity} product(s) added to stock',
    es: '{quantity} producto(s) añadido(s) al stock'
  },
  'success.productRemoved': {
    fr: '{quantity} produit(s) retiré(s) du stock',
    en: '{quantity} product(s) removed from stock',
    es: '{quantity} producto(s) retirado(s) del stock'
  },

  // Boutons communs
  'common.cancel': {
    fr: 'Annuler',
    en: 'Cancel',
    es: 'Cancelar'
  },
  'common.save': {
    fr: 'Sauvegarder',
    en: 'Save',
    es: 'Guardar'
  },
  'common.delete': {
    fr: 'Supprimer',
    en: 'Delete',
    es: 'Eliminar'
  },
  'common.add': {
    fr: 'Ajouter',
    en: 'Add',
    es: 'Añadir'
  },
  'common.remove': {
    fr: 'Retirer',
    en: 'Remove',
    es: 'Quitar'
  },
  'common.search': {
    fr: 'Rechercher',
    en: 'Search',
    es: 'Buscar'
  },
  'common.loading': {
    fr: 'Chargement...',
    en: 'Loading...',
    es: 'Cargando...'
  },
  'common.ok': {
    fr: 'OK',
    en: 'OK',
    es: 'OK'
  },
  'common.continue': {
    fr: 'Continuer',
    en: 'Continue',
    es: 'Continuar'
  },

  // Unités et quantités
  'unit.units': {
    fr: 'unité(s)',
    en: 'unit(s)',
    es: 'unidad(es)'
  },
  'quantity.label': {
    fr: 'Quantité',
    en: 'Quantity',
    es: 'Cantidad'
  },
  'quantity.minimum': {
    fr: 'Stock minimum',
    en: 'Minimum stock',
    es: 'Stock mínimo'
  }
};

export class TranslationService {
  private static currentLanguage: Language = 'fr';

  static async initialize(): Promise<void> {
    try {
      let savedLanguage: Language | null = null;
      
      if (Platform.OS === 'web') {
        // Pour le web, utiliser localStorage
        savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language;
      } else {
        // Pour mobile, utiliser AsyncStorage
        savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY) as Language;
      }
      
      if (savedLanguage && ['fr', 'en', 'es'].includes(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la langue:', error);
    }
  }

  static async setLanguage(language: Language): Promise<void> {
    try {
      this.currentLanguage = language;
      
      if (Platform.OS === 'web') {
        // Pour le web, utiliser localStorage
        localStorage.setItem(LANGUAGE_KEY, language);
      } else {
        // Pour mobile, utiliser AsyncStorage
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la langue:', error);
    }
  }

  static getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  static translate(key: string, params?: { [key: string]: string | number }): string {
    const translation = translations[key];
    
    if (!translation) {
      console.warn(`Traduction manquante pour la clé: ${key}`);
      return key;
    }

    let text = translation[this.currentLanguage] || translation.fr || key;

    // Remplacer les paramètres dans le texte
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, String(params[param]));
      });
    }

    return text;
  }

  static t = this.translate; // Alias court pour la traduction
}