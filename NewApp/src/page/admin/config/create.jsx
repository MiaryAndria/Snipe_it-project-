import { useEffect, useState } from "react"
import api_ticket from "../../../api/api_ticket"
import '../../../styles/global.css'

function CustomParams() {
    const [status, setStatus] = useState([])
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [couleur, setCouleur] = useState("#ff0000")
    const [couleurListe, setCouleurListe] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [traduction, setTraduction] = useState('')
    const [kanbanSetting, setKanbanSettings] = useState([])

    const getStatus = async () => {
        try {
            const response = await api_ticket.get('/statuses')
            setStatus(response.data.data)
        } catch (e) {
            console.log(e)
        }
    }

    const getCouleur = async () => {
        try {
            const response = await api_ticket.get('/couleurs')
            setCouleurListe(response.data.data)
        } catch (e) {
            console.log(e)
        }
    }

    const getAllKanbanSetting = async () => {
        setLoading(true)
        try {
            const response = await api_ticket.get('/kanban_settings')
            setKanbanSettings(response.data.data)
        } catch (e) {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const saveKanbanSettings = async (colorId, traductionLabel) => {
        const statusFiltrer = status.find(s => s.id === selectedStatus)
        const kanbanExiste = kanbanSetting.find(k => k.status_id === selectedStatus)
        if (!kanbanExiste) {
            try {
                await api_ticket.post('/kanban_settings', {
                    status_id: statusFiltrer.id,
                    couleur_id: colorId,
                    label_traduction: traductionLabel
                })
                setMessage('Paramètres Kanban enregistrés')
            } catch (e) {
                setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
            }
        } else {
            try {
                await api_ticket.put(`/kanban_settings/${statusFiltrer.id}`, {
                    couleur_id: colorId,
                    label_traduction: traductionLabel
                })
                setMessage('Paramètres Kanban mis à jour')
                await getStatus()
            } catch (e) {
                setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
            } finally {
                setLoading(false)
            }
        }
        setLoading(false)
    }

    const save = async () => {
        setLoading(true)
        let existe = couleurListe.find(c => c.hex_code === couleur)
        if (!existe) {
            try {
                const response = await api_ticket.post('/couleurs', {
                    name: couleur,
                    hex_code: couleur
                })
                existe = response.data.data
            } catch (e) {
                console.log(e)
                setMessage('Erreur lors creation')
                return
            }
            setCouleurListe(prev => [...prev, existe])
        }
        await saveKanbanSettings(existe.id, traduction)
    }

    useEffect(() => {
        getStatus()
        getCouleur()
        getAllKanbanSetting()
    }, [])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-infinity loading-xs" style={{transform: 'scale(0.3)'}}></span>
        </div>
    )
    return (
        <div className="page-sm">
            <h1 className="page-title">Paramètres Kanban</h1>
            <div className="card">
                <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select
                        className="field-select"
                        value={selectedStatus ?? ""}
                        onChange={(e) => setSelectedStatus(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">-- Choisir status --</option>
                        {status.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Libellé traduit</label>
                    <input
                        className="field-input"
                        type="text"
                        value={traduction}
                        onChange={(e) => setTraduction(e.target.value)}
                        placeholder="Ex : En cours, À faire..."
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Couleur de colonne</label>
                    <input
                        className="field-input color-picker"
                        type="color"
                        value={couleur}
                        onChange={(e) => setCouleur(e.target.value)}
                    />
                </div>

                <p className="msg">{message}</p>

                <div className="actions-row">
                    <button className="btn" onClick={save} disabled={loading || !selectedStatus}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CustomParams
