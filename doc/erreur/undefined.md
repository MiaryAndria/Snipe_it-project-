# Erreurs `undefined`, `map`, `reduce`, `find` en React
 verification à faire si undefined verifier useState et useEffect d'abord pour faire appel si ça ne fonctionne pas on verifie type de donnée renvoyer car peut etre donnée reçu par la fonction est vide alors là solution on fait console.log() de l'objet reçu 

## Signification

Ces erreurs signifient généralement :

* la donnée n'existe pas encore
* OU la donnée n'a pas le bon type
* OU l'API retourne un objet au lieu d'un tableau

---

# Erreurs fréquentes

## 1. `Cannot read properties of undefined`

Exemple :

```js
cart.items.name
```

alors que :

```js
cart = undefined
```

---

## 2. `map is not a function`

Exemple :

```js
cart.map(item => ...)
```

alors que :

```js
cart = {}
```

ou :

```js
cart = undefined
```

`map()` fonctionne uniquement sur un tableau.

---

## 3. `find is not a function`

Exemple :

```js
cart.find(item => item.id === id)
```

alors que :

```js
cart = {
   id: 1
}
```

`find()` fonctionne uniquement sur un tableau.

---

## 4. `reduce is not a function`

Exemple :

```js
cart.reduce((acc,item) => acc + item.qty,0)
```

alors que :

```js
cart = null
```

ou :

```js
cart = {}
```

---

## 5. `Objects are not valid as a React child`

Exemple :

```js
<p>{cart}</p>
```

alors que :

```js
cart = {}
```

React ne peut pas afficher directement un objet.

---

# Causes fréquentes

## 1. Mauvaise initialisation du state

❌ Mauvais :

```js
const [cart,setCart] = useState()
```

ou :

```js
const [cart,setCart] = useState(null)
```

---

## ✅ Bon

```js
const [cart,setCart] = useState([])
```

pour les tableaux.

---

## 2. Données API pas encore chargées

Exemple :

```js
cart.map(...)
```

mais l'API n'a pas encore répondu.

---

## Solution

Utiliser :

```js
useEffect(() => {
   getCart()
}, [])
```

---

## 3. Mauvais type de données

Exemple API :

```json
{
   "items": {}
}
```

mais on croit recevoir :

```json
{
   "items": []
}
```

---

# Vérifications importantes

## Vérifier la structure API

Toujours afficher :

```js
console.log(response.data)
```

---

## Vérifier le type

```js
console.log(Array.isArray(cart))
```

---

## Vérifier la donnée avant utilisation

```js
if(!cart) return null
```

---

# Sécurisation recommandée

## Sécuriser map

```js
cart?.map(item => ...)
```

---

## Sécuriser find

```js
cart?.find(item => item.id === id)
```

---

## Sécuriser reduce

```js
cart?.reduce((acc,item) => acc + item.qty,0)
```

---

## Vérifier tableau avant map

```js
Array.isArray(cart) && cart.map(item => ...)
```

---

# Exemple correct

```js
const [cart,setCart] = useState([])

useEffect(() => {
   getCart()
}, [])

if(!Array.isArray(cart)){
   return <p>Erreur données</p>
}

return (
   <div>
      {cart.map(item => (
         <p key={item.id}>{item.name}</p>
      ))}
   </div>
)
```

---

# Astuces importantes

## `map`, `find`, `reduce` fonctionnent uniquement sur :

```js
[]
```

(tableaux)

---

## Les objets utilisent :

```js
object.property
```

Exemple :

```js
cart.items.name
```

---

# Méthode rapide de debug

Toujours tester :

```js
console.log(data)
console.log(typeof data)
console.log(Array.isArray(data))
```

---

# Résumé

Ces erreurs viennent généralement de :

* données API non chargées
* mauvais type (objet au lieu tableau)
* mauvais state initial
* mauvaise structure API
* accès à une propriété inexistante
 

