
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Producto, Categoria, Marca, UnidadMedida, Presentacion, Lote, Cliente, Proveedor, Rol, TipoDocumento, Subcategoria, Usuario } from './types';
import { 
    CATEGORIAS_INIT, MARCAS_INIT, UNIDADES_INIT, PRESENTACIONES_INIT, 
    PRODUCTOS_INIT, LOTES_INIT, CLIENTES_INIT, PROVEEDORES_INIT,
    ROLES_INIT, TIPO_DOC_INIT, SUBCATEGORIAS_INIT, USUARIOS_INIT
} from './data';

// Import Pages & Components
import POS from './pages/POS';
import Compras from './pages/Compras';
import GenericTable from './components/GenericTable';
import GenericModal from './components/GenericModal';

// --- COMPONENTES AUXILIARES ---

// 1. LOGIN SCREEN COMPONENT
const LoginScreen = ({ users, onLoginSuccess }: { users: Usuario[], onLoginSuccess: (user: Usuario) => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const userClean = username.trim();
        const passClean = password.trim();

        // Depuración: Mostrar en consola qué se está recibiendo
        console.log("Intentando ingresar con:", userClean, passClean);
        
        // 1. Buscar en el array de datos
        let userFound = users.find(u => u.nombre_usuario === userClean && u.password === passClean);

        // 2. Fallback de seguridad: Si por alguna razón los datos no cargaron passwords, permitir admin/admin hardcoded
        if (!userFound && userClean === 'admin' && passClean === 'admin') {
            console.log("Usando acceso de respaldo admin.");
            userFound = users.find(u => u.nombre_usuario === 'admin') || {
                id_usuario: 1, nombre: 'Admin', apellido: 'Sistema', nombre_usuario: 'admin', id_rol: 1, password: 'admin'
            };
        }

        if (userFound) {
            onLoginSuccess(userFound);
        } else {
            setError('Credenciales incorrectas. Intente: admin / admin');
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" 
             style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' }}>
            <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: '400px', borderRadius: '1rem' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                             style={{ width: '60px', height: '60px' }}>
                            <i className="fas fa-bolt fa-2x"></i>
                        </div>
                        <h4 className="fw-bold text-gray-900">Bienvenido a FAST POS</h4>
                        <p className="text-muted small">Ingrese sus credenciales para continuar</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center small py-2" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Usuario</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0"><i className="fas fa-user text-muted"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-start-0" 
                                    placeholder="Ej: admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-secondary">Contraseña</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0"><i className="fas fa-lock text-muted"></i></span>
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-start-0" 
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded-pill">
                            INGRESAR
                        </button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <small className="text-muted">Versión 2.8.0 &copy; 2025</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

// CrudModule actualizado para soportar select
const CrudModule = ({ title, icon, data, setData, idField, columns, fields }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleAddNew = () => {
        const initialData: any = {};
        if(fields) {
            fields.forEach((f:any) => initialData[f.name] = '');
        }
        setFormData(initialData);
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setFormData({ ...item });
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (item: any) => {
        if (confirm(`¿Eliminar registro?`)) {
            setData(data.filter((d:any) => d[idField] !== item[idField]));
        }
    };

    const handleSave = () => {
        if (currentItem) {
            setData(data.map((d:any) => d[idField] === currentItem[idField] ? { ...formData, [idField]: currentItem[idField] } : d));
        } else {
            const newId = data.length > 0 ? Math.max(...data.map((d:any) => d[idField])) + 1 : 1;
            setData([...data, { ...formData, [idField]: newId }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="container-fluid p-3 p-md-4">
             <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="h3 mb-0 text-gray-800 fw-bold fs-4 fs-md-3"><i className={`fas ${icon} me-2 text-primary`}></i>{title}</h3>
                <button className="btn btn-primary shadow-sm rounded-pill px-3 px-md-4" onClick={handleAddNew}>
                    <i className="fas fa-plus me-2"></i><span className="d-none d-sm-inline">Nuevo</span>
                </button>
            </div>
            <GenericTable columns={columns} data={data} keyField={idField} onEdit={handleEdit} onDelete={handleDelete} />
            <GenericModal title={currentItem ? `Editar` : `Nuevo`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
                <form>
                    {fields && fields.map((field:any) => (
                        <div className="mb-3" key={field.name}>
                            <label className="form-label fw-bold small text-secondary">{field.label} {field.required && '*'}</label>
                            {field.type === 'select' ? (
                                <select 
                                    className="form-select" 
                                    value={formData[field.name] || ''} 
                                    onChange={e => setFormData({...formData, [field.name]: Number(e.target.value)})}
                                >
                                    <option value="">Seleccione...</option>
                                    {field.options?.map((opt:any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    type={field.type} 
                                    className="form-control" 
                                    value={formData[field.name] || ''} 
                                    onChange={e => setFormData({...formData, [field.name]: e.target.value})} 
                                />
                            )}
                        </div>
                    ))}
                </form>
            </GenericModal>
        </div>
    );
};

const Dashboard = ({ lotes, products }: any) => {
  const safeLotes = lotes || [];
  const stockTotal = safeLotes.reduce((acc:number, l:any) => acc + l.cantidad, 0);
  const valorTotal = safeLotes.reduce((acc:number, l:any) => acc + (l.cantidad * l.precio_compra), 0);
  
  return (
    <div className="container-fluid p-3 p-md-4">
      <h3 className="text-gray-800 fw-bold mb-4">Dashboard General</h3>
      <div className="row g-3 g-md-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100 py-2 border-start border-primary border-4">
            <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                    <div className="text-uppercase text-primary fw-bold text-xs mb-1">Productos</div>
                    <div className="h3 mb-0 fw-bold text-gray-800">{products ? products.length : 0}</div>
                </div>
                <i className="fas fa-box fa-2x text-gray-300 opacity-25"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100 py-2 border-start border-success border-4">
            <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                    <div className="text-uppercase text-success fw-bold text-xs mb-1">Stock (Und)</div>
                    <div className="h3 mb-0 fw-bold text-gray-800">{stockTotal}</div>
                </div>
                <i className="fas fa-cubes fa-2x text-gray-300 opacity-25"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100 py-2 border-start border-info border-4">
            <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                    <div className="text-uppercase text-info fw-bold text-xs mb-1">Valorización</div>
                    <div className="h3 mb-0 fw-bold text-gray-800">S/. {valorTotal.toFixed(2)}</div>
                </div>
                <i className="fas fa-dollar-sign fa-2x text-gray-300 opacity-25"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar, currentUser, roles, onLogout }: any) => {
    const handleNav = (e: React.MouseEvent, tab: string) => {
        e.preventDefault();
        setActiveTab(tab);
        if (window.innerWidth <= 992) {
            toggleSidebar();
        }
    };

    const userRoleName = roles.find((r:Rol) => r.id_rol === currentUser?.id_rol)?.nombre || 'Usuario';

    return (
        <div className={`sidebar ${isOpen ? 'show' : ''} d-flex flex-column flex-shrink-0 text-white`}>
            {/* Header */}
            <div className="p-3">
                <div className="d-flex align-items-center justify-content-between text-white text-decoration-none">
                    <span className="fs-4 fw-bold d-flex align-items-center">
                        <i className="fas fa-bolt text-warning me-2"></i>FAST POS
                    </span>
                    <button className="btn text-white d-lg-none" onClick={toggleSidebar}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <hr className="mt-3 mb-0" />
            </div>

            {/* Scroll Area for Sidebar Links */}
            <div className="sidebar-scroll-area px-1 pb-3">
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <a href="#" className={`nav-link text-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'dashboard')}>
                            <i className="fas fa-tachometer-alt me-2" style={{width: '20px'}}></i> Dashboard
                        </a>
                    </li>
                    
                    <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Operaciones</li>
                    <li>
                        <a href="#" className={`nav-link text-white ${activeTab === 'pos' ? 'active bg-success' : ''}`} onClick={(e) => handleNav(e, 'pos')}>
                            <i className="fas fa-cash-register me-2" style={{width: '20px'}}></i> Punto de Venta
                        </a>
                    </li>
                    <li>
                        <a href="#" className={`nav-link text-white ${activeTab === 'compras' ? 'active bg-primary' : ''}`} onClick={(e) => handleNav(e, 'compras')}>
                            <i className="fas fa-shopping-bag me-2" style={{width: '20px'}}></i> Compras
                        </a>
                    </li>
                    
                    <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Inventario</li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'productos' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'productos')}><i className="fas fa-box me-2" style={{width: '20px'}}></i> Productos</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'categorias' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'categorias')}><i className="fas fa-layer-group me-2" style={{width: '20px'}}></i> Categorías</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'subcategorias' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'subcategorias')}><i className="fas fa-tags me-2" style={{width: '20px'}}></i> Subcategorías</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'marcas' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'marcas')}><i className="fas fa-copyright me-2" style={{width: '20px'}}></i> Marcas</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'unidades' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'unidades')}><i className="fas fa-ruler-combined me-2" style={{width: '20px'}}></i> Unidades</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'presentaciones' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'presentaciones')}><i className="fas fa-wine-bottle me-2" style={{width: '20px'}}></i> Presentaciones</a></li>
                    
                    <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Directorios</li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'clientes' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'clientes')}><i className="fas fa-users me-2" style={{width: '20px'}}></i> Clientes</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'proveedores' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'proveedores')}><i className="fas fa-truck me-2" style={{width: '20px'}}></i> Proveedores</a></li>
                    
                    <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Sistema</li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'usuarios')}><i className="fas fa-user-shield me-2" style={{width: '20px'}}></i> Usuarios</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'roles' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'roles')}><i className="fas fa-key me-2" style={{width: '20px'}}></i> Roles</a></li>
                    <li><a href="#" className={`nav-link text-white ${activeTab === 'tipos_doc' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'tipos_doc')}><i className="fas fa-id-card me-2" style={{width: '20px'}}></i> Tipos Doc.</a></li>
                </ul>
            </div>

            {/* User Profile & Logout Sticky Footer */}
            <div className="mt-auto bg-black bg-opacity-10 p-3 border-top border-white border-opacity-10">
                {currentUser && (
                    <div className="d-flex align-items-center mb-2">
                        <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '35px', height: '35px'}}>
                            <span className="fw-bold">{currentUser.nombre.charAt(0)}</span>
                        </div>
                        <div className="overflow-hidden">
                            <div className="fw-bold text-truncate" style={{fontSize: '0.9rem'}}>{currentUser.nombre} {currentUser.apellido}</div>
                            <div className="small text-white-50 text-truncate">{userRoleName}</div>
                        </div>
                    </div>
                )}
                <button className="btn btn-sm btn-danger w-100 bg-opacity-75 border-0" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

// --- MAIN APP ---

const App = () => {
  // Estado de Sesión (Autenticación)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Global State - Original
  const [products, setProducts] = useState<Producto[]>(PRODUCTOS_INIT);
  const [categories, setCategories] = useState<Categoria[]>(CATEGORIAS_INIT);
  const [brands, setBrands] = useState<Marca[]>(MARCAS_INIT);
  const [units, setUnits] = useState<UnidadMedida[]>(UNIDADES_INIT);
  const [presentations, setPresentations] = useState<Presentacion[]>(PRESENTACIONES_INIT);
  const [lotes, setLotes] = useState<Lote[]>(LOTES_INIT);
  const [clients, setClients] = useState<Cliente[]>(CLIENTES_INIT);
  const [suppliers, setSuppliers] = useState<Proveedor[]>(PROVEEDORES_INIT);

  // Global State - Nuevos Módulos
  const [roles, setRoles] = useState<Rol[]>(ROLES_INIT);
  const [tipoDocs, setTipoDocs] = useState<TipoDocumento[]>(TIPO_DOC_INIT);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>(SUBCATEGORIAS_INIT);
  const [users, setUsers] = useState<Usuario[]>(USUARIOS_INIT);

  const handleLoginSuccess = (user: Usuario) => {
      setCurrentUser(user);
      setActiveTab('dashboard'); // Al ingresar, ir al dashboard
  };

  const handleLogout = () => {
      if(confirm("¿Está seguro que desea cerrar sesión?")) {
          setCurrentUser(null); // Esto limpiará el usuario y React renderizará <LoginScreen />
          setSidebarOpen(false);
      }
  };

  const handleConfirmPurchase = (newBatches: Lote[]) => {
      const nextIdStart = lotes.length > 0 ? Math.max(...lotes.map(l => l.id_lote), 0) + 1 : 1;
      const batchesWithIds = newBatches.map((b, idx) => ({ ...b, id_lote: nextIdStart + idx }));
      setLotes([...lotes, ...batchesWithIds]);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // --- RENDER CONDICIONAL ---
  if (!currentUser) {
      return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
        <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
            currentUser={currentUser}
            roles={roles}
            onLogout={handleLogout}
        />
        
        <div className="main-content">
            <div className="d-lg-none bg-white shadow-sm p-2 d-flex align-items-center justify-content-between sticky-top" style={{zIndex: 1020}}>
                <button className="btn btn-light text-primary" onClick={toggleSidebar}>
                    <i className="fas fa-bars fa-lg"></i>
                </button>
                <span className="fw-bold text-primary">FAST POS</span>
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center small" style={{width: '30px', height: '30px'}}>
                    {currentUser.nombre.charAt(0)}
                </div>
            </div>

            <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fc' }}>
                {activeTab === 'dashboard' && <Dashboard lotes={lotes} products={products} />}
                
                {activeTab === 'pos' && 
                    <POS 
                        products={products} 
                        lotes={lotes} 
                        setLotes={setLotes} 
                        clients={clients} 
                        categories={categories} 
                        brands={brands} 
                    />
                }

                {activeTab === 'compras' && 
                    <Compras 
                        products={products} 
                        suppliers={suppliers} 
                        onConfirmPurchase={handleConfirmPurchase} 
                    />
                }

                {/* --- CRUD Views Existentes --- */}
                {activeTab === 'clientes' && <CrudModule title="Clientes" icon="fa-users" data={clients} setData={setClients} idField="id_cliente" 
                    columns={[{header:'Nombre', accessor:'nombre'}, {header:'Doc', accessor:'nro_documento'}, {header:'Celular', accessor:'celular'}]} 
                    fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'nro_documento', label:'DNI', type:'text'}, {name:'celular', label:'Cel', type:'text'}]} 
                />}

                {activeTab === 'proveedores' && <CrudModule title="Proveedores" icon="fa-truck" data={suppliers} setData={setSuppliers} idField="id_proveedor" 
                    columns={[{header:'Razón Social', accessor:'razon_social'}, {header:'RUC', accessor:'ruc'}]} 
                    fields={[{name:'razon_social', label:'Razón Social', type:'text'}, {name:'ruc', label:'RUC', type:'text'}]} 
                />}

                {activeTab === 'productos' && <CrudModule title="Productos" icon="fa-box" data={products} setData={setProducts} idField="id_producto"
                    columns={[
                        {header: 'Nombre', accessor: 'nombre'}, 
                        {header: 'Categoría', accessor: (row:any) => categories.find(c => c.id_categoria === row.id_categoria)?.nombre || '-'},
                        {header: 'Marca', accessor: (row:any) => brands.find(m => m.id_marca === row.id_marca)?.nombre || '-'},
                        {header: 'Ref. Precio', accessor: (row:any) => `S/. ${row.precio_referencia.toFixed(2)}`}
                    ]}
                    fields={[
                        {name: 'nombre', label: 'Nombre Producto', type: 'text', required: true},
                        {name: 'id_categoria', label: 'Categoría', type: 'select', options: categories.map(c => ({value: c.id_categoria, label: c.nombre}))},
                        {name: 'id_marca', label: 'Marca', type: 'select', options: brands.map(b => ({value: b.id_marca, label: b.nombre}))},
                        {name: 'id_unidad', label: 'Unidad', type: 'select', options: units.map(u => ({value: u.id_unidad, label: u.nombre}))},
                        {name: 'id_presentacion', label: 'Presentación', type: 'select', options: presentations.map(p => ({value: p.id_presentacion, label: p.nombre}))},
                        {name: 'precio_referencia', label: 'Precio Venta Ref.', type: 'number'}
                    ]}
                />}

                {/* --- Módulos Maestros Desagregados --- */}

                {activeTab === 'categorias' && <CrudModule title="Categorías" icon="fa-layer-group" data={categories} setData={setCategories} idField="id_categoria"
                    columns={[{header: 'Nombre', accessor: 'nombre'}]}
                    fields={[{name: 'nombre', label: 'Nombre Categoría', type: 'text'}]}
                />}

                {activeTab === 'subcategorias' && <CrudModule title="Subcategorías" icon="fa-tags" data={subcategories} setData={setSubcategories} idField="id_subcategoria"
                    columns={[
                        {header: 'Nombre', accessor: 'nombre'},
                        {header: 'Categoría Padre', accessor: (row:any) => categories.find(c => c.id_categoria === row.id_categoria)?.nombre || '-'}
                    ]}
                    fields={[
                        {name: 'nombre', label: 'Nombre Subcategoría', type: 'text'},
                        {name: 'id_categoria', label: 'Categoría Padre', type: 'select', options: categories.map(c => ({value: c.id_categoria, label: c.nombre}))}
                    ]}
                />}

                {activeTab === 'marcas' && <CrudModule title="Marcas" icon="fa-copyright" data={brands} setData={setBrands} idField="id_marca"
                    columns={[{header:'Marca', accessor:'nombre'}, {header:'Desc', accessor:'descripcion'}]}
                    fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'descripcion', label:'Descripción', type:'text'}]}
                />}

                {activeTab === 'unidades' && <CrudModule title="Unidades de Medida" icon="fa-ruler-combined" data={units} setData={setUnits} idField="id_unidad"
                    columns={[{header:'Nombre', accessor:'nombre'}, {header:'Abrev.', accessor:'abreviatura'}]}
                    fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'abreviatura', label:'Abreviatura (ej: KG)', type:'text'}]}
                />}

                {activeTab === 'presentaciones' && <CrudModule title="Presentaciones" icon="fa-wine-bottle" data={presentations} setData={setPresentations} idField="id_presentacion"
                    columns={[{header:'Nombre', accessor:'nombre'}, {header:'Desc', accessor:'descripcion'}]}
                    fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'descripcion', label:'Descripción', type:'text'}]}
                />}

                {activeTab === 'usuarios' && <CrudModule title="Usuarios" icon="fa-user-shield" data={users} setData={setUsers} idField="id_usuario"
                    columns={[
                        {header: 'Usuario', accessor: 'nombre_usuario'},
                        {header: 'Nombre Completo', accessor: (row:any) => `${row.nombre} ${row.apellido}`},
                        {header: 'Rol', accessor: (row:any) => roles.find(r => r.id_rol === row.id_rol)?.nombre || 'Desconocido'}
                    ]}
                    fields={[
                        {name: 'nombre', label: 'Nombre', type: 'text'},
                        {name: 'apellido', label: 'Apellido', type: 'text'},
                        {name: 'nombre_usuario', label: 'Username', type: 'text'},
                        {name: 'password', label: 'Contraseña', type: 'password'},
                        {name: 'id_rol', label: 'Rol', type: 'select', options: roles.map(r => ({value: r.id_rol, label: r.nombre}))}
                    ]}
                />}

                {activeTab === 'roles' && <CrudModule title="Roles" icon="fa-key" data={roles} setData={setRoles} idField="id_rol"
                    columns={[{header:'Rol', accessor:'nombre'}, {header:'Desc', accessor:'descripcion'}]}
                    fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'descripcion', label:'Descripción', type:'text'}]}
                />}
                
                {activeTab === 'tipos_doc' && <CrudModule title="Tipos Documento" icon="fa-id-card" data={tipoDocs} setData={setTipoDocs} idField="id_tipo_documento"
                    columns={[{header:'Tipo', accessor:'nombre'}]}
                    fields={[{name:'nombre', label:'Nombre', type:'text'}]}
                />}

            </div>
        </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
