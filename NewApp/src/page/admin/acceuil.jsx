import { Link } from 'react-router-dom'
import ResetData from '../util/reset'
import api_service from '../../api/api_service'
import api_node from '../../api/api_node'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Acceuil() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [asset, setAsset] = useState([]);
    const [categorie, setCategorie] = useState({});
    const [ticketStat,setTicketStat] = useState({});
    const [totalAssets, setTotalAssets] = useState(0);
    const [ticket,setTicket] = useState([]);
    const [totalTickets,setTotalTickets]  = useState(0);
    const navigate = useNavigate();

    const getTickets = async()=>{
        try{
            const response = await api_node.get('/tickets')
            setTicket(response.data.data)
            setTotalTickets(response.data.total)
        }catch(e){
            setMessage('Erreur lors recuperation')
        }
    }

    const getAssets = async () => {
        try {
            const response = await api_service.get('/hardware')
            setAsset(response.data.rows)
            setTotalAssets(response.data.total)
            setLoading(false);

        } catch (e) {
            setMessage('Erreur lors recuperation')

        }
    }

    const getNombreByCategorie = async () => {
        if (asset.length > 0) {
            const result = {}
            for (const item of asset) {
                const cat = item?.category?.name || 'Unknown'
                result[cat] = (result[cat] || 0) + 1
            }
            setCategorie(result)
            setLoading(false)
        }
    }
    const getNombreTickets = async()=>{
        if(ticket.length){
        const result = {}
            for(const item of ticket){
                const stat = item?.status || 'New'
                result[stat] = (result[stat] || 0) + 1
            }
            setTicketStat(result)
            setLoading(false)
        }
    }

    useEffect(() => {
        getAssets()
        getTickets()
    }, [])

    useEffect(() => {
        getNombreByCategorie()
    }, [asset])

    useEffect(() => {
        getNombreTickets()
    }, [ticket])

    if(loading)return<p>Chargement...</p>

    return (
        <div>
            <p>Bienvenue dans la page admin de notre application où vous pouvez faire des suivis de vos données.</p>
            <p>Nombre total des assets : {totalAssets}</p>
            <div>
                {Object.entries(categorie).map(([category, count]) => (
                    <p key={category}>
                        {category} : {count}
                    </p>
                ))}
            </div>
            <p>Nombre total des tickets : {totalTickets}</p>
            <div>
                {Object.entries(ticketStat).map(([status, count]) => (
                    <p key={status}>
                        {status} : {count}
            </p>
                ))}
            </div>

            <button onClick={() => navigate('/import')}>Pour faire import</button>
            <ResetData />
            <button onClick={()=>navigate('/list/tickets')}>Voir liste des tickets</button>
        </div>

    )
}

export default Acceuil