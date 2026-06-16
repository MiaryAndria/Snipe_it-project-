# Aléas — Règles de Gestion Métier Kanban

## Contexte existant (rappel)
- **Matin** : Drag vers Closed → saisir coût → répartir par catégorie d'asset
- **Après-midi** : Drag de Closed vers In Progress → choix Réouverture (ajouter coût) ou Annulation (supprimer dernier coût)

---

## Aléa 1 — SLA (Service Level Agreement) avec pénalité

**Règle** : Chaque ticket a un délai max (ex: 48h pour High, 72h pour Medium, 120h pour Low). Si le ticket est fermé (Closed) **après le délai**, une pénalité de +20% est automatiquement ajoutée au coût.

**Scénario** :
1. Créer ticket priorité High le 10/06 à 10h
2. Fermer le ticket le 13/06 (3 jours > 48h)
3. Le système détecte le dépassement et applique `cout * 1.20`
4. Afficher un badge "SLA dépassé" sur la carte Kanban

**Technique** :
- Calculer différence entre `date_creation` et `date_fermeture`
- Comparer avec le seuil de la priorité
- Appliquer le multiplicateur avant `addTicketCout()`

---

## Aléa 2 — Remise par volume (même catégorie)

**Règle** : Si un ticket contient **3+ items de la même catégorie**, appliquer une remise de 15% sur le coût de cette catégorie.

**Scénario** :
1. Créer ticket avec items : PC-001, PC-002, PC-003, LAP-001 (3 Desktop + 1 Laptop)
2. Drag vers Closed, saisir coût total = 200
3. Répartition : Desktop = 150 (3 items), Laptop = 50 (1 item)
4. Remise Desktop : 150 * 0.85 = 127.50
5. Insérer : Desktop → 127.50, Laptop → 50

**Technique** :
- Compter les occurrences par catégorie avant la division
- Si `count >= 3` → appliquer `montantDivise * 0.85`

---

## Aléa 3 — Escalade automatique de priorité

**Règle** : Si un ticket reste en "In Progress" pendant plus de 5 jours sans bouger, sa priorité monte automatiquement d'un cran (Low → Medium → High → Critical).

**Scénario** :
1. Ticket en In Progress depuis le 05/06
2. Au chargement du Kanban le 11/06 → 6 jours écoulés
3. Le système change automatiquement la priorité de Medium à High
4. Créer une entrée historique "Escalade automatique"

**Technique** :
- Dans `useEffect`, après chargement des tickets, vérifier `ticket_history` dernière entrée avec status = In Progress
- Si `today - date > 5 jours` → `PUT /tickets/:id` avec nouvelle priorité
- `POST /ticket_history` avec description "Escalade auto"

---

## Aléa 4 — Coût récurrent (maintenance préventive)

**Règle** : Certains tickets de type "maintenance" génèrent un coût récurrent chaque mois tant qu'ils sont en statut "In Progress". Le coût mensuel = coût initial / 12.

**Scénario** :
1. Ticket maintenance créé le 01/06 avec coût estimé = 1200
2. Chaque mois (01/07, 01/08...) → insérer automatiquement 100 par catégorie
3. Si le ticket passe en Closed → arrêter les coûts récurrents
4. Afficher le cumul des coûts récurrents dans la page Cout

**Technique** :
- **Base de données (`tickets.db`)** :
  - Ajouter la colonne `type TEXT DEFAULT 'incident'` à la table `tickets`.
  - Ajouter la colonne `cout_mensuel REAL DEFAULT 0` à la table `t_ticket_cout`.
- Au niveau du contrôleur (MVC), s'assurer que l'API (`server_ticket.js`) prend en charge ces nouveaux champs.
- Vérification au chargement (Front-end) : si le dernier coût date de plus d'un mois → insérer automatiquement un nouveau coût via l'API.

---

## Aléa 5 — Transfert de coût entre tickets (ticket parent/enfant)

**Règle** : Un ticket peut être un "sous-ticket" d'un autre. Quand on annule un sous-ticket, son coût est transféré au ticket parent au lieu d'être supprimé.

**Scénario** :
1. Ticket parent #1 (coût Desktop = 100)
2. Sous-ticket #4 (coût Desktop = 30), lié au parent #1
3. Annulation du sous-ticket #4
4. Au lieu de `DELETE ticket_cout` → `PUT` pour ajouter 30 au parent : parent Desktop = 130

**Technique** :
- **Base de données (`tickets.db`)** :
  - Ajouter la colonne `parent_id INTEGER` à la table `tickets` (Clé étrangère vers `tickets(id)`).
- Au niveau de l'API (MVC), adapter les requêtes pour gérer le lien de parenté entre les tickets.
- Dans `confirmerAnnulation` (Vue/Logique UI) : si le ticket a un parent → transférer le coût au lieu de le supprimer.
- Appeler `addTicketCout(parentId, coutAnnule, category)` au lieu de `deleteTicketCout`.

---

## Aléa 6 — Validation manager avant fermeture

**Règle** : Les tickets High/Critical ne peuvent pas être fermés directement. Ils passent d'abord par un statut "En attente validation" (nouveau statut id=4). Seul un admin peut ensuite les passer en Closed.

