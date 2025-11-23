
import React from 'react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
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
                        <i className="fas fa-tachometer-alt me-2" style={{ width: '20px' }}></i> Dashboard
                    </a>
                </li>
                <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Operaciones</li>
                <li>
                    <a href="#" className={`nav-link text-white ${activeTab === 'pos' ? 'active bg-success' : ''}`} onClick={(e) => handleNav(e, 'pos')}>
                        <i className="fas fa-cash-register me-2" style={{ width: '20px' }}></i> Punto de Venta
                    </a>
                </li>
                <li>
                    <a href="#" className={`nav-link text-white ${activeTab === 'compras' ? 'active bg-primary' : ''}`} onClick={(e) => handleNav(e, 'compras')}>
                        <i className="fas fa-shopping-bag me-2" style={{ width: '20px' }}></i> Compras
                    </a>
                </li>
                <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Maestros</li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'productos' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'productos')}><i className="fas fa-box me-2" style={{ width: '20px' }}></i> Productos</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'clientes' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'clientes')}><i className="fas fa-users me-2" style={{ width: '20px' }}></i> Clientes</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'proveedores' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'proveedores')}><i className="fas fa-truck me-2" style={{ width: '20px' }}></i> Proveedores</a></li>

                <li className="nav-item mt-3 mb-1 text-uppercase text-white-50 small fw-bold ps-2">Configuración</li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'usuarios')}><i className="fas fa-user-shield me-2" style={{ width: '20px' }}></i> Usuarios</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'subcategorias' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'subcategorias')}><i className="fas fa-tags me-2" style={{ width: '20px' }}></i> Subcategorías</a></li>
                <li><a href="#" className={`nav-link text-white ${activeTab === 'otros_maestros' ? 'active' : ''}`} onClick={(e) => handleNav(e, 'otros_maestros')}><i className="fas fa-cogs me-2" style={{ width: '20px' }}></i> Tablas Base</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;
