import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api_ticket from '../../../api/api_ticket'
import '../../../styles/global.css'

function ListeTickets() {
    const [tickets, setTickets] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const getTickets = async () => {
        try {
            const response = await api_ticket.get('/tickets')
            setTickets(response.data.data)
            setTotal(response.data.total)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    useEffect(() => {
        getTickets()
    }, [])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-infinity loading-xs" style={{ transform: 'scale(0.3)' }}></span>
        </div>
    )

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Tickets</h1>
                <button className="btn" onClick={() => navigate('/create/tickets')}>+ Créer ticket</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="table table-xs">
                    <thead className="bg-white">
                        <tr className="text-black">
                            <th>Numéro</th>
                            <th>Titre</th>
                            <th>Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(t => (
                            <tr key={t.id}>
                                <td>{t.num_ticket}</td>
                                <td>{t.titre}</td>
                                <td>{t.description}</td>
                                <td><button className="btn btn-ghost" onClick={() => navigate(`/ticket/fiche/${t.id}`)}>Voir fiche</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="msg">{message}</p>
        </div>
    )
}
export default ListeTickets
