# Erreur 422 (Unprocessable Content)
## Signification
L'erreur 422 signifie :
* la requête atteint bien le serveur
* MAIS les données envoyées sont invalides
Le backend refuse donc le contenu envoyé.

# Causes fréquentes
## 1. Champ manquant
Exemple :

```js
await api.post('login', {
   email: userName
})
```
Mais l'API attend aussi :

```js
password
```

---

## 2. Mauvais nom de champ
Exemple :
```js
{
   username: 'test'
}
```
alors que l'API attend :

```js
{
   email: 'test@gmail.com'
}
```

---

## 3. Mauvais format

Exemple :
```js
email: 'abc'
```
alors que l'API attend une vraie adresse email.
---
## 4. Mauvaise route API
Exemple :

```js
api/v1/login
```
au lieu de :
```js
api/v1/admin/login
```
---

## 5. Token ou authentification manquante
Certaines routes demandent :
```js
Authorization: Bearer token
```

---

# Comment déboguer une erreur 422

## Toujours afficher l'erreur backend

Ajouter dans le catch :

```js
catch(e){
   console.log(e.response.data)
}
```

---

# Vérifications importantes

## Vérifier les données envoyées

```js
console.log({
   email: userName,
   password: pwd
})
```

---

## Vérifier la route API

Tester dans Postman ou navigateur :

```txt
http://localhost:8000/api/v1/admin/login
```
---

## Vérifier les champs attendus par l'API

Lire :

* documentation API
* contrôleur Laravel
* validation backend
---

# Exemple correct login React

```js
const handleLogin = async() => {
   try{
      const response = await api_client.post('admin/login', {
         email: userName,
         password: pwd
      })

      console.log(response.data)

   }catch(e){
      console.log(e.response.data)
   }
}
```

---

# Astuce importante

422 ≠ serveur cassé

422 signifie généralement :

* problème de validation
* données invalides
* mauvais body envoyé
