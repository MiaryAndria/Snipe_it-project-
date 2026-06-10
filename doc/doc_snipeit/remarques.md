## petite remarque de condition dans return affichage composant
(condition)?(reponse_condition_vraie):(reponsee_condition_faux)

## params pour passer parametre url 
Trier par asset tag
const response = await api_service.get('/hardware', {
    params: {
        sort: 'asset_tag',
        order: 'asc'
    }
})

URL générée :

/hardware?sort=asset_tag&order=asc
Filtrer par catégorie

La doc indique :

category_id

Donc :

const response = await api_service.get('/hardware', {
    params: {
        category_id: 1
    }
})

URL :

/hardware?category_id=1
Filtrer par localisation
const response = await api_service.get('/hardware', {
    params: {
        location_id: 20
    }
})

URL :

/hardware?location_id=20
Combiner plusieurs paramètres

Tu peux en mettre autant que tu veux :

const response = await api_service.get('/hardware', {
    params: {
        limit: 50,
        offset: 100,
        category_id: 1,
        manufacturer_id: 4,
        sort: 'asset_tag',
        order: 'asc'
    }
})

Axios envoie :

/hardware
?limit=50
&offset=100
&category_id=1
&manufacturer_id=4
&sort=asset_tag
&order=asc

## Quand ne pas utiliser params ?

Si l'API attend des données dans le corps de la requête (POST, PUT, PATCH).

Exemple :

await api_service.post('/hardware', {
    asset_tag: '12345',
    serial: 'ABC123'
}) 

### Mais malgré ça on peut aussi ajouter params dans requete post put delete etc 

await api_service.post('/hardware', {
    asset_tag: '12345',
    serial: 'ABC123'

    params:{
        manufacturer_id : 4
    }
}) 

cela signifie faire ce ajout pour manufacturer_id=4 
Oui.

Par exemple :

axios.post('/hardware', {
    asset_tag: '12345'
}, {
    params: {
        company_id: 1
    }
})

envoie :

POST /hardware?company_id=1

avec dans le body :

{
  "asset_tag": "12345"
}
Règle pratique
params → données dans l'URL (?limit=50&offset=0)
Body → données de création ou modification

Donc pour Snipe-IT :

GET /hardware

# params

POST /hardware
PUT /hardware/:id
PATCH /hardware/:id

# body (et éventuellement params si la documentation le demande explicitement).

En résumé, params n'est pas réservé à GET, mais c'est avec GET qu'on l'utilise le plus souvent. 

## Pour faire checkout 
# assets
checkout vers user / location / asset

# licence 
checkout vers user / asset 

# accessoire 
checkout vers user / locacion / asset qty a remplir 

# consumables 
checkout vers user avec qty a remplir 

# components 
checkout vers asset avec qty a remplir 

boutton checkout 
appelle modale setmodale true 
modale misafidy user ou assets parent ou location etc appelle fonction validation checkout 

Le scénario classique :

L'utilisateur voit la liste des assets.
Il clique sur Checkout pour un asset.
La modal s'ouvre.
Dans la modal, il choisit :
User
Location
Asset
Selon son choix, les champs affichés changent.
Il clique sur Valider.

checkin
Il clique sur checkin pour un asset ensuite un modal s'ouvre dans le modal il choisit status et location et note 

## Ajouter un component dans un assets 
Assets → Components → Checkout to Asset

## Kits (Bundles prédéfinis)
Permet de grouper plusieurs assets/accessories/components pour les checkout ensemble en une fois.
Kits → Create Kit → Update Kit → addItems  


## Pas de fonction d'export en csv 

## transformation objet en tableau 
object.entries permet de transformer objet en tableau on peut le voir exemple dans acceuil pour nombre categorie ligne 47 à 53

## Entries
Object.entries(ticket).map(([cle, valeur]) => (
    <p key={cle}>{cle} : {valeur}</p>
))

## transformation String en nombre decimal 
parseFloat(String(valeur).replace(/[^0-9.]/g, '')) || 0

## Utilisation prev 
prev dans react signifie ancienne valeur si on veut stocker en + en + en + un objet en entier dans un tableau alors il est recommandé d'utiliser prev pour ne pas ecraser les anciennes valeurs existantes comme par exemple utilisation de prev 
et aussi pour eviter les doublons 
    const handleOnChange =()=>{
        const item = item.find(i=> i.id === Number(e.target.value))
        if(item){
            setSelectedItems(prev => [...prev,item]);
        }
    }


# si juste on veut stocker une valeur là on prend juste le tableau selectedItems ici et valeur à rajouter 
        const handleOnChange =(e)=>{
        if (e.target.value && selectedItems.includes(e.target.value))
        setSelectedItems([...selectedItems,e.target.value])
    }

comment bien utiliser prev dia fanazavana fanampina momba ity partie ity     

const handleOnChange =(e)=>{
        const item = item.find(i=> i.id === Number(e.target.value))
        if(item){
            setSelectedItems(prev => [...prev,item]);
        }
    } et bien utilisation de prev 

# pour verifier si une valeur existe dans un tableau 
    selectedItems.includes(e.target.value)

## pas de return dans fonction alors on creer une variable à l'interieur fonction et set à l'exterieur du boucle ensuite et dans set on fait ceci set(fonction) , peux causer asynchrone si pas ça apres on peut aussi faire return et appeller dans une autre fonction return 
sort veut dire trier par colonne 
accompagné de order desc asc


## passer information d'une page à une autre update page update prerempli mettre dans state l'objet qu'on veut que la page recupère 
const navigate = useNavigate()

// Au moment du clic Edit
const handleEdit = (ticket) => {
    navigate('/edit-ticket', {
        state: {
            ticket: ticket  // ← passer tout l'objet ticket
        }
    })
}

// Dans le JSX
<button onClick={() => handleEdit(ticketData)}>Editer</button>

# extraction des informations dans la page edit 

function EditTicket() {
    const location = useLocation()
    const ticket = location.state?.ticket  // ← récupérer les données

    const [title, setTitre] = useState(ticket?.titre || '')
    const [descri, setDescription] = useState(ticket?.description || '')
    const [selectedPriority, setSelectedPriority] = useState(ticket?.priority_id || '')
    
    // ← pré-cocher les items déjà dans le ticket
    const [idsSelectionnes, setIdsSelectionnes] = useState(
        ticket?.items?.map(i => i.id) || []  // ← extraire les ids des items
    ) }