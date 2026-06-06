# Analyse et Spécification : Sélection de Produits par Checkbox pour l'Import d'Images

Ce document décrit l'architecture et les étapes nécessaires pour implémenter un système de sélection par cases à cocher (checkboxes) lors de l'importation de fichiers ZIP d'images. Cela permettra à l'administrateur de choisir précisément quelles images du ZIP associer aux produits avant de valider l'insertion en base de données.

---

## Architecture Actuelle vs Cible

### Architecture Actuelle (Import Direct)
Actuellement, dès que le ZIP est fourni, l'application extrait les images et lance immédiatement l'upload sur tous les produits correspondants trouvés en base :
```
[ZIP Upload] -> [Extraction ZIP] -> [Recherche SKU en BD] -> [Upload de TOUTES les images]
```

### Architecture Cible (Import Sélectif par Phase)
Nous allons découper le processus en deux phases distinctes :
1. **Phase 1 : Analyse & Visualisation**
    L'administrateur charge le ZIP. L'application extrait les fichiers, vérifie la correspondance des SKU en base de données, puis affiche la liste des correspondances à l'écran avec une checkbox pour chaque produit.
2. **Phase 2 : Sélection & Validation**
    L'administrateur sélectionne les images à importer (avec possibilité de "Tout sélectionner" / "Tout désélectionner"), puis clique sur un bouton de validation pour lancer l'upload uniquement sur la sélection.

```
[ZIP Upload] -> [Extraction & Correspondances] -> [Affichage liste avec Checkboxes] -> [Sélection de l'admin] -> [Bouton VALIDER] -> [Upload des images sélectionnées]
```

---

## Étapes d'Implémentation (Sans modifier le code existant)

### Étape 1 : Diviser la méthode du Service `ImageImportService.js`
Pour séparer l'extraction de l'upload, nous devons exposer deux méthodes distinctes dans `ImageImportService` :

1. **`analyserZip(zipFile)`** : 
    Cette méthode ouvre le ZIP, extrait les SKU et recherche les produits correspondants dans la base de données. Elle retourne une liste d'objets contenant :
    * Le `sku` de l'image.
    * Si le produit existe en base : son `id`, son `name` et le fichier image.
    * Si le produit n'existe pas : un indicateur d'erreur.

2. **`importerImagesSelectionnees(selectedItems, callbacks)`** :
    Cette méthode prend en paramètre uniquement les lignes validées et lance l'importation de l'image de la même manière que la boucle actuelle.

---

### Étape 2 : Mettre à jour l'état du Composant `ImageImport.jsx`
Nous devons ajouter des states React dans le composant d'interface pour gérer la liste des fichiers découverts et le choix de l'utilisateur :

```javascript
// Liste de toutes les correspondances trouvées dans le ZIP après analyse
const [elementsFichiers, setElementsFichiers] = useState([]);

// Tableau contenant les SKU sélectionnés par l'utilisateur
const [elementsSelectionnes, setElementsSelectionnes] = useState([]);
```

---

### Étape 3 : Ajouter l'interface de sélection (Tableau Noir & Blanc)
Une fois le ZIP analysé, nous afficherons un tableau structuré contenant :
* Une case à cocher globale dans l'en-tête (pour tout sélectionner/désélectionner).
* Pour chaque ligne : une case à cocher, le SKU, le nom du produit trouvé en base, et le statut de validation.

*Exemple de structure JSX :*
```jsx
<table>
    <thead>
        <tr>
            <th>
                <input 
                    type="checkbox" 
                    onChange={handleToggleAll} 
                    checked={elementsSelectionnes.length === elementsFichiers.length}
                />
            </th>
            <th>Image / SKU</th>
            <th>Produit Associé</th>
            <th>Statut</th>
        </tr>
    </thead>
    <tbody>
        {elementsFichiers.map(item => (
            <tr key={item.sku}>
                <td>
                    <input 
                        type="checkbox"
                        disabled={!item.existeEnBase} // Désactiver si le produit n'existe pas en BD
                        checked={elementsSelectionnes.includes(item.sku)}
                        onChange={() => handleToggleRow(item.sku)}
                    />
                </td>
                <td>{item.fileName}</td>
                <td>{item.existeEnBase ? item.productName : "Produit introuvable en BD"}</td>
                <td>{item.existeEnBase ? "Prêt à importer" : "Erreur"}</td>
            </tr>
        ))}
    </tbody>
</table>
```

---

### Étape 4 : Adapter la fonction de validation finale
Lors du clic sur le bouton "Lancer l'import", au lieu de passer le fichier ZIP brut, nous passerons la liste filtrée à notre service d'importation :

```javascript
const validerImportationImages = async () => {
    // Filtrer les éléments qui ont été cochés par l'utilisateur
    const aImporter = elementsFichiers.filter(item => elementsSelectionnes.includes(item.sku));
    
    setLoading(true);
    // Appeler le service d'upload uniquement sur les fichiers cochés
    await ImageImportService.importerImagesSelectionnees(aImporter, {
        onMessage: setMessage,
        onProgress: setProgress,
        onLog: (log) => setResults(prev => [...prev, log])
    });
    setLoading(false);
};
```

---

