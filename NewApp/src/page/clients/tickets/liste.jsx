import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api_ticket from "../../../api/api_ticket"
import api_service from "../../../api/api_service"
import './kanbanstyle.css'
import './modal.css'
function ListeTicket() {
    const [ticket, setTicket] = useState([])
    const [priorities, setPriority] = useState([])
    const [items, setItems] = useState([]);
    const [title, setTitre] = useState('');
    const [couleur,setCouleur] = useState([]);
    const [selectedPriority, setSelectedPriority] = useState('');
    const [idsSelectionnes, setIdsSelectionnes] = useState([]);
    const [component, setComponent] = useState([])
    const [descri, setDescription] = useState('');
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [statuses, setStatuses] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()  

    const getCouleur = async()=>{
        try{
            const response = await api_ticket.get('/couleurs')
            setCouleur(response.data.data)
        }catch(e){
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const getStatuses = async () => {
        try {
            const response = await api_ticket.get('/statuses')
            setStatuses(response.data.data)
        } catch (e) {
            setMessage(e)
        } finally {
            setLoading(false)
        }
    }

    const getTicket = async () => {
        try {
            const response = await api_ticket.get('/tickets')
            setTicket(response.data.data)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }

    }

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

    const getItemsDetail = async () => {
        setLoading(true)
        try {
            const result = []
            for (const id of idsSelectionnes) {
                if (!id) return
                const response = await api_service.get(`/hardware/${id}`)
                const itemDetail = response.data
                const contentOfComponent = {
                    id: itemDetail.id,
                    asset_tag: itemDetail.asset_tag,
                    name: itemDetail.name
                }
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
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const ajouterTicket = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setMessage('Titre manquant')
            return
        }

        if (!descri.trim()) {
            setMessage('Description manquante')
            return
        }

        if (!selectedPriority) {
            setMessage('Sélectionnez une priorité')
            return
        }

        if (component.length === 0) {
            setMessage('Sélectionnez au moins un item')
            return
        }
        setLoading(true)
        try {
            await api_ticket.post('/tickets', {
                num_ticket: Date.now() % 100000,
                titre: title,
                description: descri,
                priority_id: selectedPriority,
                items: component
            })
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors création ticket')
        }
        finally {
            setLoading(false)
        }

        setIsModalOpen(false);
        setTitre('')
        setDescription('')
        setSelectedPriority('')
        setIdsSelectionnes([])
        setComponent([])
        await getTicket()
    }

    const handleCreateTicket = async () => {
        setIsModalOpen(true)
    }

    const annulerValidation = () => {
        setIsModalOpen(false);
        setTitre('')
        setDescription('')
        setSelectedPriority('')
        setIdsSelectionnes([])
        setComponent([])
    };

    useEffect(() => {
        if (idsSelectionnes.length > 0) {
            getItemsDetail()
        } else {
            setComponent([])
        }
    }, [idsSelectionnes])

    useEffect(() => {
        getPriorities()
        getItems()
        getTicket()
        getCouleur()
        getStatuses()
    }, [])

    if (loading) return <p>En chargement...</p>
    return (
        <div>
            <center><h1>Bienvenue sur page liste ticket</h1></center>
            <div className="kanban">

                {statuses.map(s => {
                    if (s.id === 1) {
                        const ticketFiltrer = ticket.filter(t => t.status_id === s.id)
                        const couleurTrouver = couleur.find(c=> c.id === s.couleur_id)
                        return (
                            <div key={s.id} className="kanban-column" style={{ backgroundColor: couleurTrouver.hex_code }}>
                                <h3>{s.name}</h3>
                                <h3>{ticketFiltrer.length}</h3>

                                {ticketFiltrer.map(t => (
                                    <div key={t.id} className="kanban-card">
                                        <strong>#{t.num_ticket}</strong>
                                        <button onClick={() => navigate(`/detail/ticket/${t.id}`)}><p>{t.titre}</p></button>
                                    </div>
                                ))}
                                <button onClick={handleCreateTicket}> + Ajouter ticket </button>
                            </div>
                        )
                    }
                    else {
                        const couleurTrouver = couleur.find(c=> c.id === s.couleur_id)
                        const ticketFiltrer = ticket.filter(t => t.status_id === s.id)
                        return (
                            <div key={s.id} className="kanban-column"style={{ backgroundColor: couleurTrouver.hex_code }}>
                                <h3>{s.name}</h3>
                                <h3>{ticketFiltrer.length}</h3>

                                {ticketFiltrer.map(t => (
                                    <div key={t.id} className="kanban-card">
                                        <strong>#{t.num_ticket}</strong>
                                        <button onClick={() => navigate(`/detail/ticket/${t.id}`)}><p>{t.titre}</p></button>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                })}

                {isModalOpen && (
                    <div className="modal-overlay">
                        <form className="modal" onSubmit={ajouterTicket}>
                            <h2>Créer un ticket</h2>
                            <div>
                                <div className="modal-field">
                                    <label>Titre</label>
                                    <input type="text" onChange={(e) => setTitre(e.target.value)} placeholder='Titre problème' />
                                </div>
                                <div className="modal-field">
                                    <label>Description</label>
                                    <input type="text" onChange={(e) => setDescription(e.target.value)} placeholder='Description' />
                                </div>

                                <div className="modal-field">
                                    <label>Priorité</label>
                                    <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                                        <option value="">-- Choisir --</option>
                                        {priorities.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <h3>Items à ajouter</h3>
                                <ul>
                                    {items.map(item => (
                                        <li key={item.id}>
                                            <label>
                                                <input type="checkbox" checked={idsSelectionnes.includes(item.id)}
                                                    onChange={() => handleCheckboxChange(item.id)} />
                                                {item.name} - {item.asset_tag} (ID: {item.id})
                                            </label>
                                        </li>
                                    ))}
                                </ul>

                                <div className="modal-actions">
                                    <button type="button" className="btn-annuler" onClick={annulerValidation}>Annuler</button>
                                    <button type="submit" className="btn-submit">Créer ticket</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>

    )
}
export default ListeTicket



