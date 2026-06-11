import api_ticket from '../../../api/api_ticket';
import api_service from '../../../api/api_service';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../../../styles/global.css'

function InsertTickets() {
    const [priorities, setPriority] = useState([])
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitre] = useState('');
    const [message, setMessage] = useState('')
    const [selectedPriority, setSelectedPriority] = useState('');
    const [idsSelectionnes, setIdsSelectionnes] = useState([]);
    const [component, setComponent] = useState([])
    const [descri, setDescription] = useState('');

    const getPriorities = async () => {
        try {
            const response = await api_ticket.get('/priorities')
            setPriority(response.data.data)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const getItems = async () => {
        try {
            const response = await api_service.get('/hardware')
            setItems(response.data.rows)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const createHistoryEntry = async (ticketId, statusId) => {
        try {
            await api_ticket.post('/ticket_history', {
                id_ticket: ticketId,
                id_statuses: statusId,
                date: new Date().toISOString().split('T')[0],
                description: descri || "Aucune description"
            })

            setMessage('Historique ajouté')

        } catch (e) {
            console.log(e.response?.data)
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    }

    const getItemsDetail = async () => {
        setLoading(true)
        try {
            const result = []
            for (const id of idsSelectionnes) {
                if (!id) return
                const response = await api_service.get(`/hardware/${id}`)
                const itemDetail = response.data
                // const contentOfComponent = {
                //     id: itemDetail.id,
                //     asset_tag: itemDetail.asset_tag,
                //     name: itemDetail.name
                // }
                const contentOfComponent = itemDetail.asset_tag
                result.push(contentOfComponent)
            }
            setComponent(result)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckboxChange = (id) => {
        setIdsSelectionnes(prev => {
            if (prev.includes(id)) return prev.filter(item => item !== id);
            else return [...prev, id];
        });
    };

    const createTicket = async () => {
        const status = 1
        try {
            const response = await api_ticket.post('/tickets', {
                num_ticket: Date.now() % 100000,
                titre: title,
                status_id: status,
                description: descri,
                priority_id: selectedPriority,
                items: component
            })
            console.log(response.data)
            const ticketId = response.data.data.id
            await createHistoryEntry(ticketId, status)

        } catch (e) {
            console.log(e.response?.data)
        }
        finally {
            setLoading(false)
        }
        setTitre('')
        setDescription('')
        setSelectedPriority('')
        setIdsSelectionnes([])
        setComponent([])
    }

    useEffect(() => {
        getPriorities();
        getItems()
    }, [])

    useEffect(() => {
        if (idsSelectionnes.length > 0) getItemsDetail()
        else setComponent([])
    }, [idsSelectionnes])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-infinity loading-xs" style={{ transform: 'scale(0.3)' }}></span>
        </div>
    )

    return (
        <div className="page-sm">
            <h1 className="page-title">Créer un ticket</h1>
            <div className="card">
                <div className="form-group">
                    <label className="form-label">Titre</label>
                    <input className="field-input" type="text" onChange={(e) => setTitre(e.target.value)} placeholder="Titre problème" />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="field-input" type="text" onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                </div>
                <div className="form-group">
                    <label className="form-label">Priorité</label>
                    <select className="field-select" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                        <option value="">-- Choisir --</option>
                        {priorities.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Items à ajouter</label>
                    <ul className="check-list">
                        {items.map(item => (
                            <li key={item.id}>
                                <label>
                                    <input type="checkbox" checked={idsSelectionnes.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                                    {item.name} - {item.asset_tag} - {item.assigned_to?.name} (ID: {item.id})
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="msg">{message}</p>
                <div className="actions-row">
                    <button className="btn" onClick={createTicket}>Créer ticket</button>
                </div>
            </div>
        </div>
    )
}
export default InsertTickets
