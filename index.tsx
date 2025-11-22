import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Producto, Categoria, Marca, UnidadMedida, Presentacion, Lote, Cliente, Proveedor, Rol, TipoDocumento, Subcategoria, Usuario } from './types';
import { 
    CATEGORIAS_INIT, MARCAS_INIT, UNIDADES_INIT, PRESENTACIONES_INIT, 
    PRODUCTOS_INIT, LOTES_INIT, CLIENTES_INIT, PROVEEDORES_INIT,
    ROLES_INIT, TIPO_DOC_INIT, SUBCATEGORIAS_INIT, USUARIOS_INIT
} from './data';

import POS from './pages/POS';
import Compras from './pages/Compras';
import GenericTable from './components/GenericTable';
import GenericModal from './components/GenericModal';

const API_URL = 'http://localhost:8080/api';

// --- 1. PANTALLA DE LOGIN (Local por ahora) ---
const LoginScreen = ({ users, onLoginSuccess }: { users: Usuario[], onLoginSuccess: (user: Usuario) => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí podrías conectar con un endpoint real /api/login si lo creas
        const userFound = users.find(u => u.nombre_usuario === username.trim() && u.password === password.trim());
        
        if (!userFound && username === 'admin' && password === 'admin') {
            onLoginSuccess({ id_usuario: 1, nombre: 'Admin', apellido: 'Sistema', nombre_usuario: 'admin', id_rol: 1, password: 'admin' });
            return;
        }
        if (userFound) onLoginSuccess(userFound);
        else setError('Credenciales incorrectas.');
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' }}>
            <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body p-5">
                    <h4 className="fw-bold text-center mb-4">FAST POS</h4>
                    {error && <div className="alert alert-danger small">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="mb-3"><input className="form-control" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} autoFocus /></div>
                        <div className="mb-3"><input type="password" className="form-control" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} /></div>
                        <button className="btn btn-primary w-100">INGRESAR</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- 2. CRUD MODULE INTELIGENTE (Conecta con API) ---
const CrudModule = ({ title, icon, data, onSave, onDelete, idField, columns, fields }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleAddNew = () => {
        const initialData: any = {};
        if(fields) fields.forEach((f:any) => initialData[f.name] = '');
        setFormData(initialData);
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setFormData({ ...item });
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: any) => {
        if (confirm(`¿Eliminar registro?`)) onDelete(item);
    };

    const handleSaveClick = () => {
        onSave(formData, currentItem ? currentItem[idField] : null);
        setIsModalOpen(false);
    };

    return (
        <div className="container-fluid p-4">
             <div className="d-flex justify-content-between mb-4">
                <h3 className="fw-bold"><i className={`fas ${icon} me-2 text-primary`}></i>{title}</h3>
                <button className="btn btn-primary rounded-pill" onClick={handleAddNew}><i className="fas fa-plus me-2"></i>Nuevo</button>
            </div>
            <GenericTable columns={columns} data={data} keyField={idField} onEdit={handleEdit} onDelete={handleDeleteClick} />
            <GenericModal title={currentItem ? `Editar` : `Nuevo`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveClick}>
                <form>
                    {fields && fields.map((field:any) => (
                        <div className="mb-3" key={field.name}>
                            <label className="form-label small fw-bold">{field.label}</label>
                            {field.type === 'select' ? (
                                <select className="form-select" value={formData[field.name] || ''} onChange={e => setFormData({...formData, [field.name]: Number(e.target.value)})}>
                                    <option value="">Seleccione...</option>
                                    {field.options?.map((opt:any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            ) : (
                                <input type={field.type} className="form-control" value={formData[field.name] || ''} onChange={e => setFormData({...formData, [field.name]: e.target.value})} />
                            )}
                        </div>
                    ))}
                </form>
            </GenericModal>
        </div>
    );
};

// --- 3. DASHBOARD ---
const Dashboard = ({ lotes, products }: any) => {
  const stockTotal = (lotes || []).reduce((acc:number, l:any) => acc + (l.cantidad || 0), 0);
  // Calculo aproximado si precioCompra existe, sino 0
  const valorTotal = (lotes || []).reduce((acc:number, l:any) => acc + ((l.cantidad || 0) * (l.precio_compra || 0)), 0);
  
  return (
    <div className="container-fluid p-4">
      <h3 className="fw-bold mb-4">Dashboard General</h3>
      <div className="row g-4">
        <div className="col-md-4"><div className="card shadow-sm border-start border-primary border-4 py-2"><div className="card-body"><div className="text-primary fw-bold small">PRODUCTOS</div><div className="h3 fw-bold text-gray-800">{products.length}</div></div></div></div>
        <div className="col-md-4"><div className="card shadow-sm border-start border-success border-4 py-2"><div className="card-body"><div className="text-success fw-bold small">STOCK TOTAL</div><div className="h3 fw-bold text-gray-800">{stockTotal}</div></div></div></div>
        <div className="col-md-4"><div className="card shadow-sm border-start border-info border-4 py-2"><div className="card-body"><div className="text-info fw-bold small">VALORIZACIÓN</div><div className="h3 fw-bold text-gray-800">S/. {valorTotal.toFixed(2)}</div></div></div></div>
      </div>
    </div>
  );
};

// --- 4. SIDEBAR ---
const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar, currentUser, onLogout }: any) => {
    const handleNav = (e: any, tab: string) => { e.preventDefault(); setActiveTab(tab); if(window.innerWidth < 992) toggleSidebar(); };
    return (
        <div className={`sidebar ${isOpen ? 'show' : ''} d-flex flex-column flex-shrink-0 text-white`} 
             style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '250px', zIndex: 1040, background: 'linear-gradient(180deg, #4e73df 10%, #224abe 100%)' }}>
            <div className="p-3"><span className="fs-4 fw-bold"><i className="fas fa-bolt text-warning me-2"></i>FAST POS</span></div>
            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                <ul className="nav nav-pills flex-column p-2">
                    <li className="nav-item"><a href="#" className={`nav-link text-white ${activeTab==='dashboard'?'active':''}`} onClick={(e)=>handleNav(e,'dashboard')}><i className="fas fa-tachometer-alt me-2"></i> Dashboard</a></li>
                    <li className="nav-item mt-3 small fw-bold ps-2 text-white-50">OPERACIONES</li>
                    <li><a href="#" className={`nav-link text-white ${activeTab==='pos'?'active':''}`} onClick={(e)=>handleNav(e,'pos')}><i className="fas fa-cash-register me-2"></i> Venta</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab==='compras'?'active':''}`} onClick={(e)=>handleNav(e,'compras')}><i className="fas fa-shopping-bag me-2"></i> Compras</a></li>
                    <li className="nav-item mt-3 small fw-bold ps-2 text-white-50">MANTENIMIENTO</li>
                    {['productos','categorias','marcas','unidades','presentaciones','clientes','proveedores'].map(m => (
                        <li key={m}><a href="#" className={`nav-link text-white ${activeTab===m?'active':''}`} onClick={(e)=>handleNav(e,m)}><i className="fas fa-circle me-2 small"></i> {m.charAt(0).toUpperCase() + m.slice(1)}</a></li>
                    ))}
                </ul>
            </div>
            <div className="p-3 bg-black bg-opacity-25 border-top border-white border-opacity-10">
                <div className="d-flex align-items-center mb-2">
                    <div className="bg-white text-primary rounded-circle d-flex center me-2" style={{width:30,height:30}}><span className="fw-bold ps-2">{currentUser?.nombre.charAt(0)}</span></div>
                    <small>{currentUser?.nombre}</small>
                </div>
                <button className="btn btn-sm btn-danger w-100" onClick={onLogout}>Salir</button>
            </div>
        </div>
    );
};

// --- 5. APP PRINCIPAL (LOGICA DE CONEXION) ---
const App = () => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- ESTADOS DE DATOS ---
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [brands, setBrands] = useState<Marca[]>([]);
  const [units, setUnits] = useState<UnidadMedida[]>([]);
  const [presentations, setPresentations] = useState<Presentacion[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]); // Lotes también vendrán de API

  // --- CARGA INICIAL DE DATOS ---
  const fetchAllData = async () => {
    try {
        // 1. Carga de Catálogos Simples
        const [cats, mrcs, unds, pres, clis, provs] = await Promise.all([
            fetch(`${API_URL}/categorias`).then(r => r.json()),
            fetch(`${API_URL}/marcas`).then(r => r.json()),
            fetch(`${API_URL}/unidades-medida`).then(r => r.json()), // Ojo con el endpoint
            fetch(`${API_URL}/presentaciones`).then(r => r.json()),
            fetch(`${API_URL}/clientes`).then(r => r.json()),
            // fetch(`${API_URL}/proveedores`).then(r => r.json()) // Si no existe aun, usar mock
            Promise.resolve(PROVEEDORES_INIT) 
        ]);

        // Mapear Clientes (Java a React)
        const mappedClients = clis.map((c: any) => ({
            id_cliente: c.idCliente, nombre: c.nombre, apellidos: c.apellidos, 
            nro_documento: c.nroDocumento, direccion: c.direccion, celular: c.celular
        }));

        // 2. Carga de Productos (Compleja)
        const prodsRaw = await fetch(`${API_URL}/productos`).then(r => r.json());
        const mappedProds = prodsRaw.map((p: any) => ({
            id_producto: p.idProducto,
            nombre: p.nombre,
            id_categoria: p.categoria?.idCategoria || 0,
            id_marca: p.marca?.idMarca || 0,
            id_unidad: p.unidadMedida?.idUnidad || 0,
            id_presentacion: p.presentacion?.idPresentacion || 0,
            precio_referencia: 0 // Se calculará
        }));

        // 3. Carga de Lotes (Inventario)
        const lotesRaw = await fetch(`${API_URL}/lotes`).then(r => r.json());
        const mappedLotes = lotesRaw.map((l: any) => ({
            id_lote: l.idLote,
            id_producto: l.producto?.idProducto,
            codigo_lote: l.codigoLote,
            precio_compra: l.precioCompra,
            precio_venta: l.precioVenta,
            fecha_vencimiento: l.fechaVencimiento,
            cantidad: l.cantidad
        }));

        setCategories(cats.map((c:any) => ({ id_categoria: c.idCategoria, nombre: c.nombre })));
        setBrands(mrcs.map((m:any) => ({ id_marca: m.idMarca, nombre: m.nombre, descripcion: m.descripcion })));
        setUnits(unds.map((u:any) => ({ id_unidad: u.idUnidad, nombre: u.nombre, abreviatura: u.abreviatura })));
        setPresentations(pres.map((p:any) => ({ id_presentacion: p.idPresentacion, nombre: p.nombre, descripcion: p.descripcion })));
        setClients(mappedClients);
        setSuppliers(provs); // Si usas mock, asegurar estructura
        setProducts(mappedProds);
        setLotes(mappedLotes);

    } catch (error) {
        console.error("Error cargando datos del backend:", error);
        // Si falla, no hacemos nada (o podrías cargar mocks)
    }
  };

  useEffect(() => {
      if (currentUser) fetchAllData();
  }, [currentUser]);


  // --- LÓGICA DE GUARDADO GENÉRICA (API) ---
  const handleGenericSave = async (endpoint: string, data: any, id: number | null, idFieldJson: string) => {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_URL}/${endpoint}/${id}` : `${API_URL}/${endpoint}`;
      
      try {
          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          if (res.ok) {
              fetchAllData(); // Recargar todo para ver cambios
          } else {
              alert("Error al guardar en servidor");
          }
      } catch (e) { console.error(e); }
  };

  const handleGenericDelete = async (endpoint: string, id: number) => {
      try {
          await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
          fetchAllData();
      } catch (e) { console.error(e); }
  };

  // --- TRANSFORMADORES PARA GUARDAR (React -> Java) ---
  
  const saveProduct = (formData: any, id: number | null) => {
      // Convertimos ids planos a objetos para Java
      const payload = {
          nombre: formData.nombre,
          categoria: { idCategoria: formData.id_categoria },
          marca: { idMarca: formData.id_marca },
          unidadMedida: { idUnidad: formData.id_unidad },
          presentacion: { idPresentacion: formData.id_presentacion },
          estado: true
      };
      handleGenericSave('productos', payload, id, 'idProducto');
  };

  const saveClient = (formData: any, id: number | null) => {
      const payload = {
          nombre: formData.nombre, apellidos: formData.apellidos,
          nroDocumento: formData.nro_documento, direccion: formData.direccion, celular: formData.celular, estado: true
      };
      handleGenericSave('clientes', payload, id, 'idCliente');
  };

  // Wrappers Simples
  const saveCat = (d:any, id:any) => handleGenericSave('categorias', { nombre: d.nombre }, id, 'idCategoria');
  const saveBrand = (d:any, id:any) => handleGenericSave('marcas', { nombre: d.nombre, descripcion: d.descripcion }, id, 'idMarca');
  const saveUnit = (d:any, id:any) => handleGenericSave('unidades-medida', { nombre: d.nombre, abreviatura: d.abreviatura }, id, 'idUnidad');
  const savePres = (d:any, id:any) => handleGenericSave('presentaciones', { nombre: d.nombre, descripcion: d.descripcion }, id, 'idPresentacion');

  // --- VENTA (POS) & COMPRA ---
  // Nota: Aquí la lógica transaccional compleja (FIFO) ya la hace el backend en /api/ventas.
  // El frontend solo debe enviar el JSON de venta.
  // Por ahora mantenemos la lógica visual, pero idealmente deberías llamar al endpoint POST /api/ventas

  const handleLogout = () => { if(confirm("¿Salir?")) setCurrentUser(null); };

  if (!currentUser) return <LoginScreen users={USUARIOS_INIT} onLoginSuccess={setCurrentUser} />;

  return (
    <div className="app-container">
        <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} currentUser={currentUser} onLogout={handleLogout} />
        
        <div className="main-content">
            <div className="d-lg-none bg-white shadow-sm p-2 d-flex align-items-center justify-content-between sticky-top" style={{zIndex: 1020}}>
                <button className="btn btn-light text-primary" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars fa-lg"></i></button>
                <span className="fw-bold text-primary">FAST POS</span>
            </div>

            <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fc' }}>
                {activeTab === 'dashboard' && <Dashboard lotes={lotes} products={products} />}
                
                {/* POS Y COMPRAS (Siguen usando estados locales por ahora para no romper la UI visual, pero le pasamos los datos reales de productos/lotes) */}
                {activeTab === 'pos' && <POS products={products} lotes={lotes} setLotes={setLotes} clients={clients} categories={categories} brands={brands} />}
                {activeTab === 'compras' && <Compras products={products} suppliers={suppliers} onConfirmPurchase={() => alert("Falta conectar endpoint POST /api/lotes")} />}
                
                {/* MANTENIMIENTOS CONECTADOS A API */}
                {activeTab === 'productos' && <CrudModule title="Productos" icon="fa-box" data={products} onSave={saveProduct} onDelete={(d:any) => handleGenericDelete('productos', d.id_producto)} idField="id_producto" 
                    columns={[{header:'Nombre', accessor:'nombre'}, {header:'Marca', accessor:(r:any)=>brands.find(b=>b.id_marca===r.id_marca)?.nombre||'-'}]}
                    fields={[{name:'nombre', label:'Nombre', type:'text', required:true}, {name:'id_categoria', label:'Categoría', type:'select', options:categories.map(c=>({value:c.id_categoria, label:c.nombre}))}, {name:'id_marca', label:'Marca', type:'select', options:brands.map(b=>({value:b.id_marca, label:b.nombre}))}, {name:'id_unidad', label:'Unidad', type:'select', options:units.map(u=>({value:u.id_unidad, label:u.nombre}))}, {name:'id_presentacion', label:'Presentación', type:'select', options:presentations.map(p=>({value:p.id_presentacion, label:p.nombre}))}]} 
                />}

                {activeTab === 'clientes' && <CrudModule title="Clientes" icon="fa-users" data={clients} onSave={saveClient} onDelete={(d:any) => handleGenericDelete('clientes', d.id_cliente)} idField="id_cliente" 
                    columns={[{header:'Nombre', accessor:'nombre'}, {header:'DNI', accessor:'nro_documento'}]} 
                    fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'apellidos', label:'Apellidos', type:'text'}, {name:'nro_documento', label:'DNI', type:'text'}, {name:'direccion', label:'Dirección', type:'text'}, {name:'celular', label:'Celular', type:'text'}]} 
                />}

                {activeTab === 'categorias' && <CrudModule title="Categorías" icon="fa-layer-group" data={categories} onSave={saveCat} onDelete={(d:any) => handleGenericDelete('categorias', d.id_categoria)} idField="id_categoria" columns={[{header:'Nombre', accessor:'nombre'}]} fields={[{name:'nombre', label:'Nombre', type:'text'}]} />}
                
                {activeTab === 'marcas' && <CrudModule title="Marcas" icon="fa-copyright" data={brands} onSave={saveBrand} onDelete={(d:any) => handleGenericDelete('marcas', d.id_marca)} idField="id_marca" columns={[{header:'Nombre', accessor:'nombre'}, {header:'Desc', accessor:'descripcion'}]} fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'descripcion', label:'Descripción', type:'text'}]} />}
                
                {activeTab === 'unidades' && <CrudModule title="Unidades" icon="fa-ruler" data={units} onSave={saveUnit} onDelete={(d:any) => handleGenericDelete('unidades-medida', d.id_unidad)} idField="id_unidad" columns={[{header:'Nombre', accessor:'nombre'}, {header:'Abrev', accessor:'abreviatura'}]} fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'abreviatura', label:'Abrev', type:'text'}]} />}
                
                {activeTab === 'presentaciones' && <CrudModule title="Presentaciones" icon="fa-wine-bottle" data={presentations} onSave={savePres} onDelete={(d:any) => handleGenericDelete('presentaciones', d.id_presentacion)} idField="id_presentacion" columns={[{header:'Nombre', accessor:'nombre'}]} fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'descripcion', label:'Desc', type:'text'}]} />}

            </div>
        </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);