**Scénario** :
1. Drag ticket High vers Closed
2. Le système intercepte → redirige vers statut "En attente validation"
3. Un admin voit les tickets en attente, les valide → passage en Closed avec coût
4. Si refusé → retour en In Progress sans coût

**Technique** :
- **Base de données (`tickets.db`)** :
  - Insérer le statut "En attente validation" (`id=4`) dans la table `ticket_statuses`.
- Dans `onDrag` (Vue), si `destination === 3` et `priority >= High` → forcer `status_id = 4`.
- Créer une nouvelle vue (MVC) page admin et des endpoints contrôleur pour valider/refuser ces tickets.

---

## Aléa 7 — Historique des coûts avec graphique temporel

**Règle** : Afficher un graphique montrant l'évolution des coûts par catégorie au fil du temps (courbe mensuelle).

**Scénario** :
1. Juin : Desktop = 200, Laptop = 150
2. Juillet : Desktop = 350, Laptop = 200
3. Afficher un line chart avec 2 courbes

**Technique** :
- Grouper `ticket_cout` par mois (`date` de `ticket_history`)
- Utiliser une lib chart (ex: `recharts` ou `chart.js`)
- Agréger `SUM(cout)` par catégorie par mois

---

## Aléa 8 — Limite de budget par catégorie

**Règle** : Chaque catégorie a un budget maximum mensuel. Si fermer un ticket ferait dépasser le budget → alerte + confirmation obligatoire.

**Scénario** :
1. Budget Desktop = 500/mois
2. Coûts Desktop déjà enregistrés ce mois = 450
3. Nouveau ticket à fermer avec coût Desktop = 80
4. 450 + 80 = 530 > 500 → Modal d'alerte "⚠️ Budget dépassé de 30"
5. L'utilisateur confirme ou annule

**Technique** :
- **Base de données (`tickets.db`)** :
  - Créer la table `t_budget` avec les colonnes : `id (INTEGER PRIMARY KEY)`, `categorie (TEXT)`, `montant_max (REAL)`, `mois (TEXT)`.
- Créer un contrôleur API (MVC) dans `server_ticket.js` pour gérer les opérations CRUD sur `t_budget`.
- Avant l'action `addTicketCout`, interroger l'API pour calculer la somme du mois en cours.
- En cas de dépassement → afficher une modale de confirmation (Vue) à l'utilisateur.

---

## Aléa 9 — Multi-devises

**Règle** : Les coûts peuvent être en différentes devises (MGA, EUR, USD). Conversion automatique en MGA pour le total.

**Scénario** :
1. Ticket fermé avec coût = 50 EUR
2. Taux du jour : 1 EUR = 5000 MGA
3. Stocké : `cout = 50, devise = EUR`
4. Affiché dans page Cout : 250 000 MGA

**Technique** :
- **Base de données (`tickets.db`)** :
  - Ajouter la colonne `devise TEXT DEFAULT 'MGA'` à la table `t_ticket_cout`.
  - Créer la table `t_taux_change` avec les colonnes : `id (INTEGER PRIMARY KEY)`, `devise_source (TEXT)`, `devise_cible (TEXT)`, `taux (REAL)`, `date (TEXT)`.
- Côté Backend (Contrôleur MVC), créer les endpoints nécessaires pour récupérer les taux du jour.
- Effectuer la conversion dynamique à l'affichage dans la vue (`cout.jsx`).

---

## Aléa 10 — Réouverture avec pénalité progressive

**Règle** : Chaque réouverture successive d'un même ticket coûte de plus en plus cher. 1ère réouverture = +10%, 2ème = +25%, 3ème = +50%.

**Scénario** :
1. Ticket fermé avec coût = 100
2. 1ère réouverture : coût saisi = 20 → stocké = 20 * 1.10 = 22
3. 2ème réouverture : coût saisi = 20 → stocké = 20 * 1.25 = 25
4. 3ème réouverture : coût saisi = 20 → stocké = 20 * 1.50 = 30

**Technique** :
- Compter nombre de réouvertures dans `ticket_history` (combien de fois status est passé de Closed/In Progress → In Progress)
- Appliquer le multiplicateur correspondant dans `confirmerReouverture`

---

## Récapitulatif par difficulté

| # | Aléa | Difficulté | Composants touchés |
|---|---|---|---|
| 1 | SLA pénalité | ⭐⭐ | onDrag, addTicketCout, DB |
| 2 | Remise volume | ⭐⭐ | onDrag, addTicketCout |
| 3 | Escalade priorité | ⭐⭐⭐ | useEffect, ticket_history, DB |
| 4 | Coût récurrent | ⭐⭐⭐ | useEffect, DB, cout.jsx |
| 5 | Transfert parent/enfant | ⭐⭐⭐⭐ | DB schema, annulation, create |
| 6 | Validation manager | ⭐⭐⭐⭐ | onDrag, nouvelle page, rôles |
| 7 | Graphique temporel | ⭐⭐⭐ | cout.jsx, librairie chart |
| 8 | Limite budget | ⭐⭐⭐ | onDrag, DB, modal |
| 9 | Multi-devises | ⭐⭐⭐⭐ | DB, addTicketCout, cout.jsx |
| 10 | Pénalité progressive | ⭐⭐⭐ | confirmerReouverture, ticket_history |
