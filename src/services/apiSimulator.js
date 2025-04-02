

/**
 * Classe pour simuler les réponses d'une API REST basée sur un JSON
 */
class ApiSimulator {
    constructor() {
        this.data = {};
        this.routes = [];
        this.prefix = '';
    }

    /**
     * Initialise le simulateur avec des données et des routes
     * @param {Object} jsonData - Les données JSON source
     * @param {Array} routes - Les routes générées
     * @param {String} prefix - Le préfixe des routes
     */
    initialize(jsonData, routes, prefix) {
        this.data = JSON.parse(JSON.stringify(jsonData)); // Clone profond
        this.routes = routes;
        this.prefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
        console.log('Simulateur API initialisé avec',
            Object.keys(this.data).length, 'collections et',
            this.routes.length, 'routes');
        return this;
    }

    /**
     * Traite une requête simulée
     * @param {String} method - Méthode HTTP (GET, POST, PUT, DELETE)
     * @param {String} url - URL de la requête
     * @param {Object} body - Corps de la requête (pour POST, PUT)
     * @returns {Object} - Réponse simulée
     */
    request(method, url, body = null) {
        // Normaliser l'URL
        if (!url.startsWith(this.prefix)) {
            return {
                status: 404,
                data: { error: `L'URL doit commencer par ${this.prefix}` }
            };
        }

        const path = url.substring(this.prefix.length);
        console.log(`Simulation de requête ${method} ${path}`);

        // Trouver la route correspondante
        const matchingRoutes = this.findMatchingRoutes(method, path);
        if (matchingRoutes.length === 0) {
            return {
                status: 404,
                data: { error: 'Route non trouvée' }
            };
        }

        // Extraire les parties variables de l'URL
        const { route, params } = this.extractPathParams(matchingRoutes[0], path);

        // Traiter la requête selon la méthode
        switch (method.toUpperCase()) {
            case 'GET':
                return this.handleGet(route, params);
            case 'POST':
                return this.handlePost(route, params, body);
            case 'PUT':
                return this.handlePut(route, params, body);
            case 'DELETE':
                return this.handleDelete(route, params);
            default:
                return {
                    status: 405,
                    data: { error: 'Méthode non supportée' }
                };
        }
    }

