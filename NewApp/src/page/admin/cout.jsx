import { useState, useEffect } from 'react'
import api_ticket from '../../api/api_ticket'
import '../../styles/cout.css'
import api_service from '../../api/api_service'

function Cout() {
    const [ticketCout, setTicketCout] = useState([])
    const [categorie, setCategorie] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    const getTicketCouts = async () => {
        try {
            const response = await api_ticket.get(`/ticket_cout`)
            setTicketCout(response.data.data)
        } catch (e) {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    }

    const getCategorie = async () => {
        try {
            const response = await api_service.get('/categories')
            setCategorie(response.data.rows)
        } catch (e) {
            setMessage('Erreur lors récupération')
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await Promise.all([getCategorie(), getTicketCouts()])
            setLoading(false)
        }
        init()
    }, [])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-infinity loading-xs" style={{ transform: 'scale(0.3)' }}></span>
        </div>
    )

    return (
        <div className="cout-page">
            {message && <p className="cout-error">{message}</p>}
            <table className="cout-table">
                <thead>
                    <tr>
                        <th>Catégorie</th>
                        <th>Coût total</th>
                    </tr>
                </thead>
                <tbody>
                    {categorie.map(c => {
                        const couts = ticketCout.filter(tc => tc.categorie === c.name)
                        let totalCout = 0
                        for (const tc of couts) {
                            totalCout += Number(tc.cout)
                        }

                        return (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>{totalCout}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default Cout