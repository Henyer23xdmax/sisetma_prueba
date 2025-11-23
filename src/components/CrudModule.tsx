
import React, { useState } from 'react';
import GenericTable from './GenericTable';
import GenericModal from './GenericModal';

interface CrudModuleProps {
    title: string;
    icon: string;
    data: any[];
    idField: string;
    columns: any[];
    fields: any[];
    onSave: (item: any) => Promise<any>; // Retorna el item guardado
    onDelete: (id: number) => Promise<void>;
}

const CrudModule: React.FC<CrudModuleProps> = ({ title, icon, data, idField, columns, fields, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleAddNew = () => {
        const initialData: any = {};
        if (fields) {
            fields.forEach((f: any) => initialData[f.name] = '');
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

    const handleDeleteItem = async (item: any) => {
        if (confirm(`¿Eliminar registro?`)) {
            try {
                await onDelete(item[idField]);
            } catch (error: any) {
                alert("Error al eliminar: " + error.message);
            }
        }
    };

    const handleSaveItem = async () => {
        setIsLoading(true);
        try {
            const itemToSave = { ...formData };
            if (currentItem) {
                itemToSave[idField] = currentItem[idField];
            }
            await onSave(itemToSave);
            setIsModalOpen(false);
        } catch (error: any) {
            alert("Error al guardar: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="h3 mb-0 text-gray-800 fw-bold fs-4 fs-md-3"><i className={`fas ${icon} me-2 text-primary`}></i>{title}</h3>
                <button className="btn btn-primary shadow-sm rounded-pill px-3 px-md-4" onClick={handleAddNew}>
                    <i className="fas fa-plus me-2"></i><span className="d-none d-sm-inline">Nuevo</span>
                </button>
            </div>
            <GenericTable columns={columns} data={data} keyField={idField} onEdit={handleEdit} onDelete={handleDeleteItem} />
            <GenericModal title={currentItem ? `Editar` : `Nuevo`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem}>
                <form>
                    {fields && fields.map((field: any) => (
                        <div className="mb-3" key={field.name}>
                            <label className="form-label fw-bold small text-secondary">{field.label} {field.required && '*'}</label>
                            {field.type === 'select' ? (
                                <select
                                    className="form-select"
                                    value={formData[field.name] || ''}
                                    onChange={e => setFormData({ ...formData, [field.name]: Number(e.target.value) })}
                                >
                                    <option value="">Seleccione...</option>
                                    {field.options?.map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    className="form-control"
                                    value={formData[field.name] || ''}
                                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                />
                            )}
                        </div>
                    ))}
                </form>
            </GenericModal>
        </div>
    );
};

export default CrudModule;
