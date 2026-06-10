import { useState } from 'react'
import ImportService from '../../service/Import'
import '../../styles/global.css'
import '../../styles/import.css'

function ImportData() {
    const [fileAssets, setFileAssets] = useState(null)
    const [fileTickets, setFileTickets] = useState(null)
    const [statusAssets, setStatusAssets] = useState('')
    const [statusTickets, setStatusTickets] = useState('')
    const [loadingAssets, setLoadingAssets] = useState(false)
    const [loadingTickets, setLoadingTickets] = useState(false)
    const [progressAssets, setProgressAssets] = useState('')
    const [progressTickets, setProgressTickets] = useState('')

    const handleFileAssetsChange = (e) => { setFileAssets(e.target.files[0]) }
    const handleFileTicketsChange = (e) => { setFileTickets(e.target.files[0]) }

    const importAssets = async () => {
        if (!fileAssets) { setStatusAssets('Veuillez sélectionner un fichier CSV pour les Assets.'); return }
        setLoadingAssets(true)
        setStatusAssets('Lecture du fichier...')
        setProgressAssets('')
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target.result
            try {
                setStatusAssets('Importation en cours...')
                const result = await ImportService.importFromCSV(text, (done, total) => {
                    setProgressAssets(`${done} / ${total}`)
                })
                setStatusAssets(`Terminé : ${result.success} succès, ${result.errors} erreur(s).`)
            } catch (err) {
                console.error(err)
                setStatusAssets(`Erreur : ${err.message}`)
            } finally {
                setLoadingAssets(false)
            }
        }
        reader.readAsText(fileAssets, 'utf-8')
    }

    const importTickets = async () => {
        if (!fileTickets) { setStatusTickets('Veuillez sélectionner un fichier CSV pour les Tickets.'); return }
        setLoadingTickets(true)
        setStatusTickets('Lecture du fichier...')
        setProgressTickets('')
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target.result
            try {
                setStatusTickets('Importation en cours...')
                const result = await ImportService.importTicketsFromCSV(text, (done, total) => {
                    setProgressTickets(`${done} / ${total}`)
                })
                setStatusTickets(`Terminé : ${result.message} (${result.success} succès, ${result.errors} erreur(s), ${result.skipped} ignoré(s)).`)
            } catch (err) {
                console.error(err)
                setStatusTickets(`Erreur : ${err.message}`)
            } finally {
                setLoadingTickets(false)
            }
        }
        reader.readAsText(fileTickets, 'utf-8')
    }

    return (
        <div className="import-page page-sm">
            <h1 className="page-title">Import de données</h1>

            <div className="steps-indicator">
                <div className={`step-item ${(!loadingAssets && !loadingTickets && !fileAssets && !fileTickets) ? 'active' : ''}`}>1. Préparation</div>
                <div className={`step-item ${loadingAssets ? 'active' : ''}`}>2. Import Assets</div>
                <div className={`step-item ${loadingTickets ? 'active' : ''}`}>3. Import Tickets</div>
            </div>

            <div className="import-section">
                <h2>Import Assets (Feuille 1)</h2>
                <input type="file" accept=".csv" onChange={handleFileAssetsChange} disabled={loadingAssets} />
                <button className="btn" onClick={importAssets} disabled={loadingAssets || !fileAssets}>
                    Importer Assets
                </button>
                <p className="import-status">Status : {statusAssets}</p>
                {progressAssets && <p className="import-progress">Progression : {progressAssets}</p>}
            </div>

            <hr className="import-divider" />

            <div className="import-section">
                <h2>Import Tickets (Feuille 2)</h2>
                <input type="file" accept=".csv" onChange={handleFileTicketsChange} disabled={loadingTickets} />
                <button className="btn" onClick={importTickets} disabled={loadingTickets || !fileTickets}>
                    Importer Tickets
                </button>
                <p className="import-status">Status : {statusTickets}</p>
                {progressTickets && <p className="import-progress">Progression : {progressTickets}</p>}
            </div>
        </div>
    )
}

export default ImportData