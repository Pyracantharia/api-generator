<template>
    <div class="generator">
        <h1>Générateur d'API à partir de JSON</h1>

        <div class="json-input">
            <h2>Fichier JSON</h2>
            <!-- Ajout du champ d'import -->
            <input type="file" accept=".json,application/json" @change="importJsonFile" class="file-input" />
            <textarea v-model="jsonInput" placeholder="Collez votre JSON ici..." rows="15"></textarea>
            <div class="options">
                <label>
                    Préfixe des routes:
                    <input v-model="apiPrefix" placeholder="/api/v1" />
                </label>
            </div>
            <div class="actions">
                <button @click="generateApi" :disabled="!isValidJson" class="generate-btn">Générer l'API</button>
                <button v-if="hasExistingApi" @click="loadExistingApi" class="load-btn">Charger l'API existante</button>
            </div>
        </div>

        <div v-if="generatedRoutes.length" class="results">
            <h2>Routes API générées</h2>
            <ul>
                <li v-for="(route, index) in generatedRoutes" :key="index">
                    <span class="method" :class="route.method.toLowerCase()">{{ route.method }}</span>
                    <span class="url">{{ route.url }}</span>
                    <span class="description">{{ route.description }}</span>
                </li>
            </ul>
            <div class="action-buttons">
                <button @click="saveToDocs" class="save-btn">Enregistrer la documentation</button>
                <button @click="goToTest" class="test-btn">Tester l'API</button>
            </div>
        </div>

        <div>
            <h3>Exemple de réponse</h3>
            <details>
                <summary>Voir l'exemple JSON</summary>
                <pre>{{ JSON.stringify(exemple, null, 2) }}</pre>
            </details>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { generateApiRoutes } from '../services/apiGenerator'
import { saveDocumentation, getDocumentation, hasDocumentation } from '../services/docGenerator'
import apiSimulator from '../services/apiSimulator'
import { useRouter } from 'vue-router'

export default {
    name: 'ApiGenerator',
    emits: ['api-saved'],
    setup(props, { emit }) {
        const router = useRouter()
        const jsonInput = ref('')
        const apiPrefix = ref('/api/v1')
        const generatedRoutes = ref([])
        const hasExistingApi = ref(false)

        // Vérifier s'il existe déjà une API sauvegardée
        onMounted(() => {
            hasExistingApi.value = hasDocumentation();
        })

        const isValidJson = computed(() => {
            try {
                if (jsonInput.value.trim() === '') return false
                JSON.parse(jsonInput.value)
                return true
            } catch (e) {
                return false
            }
        })

        // Charger l'API existante
        const loadExistingApi = () => {
            try {
                const docs = getDocumentation();
                // Affiche seulement un aperçu (10 premiers champs)
                jsonInput.value = JSON.stringify(getJsonPreview(docs.jsonStructure), null, 2);
                apiPrefix.value = docs.apiPrefix || '/api/v1';
                generatedRoutes.value = docs.routes || [];
            } catch (e) {
                alert('Erreur lors du chargement de l\'API : ' + e.message);
            }
        }

        // Ajout de la fonction d'import
        const importJsonFile = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Vérifie que le contenu est bien du JSON
                    const json = JSON.parse(e.target.result);
                    jsonInput.value = JSON.stringify(json, null, 2);
                } catch (err) {
                    alert('Le fichier sélectionné n\'est pas un JSON valide.');
                }
            };
            reader.readAsText(file);
        };

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
                const jsonData = JSON.parse(jsonInput.value)
                const docsData = {
                    routes: generatedRoutes.value,
                    apiPrefix: apiPrefix.value,
                    jsonStructure: extractJsonStructure(jsonData),
                    jsonData // <-- ajoute cette ligne
                }
                saveDocumentation(docsData)

                // Initialiser le simulateur d'API avec les vraies données
                apiSimulator.initialize(
                    jsonData,
                    generatedRoutes.value,
                    apiPrefix.value
                )

                emit('api-saved')
                router.push('/docs')
            } catch (e) {
                alert('Erreur lors de la sauvegarde: ' + e.message)
            }
        }

        const goToTest = () => {
            router.push('/test')
        }

        return {
            jsonInput,
            apiPrefix,
            generatedRoutes,
            isValidJson,
            hasExistingApi,
            generateApi,
            loadExistingApi,
            saveToDocs,
            goToTest,
            importJsonFile
        }
    }
}

// Fonction pour extraire la structure JSON
function extractJsonStructure(obj, depth = 2) {
    if (depth === 0 || typeof obj !== 'object' || obj === null) return typeof obj;
    if (Array.isArray(obj)) {
        return [extractJsonStructure(obj[0], depth - 1)];
    }
    const structure = {};
    for (const key in obj) {
        structure[key] = extractJsonStructure(obj[key], depth - 1);
    }
    return structure;
}

// Fonction pour obtenir un aperçu du JSON
function getJsonPreview(obj, max = 10) {
    if (Array.isArray(obj)) {
        return obj.slice(0, max);
    }
    if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj).slice(0, max);
        const preview = {};
        keys.forEach(key => preview[key] = obj[key]);
        return preview;
    }
    return obj;
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

.actions {
    display: flex;
    gap: 10px;
}

button {
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.generate-btn {
    background-color: #42b983;
}

.load-btn {
    background-color: #3498db;
}

.save-btn {
    background-color: #27ae60;
}

.test-btn {
    background-color: #f39c12;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
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
    padding: 5px 10px;
    border-radius: 4px;
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
    margin-right: 15px;
    color: #0066cc;
}

.description {
    color: #666;
    font-style: italic;
}

.file-input {
    margin-bottom: 10px;
    display: block;
}
</style>