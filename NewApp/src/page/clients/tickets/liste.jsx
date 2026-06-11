import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useNavigate } from "react-router-dom"
import api_ticket from "../../../api/api_ticket"
import api_service from "../../../api/api_service"
import './kanbanstyle.css'
import './modal.css'
import '../../../styles/global.css'
function ListeTicket() {
    const [ticket, setTicket] = useState([])
    const [priorities, setPriority] = useState([])
    const [items, setItems] = useState([]);
    const [title, setTitre] = useState('');
    const [couleur, setCouleur] = useState([]);
    const [selectedPriority, setSelectedPriority] = useState('');
    const [idsSelectionnes, setIdsSelectionnes] = useState([]);
    const [component, setComponent] = useState([])
    const [descri, setDescription] = useState('');
    const [loading, setLoading] = useState(true)
    const [statuses, setStatuses] = useState([])
    const [message, setMessage] = useState([])
    const [kanbanSetting, setKanbanSettings] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const onDrag = async (result) => {
        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId == source.droppableId && destination.index == source.index) return
        const newStatusId = parseInt(destination.droppableId)
        const statusDestination = statuses.find(s => s.id === newStatusId)
const date = window.prompt(`Entrez la date du déplacement (ex: 2026-06-11)`)
if (!date) return

        const description = window.prompt(`Entrez une description pour ce déplacement vers "${statusDestination?.label || statusDestination?.id}"`)
        if (description === null) return

        setTicket(prev =>
            prev.map(t =>
                String(t.id) === draggableId
                    ? { ...t, status_id: newStatusId }
                    : t
            )
        )
        try {
            await api_ticket.put(`/tickets/${draggableId}`, {
                status_id: newStatusId
            })
            await createHistoryEntry(draggableId, newStatusId, date, description)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const createHistoryEntry = async (ticketId, statusId, date, description) => {
        setLoading(true)
        try {
            await api_ticket.post('/ticket_history', {
                id_ticket: ticketId,
                id_statuses: statusId,
                date: date ? date.toString() : new Date().toISOString().split('T')[0],
                description: description || "Aucune description"
            })
            setMessage('Historique ajouté')
        } catch (e) {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const getCouleur = async () => {
        try {
            const response = await api_ticket.get('/couleurs')
            setCouleur(response.data.data)
        } catch (e) {
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
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const ajouterTicket = async (e) => {
        e.preventDefault();
        const status = 1
        if (!title.trim()) { setMessage('Titre manquant'); return }
        if (!descri.trim()) { setMessage('Description manquante'); return }
        if (!selectedPriority) { setMessage('Sélectionnez une priorité'); return }
        if (component.length === 0) { setMessage('Sélectionnez au moins un item'); return }

        setLoading(true)
        try {
            const response = await api_ticket.post('/tickets', {
                num_ticket: Date.now() % 100000,
                titre: title,
                status_id: status,
                description: descri,
                priority_id: selectedPriority,
                items: component
            })
            const id = response.data.data.id
            await createHistoryEntry(id, status)
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
        getAllKanbanSetting()
        getItems()
        getTicket()
        getCouleur()
        getStatuses()
    }, [])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-infinity loading-xs" style={{ transform: 'scale(0.3)' }}></span>
        </div>
    )
    return (
        <div className="kanban-page">
            <h1 className="kanban-page-title">Liste des tickets</h1>
            <DragDropContext onDragEnd={onDrag}>
                <div className="kanban">
                    {statuses.map(s => {
                        const StatusParKanban = kanbanSetting.find(k => k.status_id === s.id)
                        const Couleur = couleur.find(c => c.id === StatusParKanban?.couleur_id)
                        const ticketFiltrer = ticket.filter(t => t.status_id === s.id)

                        return (
                            <Droppable key={s.id} droppableId={String(s.id)}>
                                {(provided) => (
                                    <div ref={provided.innerRef}{...provided.droppableProps} className="kanban-column"
                                        style={{ backgroundColor: Couleur?.hex_code }}>
                                        <h3>{StatusParKanban?.label_traduction || s.name}</h3>
                                        <h3>{ticketFiltrer.length}</h3>

                                        {/* Cartes draggables */}
                                        {ticketFiltrer.map((t, index) => (
                                            <Draggable key={String(t.id)} draggableId={String(t.id)} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}{...provided.draggableProps}{...provided.dragHandleProps} className="kanban-card"
                                                        style={{ ...provided.draggableProps.style }}
                                                    >
                                                        <strong>#{t.num_ticket}</strong>
                                                        <button onClick={() => navigate(`/detail/ticket/${t.id}`)}>
                                                            <p>{t.titre}</p>
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>

                                        ))}

                                        {provided.placeholder}

                                        {s.name === 'New' && (
                                            <button onClick={handleCreateTicket}>+ Ajouter ticket</button>
                                        )}

                                    </div>
                                )}
                            </Droppable>
                        )
                    })}
                </div>
            </DragDropContext>

            {isModalOpen && (
                <div className="modal-overlay">
                    <form className="custom-modal" onSubmit={ajouterTicket}>
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
                                            {item.name} - {item.asset_tag} - {item.assigned_to?.name} (ID: {item.id})
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
    )
}
export default ListeTicket
