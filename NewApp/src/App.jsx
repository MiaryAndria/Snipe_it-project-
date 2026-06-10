import { Routes, Route } from 'react-router-dom'
// import ListeUsers from './page/users/liste'
// import ResetData from './page/util/reset'
// import ListeCategorie from './page/categories/liste'
import DetailTicket from './page/admin/tickets/detail'
import ListeActif from './page/clients/actifs/liste'
import LoginAdmin from './page/admin/login'
import Acceuil from './page/admin/acceuil'
import ImportData from './page/util/import'
import ListeTickets from './page/admin/tickets/liste'
import InsertTickets from './page/admin/tickets/create'
import ListeTicket from './page/clients/tickets/liste'
import CustomParams from './page/admin/config/create'

function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ListeActif/>} />
          <Route path="/import" element={<ImportData/>} />
          <Route path="/admin/acceuil" element={<Acceuil/>} />
          <Route path="/admin" element={<LoginAdmin/>} />
          <Route path="/actifs" element={<ListeActif/>} />
          <Route path="/liste/tickets" element={<ListeTicket/>} />
          <Route path="/detail/ticket/:id" element={<DetailTicket/>} />
          <Route path="/create/tickets" element={<InsertTickets/>} />
          <Route path="/list/tickets" element={<ListeTickets/>} />
          <Route path="/ticket/fiche/:id" element={<DetailTicket/>} />
          <Route path="/admin/custom" element={<CustomParams/>} />
          {/* <Route path="/users" element={<ListeUsers />} />
          <Route path="/reset" element={<ResetData />} />
          <Route path="/categories" element={<ListeCategorie />} /> */}
          {/* <Route path="/licences" element={<ListeLicence />} />
          <Route path="/accessoires" element={<ListeAccessoire />} />
          <Route path="/consommables" element={<ListeConsommable />} />
          <Route path="/composants" element={<ListeComposant />} />
          <Route path="/locations" element={<ListeLocation />} />
          <Route path="/fabricants" element={<ListeFabricant />} />
          <Route path="/fournisseurs" element={<ListeFournisseur />} />
          <Route path="/categories" element={<ListeCategorie />} />
          <Route path="/modeles" element={<ListeModele />} />
          <Route path="/status_label" element={<ListeStatusLabel />} /> */}
        </Routes>
      </main>
    </div>
  )
}

export default App