    /**
     * Trouve les routes correspondant à une méthode et un chemin
     */
    findMatchingRoutes(method, path) {
        // Convertit le chemin en segments
        const pathSegments = path.split('/').filter(s => s.length > 0);

        return this.routes.filter(route => {
            // Vérifier que la méthode correspond
            if (route.method.toUpperCase() !== method.toUpperCase()) {
                return false;
            }

            // Convertir l'URL de la route en segments
            const routeUrl = route.url.substring(this.prefix.length);
            const routeSegments = routeUrl.split('/').filter(s => s.length > 0);

            // Si le nombre de segments ne correspond pas, ce n'est pas une correspondance
            if (routeSegments.length !== pathSegments.length) {
                return false;
            }

            // Vérifier chaque segment
            for (let i = 0; i < routeSegments.length; i++) {
                const routeSegment = routeSegments[i];
                const pathSegment = pathSegments[i];

                // Si le segment de route est un paramètre (entouré de {})
                if (routeSegment.startsWith('{') && routeSegment.endsWith('}')) {
                    continue; // C'est un paramètre, donc ça correspond à n'importe quoi
                }

                // Sinon, les segments doivent correspondre exactement
                if (routeSegment !== pathSegment) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Extrait les paramètres d'un chemin d'URL
     */
    extractPathParams(route, path) {
        const result = { route, params: {} };

        const routeUrl = route.url.substring(this.prefix.length);
        const routeSegments = routeUrl.split('/').filter(s => s.length > 0);
        const pathSegments = path.split('/').filter(s => s.length > 0);

        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const pathSegment = pathSegments[i];

            if (routeSegment.startsWith('{') && routeSegment.endsWith('}')) {
                const paramName = routeSegment.substring(1, routeSegment.length - 1);
                result.params[paramName] = pathSegment;
            }
        }

        return result;
    }

    /**
     * Récupère des données depuis le JSON selon un chemin
     */
    getDataFromPath(path) {
        // Convertir le chemin en segments, en ignorant le préfixe
        const segments = path.split('/').filter(s => s.length > 0);

        let currentData = this.data;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            // Si le segment ressemble à un ID numérique et le données actuelles sont un tableau
            if (!isNaN(segment) && Array.isArray(currentData)) {
                const index = parseInt(segment) - 1; // Convertir ID en index (hypothèse: IDs commence à 1)
                if (index >= 0 && index < currentData.length) {
                    currentData = currentData[index];
                } else {
                    return null; // Index hors limites
                }
            }
            // Sinon, le segment est une clé d'objet
            else if (currentData[segment] !== undefined) {
                currentData = currentData[segment];
            } else {
                // Essayer de trouver un objet dans un tableau avec cet ID
                if (Array.isArray(currentData)) {
                    const item = currentData.find(item => item.id === segment || item.id === parseInt(segment));
                    if (item) {
                        currentData = item;
                    } else {
                        return null; // Clé non trouvée
                    }
                } else {
                    return null; // Clé non trouvée
                }
            }
        }

        return currentData;
    }

    /**
     * Gère les requêtes GET
     */
    handleGet(route, params) {
        // Convertir l'URL de la route en un chemin pour les données
        let dataPath = route.url.substring(this.prefix.length);

        // Remplacer les paramètres dans le chemin
        for (const [key, value] of Object.entries(params)) {
            dataPath = dataPath.replace(`{${key}}`, value);
        }

        // Récupérer les données
        const data = this.getDataFromPath(dataPath);

        if (data === null) {
            return {
                status: 404,
                data: { error: 'Ressource non trouvée' }
            };
        }

        return {
            status: 200,
            data
        };
    }

    /**
     * Gère les requêtes POST (création)
     */
    handlePost(route, params, body) {
        if (!body) {
            return {
                status: 400,
                data: { error: 'Corps de requête requis' }
            };
        }

        // Convertir l'URL de la route en un chemin pour les données
        let dataPath = route.url.substring(this.prefix.length);

        // Remplacer les paramètres dans le chemin
        for (const [key, value] of Object.entries(params)) {
            dataPath = dataPath.replace(`{${key}}`, value);
        }

        // Récupérer la collection où ajouter l'élément
        const collection = this.getDataFromPath(dataPath);

        if (!Array.isArray(collection)) {
            return {
                status: 400,
                data: { error: 'Impossible d\'ajouter à une ressource qui n\'est pas une collection' }
            };
        }

        // Créer un ID unique pour le nouvel élément
        const newId = collection.length > 0
            ? Math.max(...collection.map(item => typeof item.id === 'number' ? item.id : 0)) + 1
            : 1;

        const newItem = { ...body, id: newId };
        collection.push(newItem);

        return {
            status: 201,
            data: { success: true, id: newId }
        };
    }

    /**
     * Gère les requêtes PUT (mise à jour)
     */
    handlePut(route, params, body) {
        if (!body) {
            return {
                status: 400,
                data: { error: 'Corps de requête requis' }
            };
        }

        if (!params.id) {
            return {
                status: 400,
                data: { error: 'ID requis pour la mise à jour' }
            };
        }

        // Convertir l'URL de la route en un chemin pour les données
        let dataPath = route.url.substring(this.prefix.length).replace(`{id}`, params.id);

        // Récupérer la collection
        const collectionPath = dataPath.split('/').slice(0, -1).join('/');
        const collection = this.getDataFromPath(collectionPath);

        if (!Array.isArray(collection)) {
            return {
                status: 400,
                data: { error: 'Ressource parent non trouvée ou n\'est pas une collection' }
            };
        }

        // Trouver l'élément à mettre à jour
        const id = isNaN(params.id) ? params.id : parseInt(params.id);
        const index = collection.findIndex(item => item.id === id);

        if (index === -1) {
            return {
                status: 404,
                data: { error: 'Élément non trouvé' }
            };
        }

        // Mettre à jour l'élément en préservant l'ID
        collection[index] = { ...body, id };

        return {
            status: 200,
            data: { success: true }
        };
    }

    /**
     * Gère les requêtes DELETE
     */
    handleDelete(route, params) {
        if (!params.id) {
            return {
                status: 400,
                data: { error: 'ID requis pour la suppression' }
            };
        }

        // Convertir l'URL de la route en un chemin pour les données
        let dataPath = route.url.substring(this.prefix.length).replace(`{id}`, params.id);

        // Récupérer la collection
        const collectionPath = dataPath.split('/').slice(0, -1).join('/');
        const collection = this.getDataFromPath(collectionPath);

        if (!Array.isArray(collection)) {
            return {
                status: 400,
                data: { error: 'Ressource parent non trouvée ou n\'est pas une collection' }
            };
        }

        // Trouver l'élément à supprimer
        const id = isNaN(params.id) ? params.id : parseInt(params.id);
        const index = collection.findIndex(item => item.id === id);

        if (index === -1) {
            return {
                status: 404,
                data: { error: 'Élément non trouvé' }
            };
        }

        // Supprimer l'élément
        collection.splice(index, 1);

        return {
            status: 200,
            data: { success: true }
        };
    }
}

// Exporter une instance unique
export default new ApiSimulator();