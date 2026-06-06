import { useEffect, useState } from "react"
import api_service from "../../api/api_service"

function ListeCategorie() {
    const [categorie, setCategorie] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [message, setMessage] = useState('')
    const LIMIT = 5;

    const getCategories = async (page) => {
        setLoading(true)
        const Offset = (page - 1) * LIMIT
        try {
            const response = await api_service.get('/categories', {
                params: {
                    limit: LIMIT,
                    offset: Offset,
                    order: 'desc'
                }
            })
            setTotal(response.data.total)
            setCategorie(response.data.rows)
            setLoading(false)

        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    useEffect(() => {
        getCategories(page)
    }, [page])

    const totalPage = Math.ceil(total / LIMIT)
    if (loading) return <p>En chargement...</p>

    return (
        <div>
            <div>
                <p>{total} Total Categories - {page}/{totalPage} </p>
            </div>

            <div>
                {categorie.map(c=>(
                    <div key={c.id}>
                        <p>{c.name}</p>
                        <p>{c.category_type}</p>
                        <p>{c.item_count}</p>
                        <p>{c.assets_count}</p>

                    </div>
                ))}
            </div>

            <div>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Precedent</button>
                <p>Page {page}</p>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPage}>Next</button>
            </div>
        </div>
    )
}

export default ListeCategorie