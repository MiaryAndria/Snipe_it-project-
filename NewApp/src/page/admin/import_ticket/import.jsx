import { useState, useRef } from 'react'
import Papa from 'papaparse'
import api_ticket from '../../../api/api_ticket'

function ImportTicket() {
    const [preview, setPreview] = useState([])
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const fileRef = useRef()
    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setPreview(result.data)
                setResults(null)
            }
        })
    }
    const handleImport = async () => {
        if (preview.length === 0) {
            setMessage('Aucune donnée à importer')
            return
        }
        setLoading(true)
        try {
            const response = await api_ticket.post('/import/mouvements', {
                mouvements: preview.map(row => ({
                    num_ticket: parseInt(row.num_ticket || row.Num_ticket || row.ticket),
                    mvt: (row.mvt || row.mouvement),
                    valeur: (row.valeur || row.Value || row.val)

                }))
            })
            setResults(response.data)
            setMessage('Import terminé')
            setPreview([])
            fileRef.current.value = ''
        } catch (e) {
            setMessage('Erreur lors recuperation information')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>Page import ticket</h2>
            <p>{message}</p>
            <input ref={fileRef} type="file" accept='.csv' onChange={handleFile}></input>
            {preview.length > 0 && (
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>num_ticket</th>
                                <th>type_mouvement</th>
                                <th>valeur</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.num_ticket}</td>
                                    <td>{row.mvt}</td>
                                    <td>{row.valeur}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {results && (
                <div>
                    <h3>Resultats</h3>
                    {results.results?.length > 0 && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.results.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.num_ticket}</td>
                                        <td>{r.type}</td>
                                        <td>{r.statut}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            {preview.length > 0 && (
                <button onClick={handleImport} disabled={loading}>
                    {loading ? 'Import en cours...' : 'Importer'}
                </button>
            )}
        </div>
    )
}

export default ImportTicket