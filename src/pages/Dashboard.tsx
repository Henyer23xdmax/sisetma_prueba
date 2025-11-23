
import React from 'react';

const Dashboard = ({ lotes, products }: any) => {
  const safeLotes = lotes || [];
  const stockTotal = safeLotes.reduce((acc:number, l:any) => acc + l.cantidad, 0);
  const valorTotal = safeLotes.reduce((acc:number, l:any) => acc + (l.cantidad * l.precioVenta), 0); // Usando precioVenta del lote
  
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
                    <div className="text-uppercase text-info fw-bold text-xs mb-1">Valorización (Venta)</div>
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

export default Dashboard;
