<!-- components/ApiTester.vue -->
<template>
    <div class="api-tester">
      <h1>Testeur d'API</h1>
      
      <div v-if="!apiData.routes || !apiData.routes.length" class="no-api">
        <p>Aucune API n'a été générée. Veuillez d'abord utiliser le générateur d'API.</p>
        <router-link to="/" class="btn">Aller au générateur</router-link>
      </div>
      
      <div v-else class="tester-container">
        <div class="routes-panel">
          <h2>Routes disponibles</h2>
          <ul class="routes-list">
            <li v-for="(route, index) in apiData.routes" :key="index" 
                @click="selectRoute(route)"
                :class="{ active: selectedRoute && selectedRoute.url === route.url && selectedRoute.method === route.method }">
              <span class="method" :class="route.method.toLowerCase()">{{ route.method }}</span>
              <span class="url">{{ route.url }}</span>
            </li>
          </ul>
        </div>
        
        <div class="request-panel">
          <div v-if="selectedRoute" class="request-form">
            <h2>Tester {{ selectedRoute.method }} {{ selectedRoute.url }}</h2>
            <p class="description">{{ selectedRoute.description }}</p>
            
            <!-- Formulaire de paramètres d'URL -->
            <div v-if="hasUrlParams" class="params-section">
              <h3>Paramètres d'URL</h3>
              <div v-for="(param, name) in urlParams" :key="name" class="param-field">
                <label>{{ name }}:</label>
                <input type="text" v-model="urlParams[name]" :placeholder="'Valeur pour ' + name" />
              </div>
            </div>
            
            <!-- Formulaire pour le corps de la requête (POST/PUT) -->
            <div v-if="['POST', 'PUT'].includes(selectedRoute.method)" class="body-section">
              <h3>Corps de la requête</h3>
              <textarea 
                v-model="requestBody" 
                placeholder="Entrez le JSON pour le corps de la requête"
                rows="8"
              ></textarea>
              <div class="json-validation" v-if="requestBody.trim() !== ''">
                <span v-if="isValidJson" class="valid">✓ JSON valide</span>
                <span v-else class="invalid">✗ JSON invalide</span>
              </div>
            </div>
            
            <button 
              @click="sendRequest" 
              :disabled="!isRequestValid" 
              class="send-button"
            >
              Envoyer la requête
            </button>
          </div>
          
          <div v-else class="no-route-selected">
            <p>Sélectionnez une route dans la liste pour la tester</p>
          </div>
        </div>
        
        <div class="response-panel">
          <h2>Réponse</h2>
          <div v-if="response" class="response-content">
            <div class="response-header">
              <span class="status" :class="{ success: response.status < 400, error: response.status >= 400 }">
                Statut: {{ response.status }}
              </span>
            </div>
            <pre>{{ formattedResponse }}</pre>
          </div>
          <div v-else class="no-response">
            <p>Envoyez une requête pour voir la réponse</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import apiSimulatorService from '../services/apiSimulator';
  import { getDocumentation } from '../services/docGenerator';
  
  export default {
    name: 'ApiTester',
    setup() {
      const apiData = ref({ routes: [] });
      const selectedRoute = ref(null);
      const urlParams = ref({});
      const requestBody = ref('');
      const response = ref(null);
      
      // Initialiser le simulateur d'API
      onMounted(() => {
        const docs = getDocumentation();
        if (docs.routes && docs.routes.length > 0) {
          apiData.value = docs;
          
          // Initialiser le simulateur avec les données de documentation
          if (docs.jsonStructure && docs.routes && docs.apiPrefix) {
            apiSimulatorService.initialize(
              docs.jsonStructure,
              docs.routes,
              docs.apiPrefix
            );
          }
        }
      });
      
      // Vérifier si la route sélectionnée a des paramètres d'URL
      const hasUrlParams = computed(() => {
        if (!selectedRoute.value) return false;
        return selectedRoute.value.url.includes('{');
      });
      
      // Vérifier si le JSON du corps de la requête est valide
      const isValidJson = computed(() => {
        if (!requestBody.value.trim()) return true;
        try {
          JSON.parse(requestBody.value);
          return true;
        } catch (e) {
          return false;
        }
      });
      
      // Vérifier si la requête est valide et peut être envoyée
      const isRequestValid = computed(() => {
        if (!selectedRoute.value) return false;
        
        // Vérifier les paramètres d'URL requis
        if (hasUrlParams.value) {
          for (const param in urlParams.value) {
            if (!urlParams.value[param].trim()) {
              return false;
            }
          }
        }
        
        // Vérifier le corps de la requête pour POST/PUT
        if (['POST', 'PUT'].includes(selectedRoute.value.method)) {
          return requestBody.value.trim() !== '' && isValidJson.value;
        }
        
        return true;
      });
      
      // Formatter la réponse pour l'affichage
      const formattedResponse = computed(() => {
        if (!response.value) return '';
        try {
          return JSON.stringify(response.value.data, null, 2);
        } catch (e) {
          return String(response.value.data);
        }
      });
      
      // Sélectionner une route pour le test
      const selectRoute = (route) => {
        selectedRoute.value = route;
        
        // Réinitialiser les paramètres d'URL
        urlParams.value = {};
        if (route.url.includes('{')) {
          const matches = route.url.match(/{([^}]+)}/g) || [];
          matches.forEach(match => {
            const paramName = match.substring(1, match.length - 1);
            urlParams.value[paramName] = '';
          });
        }
        
        // Réinitialiser le corps de la requête
        requestBody.value = '';
        
        // Pour POST/PUT, pré-remplir avec un exemple
        if (['POST', 'PUT'].includes(route.method) && route.responseExample) {
          try {
            const exampleData = JSON.parse(route.responseExample);
            if (exampleData && typeof exampleData === 'object') {
              // Création d'un exemple de corps de requête basé sur la structure de la réponse
              const sampleBody = {};
              for (const key in exampleData) {
                if (key !== 'id' && key !== 'success') {
                  sampleBody[key] = exampleData[key];
                }
              }
              if (Object.keys(sampleBody).length > 0) {
                requestBody.value = JSON.stringify(sampleBody, null, 2);
              }
            }
          } catch (e) {
            console.warn('Impossible de générer un exemple de corps de requête', e);
          }
        }
        
        // Réinitialiser la réponse
        response.value = null;
      };
      
      // Envoyer la requête
      const sendRequest = () => {
        if (!selectedRoute.value) return;
        
        // Construire l'URL avec les paramètres
        let url = selectedRoute.value.url;
        for (const param in urlParams.value) {
          url = url.replace(`{${param}}`, urlParams.value[param]);
        }
        
        // Préparer le corps de la requête
        let body = null;
        if (['POST', 'PUT'].includes(selectedRoute.value.method) && requestBody.value.trim()) {
          try {
            body = JSON.parse(requestBody.value);
          } catch (e) {
            console.error('Erreur de parsing JSON', e);
            return;
          }
        }
        
        // Envoyer la requête au simulateur
        response.value = apiSimulatorService.request(selectedRoute.value.method, url, body);
      };
      
      return {
        apiData,
        selectedRoute,
        urlParams,
        requestBody,
        response,
        hasUrlParams,
        isValidJson,
        isRequestValid,
        formattedResponse,
        selectRoute,
        sendRequest
      };
    }
  }
  </script>
  
  <style scoped>
  .api-tester {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .tester-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    grid-gap: 20px;
    height: calc(100vh - 200px);
    min-height: 600px;
  }
  
  .routes-panel {
    grid-column: 1;
    grid-row: 1 / span 1;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
  }
  
  .request-panel {
    grid-column: 1;
    grid-row: 2 / span 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    overflow-y: auto;
  }
  
  .response-panel {
    grid-column: 2;
    grid-row: 1 / span 2;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    overflow-y: auto;
  }
  
  .routes-list {
    list-style: none;
    padding: 0;
  }
  
  .routes-list li {
    padding: 10px;
    margin-bottom: 5px;
    border: 1px solid #eee;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;
  }
  
  .routes-list li:hover {
    background-color: #f9f9f9;
  }
  
  .routes-list li.active {
    background-color: #f0f7ff;
    border-color: #c0d7ff;
  }
  
  .method {
    display: inline-block;
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 3px;
    margin-right: 10px;
    min-width: 60px;
    text-align: center;
    color: white;
  }
  
  .method.get {
    background-color: #61affe;
  }
  
  .method.post {
    background-color: #49cc90;
  }
  
  .method.put {
    background-color: #fca130;
  }
  
  .method.delete {
    background-color: #f93e3e;
  }
  
  .url {
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .no-api, .no-route-selected, .no-response {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
  }
  
  .btn {
    display: inline-block;
    background-color: #42b983;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    text-decoration: none;
    margin-top: 15px;
  }
  
  .request-form {
    padding: 10px;
  }
  
  .description {
    color: #666;
    font-style: italic;
    margin-bottom: 20px;
  }
  
  .params-section, .body-section {
    margin-bottom: 20px;
  }
  
  .param-field {
    margin-bottom: 10px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
  }
  
  .json-validation {
    margin-top: 5px;
    font-size: 14px;
  }
  
  .valid {
    color: #49cc90;
  }
  
  .invalid {
    color: #f93e3e;
  }
  
  .send-button {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
  }
  
  .send-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .response-header {
    margin-bottom: 10px;
  }
  
  .status {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
  }
  
  .status.success {
    background-color: #e3f9e9;
    color: #49cc90;
  }
  
  .status.error {
    background-color: #fee7e7;
    color: #f93e3e;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-family: monospace;
    font-size: 14px;
    margin: 0;
  }
  </style>