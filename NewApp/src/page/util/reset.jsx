import { useState } from 'react'
import api_node from '../../api/api_node'

function ResetData() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [step, setStep] = useState('')

    const handleResetMysql = async () => {
        setStep('Reset MySQL en cours...')
        try {
            const res = await api_node.delete('/reset/data/mysql')
            setStep(` MySQL : ${res.data?.message || 'OK'}`)
        } catch (e) {
            console.log(e)
            setStep(' Erreur MySQL')
            throw e
        }
    }

    const handleResetSqlite = async () => {
        setStep('Reset SQLite en cours...')
        try {
            const res = await api_node.delete('/reset/data/sqlite')
            setStep(` SQLite : ${res.data?.message || 'OK'}`)
        } catch (e) {
            console.log(e)
            setStep(' Erreur SQLite')
            throw e
        }
    }

    const handleReset = async () => {
        setLoading(true)
        setMessage('')
        setStep('')
        try {
            await handleResetMysql()
            await handleResetSqlite()
            setMessage(' Reset complet terminé')
            setStep('')
        } catch (e) {
            console.log(e)
            setMessage(' Erreur lors de la réinitialisation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <button onClick={handleReset} disabled={loading}>
                {loading ? ' Reset en cours...' : 'Reset data'}
            </button>
            {step && <p>{step}</p>}
            {message && <p><strong>{message}</strong></p>}
        </div>
    )
}

export default ResetData