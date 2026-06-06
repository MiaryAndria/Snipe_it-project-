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
    const [selectedItems, setSelectedItems] = useState('');
    const [component, setComponent] = useState({ id: null, asset_tag: '', name: '' })
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

    const getItemsDetail = async (selectedItems) => {
        if (!selectedItems) return
        setLoading(true) 
        try {
            const response = await api_service.get(`/hardware/${selectedItems}`)
            const itemDetail = response.data
            setComponent({
                id       : itemDetail.id,
                asset_tag: itemDetail.asset_tag,
                name     : itemDetail.name
            })
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors recuperation')
        } finally {
            setLoading(false)  
        }
    }

    const createTicket = async () => {
        try {
            const response = await api_node.post('/tickets', {
                num_ticket: Date.now() % 100000,
                titre: title,
                description: descri,
                priority: selectedPriority,
                items: [component]
            })
        } catch (e) {
            console.log(e)
            setMessage('Erreur lors création ticket')
        }
    }

    useEffect(() => {
        getPriorities()
        getItems()
    }, [])
    
    useEffect(() => {
        getItemsDetail(selectedItems)
    }, [selectedItems])
    if (loading) return <p>En cours de recuperation</p>
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
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>
            <select
                value={selectedItems}
                onChange={(e)=>setSelectedItems(e.target.value)}>
                <option value="">-- Choisir --</option>
                {items.map(item=> (
                    <option key={item.id} value={item.id}>
                        {item.asset_tag}
                    </option>
                ))}
            </select>
            <p>Items</p>

            <button onClick={createTicket}>Creer ticket</button>
        </div>

    )
}
export default InsertTickets
