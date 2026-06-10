import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api_service from "../../../api/api_service"

function ListeActif() {
    const [actif, setActif] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [compagnie, setCompagnie] = useState([])
    const [selectedCategorie, setSelectedCategorie] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [labelFilter , setLabelFilter] = useState('')
    const [status, setStatus] = useState([])
    const [categorie, setCategorie] = useState([])

    const navigate = useNavigate()

    const getActif = async (categorie, status, compagnie , recherche) => {
    try {
        const params = {}
        if (recherche) params.search = recherche
        if (categorie)  params.category_id = categorie
        if (status)     params.status_id   = status
        if (compagnie)  params.company_id  = compagnie

        const response = await api_service.get('/hardware', { params })
        setActif(response.data.rows)
        setLoading(false)
    } catch (e) {
        console.log(e)
    }
}

    const getStatus = async () => {
        try {
            const response = await api_service.get('/statuslabels')
            setStatus(response.data.rows)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors récuperation')
        }
    }

    const getCategorie = async () => {
        try {
            const response = await api_service.get('/categories')
            setCategorie(response.data.rows)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors récuperation')
        }
    }

    const getCompagnie = async () => {
        try {
            const response = await api_service.get('/companies')
            setCompagnie(response.data.rows)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    useEffect(() => {
        getCategorie()
        getStatus()
        getCompagnie()
        getActif(selectedCategorie, selectedStatus, selectedCompany , labelFilter)
    }, [selectedCategorie, selectedStatus,selectedCompany ,labelFilter])

    let total = 0
    for (const a of actif) {
        const cost = parseFloat(String(a?.purchase_cost).replace(/[^0-9.]/g, '')) || 0
        total += cost
    }

    if (loading) return <p>Chargement ... </p>

    return (
        <div>
            <input type='text'onChange={(e)=> setLabelFilter(e.target.value)}placeholder="filter par nom"/>
            <select value={selectedCategorie ?? ""} onChange={(e) => setSelectedCategorie(e.target.value)}>
                <option value="">-- Filtrer par categorie --</option>
                {categorie.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            <select value={selectedStatus ?? ""} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">-- Filtrer par status --</option>
                {status.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <select value={selectedCompany ?? ""} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="">-- Filtrer par company --</option>
                {compagnie.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            <table>
                <thead>
                    <tr>
                        <th>Asset tag</th>
                        <th>Serial</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Manufactureur </th>
                        <th>Model</th>
                        <th>Status </th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Departement</th>
                        <th>Purchase date</th>
                        <th>Purchase cost</th>
                    </tr>
                </thead>
                <tbody>
                    {actif.map(a => (
                        <tr key={a.id}>
                            <td>{a?.asset_tag}</td>
                            <td>{a?.serial}</td>
                            <td>{a?.name}</td>
                            <td>{a?.category?.name}</td>
                            <td>{a?.manufacturer?.name}</td>
                            <td>{a?.model?.name}</td>
                            <td>{a?.status_label?.name}</td>
                            <td>{a?.assigned_to?.name}</td>
                            <td>{a?.assigned_to?.email}</td>
                            <td>{a?.company?.name}</td>
                            <td>{a?.purchase_date?.formatted}</td>
                            <td>{a?.purchase_cost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Valeur total : {total}</p>
            <button onClick={() => navigate('/liste/tickets')}>Voir liste tickets</button>
        </div>
    )
}

export default ListeActif



