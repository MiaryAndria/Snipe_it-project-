// import { useEffect, useState } from "react"
// import api_service from "../../api/api_service"

// function ListeActif() {
//     const [actifs, setActifs] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [message, setMessage] = useState('')
//     const [pages, setPages] = useState(1)
//     const [total, setTotal] = useState()
//     const [actifByAssetTag, setactifByAssetTag] = useState({})
//     const [search, setSearch] = useState('')
//     const LIMIT = 50
//     const [filterValue, setFilterValue] = useState('all');

//     const getActif = async (pageActuelle) => {
//         setLoading(true)
//         try {
//             const offset = (pageActuelle - 1) * LIMIT
//             const response = await api_service.get('/hardware', {
//                 params: {
//                     limit: LIMIT,
//                     offset: offset,
//                     sort: 'created_at',
//                     order: 'desc'
//                 }
//             })
//             setActifs(response.data.rows)
//             setTotal(response.data.total)

//             setLoading(false)
//         } catch (e) {
//             setMessage('Erreur lors recuperation assets')
//             console.log(e)

//         }
//     }

//     const getActifByAssetTag = async () => {
//         try {
//             const response = await api_service.get(`hardware/bytag/${search}`)
//             setactifByAssetTag(response.data)
//         } catch (e) {
//             console.log(e)
//             setMessage('Erreur lors recherche')
//         }
//     }

//     const ActifLaptop = actifs.filter(actif => actif.category?.name === 'Laptops');
//     const ActifDisplay = actifs.filter(actif => actif.category?.name === 'Displays');
//     const ActifMobile = actifs.filter(actif => actif.category?.name === 'Mobile Phones');
//     const ActifTablet = actifs.filter(actif => actif.category?.name === 'Tablets ');
//     const ActifVoIP = actifs.filter(actif => actif.category?.name === 'VOIP Phones');
//     const ActifDesktop = actifs.filter(actif => actif.category?.name === 'Desktops ');

//     let ActifFiltrer = actifs;

//     if (filterValue === 'ordinateur_portable') ActifFiltrer = ActifLaptop;
//     if (filterValue === 'ecrans') ActifFiltrer = ActifDisplay;
//     if (filterValue === 'mobiles_phone') ActifFiltrer = ActifMobile;
//     if (filterValue === 'tablets') ActifFiltrer = ActifTablet;
//     if (filterValue === 'voir_phone') ActifFiltrer = ActifVoIP;
//     if (filterValue === 'desktops') ActifFiltrer = ActifDesktop;

//     useEffect(() => {
//         getActif(pages)
//     }, [pages])
//     const totalPages = Math.ceil(total / LIMIT)
//     console.log(actifs)
//     console.log(total)

//     if (loading) return <p>En chargement...</p>

//     return (
//         <div>
//             <div>
//                 <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Entrer valeur tag que vous voulez chercher" />
//                 <button onClick={getActifByAssetTag}>Rechercher</button>
//             </div>
//             {actifByAssetTag ? (
//                 <div>
//                     <p>{actifByAssetTag.name}</p>
//                     <p>{actifByAssetTag.asset_tag}</p>
//                     <p>{actifByAssetTag.model?.name}</p>
//                     <p>{actifByAssetTag.status_label?.name}</p>
//                 </div>
//             ) : (
//                 <p>Aucun actif trouvé.</p>
//             )}
//             <div>
//                 <p>{total}Total actifs -  {pages} / {totalPages}</p>
//                 <select
//                     value={filterValue}
//                     onChange={(e) => setFilterValue(e.target.value)}
//                 >
//                     <option value="all">Tous les actifs ({actifs.length})</option>
//                     <option value="ordinateur_portable">Ordinateurs Portables ({ActifLaptop.length})</option>
//                     <option value="ecrans">Écrans ({ActifDisplay.length})</option>
//                     <option value="mobiles_phone">Téléphones Mobiles ({ActifMobile.length})</option>
//                     <option value="tablets">Tablettes ({ActifTablet.length})</option>
//                     <option value="voir_phone">Téléphones VoIP ({ActifVoIP.length})</option>
//                     <option value="desktops">Ordinateurs de Bureau ({ActifDesktop.length})</option>
//                 </select>
//             </div>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Asset Tag</th>
//                         <th>Serial</th>
//                         <th>Model</th>
//                         <th>Model Number</th>
//                         <th>EOL Date</th>
//                         <th>Status</th>
//                         <th>Category</th>
//                         <th>Manufacturer</th>
//                         <th>Image</th>
//                     </tr>
//                 </thead>
//                 <tbody>

//                     {ActifFiltrer.length === 0 ? (
//                         <tr>
//                             <td>Pas de produit.</td>
//                         </tr>
//                     ) :
//                         (
//                             ActifFiltrer.map(actif => (
//                                 <tr key={actif.id}>
//                                     <td>{actif.asset_tag}</td>
//                                     <td>{actif.serial}</td>
//                                     <td>{actif.model?.name}</td>
//                                     <td>{actif.model_number}</td>
//                                     <td>{actif.asset_eol_date?.date}</td>
//                                     <td>{actif.status?.name}</td>
//                                     <td>{actif.category?.name}</td>
//                                     <td>{actif.manufacturer?.name}</td>
//                                     <td>
//                                         <img
//                                             src={actif.image}
//                                             alt={actif.model?.name}
//                                             width="80"
//                                         />
//                                     </td>
//                                 </tr>

//                             ))
//                         )}

//                 </tbody>
//             </table>
//             <div>
//                 <button
//                     onClick={() => setPages(p => p - 1)}
//                     disabled={pages === 1}
//                 >
//                     Précédent
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
//                     <button
//                         key={num}
//                         onClick={() => setPages(num)}
//                         style={{ fontWeight: pages === num ? 'bold' : 'normal' }}
//                     >
//                         {num}
//                     </button>
//                 ))}

//                 <button
//                     onClick={() => setPages(p => p + 1)}
//                     disabled={pages === totalPages}
//                 >
//                     Suivant
//                 </button>
//             </div>
//         </div>
//     )
// }

// export default ListeActif