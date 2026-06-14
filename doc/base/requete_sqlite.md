## GET
# Lire tous les enregistrements
router.get('/ma_table', (req, res) => {
    try {
        const rows = sqliteDb.prepare('SELECT * FROM ma_table ORDER BY id ASC').all()
        res.json({ success: true, data: rows })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

# Lire un seul enregistrement par id
router.get('/ma_table/:id', (req, res) => {
    try {
        const row = sqliteDb.prepare('SELECT * FROM ma_table WHERE id = ?').get(req.params.id)
        if (!row) return res.status(404).json({ success: false, message: 'Introuvable' })
        res.json({ success: true, data: row })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})
# GET AVEC PARAMETRES 
# pattern à répéter pour chaque nouveau filtre
javascript// 1. Ajouter dans la déstructuration
const { ..., nouveau_filtre } = req.query

// 2. Ajouter le if
if (nouveau_filtre) {
    conditions.push('colonne = ?')   // ← exact match
    params.push(nouveau_filtre)
}

// Pour une recherche partielle LIKE
if (nouveau_filtre) {
    conditions.push('colonne LIKE ?')
    params.push(`%${nouveau_filtre}%`)
}

router.get('/ma_table', (req, res) => {
    try {
        const { search, id_ticket, sort = 'id', order = 'desc', limit, offset = 0 } = req.query

        const conditions = []
        const params = []

        // Filtre texte
        if (search) {
            conditions.push('(nom LIKE ? OR description LIKE ?)')
            params.push(`%${search}%`, `%${search}%`)
        }

        // Filtre par id_ticket
        if (id_ticket) {
            conditions.push('id_ticket = ?')
            params.push(id_ticket)
        }

        // Whitelist colonnes de tri
        const SORTABLE = ['id', 'nom', 'valeur', 'date']
        const sortCol = SORTABLE.includes(sort) ? sort : 'id'
        const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
        const limitClause = limit ? `LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}` : ''

        const rows = sqliteDb.prepare(`
            SELECT * FROM ma_table
            ${whereClause}
            ORDER BY ${sortCol} ${sortOrder}
            ${limitClause}
        `).all(...params)

        res.json({ success: true, data: rows, total: rows.length })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

# Lire avec JOIN
router.get('/ma_table', (req, res) => {
    try {
        const rows = sqliteDb.prepare(`
            SELECT ma_table.*, tickets.titre as ticket_titre
            FROM ma_table
            LEFT JOIN tickets ON ma_table.id_ticket = tickets.id
            ORDER BY ma_table.id DESC
        `).all()
        res.json({ success: true, data: rows })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

## POST 
router.post('/ma_table', (req, res) => {
    try {
        const { nom, valeur, id_ticket } = req.body

        // Validation
        if (!nom) return res.status(400).json({ success: false, message: 'nom est requis' })

        const result = sqliteDb.prepare(`
            INSERT INTO ma_table (nom, valeur, id_ticket)
            VALUES (?, ?, ?)
        `).run(nom, valeur || 0, id_ticket || null)

        // Retourner l'enregistrement créé
        const created = sqliteDb.prepare('SELECT * FROM ma_table WHERE id = ?').get(result.lastInsertRowid)
        res.status(201).json({ success: true, data: created })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

## PUT
# Modification complète — tous les champs
router.put('/ma_table/:id', (req, res) => {
    try {
        const row = sqliteDb.prepare('SELECT * FROM ma_table WHERE id = ?').get(req.params.id)
        if (!row) return res.status(404).json({ success: false, message: 'Introuvable' })

        const { nom, valeur } = req.body

        sqliteDb.prepare(`
            UPDATE ma_table
            SET nom = ?, valeur = ?
            WHERE id = ?
        `).run(
            nom    ?? row.nom,     // ← garder l'ancienne valeur si non fourni
            valeur ?? row.valeur,
            req.params.id
        )

        const updated = sqliteDb.prepare('SELECT * FROM ma_table WHERE id = ?').get(req.params.id)
        res.json({ success: true, data: updated })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

# Modification partielle dynamique — comme dans ton ticket_cout
router.put('/ma_table/:id', (req, res) => {
    try {
        const { nom, valeur, actif } = req.body
        const updateParams = []
        const updateFields = []

        // Ajouter seulement les champs fournis
        if (nom !== undefined)    { updateFields.push('nom = ?');    updateParams.push(nom); }
        if (valeur !== undefined) { updateFields.push('valeur = ?'); updateParams.push(parseFloat(valeur)); }
        if (actif !== undefined)  { updateFields.push('actif = ?');  updateParams.push(actif ? 1 : 0); }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucun champ à modifier' })
        }

        updateParams.push(req.params.id)
        const result = sqliteDb.prepare(`
            UPDATE ma_table SET ${updateFields.join(', ')} WHERE id = ?
        `).run(...updateParams)

        if (result.changes === 0) return res.status(404).json({ success: false, message: 'Introuvable' })
        res.json({ success: true, message: 'Mis à jour' })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

## DELETE
// Supprimer un enregistrement
router.delete('/ma_table/', (req, res) => {
    try {
        const result = sqliteDb.prepare('DELETE FROM ma_table').run(req.params.id)
        res.json({ success: true, message: 'Supprimé' })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// Supprimer un enregistrement
router.delete('/ma_table/:id', (req, res) => {
    try {
        const result = sqliteDb.prepare('DELETE FROM ma_table WHERE id = ?').run(req.params.id)
        if (result.changes === 0) return res.status(404).json({ success: false, message: 'Introuvable' })
        res.json({ success: true, message: 'Supprimé' })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})