import { useEffect, useState } from "react"
import api_ticket from "../../../api/api_ticket"
function ListeTicket() {
    const [ticketDetail, setTicketDetail] = useState({})
    const [loading, setLoading] = useState(true)
    const { id } = useParams()

    const getDetailTicket = async () => {
        try {
            const response = await api_ticket.get(`/ticketDetail/${id}`)
            setTicketDetail(response.data.data)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    console.log(ticketDetail)

    useEffect(() => {
        getDetailTicket()
    }, [])

    if (loading) return <p>En chargement...</p>

    return (
        <div key={ticketDetail.id}>
            <p>ID : {ticketDetail?.id}</p>
            <p>Numéro ticket : {ticketDetail?.num_ticket}</p>
            <p>Date : {ticketDetail?.date}</p>
            <p>Heure : {ticketDetail?.heure}</p>
            <p>Titre : {ticketDetail?.titre}</p>
            <p>Description : {ticketDetail?.description}</p>
            <p>Statut : {ticketDetail?.status}</p>
            <p>Priorité : {ticketDetail?.priority}</p>
            <h1>Item</h1>
            {/* (ticketDetail?.item?.length === 0 ) ? <p>Pas d'item</p>:(
                {ticketDetail?.item?.map(t=>(
                    <div key={t.id}>
                        <p>{t.asset_tag}</p>
                        <p>{t.name}</p>
                    </div>
                ))}
            ) */}
            <div>
                {(!tickets?.items || tickets.items.length === 0) ? (
                    <p>Aucun item</p>
                ) : (
                    tickets.items.map((i, index) => (
                        <div key={i?.id || index}>
                            <p>{typeof i === 'string' ? i : i?.asset_tag}</p>
                            {typeof i !== 'string' && <p>{i?.name}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
export default DetailTicket



