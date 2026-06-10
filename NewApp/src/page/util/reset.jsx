import { useState } from 'react'
import api_import from '../../api/api_import'
import '../../styles/global.css'
import '../../styles/reset.css'

function ResetData() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [step, setStep] = useState('')

    const handleResetMysql = async () => {
        setStep('Reset MySQL en cours...')
        try {
            const res = await api_import.delete('/reset/data/mysql')
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
            const res = await api_import.delete('/reset/data/sqlite')
            setStep(` SQLite : ${res.data?.message || 'OK'}`)
        } catch (e) {
            console.log(e)
            setStep(' Erreur SQLite')
            throw e
        }
    }

    const handleReset = async () => {
        const windowConfirm = window.confirm("Êtes vous sur de reinitialiser ?")
        console.log("Suppression exécutée")

        if(!windowConfirm) return

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
        <div className="reset-widget">
            <button className="btn btn-danger" onClick={handleReset} disabled={loading}>
                {loading ? 'Reset en cours...' : 'Reset data'}
            </button>
            {step && <p className="reset-step">{step}</p>}
            {message && <p className="reset-message"><strong>{message}</strong></p>}
        </div>
    )
}

export default ResetData