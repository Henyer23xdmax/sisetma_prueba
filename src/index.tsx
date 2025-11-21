
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

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }: any) => {
    const handleNav = (e: React.MouseEvent, tab: string) => {
        e.preventDefault();
        setActiveTab(tab);
        if (window.innerWidth <= 992) {
            toggleSidebar();
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'show' : ''} d-flex flex-column flex-shrink-0 p-3 text-white`}>
            <div className="d-flex align-items-center justify-content-between mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4 fw-bold d-flex align-items-center">
                    <i className="fas fa-bolt text-warning me-2"></i>FAST POS
                </span>
                <button className="btn text-white d-lg-none" onClick={toggleSidebar}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <hr />
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
                <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Maestros</li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'productos' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'productos')}><i className="fas fa-box me-2" style={{width: '20px'}}></i> Productos</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'clientes' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'clientes')}><i className="fas fa-users me-2" style={{width: '20px'}}></i> Clientes</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'proveedores' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'proveedores')}><i className="fas fa-truck me-2" style={{width: '20px'}}></i> Proveedores</a></li>
                
                <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Configuración</li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'usuarios')}><i className="fas fa-user-shield me-2" style={{width: '20px'}}></i> Usuarios</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'subcategorias' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'subcategorias')}><i className="fas fa-tags me-2" style={{width: '20px'}}></i> Subcategorías</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'otros_maestros' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'otros_maestros')}><i className="fas fa-cogs me-2" style={{width: '20px'}}></i> Tablas Base</a></li>
            </ul>
        </div>
    );
};

// --- MAIN APP ---

const App = () => {
  const [activeTab, setActiveTab] = useState('pos');
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

  const handleConfirmPurchase = (newBatches: Lote[]) => {
      const nextIdStart = lotes.length > 0 ? Math.max(...lotes.map(l => l.id_lote), 0) + 1 : 1;
      const batchesWithIds = newBatches.map((b, idx) => ({ ...b, id_lote: nextIdStart + idx }));
      setLotes([...lotes, ...batchesWithIds]);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-container">
        <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="main-content">
            <div className="d-lg-none bg-white shadow-sm p-2 d-flex align-items-center justify-content-between sticky-top" style={{zIndex: 1020}}>
                <button className="btn btn-light text-primary" onClick={toggleSidebar}>
                    <i className="fas fa-bars fa-lg"></i>
                </button>
                <span className="fw-bold text-primary">FAST POS</span>
                <div style={{width: '40px'}}></div>
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

                {activeTab === 'productos' && (
                    <div className="container-fluid p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                             <h3 className="h3 mb-0 text-gray-800 fw-bold fs-4"><i className="fas fa-box me-2 text-primary"></i>Productos</h3>
                        </div>
                        <div className="alert alert-info shadow-sm border-0">
                            <i className="fas fa-info-circle me-2"></i> Gestión visual completa en <strong>Punto de Venta</strong>.
                        </div>
                        <GenericTable 
                            columns={[
                                {header: 'Nombre', accessor: 'nombre'}, 
                                {header: 'Ref. Price', accessor: (row:any) => `S/. ${row.precio_referencia.toFixed(2)}`}
                            ]}
                            data={products}
                            keyField="id_producto"
                            onEdit={() => {}}
                            onDelete={() => {}}
                        />
                    </div>
                )}

                {/* --- NUEVOS MÓDULOS CRUD --- */}

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

                {activeTab === 'otros_maestros' && (
                    <div className="row g-0">
                        <div className="col-12 border-bottom">
                             <CrudModule title="Roles" icon="fa-key" data={roles} setData={setRoles} idField="id_rol"
                                columns={[{header:'Rol', accessor:'nombre'}, {header:'Desc', accessor:'descripcion'}]}
                                fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'descripcion', label:'Descripción', type:'text'}]}
                            />
                        </div>
                        <div className="col-12 border-bottom">
                             <CrudModule title="Tipos Documento" icon="fa-id-card" data={tipoDocs} setData={setTipoDocs} idField="id_tipo_documento"
                                columns={[{header:'Tipo', accessor:'nombre'}]}
                                fields={[{name:'nombre', label:'Nombre', type:'text'}]}
                            />
                        </div>
                        <div className="col-12">
                             <CrudModule title="Marcas" icon="fa-copyright" data={brands} setData={setBrands} idField="id_marca"
                                columns={[{header:'Marca', accessor:'nombre'}, {header:'Desc', accessor:'descripcion'}]}
                                fields={[{name:'nombre', label:'Nombre', type:'text'}, {name:'descripcion', label:'Descripción', type:'text'}]}
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
