# 📄 2. `erreurs_rencontrees.md` (ERREURS + CAUSES + FIX)

```md
# ❌ ERREURS RENCONTRÉES + CORRECTIONS

---

## 🚨 1. map sur undefined

### Erreur :

Cannot read properties of undefined (reading 'map')


### Cause :
```js
produit.map(...)

mais produit = undefined

Fix :
produit?.map(...)
🚨 2. undefined is not iterable
Cause :
for (const item of produit.item)
Fix :
for (const item of produit)

ou vérifier :

Array.isArray(produit)
🚨 3. input controlled/uncontrolled
Cause :
value={quantity}

mais quantity = undefined

Fix :
const [quantity, setQuantity] = useState("")
🚨 4. input wrong event
Cause :
e.target.filtervalue ❌
Fix :
e.target.value ✅
🚨 5. 422 API error
Cause :
mauvais format JSON envoyé
Fix :
{
  inventories: {
    [sourceId]: qty
  }
}
🚨 6. Uncaught promise
Cause :
catch mal géré
e.response undefined
Fix :
catch (e) {
  console.log(e?.response?.data || e.message)
}
🚨 7. input void element error
Cause :
<input>children</input> ❌
Fix :
<input /> ✅
🚨 8. React hook invalid call
Cause :
useState / useEffect hors composant
Fix :
toujours dans fonction composant
🚨 9. Cannot read properties of undefined
Cause :
item.inventories[0].qty
Fix :
item?.inventories?.[0]?.qty
🚨 10. API ne se déclenche pas
Causes possibles :
fonction non appelée
mauvais onClick
return avant appel
boucle vide
Fix :
<button onClick={addStock}>
🚨 11. boucle sur mauvais type
Cause :
for (const item of item.id)
Fix :
for (const item of produitFiltrer)
🚨 12. clé dynamique oubliée
Cause :
{ sourceId: qty }
Fix :
{ [sourceId]: qty }