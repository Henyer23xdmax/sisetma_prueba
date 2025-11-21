
import React from 'react';

interface GenericModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    children: React.ReactNode;
    size?: 'modal-sm' | 'modal-lg' | 'modal-xl';
}

const GenericModal: React.FC<GenericModalProps> = ({ title, isOpen, onClose, onSave, children, size = '' }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} tabIndex={-1}>
                <div className={`modal-dialog modal-dialog-centered ${size}`}>
                    <div className="modal-content border-0 shadow-lg overflow-hidden">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold"><i className="fas fa-layer-group me-2"></i>{title}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body bg-light p-4">
                            {children}
                        </div>
                        <div className="modal-footer bg-white">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
                            <button type="button" className="btn btn-primary shadow-sm px-4" onClick={onSave}>
                                <i className="fas fa-save me-2"></i>Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
};

export default GenericModal;
