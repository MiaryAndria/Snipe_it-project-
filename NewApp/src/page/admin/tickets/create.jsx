import api_node from '../../../api/api_node'
import api_service from '../../../api/api_service';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function InsertTickets() {
    const [priorities, setPriority] = useState([])
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitre] = useState('');
    const [message, setMessage] = useState('')
    const [selectedPriority, setSelectedPriority] = useState('');
    const [idsSelectionnes, setIdsSelectionnes] = useState([]);
    const [component, setComponent] = useState([])
    const [descri, setDescription] = useState('');

    const getPriorities = async () => {
        try {
            const response = await api_node.get('/priorities')
            setPriority(response.data.data)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const getItems = async () => {
        try {
            const response = await api_service.get('/hardware')
            setItems(response.data.rows)
            setLoading(false)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        }
    }

    const getItemsDetail = async () => {
        setLoading(true)
        try {
            const result =[]
            for (const id of idsSelectionnes) {
                if (!id) return
                const response = await api_service.get(`/hardware/${id}`)
                const itemDetail = response.data
                const contentOfComponent = {
                    id: itemDetail.id,
                    asset_tag: itemDetail.asset_tag,
                    name: itemDetail.name
                }
                // const contentOfComponent = itemDetail.asset_tag
                result.push(contentOfComponent)
            }
            setComponent(result)
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        } finally {
            setLoading(false)
        }
    }
    
    
    const handleCheckboxChange = (id) => {
        setIdsSelectionnes(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const createTicket = async () => {
        setLoading(true)
        try {
            await api_node.post('/tickets', {
                num_ticket: Date.now() % 100000,
                titre: title,
                description: descri,
                priority_id: selectedPriority,
                items: component
            })
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors création ticket')
        }
        finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        getPriorities()
        getItems()
    }, [])

    useEffect(()=>{
        if(idsSelectionnes.length>0){
            getItemsDetail()
        }else{
            setComponent([])
        }        
    },[idsSelectionnes])

    if (loading) return <p>En cours de recuperation data</p>
    return (
        <div>
            <input type="text" onChange={(e) => setTitre(e.target.value)} placeholder='Titre problème' />
            <input type="text" onChange={(e) => setDescription(e.target.value)} placeholder='Description' />
            <p>Priorité </p>
            <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}>
                <option value="">-- Choisir --</option>
                {priorities.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.name}
                    </option>
                ))}
            </select>
            <h3>Sélectionnez les items à ajouter :</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {items.map(item => (
                    <li key={item.id} style={{ margin: '10px 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={idsSelectionnes.includes(item.id)}
                                onChange={() => handleCheckboxChange(item.id)}
                            />
                            {item.name} - {item.asset_tag}(ID: {item.id})
                        </label>
                    </li>
                ))}
            </ul>
            <button onClick={createTicket}>Creer ticket</button>
        </div>

    )
}
export default InsertTickets
