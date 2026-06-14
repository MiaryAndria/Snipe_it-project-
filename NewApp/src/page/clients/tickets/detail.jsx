import { useEffect, useState } from "react"
import api_ticket from "../../../api/api_ticket"
import { useParams } from "react-router-dom"
import '../../../styles/global.css'

function DetailTicket() {
    const [ticketDetail, setTicketDetail] = useState({})
    const [loading, setLoading] = useState(true)
    const { id } = useParams()

    const getDetailTicket = async () => {
        try {
            const response = await api_ticket.get(`/tickets/${id}`)
            setTicketDetail(response.data.data)
            setLoading(false)
        } catch (e) { console.log(e) }
    }

    console.log(ticketDetail)

    useEffect(() => { 
        setLoading(true)
        getDetailTicket() 
        setLoading(false)
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
                    <span className="detail-value">{ticketDetail?.id}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Numéro ticket</span>
                    <span className="detail-value">{ticketDetail?.num_ticket}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{ticketDetail?.date}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Heure</span>
                    <span className="detail-value">{ticketDetail?.heure}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Titre</span>
                    <span className="detail-value">{ticketDetail?.titre}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Description</span>
                    <span className="detail-value">{ticketDetail?.description}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Statut</span>
                    <span className="detail-value">{ticketDetail?.status}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Priorité</span>
                    <span className="detail-value">{ticketDetail?.priority}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Items</span>
                    <span className="detail-value">
                        {/* (ticketDetail?.item?.length === 0 ) ? <p>Pas d'item</p>:(
                            {ticketDetail?.item?.map(t=>(
                                <div key={t.id}>
                                    <p>{t.asset_tag}</p>
                                    <p>{t.name}</p>
                                </div>
                            ))}
                        ) */}
                        {(!ticketDetail?.items || ticketDetail.items.length === 0) ? (
                            <span>Aucun item</span>
                        ) : (
                            ticketDetail.items.map((i, index) => (
                                <span className="tag" key={i?.id || index}>
                                    {typeof i === 'string' ? i : i?.asset_tag}
                                </span>
                            ))
                        )}
                    </span>
                </div>
            </div>
        </div>
    )
}
export default DetailTicket
