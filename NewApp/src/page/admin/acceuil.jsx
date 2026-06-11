import ResetData from '../util/reset'
import api_service from '../../api/api_service'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api_ticket from '../../api/api_ticket'
import '../../styles/global.css'
import '../../styles/acceuil.css'

function Acceuil() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [asset, setAsset] = useState([]);
    const [categorie, setCategorie] = useState({});
    const [ticketStat, setTicketStat] = useState({});
    const [totalAssets, setTotalAssets] = useState(0);
    const [ticket, setTicket] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const navigate = useNavigate();

    const getTickets = async () => {
        try {
            const response = await api_ticket.get('/tickets')
            setTicket(response.data.data)
            setTotalTickets(response.data.total)
        } catch (e) { setMessage('Erreur lors recuperation') }
    }

    const getAssets = async () => {
        try {
            const response = await api_service.get('/hardware')
            setAsset(response.data.rows)
            setTotalAssets(response.data.total)
        } catch (e) { setMessage('Erreur lors recuperation') }
    }

    const getNombreByCategorie = async () => {
        if (asset.length > 0) {
            const result = {}
            for (const item of asset) {
                const cat = item?.category?.name || 'Unknown'
                result[cat] = (result[cat] || 0) + 1
            }
            setCategorie(result)
        }
    }

    const getNombreTickets = async () => {
        if (ticket.length) {
            const result = {}
            for (const item of ticket) {
                const stat = item?.status || 'New'
                result[stat] = (result[stat] || 0) + 1
            }
            setTicketStat(result)
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await getAssets()
            await getTickets()
            setLoading(false)
        }
        init()
    }, [])

    useEffect(() => {
        getNombreByCategorie()
    }, [asset])

    useEffect(() => {
        getNombreTickets()
    }, [ticket])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-infinity loading-xs" style={{ transform: 'scale(0.3)' }}></span>
        </div>
    )

    return (
        <div className="acceuil-page">
            <div className="acceuil-header">
                <h1>Tableau de bord</h1>
                <p>Suivi global des assets et des tickets de support.</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <p className="kpi-label">Total Assets</p>
                    <p className="kpi-value">{totalAssets}</p>
                </div>
                <div className="kpi-card">
                    <p className="kpi-label">Total Tickets</p>
                    <p className="kpi-value">{totalTickets}</p>
                </div>
            </div>

            <div className="section-block">
                <p className="section-block-title">Assets par catégorie</p>
                {Object.entries(categorie).map(([category, count]) => (
                    <div className="stat-row" key={category}>
                        <span>{category}</span>
                        <span className="stat-count">{count}</span>
                    </div>
                ))}
            </div>

            <div className="section-block">
                <p className="section-block-title">Tickets par statut</p>
                {Object.entries(ticketStat).map(([status, count]) => (
                    <div className="stat-row" key={status}>
                        <span>{status}</span>
                        <span className="stat-count">{count}</span>
                    </div>
                ))}
            </div>

            <div className="acceuil-actions">
                <ResetData />
            </div>
            <p className="msg">{message}</p>
        </div>
    )
}

export default Acceuil