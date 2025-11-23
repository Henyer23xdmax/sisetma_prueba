
import React from 'react';

interface Column {
    header: string;
    accessor: string | ((row: any) => any);
}

interface GenericTableProps {
    columns: Column[];
    data: any[];
    keyField: string;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

const GenericTable: React.FC<GenericTableProps> = ({ columns, data, keyField, onEdit, onDelete }) => {
    return (
        <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover mb-0 align-middle bg-white">
                <thead className="bg-light text-secondary small text-uppercase">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="py-3 border-bottom-0">{col.header}</th>
                        ))}
                        {(onEdit || onDelete) && <th className="text-end py-3 border-bottom-0">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-5 text-muted">
                                No hay registros para mostrar
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={row[keyField]}>
                                {columns.map((col, idx) => (
                                    <td key={idx}>
                                        {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="text-end">
                                        {onEdit && (
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(row)}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(row)}>
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default GenericTable;
