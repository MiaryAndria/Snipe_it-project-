import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api_ticket from '../../../api/api_ticket'

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
    if (loading) return <p>En chargement </p>

    return (
        <div key={tickets?.id}>
            <p>ID : {tickets?.id}</p>
            <p>Numéro ticket : {tickets?.num_ticket}</p>
            <p>Date : {tickets?.date}</p>
            <p>Heure : {tickets?.heure}</p>
            <p>Titre : {tickets?.titre}</p>
            <p>Description : {tickets?.description}</p>
            <p>Statut : {tickets?.status}</p>
            <p>Priorité : {tickets?.priority}</p>
            <h1>Item</h1>
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
            <div>
                {(tickets.items.length == 0) ? (
                <p>Aucun ticket</p>
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