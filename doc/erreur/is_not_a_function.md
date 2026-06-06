---

## 🧠 Cause de l’erreur

Cette erreur arrive lorsque l’on utilise `.map()` sur une **donnée qui n’est pas un tableau**.

👉 `.map()` fonctionne uniquement sur les tableaux (`[]`)  
👉 mais ici, `cartDetail` est un **objet (`{}`)**

---

## 📦 Exemple du problème

### API retournée :
```json
{
  "data": {
    "id": 1,
    "customer_email": "john@example.com",
    "items": {
      "id": 1,
      "name": "Wooden Chair",
      "quantity": 2
    }
  }
}

✅ Solution correcte
✔️ Cas 1 : accès direct (objet)
cartDetail.items.name
cartDetail.items.quantity
cartDetail.customer_email
✔️ Cas 2 : si c’était un tableau (ex: items [])
cartDetail.items.map(item => ...)
🔍 Comment éviter cette erreur

Toujours vérifier le type :

console.log(Array.isArray(cartDetail));

ou aussi on passe a un fonction une valeur qu'il n'accepte pas comme par exemple on passe function find sur un liste pas tableau alors ça peut pas si c'est pas tableau alors on fait directement comme ceci cart?.items?.product_id === produitId 