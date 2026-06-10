import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api_ticket from '../../../api/api_ticket'
import '../../../styles/global.css'

function DetailTicket() {
    const [tickets, setTickets] = useState({})
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const { id } = useParams()

    const getTickets = async () => {
        try {
            const response = await api_ticket.get(`/tickets/${id}`)
            setTickets(response.data.data)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    console.log(tickets)

    useEffect(() => {
        getTickets()
    }, [])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-infinity loading-xs" style={{transform: 'scale(0.3)'}}></span>
        </div>
    )

    return (
        <div className="page-sm">
            <div className="card">
                <div className="detail-row">
                    <span className="detail-label">ID</span>
                    <span className="detail-value">{tickets?.id}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Numéro ticket</span>
                    <span className="detail-value">{tickets?.num_ticket}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{tickets?.date}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Heure</span>
                    <span className="detail-value">{tickets?.heure}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Titre</span>
                    <span className="detail-value">{tickets?.titre}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Description</span>
                    <span className="detail-value">{tickets?.description}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Statut</span>
                    <span className="detail-value">{tickets?.status}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Priorité</span>
                    <span className="detail-value">{tickets?.priority}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Items</span>
                    <span className="detail-value">
                        {/* <div>
                            {(tickets.items.length == 0) ? (
                            <p>Aucun ticket</p>
                            ) : (
                            tickets?.items.map(i => (
                                <div key={i?.id}>
                                    <p>{i?.asset_tag}</p>
                                </div>
                            ))
                            )}
                        </div> */}
                        {(!tickets?.items || tickets.items.length === 0) ? (
                            <span>Aucun item</span>
                        ) : (
                            tickets.items.map((i, index) => (
                                <span className="tag" key={i?.id || index}>
                                    {typeof i === 'string' ? i : i?.asset_tag}
                                </span>
                            ))
                        )}
                    </span>
                </div>
            </div>
            <p className="msg">{message}</p>
        </div>
    )
}
export default DetailTicket