## Avantages de cette approche
1. **Contrôle Total** : L'administrateur peut exclure des images sans avoir à modifier le fichier ZIP d'origine.
2. **Sécurité** : Évite d'écraser des images existantes par erreur.
3. **Retour visuel immédiat** : Permet de voir instantanément si des images dans le ZIP ne correspondent à aucun SKU en base de données avant même de démarrer l'importation.



  // =========================================================================
    // IMPLEMENTATION DE L'IMPORTATION SELECTIVE PAR CHECKBOXES (SELECTION PAR SKU)
    // =========================================================================
    // Cette méthode reçoit le ZIP d'origine et un tableau contenant uniquement les SKUs cochés
    // par l'utilisateur (ex: ['SKU-01', 'SKU-05']) afin de n'importer que les images correspondantes.
    async importSelectedImages(zipFile, selectedSkus = [], callbacks) {
        const { onProgress, onMessage, onLog } = callbacks || {}
        
        if (!zipFile || selectedSkus.length === 0) {
            if (onMessage) onMessage('Aucun produit sélectionné ou fichier manquant.')
            return
        }
        
        if (onMessage) onMessage('Extraction des images sélectionnées...')
        
        try {
            const zip = await JSZip.loadAsync(zipFile)
            const imageFiles = {}

            // Fonction récursive pour lire le ZIP et extraire uniquement les SKUs sélectionnés
            const processZipFiles = async (zipObj) => {
                for (const [path, entry] of Object.entries(zipObj.files)) {
                    if (entry.dir) continue
                    if (path.includes('__MACOSX') || path.includes('._')) continue
                    const fileName = path.split('/').pop()
                    if (fileName.startsWith('.')) continue
                    
                    const ext = fileName.split('.').pop().toLowerCase()
                    
                    // Si on tombe sur un fichier .zip à l'intérieur du ZIP
                    if (ext === 'zip') {
                        try {
                            const nestedBlob = await entry.async('blob')
                            const nestedZip = await JSZip.loadAsync(nestedBlob)
                            await processZipFiles(nestedZip)
                        } catch(e) {
                            console.error('Erreur lors de la lecture du zip imbriqué', e)
                        }
                        continue
                    }

                    // Sinon, si c'est une image
                    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) continue
                    
                    const sku = fileName.replace(/\.[^.]+$/, '')
                    
                    // --- SELECTION PAR SKU CHECKEE ---
                    // On ne retient l'image que si le SKU normalisé fait partie des SKUs cochés par l'utilisateur
                    const isSelected = selectedSkus.some(selSku => normalizeSku(selSku) === normalizeSku(sku))
                    
                    if (isSelected) {
                        imageFiles[sku] = { entry, fileName, ext }
                    }
                }
            }

            await processZipFiles(zip)

            const totalFiles = Object.keys(imageFiles).length
            if (onLog) onLog({ sku: '---', status: 'info', msg: `${totalFiles} images sélectionnées prêtes pour l'upload` })
            
            if (totalFiles === 0) {
                if (onMessage) onMessage('Aucune image correspondante trouvée dans le ZIP')
                return
            }

            // On conserve l'appel dynamique des catégories
            const productCatMap = await this.buildCategoryMap()
            console.log('[MAP] productCatMap final:', productCatMap)

            if (onMessage) onMessage('Récupération des produits en BD...')
            let products = []
            let page = 1
            while (true) {
                try {
                    const response = await api_admin.get(`/admin/catalog/products?page=${page}&limit=200`)
                    const data = response.data?.data || []
                    products = products.concat(data)
                    if (data.length < 200) break
                    page++
                } catch (e) {
                    console.error('Erreur récupération produits:', e.message)
                    break
                }
            }

            let processedCount = 0

            for (const [sku, imgData] of Object.entries(imageFiles)) {
                const product = products.find(p => normalizeSku(p.sku) === normalizeSku(sku))

                if (!product) {
                    if (onLog) onLog({ sku, status: 'error', msg: 'Produit introuvable en BD' })
                    processedCount++
                    if (onProgress) onProgress(Math.round((processedCount / totalFiles) * 100))
                    continue
                }

                // On applique les catégories récupérées par buildCategoryMap
                const catIds = productCatMap[product.id] || []

                try {
                    const detailRes = await api_admin.get(`/admin/catalog/products/${product.id}`)
                    const detail = detailRes.data.data

                    const blob = await imgData.entry.async('blob')
                    const file = new File([blob], imgData.fileName, {
                        type: `image/${imgData.ext === 'jpg' ? 'jpeg' : imgData.ext}`
                    })

                    const formData = new FormData()
                    formData.append('channel', 'default')
                    formData.append('locale', 'fr')
                    formData.append('_method', 'PUT')
                    formData.append('sku', product.sku)
                    formData.append('name', detail.name || product.sku)
                    formData.append('url_key', detail.url_key || product.sku.toLowerCase())
                    formData.append('price', detail.price || 0)
                    formData.append('weight', detail.weight || 1)
                    formData.append('status', 1)
                    formData.append('visible_individually', 1)
                    formData.append('manage_stock', 1)
                    formData.append('short_description', detail.short_description || detail.name)
                    formData.append('description', detail.description || detail.name)
                    formData.append('images[files][]', file)
                    formData.append('channels[]', 1)
                    
                    catIds.forEach(id => formData.append('categories[]', id))
                    
                    if (detail.inventories && detail.inventories.length > 0) {
                        detail.inventories.forEach(inv => {
                            formData.append(`inventories[${inv.inventory_source_id}]`, inv.qty || 0)
                        })
                    }

                    // Envoi final pour enregistrer l'image
                    await api_admin.post(`/admin/catalog/products/${product.id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })

                    if (onLog) onLog({ sku, status: 'success', msg: `Image OK` })
                } catch (e) {
                    console.error(`Erreur upload ${sku}:`, e.response?.data || e.message)
                    if (onLog) onLog({ sku, status: 'error', msg: e.response?.data?.message || e.message })
                }
                
                processedCount++
                if (onProgress) onProgress(Math.round((processedCount / totalFiles) * 100))
            }

            if (onMessage) onMessage('Importation des images sélectionnées terminée avec succès !')
        } catch (error) {
            console.error('Erreur import images:', error)
            if (onMessage) onMessage('Erreur : ' + error.message)
        }
    }
