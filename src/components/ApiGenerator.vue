<template>
    <div class="generator">
        <h1>Générateur d'API à partir de JSON</h1>

        <div class="json-input">
            <h2>Fichier JSON</h2>
            <textarea v-model="jsonInput" placeholder="Collez votre JSON ici..." rows="15"></textarea>
            <div class="options">
                <label>
                    Préfixe des routes:
                    <input v-model="apiPrefix" placeholder="/api/v1" />
                </label>
            </div>
            <button @click="generateApi" :disabled="!isValidJson">Générer l'API</button>
        </div>

        <div v-if="generatedRoutes.length" class="results">
            <h2>Routes API générées</h2>
            <ul>
                <li v-for="(route, index) in generatedRoutes" :key="index">
                    <span class="method">{{ route.method }}</span>
                    <span class="url">{{ route.url }}</span>
                    <span class="description">{{ route.description }}</span>
                </li>
            </ul>
            <button @click="saveToDocs">Enregistrer la documentation</button>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { generateApiRoutes } from '../services/apiGenerator'
import { saveDocumentation } from '../services/docGenerator'
import apiSimulator from '../services/apiSimulator'
import { useRouter } from 'vue-router'

export default {
    name: 'ApiGenerator',
    setup() {
        const router = useRouter()
        const jsonInput = ref('')
        const apiPrefix = ref('/api/v1')
        const generatedRoutes = ref([])

        const isValidJson = computed(() => {
            try {
                if (jsonInput.value.trim() === '') return false
                JSON.parse(jsonInput.value)
                return true
            } catch (e) {
                return false
            }
        })

        const generateApi = () => {
            try {
                const jsonData = JSON.parse(jsonInput.value)
                generatedRoutes.value = generateApiRoutes(jsonData, apiPrefix.value)
            } catch (e) {
                alert('Erreur lors de la génération: ' + e.message)
            }
        }

        const saveToDocs = () => {
            try {
                const docsData = {
                    routes: generatedRoutes.value,
                    apiPrefix: apiPrefix.value,
                    jsonStructure: JSON.parse(jsonInput.value)
                }

                // Enregistrer la documentation
                saveDocumentation(docsData)

                // Initialiser le simulateur d'API
                apiSimulator.initialize(
                    JSON.parse(jsonInput.value),
                    generatedRoutes.value,
                    apiPrefix.value
                )

                router.push('/docs')
            } catch (e) {
                alert('Erreur lors de la sauvegarde: ' + e.message)
            }
        }

        return {
            jsonInput,
            apiPrefix,
            generatedRoutes,
            isValidJson,
            generateApi,
            saveToDocs
        }
    }
}
</script>

<style scoped>
.generator {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
}

.json-input {
    margin-bottom: 30px;
}

textarea {
    width: 100%;
    padding: 10px;
    font-family: monospace;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.options {
    margin-bottom: 15px;
    text-align: left;
}

button {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.results {
    margin-top: 30px;
    border-top: 1px solid #eee;
    padding-top: 20px;
}

ul {
    list-style: none;
    padding: 0;
    text-align: left;
}

li {
    padding: 10px;
    margin-bottom: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
}

.method {
    font-weight: bold;
    background-color: #e9f5fb;
    padding: 5px 10px;
    border-radius: 4px;
    margin-right: 10px;
    min-width: 60px;
    text-align: center;
}

.url {
    font-family: monospace;
    margin-right: 15px;
    color: #0066cc;
}

.description {
    color: #666;
    font-style: italic;
}
</style>