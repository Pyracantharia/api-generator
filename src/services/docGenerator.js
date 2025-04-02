
// Stockage local pour la documentation
let documentation = {
    routes: [],
    apiPrefix: '',
    jsonStructure: {}
};

/**
 * Enregistre la documentation générée
 * @param {Object} docs - L'objet de documentation
 */
export function saveDocumentation(docs) {
    documentation = { ...docs };

    // Éventuellement sauvegarder dans localStorage pour persistance entre sessions
    try {
        localStorage.setItem('api-documentation', JSON.stringify(documentation));
    } catch (e) {
        console.warn('Impossible de sauvegarder la documentation dans localStorage:', e);
    }
}

/**
 * Récupère la documentation sauvegardée
 * @returns {Object} - L'objet de documentation
 */
export function getDocumentation() {
    // Tenter de charger depuis localStorage si disponible
    try {
        const savedDocs = localStorage.getItem('api-documentation');
        if (savedDocs) {
            documentation = JSON.parse(savedDocs);
        }
    } catch (e) {
        console.warn('Impossible de charger la documentation depuis localStorage:', e);
    }

    return documentation;
}