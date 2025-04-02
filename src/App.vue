<template>
  <div id="app">
    <header>
      <h1>API Generator</h1>
      <nav>
        <router-link to="/">Générateur</router-link> |
        <router-link to="/docs">Documentation</router-link> |
        <router-link to="/test">Testeur d'API</router-link>
      </nav>
      <div v-if="hasApi" class="api-controls">
        <span class="api-status">API active: <strong>{{ apiPrefix }}</strong> ({{ routesCount }} routes)</span>
        <button @click="clearApi" class="clear-btn">Supprimer l'API</button>
      </div>
    </header>
    <router-view @api-saved="checkApi" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { hasDocumentation, getDocumentation, clearDocumentation } from './services/docGenerator';


import { useRouter } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const hasApi = ref(false);
    const apiPrefix = ref('');
    const routesCount = ref(0);

    // Vérifier si une API est déjà chargée
    const checkApi = () => {
      hasApi.value = hasDocumentation();
      if (hasApi.value) {
        const docs = getDocumentation();
        apiPrefix.value = docs.apiPrefix || '';
        routesCount.value = docs.routes ? docs.routes.length : 0;
      }
    };

    // Supprimer l'API et les données associées
    const clearApi = () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer l\'API actuelle ?')) {
        clearDocumentation();
        checkApi();
        router.push('/');
      }
    };

    // Vérifier au chargement
    onMounted(() => {
      checkApi();
    });

    return {
      hasApi,
      apiPrefix,
      routesCount,
      checkApi,
      clearApi
    };
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

header {
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 20px;
}

h1 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #42b983;
}

nav {
  padding: 10px 0;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.api-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding: 8px;
  background-color: #e9f7ef;
  border-radius: 4px;
}

.api-status {
  margin-right: 20px;
}

.clear-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background-color: #c0392b;
}
</style>