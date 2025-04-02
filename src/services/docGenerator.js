// services/docGenerator.js

// Clé de stockage dans le localStorage
const STORAGE_KEY = 'api-documentation';

// Stockage local pour la documentation
let documentation = {
  routes: [],
  apiPrefix: '',
  jsonStructure: {},
  timestamp: null
};

/**
 * Charge la documentation depuis le localStorage
 */
function loadFromStorage() {
  try {
    const savedDocs = localStorage.getItem(STORAGE_KEY);
    if (savedDocs) {
      documentation = JSON.parse(savedDocs);
      console.log('Documentation chargée depuis localStorage');
    }
  } catch (e) {
    console.warn('Impossible de charger la documentation depuis localStorage:', e);
  }
}

// Charger au démarrage
loadFromStorage();

/**
 * Enregistre la documentation générée
 * @param {Object} docs - L'objet de documentation
 */
export function saveDocumentation(docs) {
  // Ajouter un timestamp pour suivre quand cette API a été générée
  docs.timestamp = new Date().toISOString();
  
  documentation = { ...docs };
  
  // Sauvegarder dans localStorage pour persistance entre sessions
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documentation));
    console.log('Documentation sauvegardée dans localStorage');
  } catch (e) {
    console.warn('Impossible de sauvegarder la documentation dans localStorage:', e);
  }
}

/**
 * Récupère la documentation sauvegardée
 * @returns {Object} - L'objet de documentation
 */
export function getDocumentation() {
  // Recharger depuis localStorage à chaque fois pour s'assurer d'avoir les données à jour
  loadFromStorage();
  return documentation;
}

/**
 * Supprime la documentation sauvegardée
 */
export function clearDocumentation() {
  documentation = {
    routes: [],
    apiPrefix: '',
    jsonStructure: {},
    timestamp: null
  };
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Documentation supprimée du localStorage');
    return true;
  } catch (e) {
    console.warn('Impossible de supprimer la documentation du localStorage:', e);
    return false;
  }
}

/**
 * Vérifie si une documentation existe
 * @returns {Boolean} - True si une documentation existe
 */
export function hasDocumentation() {
  return documentation.routes && documentation.routes.length > 0;
}