
<template>
    <div class="documentation">
      <h1>Documentation de l'API</h1>
      
      <div v-if="!apiDocs.routes.length" class="no-docs">
        <p>Aucune documentation n'a été générée. Veuillez d'abord utiliser le générateur d'API.</p>
        <router-link to="/" class="btn">Aller au générateur</router-link>
      </div>
      
      <div v-else class="docs-content">
        <h2>Aperçu</h2>
        <p>Préfixe de l'API: <code>{{ apiDocs.apiPrefix }}</code></p>
        
        <h2>Structure des données</h2>
        <pre>{{ formattedJsonStructure }}</pre>
        
        <h2>Points de terminaison</h2>
        <div class="endpoint" v-for="(route, index) in apiDocs.routes" :key="index">
          <div class="endpoint-header">
            <span class="method" :class="route.method.toLowerCase()">{{ route.method }}</span>
            <span class="url">{{ route.url }}</span>
          </div>
          <div class="endpoint-details">
            <p>{{ route.description }}</p>
            
            <h4 v-if="route.params && route.params.length">Paramètres</h4>
            <table v-if="route.params && route.params.length">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Requis</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(param, pIndex) in route.params" :key="pIndex">
                  <td>{{ param.name }}</td>
                  <td>{{ param.type }}</td>
                  <td>{{ param.description }}</td>
                  <td>{{ param.required ? 'Oui' : 'Non' }}</td>
                </tr>
              </tbody>
            </table>
            
            <h4>Exemple de réponse</h4>
            <pre v-if="route.responseExample">{{ route.responseExample }}</pre>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue'
  import { getDocumentation } from '../services/docGenerator'
  
  export default {
    name: 'ApiDocumentation',
    setup() {
      const apiDocs = getDocumentation()
      
      const formattedJsonStructure = computed(() => {
        return JSON.stringify(apiDocs.jsonStructure, null, 2)
      })
      
      return {
        apiDocs,
        formattedJsonStructure
      }
    }
  }
  </script>
  
  <style scoped>
  .documentation {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    text-align: left;
  }
  
  .no-docs {
    text-align: center;
    margin: 50px 0;
  }
  
  .btn {
    display: inline-block;
    background-color: #42b983;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    text-decoration: none;
    margin-top: 15px;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-family: monospace;
    font-size: 14px;
  }
  
  .endpoint {
    margin-bottom: 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .endpoint-header {
    padding: 15px;
    background-color: #f8f8f8;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
  }
  
  .endpoint-details {
    padding: 15px;
  }
  
  .method {
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 4px;
    margin-right: 15px;
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
    font-weight: bold;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }
  
  th {
    background-color: #f5f5f5;
  }
  </style>