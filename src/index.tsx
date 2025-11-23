import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Producto, Categoria, Marca, UnidadMedida, Presentacion, Lote, Cliente, Proveedor, Rol, TipoDocumento, Subcategoria, Usuario } from './types';
import { productService } from './services/productService';
import { api } from './services/api';

// Components
import Sidebar from './components/Sidebar';
// import GenericTable from './components/GenericTable'; // Removed unused import
import CrudModule from './components/CrudModule';
import GenericModal from './components/GenericModal';

// Pages
import POS from './pages/POS';
import Compras from './pages/Compras';
import Dashboard from './pages/Dashboard';

const API_URL = 'http://localhost:8080/api';

// --- 1. PANTALLA DE LOGIN (Local por ahora) ---
const LoginScreen = ({ users, onLoginSuccess }: { users: Usuario[], onLoginSuccess: (user: Usuario) => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí podrías conectar con un endpoint real /api/login si lo creas
        const userFound = users.find(u => u.nombreUsuario === username.trim() && u.password === password.trim());

        if (!userFound && username === 'admin' && password === 'admin') {
            onLoginSuccess({ idUsuario: 1, nombre: 'Admin', apellido: 'Sistema', nombreUsuario: 'admin', idRol: 1, password: 'admin' });
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
    const [roles, setRoles] = useState<Rol[]>([]);
    const [tipoDocs, setTipoDocs] = useState<TipoDocumento[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
    const [users, setUsers] = useState<Usuario[]>([]);

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
                const err = await res.text();
                alert("Error al guardar en servidor: " + err);
            }
        } catch (e) { console.error(e); }
    };

    // --- FUNCIÓN DE CARGA DE DATOS ---
    const fetchAllData = async () => {
        try {
            const [
                prodRes,
                catRes,
                brandRes,
                unitRes,
                presRes,
                clientRes,
                suppRes,
                loteRes,
                roleRes,
                tipoDocRes,
                subcatRes,
                userRes
            ] = await Promise.all([
                productService.getAll(),
                productService.getCategorias(),
                productService.getMarcas(),
                productService.getUnidades(),
                productService.getPresentaciones(),
                api.get('/clientes'),
                api.get('/proveedores'),
                api.get('/lotes'),
                api.get('/roles'),
                api.get('/tipos-documento'),
                api.get('/subcategorias'),
                api.get('/usuarios')
            ]);
            console.log('Datos cargados', { prodRes, catRes, brandRes, unitRes, presRes, clientRes, suppRes, loteRes, roleRes, tipoDocRes, subcatRes, userRes });
            setProducts(prodRes);
            setCategories(catRes);
            setBrands(brandRes);
            setUnits(unitRes);
            setPresentations(presRes);
            setClients(clientRes);
            setSuppliers(suppRes);
            setLotes(loteRes);
            setRoles(roleRes);
            setTipoDocs(tipoDocRes);
            setSubcategories(subcatRes);
            setUsers(userRes);
        } catch (error) {
            console.error('Error cargando datos del backend:', error);
        }
    };

    const handleGenericDelete = async (endpoint: string, id: number) => {
        try {
            await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
            fetchAllData();
        } catch (e) { console.error(e); }
    };

    // Load data when user logs in
    useEffect(() => {
        if (currentUser) {
            fetchAllData();
        }
    }, [currentUser]);

    // --- TRANSFORMADORES PARA GUARDAR (React -> Java) ---

    const saveProduct = (formData: any, id: number | null) => {
        // Convertimos ids planos a objetos para Java
        const payload = {
            nombre: formData.nombre,
            categoria: { idCategoria: formData.idCategoria },
            marca: { idMarca: formData.idMarca },
            unidadMedida: { idUnidad: formData.idUnidad },
            presentacion: { idPresentacion: formData.idPresentacion },
            precioReferencia: formData.precioReferencia || 0,
            estado: true
        };
        handleGenericSave('productos', payload, id, 'idProducto');
    };

    const saveClient = (formData: any, id: number | null) => {
        const payload = {
            nombre: formData.nombre, apellidos: formData.apellidos,
            nroDocumento: formData.nroDocumento, direccion: formData.direccion, celular: formData.celular, estado: true
        };
        handleGenericSave('clientes', payload, id, 'idCliente');
    };

    // Wrappers Simples
    const saveCat = (d: any, id: any) => handleGenericSave('categorias', { nombre: d.nombre }, id, 'idCategoria');
    const saveBrand = (d: any, id: any) => handleGenericSave('marcas', { nombre: d.nombre, descripcion: d.descripcion }, id, 'idMarca');
    const saveUnit = (d: any, id: any) => handleGenericSave('unidades-medida', { nombre: d.nombre, abreviatura: d.abreviatura }, id, 'idUnidad');
    const savePres = (d: any, id: any) => handleGenericSave('presentaciones', { nombre: d.nombre, descripcion: d.descripcion }, id, 'idPresentacion');
    const saveSubcat = (d: any, id: any) => handleGenericSave('subcategorias', { nombre: d.nombre, categoria: { idCategoria: d.idCategoria } }, id, 'idSubcategoria');
    const saveUser = (d: any, id: any) => handleGenericSave('usuarios', { nombre: d.nombre, apellido: d.apellido, nombreUsuario: d.nombreUsuario, password: d.password, idRol: d.idRol }, id, 'idUsuario');
    const saveRole = (d: any, id: any) => handleGenericSave('roles', { nombre: d.nombre, descripcion: d.descripcion }, id, 'idRol');
    const saveTipoDoc = (d: any, id: any) => handleGenericSave('tipos-documento', { nombre: d.nombre }, id, 'idTipoDocumento');

    const handleLogout = () => { if (confirm("¿Salir?")) setCurrentUser(null); };

    // Mock login for now if no users loaded yet
    if (!currentUser) return <LoginScreen users={users.length > 0 ? users : [{ idUsuario: 1, nombre: 'Admin', apellido: 'Sys', nombreUsuario: 'admin', password: 'admin', idRol: 1 }]} onLoginSuccess={setCurrentUser} />;

    return (
        <div className="app-container">
            <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} currentUser={currentUser} onLogout={handleLogout} />

            <div className="main-content">
                <div className="d-lg-none bg-white shadow-sm p-2 d-flex align-items-center justify-content-between sticky-top" style={{ zIndex: 1020 }}>
                    <button className="btn btn-light text-primary" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars fa-lg"></i></button>
                    <span className="fw-bold text-primary">FAST POS</span>
                </div>

                <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fc' }}>
                    {activeTab === 'dashboard' && <Dashboard lotes={lotes} products={products} />}

                    {activeTab === 'pos' && <POS products={products} lotes={lotes} onSaleSuccess={fetchAllData} clients={clients} categories={categories} brands={brands} />}
                    {activeTab === 'compras' && <Compras products={products} suppliers={suppliers} onPurchaseSuccess={fetchAllData} />}

                    {/* MANTENIMIENTOS CONECTADOS A API */}
                    {activeTab === 'productos' && <CrudModule title="Productos" icon="fa-box" data={products} onSave={saveProduct} onDelete={(d: any) => handleGenericDelete('productos', d.idProducto)} idField="idProducto"
                        columns={[{ header: 'Nombre', accessor: 'nombre' }, { header: 'Marca', accessor: (r: any) => r.marca?.nombre || '-' }, { header: 'Precio Ref.', accessor: (r: any) => r.precioReferencia }]}
                        fields={[{ name: 'nombre', label: 'Nombre', type: 'text', required: true }, { name: 'idCategoria', label: 'Categoría', type: 'select', options: categories.map(c => ({ value: c.idCategoria, label: c.nombre })) }, { name: 'idMarca', label: 'Marca', type: 'select', options: brands.map(b => ({ value: b.idMarca, label: b.nombre })) }, { name: 'idUnidad', label: 'Unidad', type: 'select', options: units.map(u => ({ value: u.idUnidad, label: u.nombre })) }, { name: 'idPresentacion', label: 'Presentación', type: 'select', options: presentations.map(p => ({ value: p.idPresentacion, label: p.nombre })) }, { name: 'precioReferencia', label: 'Precio Ref.', type: 'number' }]}
                    />}

                    {activeTab === 'clientes' && <CrudModule title="Clientes" icon="fa-users" data={clients} onSave={saveClient} onDelete={(d: any) => handleGenericDelete('clientes', d.idCliente)} idField="idCliente"
                        columns={[{ header: 'Nombre', accessor: 'nombre' }, { header: 'DNI', accessor: 'nroDocumento' }]}
                        fields={[{ name: 'nombre', label: 'Nombre', type: 'text' }, { name: 'apellidos', label: 'Apellidos', type: 'text' }, { name: 'nroDocumento', label: 'DNI', type: 'text' }, { name: 'direccion', label: 'Dirección', type: 'text' }, { name: 'celular', label: 'Celular', type: 'text' }]}
                    />}

                    {activeTab === 'categorias' && <CrudModule title="Categorías" icon="fa-layer-group" data={categories} onSave={saveCat} onDelete={(d: any) => handleGenericDelete('categorias', d.idCategoria)} idField="idCategoria" columns={[{ header: 'Nombre', accessor: 'nombre' }]} fields={[{ name: 'nombre', label: 'Nombre', type: 'text' }]} />}

                    {activeTab === 'marcas' && <CrudModule title="Marcas" icon="fa-copyright" data={brands} onSave={saveBrand} onDelete={(d: any) => handleGenericDelete('marcas', d.idMarca)} idField="idMarca" columns={[{ header: 'Nombre', accessor: 'nombre' }, { header: 'Desc', accessor: 'descripcion' }]} fields={[{ name: 'nombre', label: 'Nombre', type: 'text' }, { name: 'descripcion', label: 'Descripción', type: 'text' }]} />}

                    {activeTab === 'unidades' && <CrudModule title="Unidades" icon="fa-ruler" data={units} onSave={saveUnit} onDelete={(d: any) => handleGenericDelete('unidades-medida', d.idUnidad)} idField="idUnidad" columns={[{ header: 'Nombre', accessor: 'nombre' }, { header: 'Abrev', accessor: 'abreviatura' }]} fields={[{ name: 'nombre', label: 'Nombre', type: 'text' }, { name: 'abreviatura', label: 'Abrev', type: 'text' }]} />}

                    {activeTab === 'presentaciones' && <CrudModule title="Presentaciones" icon="fa-wine-bottle" data={presentations} onSave={savePres} onDelete={(d: any) => handleGenericDelete('presentaciones', d.idPresentacion)} idField="idPresentacion" columns={[{ header: 'Nombre', accessor: 'nombre' }]} fields={[{ name: 'nombre', label: 'Nombre', type: 'text' }, { name: 'descripcion', label: 'Desc', type: 'text' }]} />}

                    {activeTab === 'subcategorias' && <CrudModule title="Subcategorías" icon="fa-tags" data={subcategories} onSave={saveSubcat} onDelete={(d: any) => handleGenericDelete('subcategorias', d.idSubcategoria)} idField="idSubcategoria"
                        columns={[
                            { header: 'Nombre', accessor: 'nombre' },
                            { header: 'Categoría Padre', accessor: (row: any) => categories.find(c => c.idCategoria === row.idCategoria)?.nombre || '-' }
                        ]}
                        fields={[
                            { name: 'nombre', label: 'Nombre Subcategoría', type: 'text' },
                            { name: 'idCategoria', label: 'Categoría Padre', type: 'select', options: categories.map(c => ({ value: c.idCategoria, label: c.nombre })) }
                        ]}
                    />}

                    {activeTab === 'usuarios' && <CrudModule title="Usuarios" icon="fa-user-shield" data={users} onSave={saveUser} onDelete={(d: any) => handleGenericDelete('usuarios', d.idUsuario)} idField="idUsuario"
                        columns={[
                            { header: 'Usuario', accessor: 'nombreUsuario' },
                            { header: 'Nombre Completo', accessor: (row: any) => `${row.nombre} ${row.apellido}` },
                            { header: 'Rol', accessor: (row: any) => roles.find(r => r.idRol === row.idRol)?.nombre || 'Desconocido' }
                        ]}
                        fields={[
                            { name: 'nombre', label: 'Nombre', type: 'text' },
                            { name: 'apellido', label: 'Apellido', type: 'text' },
                            { name: 'nombreUsuario', label: 'Username', type: 'text' },
                            { name: 'password', label: 'Contraseña', type: 'password' },
                            { name: 'idRol', label: 'Rol', type: 'select', options: roles.map(r => ({ value: r.idRol, label: r.nombre })) }
                        ]}
                    />}

                    {activeTab === 'proveedores' && <CrudModule title="Proveedores" icon="fa-truck" data={suppliers} onSave={(d: any, id: any) => handleGenericSave('proveedores', d, id, 'idProveedor')} onDelete={(d: any) => handleGenericDelete('proveedores', d.idProveedor)} idField="idProveedor"
                        columns={[{ header: 'Razón Social', accessor: 'razonSocial' }, { header: 'RUC', accessor: 'ruc' }]}
                        fields={[{ name: 'razonSocial', label: 'Razón Social', type: 'text' }, { name: 'ruc', label: 'RUC', type: 'text' }, { name: 'direccion', label: 'Dirección', type: 'text' }, { name: 'telefono', label: 'Teléfono', type: 'text' }, { name: 'correo', label: 'Correo', type: 'text' }]}
                    />}

                    {activeTab === 'otros_maestros' && (
                        <div className="row g-0">
                            <div className="col-12 border-bottom">
                                <CrudModule title="Roles" icon="fa-key" data={roles} onSave={saveRole} onDelete={(d: any) => handleGenericDelete('roles', d.idRol)} idField="idRol"
                                    columns={[{ header: 'Rol', accessor: 'nombre' }, { header: 'Desc', accessor: 'descripcion' }]}
                                    fields={[{ name: 'nombre', label: 'Nombre', type: 'text' }, { name: 'descripcion', label: 'Descripción', type: 'text' }]}
                                />
                            </div>
                            <div className="col-12 border-bottom">
                                <CrudModule title="Tipos Documento" icon="fa-id-card" data={tipoDocs} onSave={saveTipoDoc} onDelete={(d: any) => handleGenericDelete('tipos-documento', d.idTipoDocumento)} idField="idTipoDocumento"
                                    columns={[{ header: 'Tipo', accessor: 'nombre' }]}
                                    fields={[{ name: 'nombre', label: 'Nombre', type: 'text' }]}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
