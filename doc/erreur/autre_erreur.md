📄 1. fichier : erreurs-api-bagisto-react.md
# 🚨 Erreurs fréquentes (Bagisto + React + API)

Ce fichier regroupe les erreurs courantes rencontrées lors de l’utilisation de l’API Bagisto avec React + Axios, ainsi que leurs causes et corrections.

---

## ❌ 1. Undefined array key (ex: "Undefined array key 1")

### 🧠 Cause
Cette erreur vient du backend PHP (Laravel / Bagisto).

Elle signifie que le code essaie d’accéder à une clé qui n’existe pas dans un tableau.

Exemple côté backend :
```php
$items[1]

mais la clé 1 n’existe pas dans $items.

📦 Exemple côté request incorrecte
{
  "shipment": {
    "items": {
      "8": {
        "1": 1
      }
    }
  }
}

👉 Le 1 ici peut ne pas correspondre à une clé valide attendue par Bagisto.

🛠️ Correction

✔ Toujours utiliser les item.id et product_id corrects fournis par l’API :

const items = {};

order.items.forEach(item => {
  items[item.id] = {
    [item.product_id]: item.qty_ordered
  };
});

✔ Vérifier les IDs avant envoi :

console.log(order.items);
❌ 2. MethodNotAllowedHttpException (405)
🧠 Cause

Tu utilises une méthode HTTP non supportée par la route.

Exemple :

POST envoyé sur une route qui accepte seulement GET
📦 Exemple erreur
The POST method is not supported for route /api/v1/sales/shipments/448
Supported methods: GET, HEAD
🛠️ Correction

✔ Vérifie la bonne route API :

✔ Mauvais :

/api/v1/sales/shipments/{id}

✔ Correct :

/api/v1/admin/sales/shipments/{order_id}
❌ 3. 401 Unauthenticated
🧠 Cause

L’API refuse la requête car tu n’es pas connecté.

📦 Exemple
{
  "message": "Unauthenticated."
}
🛠️ Correction

✔ Ajouter le token dans Axios :

api_admin.defaults.headers.common['Authorization'] = `Bearer ${token}`;

✔ Vérifier que :

token existe
token non expiré
login admin effectué
❌ 4. 500 Internal Server Error
🧠 Cause

Erreur côté serveur (Laravel / Bagisto).

Souvent causée par :

mauvais format JSON
IDs invalides
données manquantes
structure items incorrecte
🛠️ Correction

✔ Vérifier payload envoyé :

console.log(payload);

✔ Vérifier API documentation officielle Bagisto

✔ Tester dans Swagger / Postman avant React

🧩 Bon réflexe général

Toujours faire :

console.log("REQUEST:", payload);
console.log("ORDER:", order);
console.log("ITEMS:", order.items);

avant d’envoyer une requête API.


---

# 📄 2. fichier : `bon-usage-console-log.md`

```md
# 🧪 Bon usage de console.log() en développement React / API

Ce fichier explique comment utiliser correctement `console.log()` pour debug efficacement.

---

## 🎯 Pourquoi utiliser console.log ?

`console.log()` sert à :
- vérifier les données reçues de l’API
- comprendre les erreurs
- suivre l’exécution du code
- éviter les bugs silencieux

---

## 📦 1. Log des réponses API

✔ Toujours vérifier la réponse complète :

```js
const response = await api.get("/endpoint");

console.log("RESPONSE:", response);
console.log("DATA:", response.data);
📦 2. Log des données importantes

✔ Avant un .map() ou .forEach() :

console.log("COMMANDES:", commande);
console.log("ITEMS:", order.items);
📦 3. Log des erreurs API

✔ Toujours afficher les erreurs correctement :

catch (e) {
  console.log("ERROR MESSAGE:", e.message);
  console.log("ERROR RESPONSE:", e.response?.data);
}
📦 4. Log des payloads envoyés

✔ Très important pour POST / PUT :

console.log("PAYLOAD SHIP:", payload);
⚠️ 5. Erreur fréquente

❌ Mauvais :

console.log(e.response.data);

✔ Correct :

console.log(e.response?.data || e.message);

👉 Pourquoi ?
Car response peut être undefined (erreur réseau)

🧠 6. Bon réflexe professionnel

Toujours log dans cet ordre :

console.log("STEP 1: DATA FROM API");
console.log("STEP 2: TRANSFORM DATA");
console.log("STEP 3: FINAL PAYLOAD");

erreur 401 
token

erreur 405
method not allowed 

erreur 422
unprocessable entity misy valeur tsy mety envoyer

erreur 500
internal server error 

## Console log d'un structure json
console.log(JSON.stringify(actif.find(a => a.assigned_to), null, 2)) pour afficher structure json dans console.log

