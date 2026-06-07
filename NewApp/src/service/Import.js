import api_service from '../api/api_service'
import api_node from '../api/api_node'

class ImportService {

    constructor() {

        this.companiesCache      = {}
        this.categoriesCache     = {}
        this.manufacturersCache  = {}
        this.statusLabelsCache   = {}
        this.departmentsCache    = {}
        this.modelsCache         = {}
        this.usersCache          = {}
    }


    reset() {
        this.companiesCache      = {}
        this.categoriesCache     = {}
        this.manufacturersCache  = {}
        this.statusLabelsCache   = {}
        this.departmentsCache    = {}
        this.modelsCache         = {}
        this.usersCache          = {}
    }

    clean(val, defaultValue = '') {
        if (val === null || val === undefined) return defaultValue
        return val.toString().replace(/["']/g, '').trim()
    }

    cleanCSV(val, defaultValue = '') {
        if (val === null || val === undefined) return defaultValue
        return val.toString().replace(/["']/g, '').replace(/^[;,\s]+|[;,\s]+$/g, '').trim()
    }

    cleanLower(val, defaultValue = '') {
        return this.cleanCSV(val, defaultValue).toLowerCase()
    }

    cleanNum(val, defaultValue = 0) {
        if (val === null || val === undefined || val === '') return defaultValue
        let s = val.toString().replace(/["';\s]/g, '')
        // Si ça ressemble à un nombre anglais (ex: 1,200 ou 1,200.50), retirer les virgules
        if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
            s = s.replace(/,/g, '')
        } else {
            // Sinon, considérer que la virgule est une virgule décimale française
            s = s.replace(',', '.')
        }
        const n = parseFloat(s)
        return isNaN(n) ? defaultValue : n
    }

    /** Recherche flexible d'une valeur dans une row CSV */
    getVal(row, ...keys) {
        if (!row) return ''
        for (const k of keys) {
            const foundKey = Object.keys(row).find(
                rk => rk.toLowerCase().trim() === k.toLowerCase().trim()
            )
            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
                return this.cleanCSV(row[foundKey])
            }
        }
        return ''
    }

    /** Convertit DD/MM/YYYY → YYYY-MM-DD (format Snipe-IT) */
    formatDate(dateStr) {
        if (!dateStr) return null
        const cleaned = this.cleanCSV(dateStr)
        const match = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
        if (match) {
            const day   = match[1].padStart(2, '0')
            const month = match[2].padStart(2, '0')
            return `${match[3]}-${month}-${day}`
        }
        // Déjà en YYYY-MM-DD ?
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned
        return null
    }

    /** Mapping status CSV → type Snipe-IT */
    mapStatusType(statusName) {
        const s = (statusName || '').toLowerCase().trim()
        if (s.includes('deploy'))               return 'deployable'
        if (s.includes('pending'))              return 'pending'
        if (s.includes('archived') || s.includes('archivé')) return 'archived'
        if (s.includes('broken') || s.includes('cassé'))     return 'undeployable'
        if (s.includes('ready'))                return 'deployable'
        return 'deployable'
    }

    /** Génère un username à partir d'un nom complet */
    generateUsername(fullName, email) {
        if (email) {
            const local = email.split('@')[0]
            if (local) return local.toLowerCase().replace(/[^a-z0-9._-]/g, '')
        }
        if (fullName) {
            return fullName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, '')
        }
        return 'user_' + Date.now()
    }

    /** Sépare un nom complet en prénom + nom */
    splitName(fullName) {
        if (!fullName) return { firstName: 'Inconnu', lastName: 'Inconnu' }
        const parts = fullName.trim().split(/\s+/)
        if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
        return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
    }

    // ============================================================
    //  PARSEUR CSV ROBUSTE
    // ============================================================

    parseCSV(content, separator = 'auto') {
        const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '')
        if (lines.length === 0) return []

        // ── Auto-détection du séparateur ─────────────────────
        let sep = separator
        if (sep === 'auto') {
            const sample = lines.slice(0, 5).join('\n')
            const counts = {
                ';':  (sample.match(/;/g)  || []).length,
                ',':  (sample.match(/,/g)  || []).length,
                '\t': (sample.match(/\t/g) || []).length,
            }
            sep = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
            if (counts[sep] === 0) sep = ','
        }

        // ── Split en respectant les guillemets ───────────────
        const splitLine = (str) => {
            const parts = []
            let current = '', inQuotes = false
            for (let i = 0; i < str.length; i++) {
                const c = str[i]
                if (c === '"') {
                    if (inQuotes && str[i + 1] === '"') {
                        current += '"'
                        i++
                    } else {
                        inQuotes = !inQuotes
                    }
                } else if (c === sep && !inQuotes) {
                    parts.push(current.trim())
                    current = ''
                } else {
                    current += c
                }
            }
            parts.push(current.trim())
            return parts
        }

        // ── En-têtes ─────────────────────────────────────────
        const headers = lines[0].replace(/^\uFEFF/, '').split(sep).map(h =>
            this.clean(h).replace(/[;,\s]+$/, '')
        )
        const dataLines = lines.slice(1)

        return dataLines.map(line => {
            const values = splitLine(line)
            while (values.length < headers.length) values.push('')
            const row = {}
            headers.forEach((h, i) => { row[h] = values[i] !== undefined ? values[i] : '' })
            return row
        })
    }

    // ============================================================
    //  1. COMPANIES
    // ============================================================

    async insertCompany(name) {
        const n = this.clean(name)
        if (!n) return null
        if (this.companiesCache[n]) return this.companiesCache[n]

        try {
            // Chercher si existe déjà
            const search = await api_service.get('/companies', { params: { search: n, limit: 50 } })
            const rows = search.data?.rows || []
            const found = rows.find(c => c.name?.toLowerCase() === n.toLowerCase())
            if (found) { this.companiesCache[n] = found.id; return found.id }

            // Créer
            const res = await api_service.post('/companies', { name: n })
            const id = res.data?.payload?.id
            if (id) { this.companiesCache[n] = id; console.log(`[COMPANY] Créée : ${n} → ID ${id}`) }
            return id || null
        } catch (e) {
            console.error(`[COMPANY] Erreur "${n}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  2. CATEGORIES
    // ============================================================

    async insertCategory(name, categoryType = 'asset') {
        const n = this.clean(name) || 'Général'
        const key = n.toLowerCase()
        if (this.categoriesCache[key]) return this.categoriesCache[key]

        try {
            const search = await api_service.get('/categories', { params: { search: n, limit: 50 } })
            const rows = search.data?.rows || []
            const found = rows.find(c => c.name?.toLowerCase() === key)
            if (found) { this.categoriesCache[key] = found.id; return found.id }

            const res = await api_service.post('/categories', {
                name: n,
                category_type: categoryType,
                use_default_eula: false,
                require_acceptance: false,
                checkin_email: false,
            })
            const id = res.data?.payload?.id
            if (id) { this.categoriesCache[key] = id; console.log(`[CATEGORY] Créée : ${n} → ID ${id}`) }
            return id || null
        } catch (e) {
            console.error(`[CATEGORY] Erreur "${n}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  3. MANUFACTURERS
    // ============================================================

    async insertManufacturer(name) {
        const n = this.clean(name)
        if (!n) return null
        const key = n.toLowerCase()
        if (this.manufacturersCache[key]) return this.manufacturersCache[key]

        try {
            const search = await api_service.get('/manufacturers', { params: { search: n, limit: 50 } })
            const rows = search.data?.rows || []
            const found = rows.find(m => m.name?.toLowerCase() === key)
            if (found) { this.manufacturersCache[key] = found.id; return found.id }

            const res = await api_service.post('/manufacturers', { name: n })
            const id = res.data?.payload?.id
            if (id) { this.manufacturersCache[key] = id; console.log(`[MANUFACTURER] Créé : ${n} → ID ${id}`) }
            return id || null
        } catch (e) {
            console.error(`[MANUFACTURER] Erreur "${n}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  4. STATUS LABELS
    // ============================================================

    async insertStatusLabel(name) {
        const n = this.clean(name) || 'Ready to Deploy'
        const key = n.toLowerCase()
        if (this.statusLabelsCache[key]) return this.statusLabelsCache[key]

        try {
            const search = await api_service.get('/statuslabels', { params: { search: n, limit: 50 } })
            const rows = search.data?.rows || []
            const found = rows.find(s => s.name?.toLowerCase() === key)
            if (found) { this.statusLabelsCache[key] = found.id; return found.id }

            const type = this.mapStatusType(n)
            const res = await api_service.post('/statuslabels', { name: n, type })
            const id = res.data?.payload?.id
            if (id) { this.statusLabelsCache[key] = id; console.log(`[STATUS] Créé : ${n} (${type}) → ID ${id}`) }
            return id || null
        } catch (e) {
            console.error(`[STATUS] Erreur "${n}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  5. DEPARTMENTS  (dépend de company)
    // ============================================================

    async insertDepartment(name, companyId) {
        const n = this.clean(name)
        if (!n) return null
        const key = `${n.toLowerCase()}_${companyId || 0}`
        if (this.departmentsCache[key]) return this.departmentsCache[key]

        try {
            const search = await api_service.get('/departments', { params: { search: n, limit: 50 } })
            const rows = search.data?.rows || []
            const found = rows.find(d => d.name?.toLowerCase() === n.toLowerCase())
            if (found) { this.departmentsCache[key] = found.id; return found.id }

            const payload = { name: n }
            if (companyId) payload.company_id = companyId
            const res = await api_service.post('/departments', payload)
            const id = res.data?.payload?.id
            if (id) { this.departmentsCache[key] = id; console.log(`[DEPARTMENT] Créé : ${n} → ID ${id}`) }
            return id || null
        } catch (e) {
            console.error(`[DEPARTMENT] Erreur "${n}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  6. MODELS  (dépend de category + manufacturer)
    // ============================================================

    async insertModel(name, categoryId, manufacturerId) {
        const n = this.clean(name)
        if (!n) return null
        const key = n.toLowerCase()
        if (this.modelsCache[key]) return this.modelsCache[key]

        try {
            const search = await api_service.get('/models', { params: { search: n, limit: 50 } })
            const rows = search.data?.rows || []
            const found = rows.find(m => m.name?.toLowerCase() === key)
            if (found) { this.modelsCache[key] = found.id; return found.id }

            const payload = { name: n }
            if (categoryId)      payload.category_id     = categoryId
            if (manufacturerId)  payload.manufacturer_id  = manufacturerId
            const res = await api_service.post('/models', payload)
            const id = res.data?.payload?.id
            if (id) { this.modelsCache[key] = id; console.log(`[MODEL] Créé : ${n} → ID ${id}`) }
            return id || null
        } catch (e) {
            console.error(`[MODEL] Erreur "${n}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  7. USERS  (dépend de company + department)
    // ============================================================

    async insertUser(row, companyId, departmentId) {
        const fullName = this.getVal(row, 'user', 'name', 'nom', 'utilisateur','user_name','nom utilisateur','nom_utilisateur')
        const email    = this.getVal(row, 'email', 'e-mail', 'mail','e_mail')
        if (!fullName && !email) return null

        const cacheKey = (email || fullName).toLowerCase()
        if (this.usersCache[cacheKey]) return this.usersCache[cacheKey]

        const { firstName, lastName } = this.splitName(fullName)
        const username = this.generateUsername(fullName, email)

        try {
            // Chercher par email ou username
            if (email) {
                const search = await api_service.get('/users', { params: { search: email, limit: 50 } })
                const rows = search.data?.rows || []
                const found = rows.find(u =>
                    u.email?.toLowerCase() === email.toLowerCase() ||
                    u.username?.toLowerCase() === username.toLowerCase()
                )
                if (found) { this.usersCache[cacheKey] = found.id; return found.id }
            }

            const password = username + '_Pwd1!'
            const payload = {
                first_name:            firstName,
                last_name:             lastName,
                username:              username,
                password:              password,
                password_confirmation: password,
                activated:             true,
            }
            if (email)        payload.email         = email
            if (companyId)    payload.company_id     = companyId
            if (departmentId) payload.department_id  = departmentId

            const res = await api_service.post('/users', payload)
            const id = res.data?.payload?.id
            if (id) { this.usersCache[cacheKey] = id; console.log(`[USER] Créé : ${fullName} (${email}) → ID ${id}`) }
            return id || null
        } catch (e) {
            console.error(`[USER] Erreur "${fullName}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  8. ASSETS / HARDWARE  (dépend de tout le reste)
    // ============================================================

    async insertAsset(row, modelId, statusId, companyId, userId) {
        const assetTag     = this.getVal(row, 'asset_tag', 'asset-tag', 'asset', 'tag', 'code', 'identifiant')
        const serial       = this.getVal(row, 'serial', 'serial_number', 'numero_serie', 'num_serie', 'sn')
        const name         = this.getVal(row, 'name', 'nom', 'libelle', 'titre', 'asset_name')
        const purchaseDate = this.formatDate(this.getVal(row, 'purchase_date', 'date_achat', 'date', 'achat'))
        const purchaseCost = this.cleanNum(this.getVal(row, 'purchase_cost', 'cout', 'prix', 'cost', 'valeur'))

        if (!assetTag || !modelId || !statusId) {
            console.error(`[ASSET] Champs obligatoires manquants — tag:${assetTag} model:${modelId} status:${statusId}`)
            return null
        }

        try {
            const payload = {
                asset_tag:  assetTag,
                model_id:   modelId,
                status_id:  statusId,
                name:       name || assetTag,
            }
            if (serial)       payload.serial        = serial
            if (companyId)    payload.company_id     = companyId
            if (purchaseDate) payload.purchase_date  = purchaseDate
            if (purchaseCost) payload.purchase_cost  = purchaseCost

            // Checkout à un user si status = Deployed
            const statusName = this.getVal(row, 'status', 'statut', 'etat', 'état')
            if (userId && statusName.toLowerCase().includes('deploy')) {
                payload.assigned_user = userId
            }

            const res = await api_service.post('/hardware', payload)
            const id = res.data?.payload?.id
            if (id) console.log(`[ASSET] Créé : ${assetTag} — ${name} → ID ${id}`)
            return id || null
        } catch (e) {
            console.error(`[ASSET] Erreur "${assetTag}" :`, e.response?.data || e.message)
            return null
        }
    }

    // ============================================================
    //  IMPORT PRINCIPAL — traite chaque ligne du CSV
    // ============================================================

    async importFromCSV(csvContent, progressCallback) {
        this.reset()
        const rows = this.parseCSV(csvContent)
        if (rows.length === 0) throw new Error('CSV vide ou invalide')

        console.log(`\n══════════════════════════════════════════`)
        console.log(`  IMPORT CSV → Snipe-IT : ${rows.length} ligne(s)`)
        console.log(`══════════════════════════════════════════\n`)

        const results = { success: 0, errors: 0, details: [] }

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const lineNum = i + 2  // +2 car ligne 1 = en-tête
            try {
                // ── 1. Company ────────────────────────────
                const companyName = this.getVal(row, 'company', 'entreprise', 'societe', 'société', 'compagnie')
                const companyId   = await this.insertCompany(companyName)

                // ── 2. Category ───────────────────────────
                const categoryName = this.getVal(row, 'category', 'categorie', 'cat', 'type', 'catégorie')
                const categoryId   = await this.insertCategory(categoryName, 'asset')

                // ── 3. Manufacturer ───────────────────────
                const mfgName      = this.getVal(row, 'manufacturer', 'fabricant', 'marque', 'constructeur')
                const manufacturerId = await this.insertManufacturer(mfgName)

                // ── User existence check pour status ───────
                const userNameCheck = this.getVal(row, 'user', 'utilisateur', 'nom', 'employe', 'employé', 'assignee')
                const userEmailCheck = this.getVal(row, 'email', 'mail', 'courriel', 'e-mail')
                const hasUser = !!(userNameCheck || userEmailCheck)

                // ── 4. Status Label ───────────────────────
                let statusName = this.getVal(row, 'status', 'statut', 'etat', 'état')
                // Si "Deployed" mais aucun user, on modifie en "Ready to Deploy"
                if (statusName.toLowerCase() === 'deployed' && !hasUser) {
                    statusName = 'Ready to Deploy'
                }
                const statusId   = await this.insertStatusLabel(statusName)

                // ── 5. Department ─────────────────────────
                const deptName    = this.getVal(row, 'department', 'departement', 'service', 'dept', 'département')
                const departmentId = await this.insertDepartment(deptName, companyId)

                // ── 6. Model ──────────────────────────────
                const modelName = this.getVal(row, 'model', 'modele', 'modèle')
                const modelId   = await this.insertModel(modelName, categoryId, manufacturerId)

                // ── 7. User ───────────────────────────────
                const userName = this.getVal(row, 'user', 'utilisateur', 'nom', 'employe', 'employé', 'assignee')
                const userEmail = this.getVal(row, 'email', 'mail', 'courriel', 'e-mail')
                let userId = null
                if (userName || userEmail) {
                    userId = await this.insertUser(row, companyId, departmentId)
                }

                // ── 8. Asset ──────────────────────────────
                const assetId = await this.insertAsset(row, modelId, statusId, companyId, userId)

                if (assetId) {
                    results.success++
                    results.details.push({ line: lineNum, status: 'OK', asset_tag: this.getVal(row, 'asset_tag'), id: assetId })
                } else {
                    results.errors++
                    results.details.push({ line: lineNum, status: 'ERREUR', asset_tag: this.getVal(row, 'asset_tag'), error: 'Asset non créé' })
                }
            } catch (err) {
                results.errors++
                results.details.push({ line: lineNum, status: 'ERREUR', asset_tag: this.getVal(row, 'asset_tag'), error: err.message })
                console.error(`[LIGNE ${lineNum}] Erreur :`, err.message)
            }

            if (progressCallback) progressCallback(i + 1, rows.length)
        }

        console.log(`\n══════════════════════════════════════════`)
        console.log(`  RÉSULTAT : ${results.success} OK / ${results.errors} erreur(s)`)
        console.log(`══════════════════════════════════════════\n`)

        return results
    }

    // ============================================================
    //  IMPORT TICKETS CSV → Node.js SQLite
    // ============================================================

    /** Parse le champ Items en JSON array string — gère tous les cas super robustement */
    parseTicketItems(raw) {
        if (!raw || raw === '') return '[]'
        
        let cleaned = raw.toString().replace(/["'\[\]]/g, '').trim()
        cleaned = cleaned.replace(/^[,;\s]+|[,;\s]+$/g, '')
        
        if (!cleaned) return '[]'

        const parts = cleaned.split(/[,;]/)
            .map(s => s.trim())
            .filter(s => s !== '')

        return JSON.stringify(parts)
    }

    /** Valide et normalise un status de ticket */
    normalizeTicketStatus(raw) {
        const s = this.cleanLower(raw)
        const mapping = {
            'new': 'New', 'nouveau': 'New', 'ouvert': 'New', 'open': 'New',
            'in progress': 'In Progress', 'en cours': 'In Progress', 'progress': 'In Progress',
            'closed': 'Closed', 'fermé': 'Closed', 'ferme': 'Closed', 'done': 'Closed',
            'resolved': 'Closed', 'resolu': 'Closed',
        }
        return mapping[s] || raw || 'New'
    }

    /** Valide et normalise une priorité de ticket */
    normalizeTicketPriority(raw) {
        const s = this.cleanLower(raw)
        const mapping = {
            'low': 'Low', 'basse': 'Low', 'bas': 'Low', 'faible': 'Low',
            'medium': 'Medium', 'moyenne': 'Medium', 'moyen': 'Medium', 'normal': 'Medium',
            'high': 'High', 'haute': 'High', 'haut': 'High', 'élevé': 'High', 'eleve': 'High',
            'critical': 'Critical', 'critique': 'Critical', 'urgent': 'Critical',
        }
        return mapping[s] || raw || 'Medium'
    }

    async importTicketsFromCSV(csvContent, progressCallback) {
        const rows = this.parseCSV(csvContent)
        if (rows.length === 0) throw new Error('CSV tickets vide ou invalide')

        console.log(`\n══════════════════════════════════════════`)
        console.log(`  IMPORT TICKETS CSV : ${rows.length} ticket(s)`)
        console.log(`══════════════════════════════════════════\n`)

        const results = { success: 0, errors: 0, skipped: 0, details: [] }
        const validTickets = []

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const lineNum = i + 2

            try {
                const numTicket = this.cleanNum(
                    this.getVal(row, 'Num_Ticket', 'num_ticket', 'numero ticket', 'num ticket', 'numero', 'num', 'id', 'ticket'),
                    0
                )

                if (!numTicket || numTicket <= 0) {
                    console.warn(`[TICKET L${lineNum}] num_ticket invalide, ignoré`)
                    results.skipped++
                    results.details.push({ line: lineNum, status: 'SKIP', error: 'num_ticket invalide' })
                    continue
                }

                const titre = this.getVal(row, 'Titre', 'titre', 'title', 'sujet', 'objet', 'nom')
                if (!titre) {
                    console.warn(`[TICKET L${lineNum}] titre vide, ignoré`)
                    results.skipped++
                    results.details.push({ line: lineNum, status: 'SKIP', error: 'titre vide' })
                    continue
                }

                const dateRaw = this.formatDate(this.getVal(row, 'Date', 'date', 'date_ticket', 'date creation')) || ''
                const heureRaw = this.getVal(row, 'Heure', 'heure', 'time', 'hour', 'temps')
                const description = this.getVal(row, 'Description', 'description', 'desc', 'detail', 'details', 'contenu') || titre
                const status = this.normalizeTicketStatus(this.getVal(row, 'Status', 'status', 'statut', 'etat', 'état'))
                const priority = this.normalizeTicketPriority(this.getVal(row, 'Priority', 'priority', 'priorite', 'prio', 'priorité', 'importance'))
                const items = this.parseTicketItems(this.getVal(row, 'Items', 'items', 'assets', 'equipements', 'materiels', 'matériels', 'asset_tag', 'asset', 'tag'))

                validTickets.push({
                    num_ticket: numTicket,
                    date: dateRaw || '',
                    heure: heureRaw || '',
                    titre,
                    description,
                    status,
                    priority,
                    items,
                })

                console.log(`[TICKET L${lineNum}] #${numTicket} "${titre}" — ${status} (${priority})`)
            } catch (err) {
                results.errors++
                results.details.push({ line: lineNum, status: 'ERREUR', error: err.message })
                console.error(`[TICKET L${lineNum}] Erreur parsing :`, err.message)
            }
        }

        if (validTickets.length === 0) {
            console.warn('[TICKETS] Aucun ticket valide trouvé')
            return { ...results, message: 'Aucun ticket valide à importer' }
        }

        if (progressCallback) progressCallback(0, validTickets.length)

        try {
            const res = await api_node.post('/import/tickets', { tickets: validTickets })
            results.success = res.data?.count || validTickets.length
            results.message = res.data?.message || `${results.success} ticket(s) importé(s)`
            console.log(`[TICKETS] ${results.message}`)
            if (progressCallback) progressCallback(validTickets.length, validTickets.length)
        } catch (e) {
            console.error('[TICKETS] Erreur import :', e.response?.data || e.message)
            results.errors += validTickets.length
            results.message = e.response?.data?.message || e.message
            throw new Error(results.message)
        }

        console.log(`\n══════════════════════════════════════════`)
        console.log(`  TICKETS : ${results.success} OK / ${results.errors} erreur(s) / ${results.skipped} ignoré(s)`)
        console.log(`══════════════════════════════════════════\n`)

        return results
    }
}

export default new ImportService()