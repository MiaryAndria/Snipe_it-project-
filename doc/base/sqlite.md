## pour creer table 
sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS ma_nouvelle_table (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        nom         TEXT NOT NULL,
        valeur      REAL DEFAULT 0,
        date        TEXT,
        actif       INTEGER DEFAULT 1,   -- ← booléen en SQLite (0 ou 1)
        id_ticket   INTEGER,
        FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE
    );
`)
Si creer table a la premiere alors on ajoute dan sqliteDb.exec dans server.js ou via interface ensuite si on veut modifier on ajout dans server node ce ajouterColonne en bas ajouter un autre sqliteDb.exec comme dans server pour s'assurer migration 
## Ajouter colonne
à mettre dans server node 
try {
    sqliteDb.prepare('ALTER TABLE tickets ADD COLUMN priorite_label TEXT').run()
} catch (err) {
    // Colonne existe déjà → ignorer l'erreur
}
## Type 
Integer Nombres entiers, booléens (0/1), ids
text    Nombres décimaux (prix, montants)
real    Chaînes de caractères, dates, JSON
bloab   Données binaires (rarement utilisé)

## Autorisé et non autorisé
# Autorisé
ALTER TABLE t ADD COLUMN nom TEXT
ALTER TABLE t ADD COLUMN nom TEXT DEFAULT 'valeur'
ALTER TABLE t ADD COLUMN nom INTEGER DEFAULT 0

# Non supporté dans ALTER TABLE SQLite
ALTER TABLE t ADD COLUMN nom TEXT NOT NULL  // ← NOT NULL sans DEFAULT interdit
ALTER TABLE t DROP COLUMN nom               // ← DROP supporté seulement SQLite 3.35+
ALTER TABLE t RENAME COLUMN ancien TO nouveau
