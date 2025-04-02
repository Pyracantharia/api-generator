
/**
 * Génère des routes API basées sur la structure d'un objet JSON
 * @param {Object} jsonData - L'objet JSON source
 * @param {String} prefix - Le préfixe pour toutes les routes API
 * @returns {Array} - Un tableau d'objets de route
 */
export function generateApiRoutes(jsonData, prefix) {
    const routes = [];
    const cleanPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    
    // Fonction récursive pour parcourir la structure JSON
    function traverseObject(obj, path = [], parentPath = '') {
      // Génère une route GET pour l'objet actuel
      const currentPath = parentPath + (path.length > 0 ? '/' + path.join('/') : '');
      
      if (typeof obj === 'object' && obj !== null) {
        // Route GET pour l'objet/tableau complet
        routes.push({
          method: 'GET',
          url: `${cleanPrefix}${currentPath}`,
          description: `Récupérer ${path.length > 0 ? path[path.length - 1] : 'toutes les données'}`,
          responseExample: JSON.stringify(obj, null, 2),
          params: []
        });
        
        if (Array.isArray(obj)) {
          // Si c'est un tableau, ajoute une route GET avec ID pour les éléments individuels
          if (obj.length > 0 && typeof obj[0] === 'object') {
            routes.push({
              method: 'GET',
              url: `${cleanPrefix}${currentPath}/{id}`,
              description: `Récupérer un élément spécifique de ${path.length > 0 ? path[path.length - 1] : 'la collection'}`,
              responseExample: JSON.stringify(obj[0], null, 2),
              params: [{
                name: 'id',
                type: 'string/number',
                description: "L'identifiant de l'élément",
                required: true
              }]
            });
            
            // Ajoute des routes POST, PUT et DELETE pour les collections
            routes.push({
              method: 'POST',
              url: `${cleanPrefix}${currentPath}`,
              description: `Créer un nouvel élément dans ${path.length > 0 ? path[path.length - 1] : 'la collection'}`,
              responseExample: JSON.stringify({ success: true, id: 'new-id' }, null, 2),
              params: [{
                name: 'body',
                type: 'object',
                description: "Les données de l'élément à créer",
                required: true
              }]
            });
            
            routes.push({
              method: 'PUT',
              url: `${cleanPrefix}${currentPath}/{id}`,
              description: `Mettre à jour un élément existant dans ${path.length > 0 ? path[path.length - 1] : 'la collection'}`,
              responseExample: JSON.stringify({ success: true }, null, 2),
              params: [
                {
                  name: 'id',
                  type: 'string/number',
                  description: "L'identifiant de l'élément",
                  required: true
                },
                {
                  name: 'body',
                  type: 'object',
                  description: "Les données mises à jour",
                  required: true
                }
              ]
            });
            
            routes.push({
              method: 'DELETE',
              url: `${cleanPrefix}${currentPath}/{id}`,
              description: `Supprimer un élément de ${path.length > 0 ? path[path.length - 1] : 'la collection'}`,
              responseExample: JSON.stringify({ success: true }, null, 2),
              params: [{
                name: 'id',
                type: 'string/number',
                description: "L'identifiant de l'élément à supprimer",
                required: true
              }]
            });
          }
          
          // Récursivement traite les éléments du tableau s'ils sont des objets complexes
          if (obj.length > 0 && typeof obj[0] === 'object') {
            traverseObject(obj[0], [...path, '{id}'], currentPath);
          }
        } else {
          // C'est un objet, parcours chaque propriété
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const newPath = [...path, key];
              const value = obj[key];
              
              // Si la valeur est un objet ou un tableau, récursivement la traite
              if (typeof value === 'object' && value !== null) {
                traverseObject(value, newPath, currentPath);
              } else {
                // Optionnellement, tu pourrais ajouter des routes pour des propriétés individuelles
                // si c'est un comportement souhaité
              }
            }
          }
        }
      }
    }
    
    traverseObject(jsonData);
    return routes;
  }