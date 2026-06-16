## POST
router.post('/ticket/:id/note', (req, res) => {
    const id_ticket = req.params.id
    const { note } = req.body
    const date = new Date().toISOString();

    try {
        const result = sqliteDb.prepare('INSERT INTO ticket_note(id_ticket , note , date) VALUES (?,?,?)').run(id_ticket,note,date)
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

run ici remplace valeur des ? 
req.params.id passé en parametre dans l'url 
req.body ce qu'on fait dans l'insert

## GET 
router.get('/ticket',(req,res)=>{
    try{
        const result = sqliteDb.prepare('SELECT * FROM ticket_note').all();
        res.json({
            success: true,
            data: result
        });
    }catch(e){

    }
})

## GET un id
router.get('/ticket/:id',(req,res)=>{
    const id= req.params.id
    try{
        const result = sqliteDb.prepare('SELECT * FROM ticket_note WHERE id = ?').get(id);
        res.json({
            success: true,
            data: result
        });
    }catch(e){

    }
})


## PUT 
router.put('/ticket/:id',(req,res)=>{
    const id = req.params.id
    const {valeur1,valeur2} = req.params.body
    try{
        const result = sqliteDb.prepare('UPDATE ticket_note WHERE colonne1 = ? colonne2 = ? where id =?').run(id,valeur1,valeur2)
    }catch(e){

    }
})

## DELETE 
router.delete('/ticket/:id',(req,res)=>{
    const id = req.params.id
    try{
        const result = sqliteDb.prepare('DELETE FROM ticket_note where id = ?').run(id)
    }catch(e){

    }
})

differente type run pour delete post et put
get on utilise get ou all get pour retourner un element et all pour toutes les elements 

## JOIN 
SELECT
    t.num_ticket,
    t.titre,
    tn.id AS note_id,
    tn.contenu,
    tn.date
FROM ticket t
LEFT JOIN ticket_note tn
    ON t.id = tn.ticket_id


# dans select
# SELECT 
SELECT
    t.num_ticket,
    t.titre,
    tn.id AS note_id,
    tn.contenu,
    tn.date

# from
Ici tu choisis les colonnes que tu veux récupérer dans le résultat
FROM table de depart comme par exemple ici alors table de depart ticket car on veut recuperer les informations dans ticket 
cela signifie je pars de la table ticket et je lui donne l'alias t.

# left 
LEFT JOIN ticket_note tn
Je veux joindre la table ticket_note (alias tn) à chaque ticket.

# on 
ON condition de liaison je veux relier t.id du ticket avec tn.ticket_id ON t.id = tn.ticket_id

# as 
sert a ajouter alias qui pourrait etre utile dans json car sans ça ça renvoi id simplement 

## POUR RECONNAITRE CE QUE RETOURNE BASE 
# log réponse complète côté React
const response = await api_ticket.post(...)
console.log(response);

# cas 1  
backend : res.json({ success: true, data: result });
alors dans front : response.data.data 

# cas 2 
backend : res.json({success:true,result})
alors front : response.result

# cas 3 
res.json({ result });
alors front : response.data.result

# GET
sert à lire
response = data
response.data.data

# POST
crée un élément
souvent retourne created item
response.data.data

# PUT
update
retourne souvent item modifié
response.data.data

# DELETE
supprime
souvent retourne message
response.data.message

