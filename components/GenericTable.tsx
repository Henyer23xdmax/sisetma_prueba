
import React, { useState } from 'react';

interface GenericTableProps {
    columns: { header: string, accessor: string | ((row: any) => any) }[];
    data: any[];
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    keyField?: string;
}

const GenericTable: React.FC<GenericTableProps> = ({ 
    columns, 
    data, 
    onEdit, 
    onDelete,
    keyField = 'id' 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Lógica de filtrado: Busca el término en cualquier valor de las columnas definidas
    const filteredData = data.filter(row => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        
        // Verificar en propiedades directas del objeto
        const inValues = Object.values(row).some(val => 
            String(val).toLowerCase().includes(lowerTerm)
        );
        
        // Si no se encuentra en valores directos, intentar con los accessors (para columnas calculadas)
        const inAccessors = columns.some(col => {
            if (typeof col.accessor === 'function') {
                const val = col.accessor(row);
                return String(val).toLowerCase().includes(lowerTerm);
            }
            return false;
        });

        return inValues || inAccessors;
    });

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 font-weight-bold text-primary">Listado de Registros</h6>
                <div className="input-group input-group-sm" style={{ width: '250px' }}>
                    <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-search text-gray-400"></i>
                    </span>
                    <input 
                        type="text" 
                        className="form-control border-start-0 bg-light" 
                        placeholder="Buscar en la tabla..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-dark">
                            <tr>
                                {columns.map((col, idx) => <th key={idx} className="py-3 small text-uppercase fw-bold text-muted border-0">{col.header}</th>)}
                                <th className="text-center py-3 small text-uppercase fw-bold text-muted border-0" style={{width: '120px'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="text-center text-muted py-5">
                                        <div className="mb-2"><i className="fas fa-inbox fa-3x opacity-25"></i></div>
                                        No se encontraron registros
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row, rowIdx) => (
                                    <tr key={row[keyField] || rowIdx}>
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className="py-3">
                                                {typeof col.accessor === 'function' 
                                                    ? col.accessor(row) 
                                                    : row[col.accessor]}
                                            </td>
                                        ))}
                                        <td className="text-center py-3">
                                            <button className="btn btn-sm btn-link text-primary p-1" onClick={() => onEdit(row)} title="Editar">
                                                <i className="fas fa-pen"></i>
                                            </button>
                                            <button className="btn btn-sm btn-link text-danger p-1" onClick={() => onDelete(row)} title="Eliminar">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card-footer bg-white py-2 small text-muted">
                Mostrando {filteredData.length} de {data.length} registros
            </div>
        </div>
    );
};

export default GenericTable;
