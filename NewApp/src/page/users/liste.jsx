import { useEffect, useState } from "react"
import api_service from "../../api/api_service"

function ListeUsers() {
    const [users, setUsers]   = useState([])
    const [total, setTotal]   = useState(0)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    
    const [page, setPage]  = useState(1)
    const LIMIT = 50          

    const getUsers = async (pageActuelle) => {
        try {
            setLoading(true)
            const offset = (pageActuelle - 1) * LIMIT  

            const response = await api_service.get('/users', {
                params: {
                    limit: LIMIT,
                    offset: offset,
                    sort: 'created_at',
                    order: 'desc'
                }
            })
            setUsers(response.data.rows)   
            setTotal(response.data.total)  
            setLoading(false)
            
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors de la récupération')
            setLoading(false)
        }
    }

    useEffect(() => {
        getUsers(page)
    }, [page])

    const totalPages = Math.ceil(total / LIMIT)

    if (loading) return <p>En chargement...</p>
    if (message)  return <p>{message}</p>

    return (
        <div>

            <p>{total} utilisateurs au total — Page {page} / {totalPages}</p>

            {users.map(user => (
                <div key={user.id}>
                    <p>{user.name}</p>
                    <p>{user.city}</p>
                    <p>{user.manager?.name}</p>
                    <p>{user.phone}</p>
                    <p>{user.groups?.map(g => g.name).join(', ')}</p>
                </div>
            ))}


            <div>

                <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                >
                    Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                        key={num}
                        onClick={() => setPage(num)}
                        style={{ fontWeight: page === num ? 'bold' : 'normal' }}
                    >
                        {num}
                    </button>
                ))}

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                >
                    Suivant
                </button>
            </div>

        </div>
    )
}

export default ListeUsers