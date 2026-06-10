import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/global.css'
import '../styles/navbar.css'

// Routes considérées comme "admin"
const ADMIN_PATHS = ['/admin', '/admin/acceuil', '/admin/custom', '/list/tickets', '/create/tickets', '/ticket/fiche', '/import']

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

    const isAdminArea = ADMIN_PATHS.some(p => location.pathname.startsWith(p))

    return (
        
        <nav className="navbar">
            <span className="navbar-brand" onClick={() => navigate('/actifs')}>AssetManager</span>

            <div className="navbar-links">
                {isAdminArea ? (
                    <>
                        <button className={isActive('/list/tickets')} onClick={() => navigate('/list/tickets')}>Liste tickets</button>
                        <button className={isActive('/admin/custom')} onClick={() => navigate('/admin/custom')}>Settings</button>
                        <button className={isActive('/import')} onClick={() => navigate('/import')}>Import</button>
                    </>
                ) : (
                    <>
                        <button className={location.pathname === '/actifs' || location.pathname === '/' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('/actifs')}>Actifs</button>
                        <button className={isActive('/liste/tickets')} onClick={() => navigate('/liste/tickets')}>Kanban</button>
                    </>
                )}
            </div>

            <div className="navbar-end">
                {!isAdminArea ? (
                    <button className="nav-link" onClick={() => navigate('/admin')}>Admin →</button>
                ) : (
                    <button className="nav-link" onClick={() => navigate('/admin/acceuil')}>Dashboard</button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
