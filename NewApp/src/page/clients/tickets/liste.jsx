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
    const [items, setItems] = useState([]);
    const [couleur, setCouleur] = useState([]);
    const [loading, setLoading] = useState(true)
    const [statuses, setStatuses] = useState([])
    const [message, setMessage] = useState([])
    const [pendingDrag, setPendingDrag] = useState({})
    const [category, setCategory] = useState([])
    const [isModalProcess, setIsModalProcess] = useState(false)
    const [isModalReouverture, setIsModalReouverture] = useState(false)
    const [isModalAnnulation, setIsModalAnnulation] = useState(false)
    const [kanbanSetting, setKanbanSettings] = useState([])
    const [prixReouverture, setPrixReouverture] = useState('')
    const [ticketCout, setTicketCout] = useState([])
    const [dateModal, setDateModal] = useState('')
    const [descriptionModal, setDescriptionModal] = useState('')
    const navigate = useNavigate()

    const getTicketCout = async () => {
        try {
            const response = await api_ticket.get(`/ticket_cout`)
            setTicketCout(response.data.data)
        } catch (e) {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    }

    const onDrag = async (result) => {
        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId == source.droppableId && destination.index == source.index) return
        const newStatusId = parseInt(destination.droppableId)
        const statusDestination = statuses.find(s => s.id === newStatusId)

        if (parseInt(destination.droppableId) === 3) {
            const description = window.prompt(`Entrer description`)
            if (!description) return

            const date = window.prompt(`Entrez la date du déplacement (ex: 2026-06-11)`)
            if (!date) return
            const cout = window.prompt('Inserer cout pour avoir terminer')
            if (cout === null) return

            let categoriesArray = []
            const draggedTicket = ticket.find(t => String(t.id) === draggableId);
            if (draggedTicket && draggedTicket.items && draggedTicket.items.length > 0) {
                draggedTicket.items.forEach(tag => {
                    const assetTag = typeof tag === 'string' ? tag : tag.asset_tag;
                    const hardwareItem = items.find(i => i.asset_tag === assetTag);
                    const catName = hardwareItem?.category?.name || 'Non catégorisé'
                    if (hardwareItem && hardwareItem.category) {
                        if (!categoriesArray.includes(catName)) {
                            categoriesArray.push(catName)
                        }
                    } else {
                        categoriesArray.push(catName);
                    }
                });
            } else {
                categoriesArray = ["Aucune catégorie"];
            }
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
                await addTicketCout(draggableId, cout, categoriesArray)
            } catch (e) {
                console.log(e)
                setMessage('Erreur lors recuperation')
            }

        } else if (parseInt(destination.droppableId) === 2) {
            let categoriesArray = [];
            const draggedTicket = ticket.find(t => String(t.id) === draggableId);
            if (draggedTicket && draggedTicket.items && draggedTicket.items.length > 0) {
                draggedTicket.items.forEach(tag => {
                    const assetTag = typeof tag === 'string' ? tag : tag.asset_tag;
                    const hardwareItem = items.find(i => i.asset_tag === assetTag);
                    const catName = hardwareItem?.category?.name || 'Non catégorisé'
                    if (hardwareItem && hardwareItem.category) {
                        if (!categoriesArray.includes(catName)) {
                            categoriesArray.push(catName)
                        }
                    } else {
                        categoriesArray.push(catName);
                    }
                });
            } else {
                categoriesArray = ["Aucune catégorie"];
            }

            const ticketId = parseInt(draggableId)
            const newStatusId = parseInt(destination.droppableId)
            setPendingDrag({ ticketId, newStatusId })
            setCategory(categoriesArray)
            setIsModalProcess(true)

        } else {
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
    }

    const confirmerReouverture = async () => {
        try {
            setTicket(prev =>
                prev.map(t =>
                    t.id === pendingDrag.ticketId
                        ? { ...t, status_id: pendingDrag.newStatusId }
                        : t
                )
            )
            await api_ticket.put(`/tickets/${pendingDrag.ticketId}`, {
                status_id: pendingDrag.newStatusId
            })

            const cout = Number(prixReouverture)
            await createHistoryEntry(pendingDrag.ticketId, pendingDrag.newStatusId, dateModal, descriptionModal)
            await addTicketCout(pendingDrag.ticketId, cout, category)
        } catch (e) {
            console.log(e)
        }
        setIsModalReouverture(false)
    }

    const confirmerAnnulation = async () => {
        try {
            setTicket(prev =>
                prev.map(t =>
                    t.id === pendingDrag.ticketId
                        ? { ...t, status_id: pendingDrag.newStatusId }
                        : t
                )
            )
            await api_ticket.put(`/tickets/${pendingDrag.ticketId}`, {
                status_id: pendingDrag.newStatusId
            })

            await createHistoryEntry(pendingDrag.ticketId, pendingDrag.newStatusId, dateModal, descriptionModal)
            await deleteTicketCout(category, pendingDrag.ticketId)
        } catch (e) {
            console.log(e)
        }
        setIsModalAnnulation(false)
    }

    const handleModalReouverture = async () => {
        setIsModalReouverture(true)
        setIsModalProcess(false)
    }

    const handleModalAnnulation = async () => {
        setIsModalAnnulation(true)
        setIsModalProcess(false)
    }

    const annuler = async () => {
        setIsModalProcess(false)
        setIsModalAnnulation(false)
        setIsModalReouverture(false)
        setPendingDrag(null)
    }

    const addTicketCout = async (ticketId, montant, categorie) => {
        setLoading(true)
        const montantDivise = montant / categorie.length
        for (const cat of categorie) {
            try {
                await api_ticket.post('/ticket_cout', {
                    id_ticket: ticketId,
                    cout: montantDivise,
                    categorie: cat
                })
                setMessage('Coût ajouté avec succès')
            } catch (e) {
                setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
            } finally {
                setLoading(false)
            }
            await getTicketCout()
        }
    }

    const deleteTicketCout = async (categoryArray, ticketId) => {
        try {
            for (const c of categoryArray) {
                const category = ticketCout.filter(tc => tc.categorie === c && tc.id_ticket === ticketId)
                const dernierLigneCategorie = category[0]
                await api_ticket.delete(`/ticket_cout/${dernierLigneCategorie.id}`)
            }
        } catch (e) {
            setMessage('Erreur lors supression')
            console.log(e)
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
        }
    }

    const getTicket = async () => {
        try {
            const response = await api_ticket.get('/tickets')
            setTicket(response.data.data)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const getItems = async () => {
        try {
            const response = await api_service.get('/hardware')
            setItems(response.data.rows)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const getAllKanbanSetting = async () => {
        try {
            const response = await api_ticket.get('/kanban_settings')
            setKanbanSettings(response.data.data)
        } catch (e) {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        } finally {
        }
    }

    useEffect(() => {
        const init = async () => {
            try {
                await Promise.all([
                    getAllKanbanSetting(),
                    getItems(),
                    getTicket(),
                    getCouleur(),
                    getStatuses(),
                    getTicketCout()
                ])
            } catch (e) {
                setMessage('Erreur chargement')
            } finally {
                setLoading(false)
            }
        }
        init()
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
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-column"
                                        style={{ backgroundColor: Couleur?.hex_code }}>
                                        <h3>{StatusParKanban?.label_traduction || s.name}</h3>
                                        <h3>{ticketFiltrer.length}</h3>

                                        {ticketFiltrer.map((t, index) => (
                                            <Draggable key={String(t.id)} draggableId={String(t.id)} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                        className="kanban-card"
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
                                        {s.id === 1 && <button onClick={() => navigate("/create/tickets")}>Creer ticket</button>}
                                    </div>
                                )}
                            </Droppable>
                        )
                    })}
                </div>
            </DragDropContext>

            {isModalProcess && (
                <div>
                    <p>Choisissez action que vous voulez faire</p>
                    <button onClick={handleModalReouverture}>Reouverture</button>
                    <button onClick={handleModalAnnulation}>Annulation</button>
                    <button onClick={annuler}>Annuler</button>
                </div>
            )}

            {isModalReouverture && (
                <div>
                    <input type='text' onChange={(e) => setPrixReouverture(e.target.value)} placeholder="Inserer montant" />
                    <input type="date" onChange={(e) => setDateModal(e.target.value)} />
                    <input type="text" onChange={(e) => setDescriptionModal(e.target.value)} placeholder="Description" />
                    <button onClick={confirmerReouverture}>Confirmer</button>
                </div>
            )}

            {isModalAnnulation && (
                <div>
                    <input type="date" onChange={(e) => setDateModal(e.target.value)} />
                    <input type="text" onChange={(e) => setDescriptionModal(e.target.value)} placeholder="Description" />
                    <button onClick={confirmerAnnulation}>Confirmer</button>
                </div>
            )}
        </div>
    )
}

export default ListeTicket