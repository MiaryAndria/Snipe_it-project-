## input a ne pas fermer 
## dans boucle for bien verifier ce qu'on fait boucle comme ici boucler un tableau pas un item for (const item of produitFiltrer)

## input besoin parent à mettre dans div ou form 
## ne pas oublier const sur response sinon ça va causer incaught promises 
# ✅ À VÉRIFIER AVANT DE CODER (React + API)

## 🧩 1. INPUT (React)
- Toujours utiliser `value` + `onChange` ensemble
- Ne jamais laisser `value={undefined}`
- Toujours initialiser le state :

```js
const [quantity, setQuantity] = useState("")
Utiliser :
onChange={(e) => setQuantity(e.target.value)}
🧩 2. INPUT DOIT ÊTRE DANS UN CONTENEUR
Toujours mettre input dans div ou form
<form>
  <input />
</form>
🧩 3. BOUTON + FORM
Si form, utiliser :
onSubmit={(e) => e.preventDefault()}
Sinon utiliser onClick
🔁 4. BOUCLE FOR / MAP
✔ FOR OF

Utiliser uniquement sur tableau :

for (const item of produitFiltrer)

❌ ne jamais faire :

for (const item of produitFiltrer.item)
✔ MAP

Uniquement sur tableau :

produit.map(p => p.name)

❌ objet = pas de map

🧠 5. OBJET vs TABLEAU
Tableau :
[1,2,3]
Objet :
{ id: 1, qty: 5 }
🔑 6. CLÉS DYNAMIQUES

Toujours utiliser :

{ [id]: value }

❌ jamais :

{ id: value }
📦 7. API CALL

Toujours :

const response = await api.post(...)
⚠️ 8. STATE SAFE

Toujours vérifier avant usage :

produit?.inventories?.[0]?.qty
🚀 9. USE EFFECT
useEffect(() => {
  fetchData()
}, [])
🧼 10. DEBUG OBLIGATOIRE

Toujours ajouter :

console.log(data)