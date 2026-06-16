import { Routes, Route } from 'react-router-dom'
import DetailTicket from './page/admin/tickets/detail'
import ListeActif from './page/clients/actifs/liste'
import LoginAdmin from './page/admin/login'
import Acceuil from './page/admin/acceuil'
import ImportData from './page/util/import'
import ListeTickets from './page/admin/tickets/liste'
import InsertTickets from './page/admin/tickets/create'
import ListeTicket from './page/clients/tickets/liste'
import CustomParams from './page/admin/config/create'
import Cout from './page/admin/cout'
import ImportTicket from './page/admin/import_ticket/import'
import Navbar from './page/Navbar'
import './styles/global.css'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ListeActif />} />
          <Route path="/import" element={<ImportData />} />
          <Route path="/admin/acceuil" element={<Acceuil />} />
          <Route path="/admin" element={<LoginAdmin />} />
          <Route path="/actifs" element={<ListeActif />} />
          <Route path="/liste/tickets" element={<ListeTicket />} />
          <Route path="/detail/ticket/:id" element={<DetailTicket />} />
          <Route path="/create/tickets" element={<InsertTickets />} />
          <Route path="/list/tickets" element={<ListeTickets />} />
          <Route path="/ticket/fiche/:id" element={<DetailTicket />} />
          <Route path="/admin/custom" element={<CustomParams />} />
          <Route path="/admin/cout" element={<Cout />} />
          <Route path="/import/ticket" element={<ImportTicket />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
