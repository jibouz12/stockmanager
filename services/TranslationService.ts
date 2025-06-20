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
    fr: 'Expire bientôt',
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

  // Ajouter au stock / Scanner
  'scanner.title': {
    fr: 'Ajouter au stock',
    en: 'Add to stock',
    es: 'Añadir al stock'
  },
  'scanner.cameraPermission': {
    fr: 'Accès à la caméra requis',
    en: 'Camera access required',
    es: 'Acceso a la cámara requerido'
  },
  'scanner.cameraPermissionDesc': {
    fr: 'Pour scanner les codes-barres, nous avons besoin d\'accéder à votre caméra.',
    en: 'To scan barcodes, we need access to your camera.',
    es: 'Para escanear códigos de barras, necesitamos acceso a su cámara.'
  },
  'scanner.allowAccess': {
    fr: 'Autoriser l\'accès',
    en: 'Allow access',
    es: 'Permitir acceso'
  },
  'scanner.scanInstruction': {
    fr: 'Positionnez le code-barre dans le cadre',
    en: 'Position the barcode in the frame',
    es: 'Posicione el código de barras en el marco'
  },
  'scanner.manualEntry': {
    fr: 'Saisie manuelle',
    en: 'Manual entry',
    es: 'Entrada manual'
  },
  'scanner.searchProduct': {
    fr: 'Rechercher un produit',
    en: 'Search for a product',
    es: 'Buscar un producto'
  },
  'scanner.searchPlaceholder': {
    fr: 'Nom ou marque du produit',
    en: 'Product name or brand',
    es: 'Nombre o marca del producto'
  },
  'scanner.createNewProduct': {
    fr: 'Créer une nouvelle fiche produit',
    en: 'Create a new product sheet',
    es: 'Crear una nueva ficha de producto'
  },
  'scanner.manualBarcode': {
    fr: 'Code-barre manuel',
    en: 'Manual barcode',
    es: 'Código de barras manual'
  },
  'scanner.barcodePlaceholder': {
    fr: 'Saisissez le code-barre',
    en: 'Enter the barcode',
    es: 'Ingrese el código de barras'
  },
  'scanner.productInfo': {
    fr: 'Informations du produit',
    en: 'Product information',
    es: 'Información del producto'
  },
  'scanner.productNotFound': {
    fr: 'Produit inexistant',
    en: 'Product not found',
    es: 'Producto no encontrado'
  },
  'scanner.noInfoAvailable': {
    fr: 'Informations non disponibles',
    en: 'Information not available',
    es: 'Información no disponible'
  },
  'scanner.createProductSheet': {
    fr: 'Créer une fiche produit',
    en: 'Create product sheet',
    es: 'Crear ficha de producto'
  },
  'scanner.productCreatedSuccess': {
    fr: '✅ Fiche produit créée avec succès',
    en: '✅ Product sheet created successfully',
    es: '✅ Ficha de producto creada exitosamente'
  },
  'scanner.canAddToStock': {
    fr: 'Vous pouvez maintenant ajouter ce produit au stock',
    en: 'You can now add this product to stock',
    es: 'Ahora puede añadir este producto al stock'
  },
  'scanner.expiryDate': {
    fr: 'Date de péremption (optionnel)',
    en: 'Expiry date (optional)',
    es: 'Fecha de caducidad (opcional)'
  },
  'scanner.chooseDate': {
    fr: 'Choisir une date',
    en: 'Choose a date',
    es: 'Elegir una fecha'
  },
  'scanner.searchResults': {
    fr: 'Résultats de recherche',
    en: 'Search results',
    es: 'Resultados de búsqueda'
  },
  'scanner.loadingInfo': {
    fr: 'Chargement des informations...',
    en: 'Loading information...',
    es: 'Cargando información...'
  },
  'scanner.searching': {
    fr: 'Recherche en cours...',
    en: 'Searching...',
    es: 'Buscando...'
  },
  'scanner.invalidBarcode': {
    fr: 'Veuillez saisir un code-barre valide',
    en: 'Please enter a valid barcode',
    es: 'Por favor ingrese un código de barras válido'
  },
  'scanner.invalidQuantity': {
    fr: 'La quantité doit être supérieure à zéro',
    en: 'Quantity must be greater than zero',
    es: 'La cantidad debe ser mayor que cero'
  },
  'scanner.createProductFirst': {
    fr: 'Ce produit n\'existe pas dans la base de données. Veuillez créer une fiche produit avant de l\'ajouter au stock.',
    en: 'This product does not exist in the database. Please create a product sheet before adding it to stock.',
    es: 'Este producto no existe en la base de datos. Por favor cree una ficha de producto antes de añadirlo al stock.'
  },
  'scanner.product': {
    fr: 'Produit',
    en: 'Product',
    es: 'Producto'
  },
  'scanner.code': {
    fr: 'Code',
    en: 'Code',
    es: 'Código'
  },

  // Retirer du stock
  'removeStock.title': {
    fr: 'Retirer du stock',
    en: 'Remove from stock',
    es: 'Quitar del stock'
  },
  'removeStock.searchInStock': {
    fr: 'Rechercher dans le stock',
    en: 'Search in stock',
    es: 'Buscar en el stock'
  },
  'removeStock.searchPlaceholder': {
    fr: 'Nom, marque ou code-barre du produit',
    en: 'Product name, brand or barcode',
    es: 'Nombre, marca o código de barras del producto'
  },
  'removeStock.availableProducts': {
    fr: 'Produits disponibles en stock',
    en: 'Products available in stock',
    es: 'Productos disponibles en stock'
  },
  'removeStock.quantityToRemove': {
    fr: 'Quantité à retirer',
    en: 'Quantity to remove',
    es: 'Cantidad a quitar'
  },
  'removeStock.manualSearch': {
    fr: 'Recherche manuelle',
    en: 'Manual search',
    es: 'Búsqueda manual'
  },
  'removeStock.noProductsFound': {
    fr: 'Aucun produit disponible trouvé',
    en: 'No available products found',
    es: 'No se encontraron productos disponibles'
  },
  'removeStock.noProductsDesc': {
    fr: 'Aucun produit en stock ne correspond à votre recherche',
    en: 'No products in stock match your search',
    es: 'Ningún producto en stock coincide con su búsqueda'
  },
  'removeStock.alreadyOutOfStock': {
    fr: 'Ce produit est déjà en rupture de stock',
    en: 'This product is already out of stock',
    es: 'Este producto ya está sin stock'
  },
  'removeStock.insufficientStock': {
    fr: 'Quantité insuffisante en stock (disponible: {available})',
    en: 'Insufficient stock quantity (available: {available})',
    es: 'Cantidad insuficiente en stock (disponible: {available})'
  },
  'removeStock.availableStock': {
    fr: 'Stock disponible: {stock}',
    en: 'Available stock: {stock}',
    es: 'Stock disponible: {stock}'
  },

  // Ajouter produit
  'addProduct.title': {
    fr: 'Ajouter produit',
    en: 'Add product',
    es: 'Añadir producto'
  },
  'addProduct.searchProduct': {
    fr: 'Rechercher produit',
    en: 'Search product',
    es: 'Buscar producto'
  },
  'addProduct.createNewProduct': {
    fr: 'Créer nouveau produit',
    en: 'Create new product',
    es: 'Crear nuevo producto'
  },
  'addProduct.productName': {
    fr: 'Nom du produit *',
    en: 'Product name *',
    es: 'Nombre del producto *'
  },
  'addProduct.productNamePlaceholder': {
    fr: 'Nom du produit',
    en: 'Product name',
    es: 'Nombre del producto'
  },
  'addProduct.brand': {
    fr: 'Marque (optionnel)',
    en: 'Brand (optional)',
    es: 'Marca (opcional)'
  },
  'addProduct.brandPlaceholder': {
    fr: 'Marque du produit',
    en: 'Product brand',
    es: 'Marca del producto'
  },
  'addProduct.createAndAdd': {
    fr: 'Créer et ajouter à la commande',
    en: 'Create and add to order',
    es: 'Crear y añadir al pedido'
  },
  'addProduct.resultsFound': {
    fr: 'Résultats trouvés ({count})',
    en: 'Results found ({count})',
    es: 'Resultados encontrados ({count})'
  },
  'addProduct.adjustQuantities': {
    fr: 'Ajustez les quantités et ajoutez à votre commande',
    en: 'Adjust quantities and add to your order',
    es: 'Ajuste las cantidades y añada a su pedido'
  },
  'addProduct.noResults': {
    fr: 'Aucun produit trouvé',
    en: 'No products found',
    es: 'No se encontraron productos'
  },
  'addProduct.noResultsDesc': {
    fr: 'Essayez avec d\'autres mots-clés ou créez un nouveau produit',
    en: 'Try with other keywords or create a new product',
    es: 'Pruebe con otras palabras clave o cree un nuevo producto'
  },
  'addProduct.searchProducts': {
    fr: 'Recherchez des produits',
    en: 'Search for products',
    es: 'Buscar productos'
  },
  'addProduct.searchDesc': {
    fr: 'Saisissez le nom ou la marque d\'un produit pour commencer',
    en: 'Enter the name or brand of a product to start',
    es: 'Ingrese el nombre o marca de un producto para comenzar'
  },

  // Résumé de commande
  'orderSummary.title': {
    fr: 'Résumé de Commande',
    en: 'Order Summary',
    es: 'Resumen del Pedido'
  },
  'orderSummary.placeOrder': {
    fr: 'Passer la Commande',
    en: 'Place Order',
    es: 'Realizar Pedido'
  },
  'orderSummary.shareList': {
    fr: 'Partagez votre liste de commande',
    en: 'Share your order list',
    es: 'Comparta su lista de pedido'
  },
  'orderSummary.share': {
    fr: 'Partager',
    en: 'Share',
    es: 'Compartir'
  },
  'orderSummary.noOrder': {
    fr: 'Aucune commande',
    en: 'No order',
    es: 'Sin pedido'
  },
  'orderSummary.noOrderDesc': {
    fr: 'Aucun produit n\'est actuellement dans votre commande',
    en: 'No products are currently in your order',
    es: 'No hay productos actualmente en su pedido'
  },
  'orderSummary.loading': {
    fr: 'Chargement du résumé...',
    en: 'Loading summary...',
    es: 'Cargando resumen...'
  },
  'orderSummary.orderOf': {
    fr: 'Commande du {date}',
    en: 'Order of {date}',
    es: 'Pedido del {date}'
  },
  'orderSummary.shareSuccess': {
    fr: 'Commande copiée dans le presse-papiers',
    en: 'Order copied to clipboard',
    es: 'Pedido copiado al portapapeles'
  },
  'orderSummary.shareError': {
    fr: 'Impossible de partager la commande',
    en: 'Unable to share order',
    es: 'No se puede compartir el pedido'
  },
  'orderSummary.noProductsToShare': {
    fr: 'Aucun produit dans la commande à partager',
    en: 'No products in order to share',
    es: 'No hay productos en el pedido para compartir'
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
  'error.searchProducts': {
    fr: 'Impossible de rechercher les produits',
    en: 'Unable to search products',
    es: 'No se pueden buscar productos'
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
  },

  // Créer produit
  'initial.quantity': {
    fr: 'quantité initiale',
    en: 'initial quantity',
    es: 'cantidad inicial'
  },
  'create.product': {
    fr: 'créer produit',
    en: 'Create product',
    es: 'crear producto'
  },
  'choose.date': {
    fr: 'Choisir une date',
    en: 'Choose a date',
    es: 'Elige une fecha'
  },
  'error.1': {
    fr: 'Le nom du produit est obligatoire',
    en: 'The product name is required',
    es: 'El nombre del producto es obligatorio'
  },
  'error.2': {
    fr: 'La quantité doit être supérieure à zéro',
    en: 'Quantity must be greater than zero',
    es: 'La cantidad debe ser mayor que cero'
  },
  'error.3': {
    fr: 'Le stock minimum ne peut pas être négatif',
    en: 'Minimum stock cannot be negative',
    es: 'El stock mínimo no puede ser negativo'
  },
  'error.4': {
    fr: 'Un produit avec ce code-barre existe déjà',
    en: 'A product with this barcode already exists',
    es: 'Ya existe un producto con este código de barras'
  },
  'edit.product': {
    fr: 'Modifier le produit',
    en: 'Edit product',
    es: 'Editar producto'
  },
  'code': {
    fr: 'Code',
    en: 'Code:',
    es: 'Código:'
  },
  'ajout': {
    fr: 'Ajouté le:',
    en: 'Added:',
    es: 'Agregado:'
  },
  'last.modif': {
    fr: 'Dernière modification:',
    en: 'Last modified:',
    es: 'Última modificación:'
  },
  'ou': {
    fr: 'Ou',
    en: 'Or',
    es: 'O'
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