import api_node from '../../../api/api_node'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function ListeTickets() {
    const [tickets, setTickets] = useState([])
    const [total, setTotal] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const getTickets = async () => {
        try {
            const response = await api_node.get('/tickets')
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
    if (loading) return <p>En chargement </p>

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>numero </th>
                        <th>titre </th>
                        <th>description </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(t => (
                        <tr key={t.id}>
                            <td>{t.num_ticket}</td>
                            <td>{t.titre}</td>
                            <td>{t.description}</td>
                            <td><button onClick={()=>navigate(`/ticket/fiche/${t.id}`)}>Voir fiche</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={()=>navigate(`/create/tickets`)}>Creer tickets</button>
        </div>
    )
}
export default ListeTickets