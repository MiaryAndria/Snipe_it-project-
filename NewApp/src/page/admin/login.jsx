import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import '../../styles/global.css'
import '../../styles/login.css'

function LoginAdmin() {
    const navigate = useNavigate()
    const [adminEntrer, SetAdminEntrer] = useState('');
    const [mdpEntrer, SetMdpEntrer] = useState('');
    const [message, setMessage] = useState('');
    const admin = 'admin';
    const password = '123456';

    const login = () => {
        if (!adminEntrer || !mdpEntrer) { setMessage('Identifiants nécessaires'); return; }
        if (adminEntrer !== admin) { setMessage('Utilisateur incorrect'); return; }
        if (mdpEntrer != password) { setMessage('Mot de passe incorrect'); return; }
        if (adminEntrer === admin && mdpEntrer === password) {
            navigate('/admin/acceuil');
        } else {
            setMessage('Identifiants incorrects');
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h1 className="login-title">Administration</h1>
                <p className="login-subtitle">Accès réservé</p>
                <div className="login-fields">
                    <input className="field-input" type="text" onChange={(e) => SetAdminEntrer(e.target.value)} placeholder="Identifiant (admin)" />
                    <input className="field-input" type="password" onChange={(e) => SetMdpEntrer(e.target.value)} placeholder="Mot de passe (123456)" />
                </div>
                <button className="btn login-btn" onClick={login}>Se connecter</button>
                <p className="msg">{message}</p>
            </div>
        </div>
    )
}

export default LoginAdmin
