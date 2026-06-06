import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function LoginAdmin() {
    const navigate = useNavigate()
    const [adminEntrer, SetAdminEntrer] = useState('');
    const [mdpEntrer, SetMdpEntrer] = useState('');
    const [message,setMessage] = useState  ('');
    const admin = 'admin';
    const password = '123456';

    const login = () => {
        if (!adminEntrer || !mdpEntrer) {
            setMessage('Identifiants nécessaires');
            return;
        }
        if(adminEntrer !== admin) {
            setMessage('Utilisateur incorrect');
            return;
        }
        if(mdpEntrer != password){
            setMessage('Mot de passe incorrect');
            return;
        }

        if (adminEntrer === admin && mdpEntrer === password) {
            navigate('/admin/acceuil');
        } else {
            setMessage('Identifiants incorrects');
        }
    };

    return (
        <div>
            <div>
                <input type="text" onChange={(e) => SetAdminEntrer(e.target.value)} placeholder="Entrer identifiant (admin)" />
                <input type="password" onChange={(e) => SetMdpEntrer(e.target.value)} placeholder="Entrer mdp (123456)" />
                <button onClick={login}>Se connecter</button>
                <p>{message}</p>
            </div>

        </div>

    )
}

export default LoginAdmin



