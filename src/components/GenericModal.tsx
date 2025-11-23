
import React from 'react';

interface GenericModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
    children: React.ReactNode;
    size?: 'modal-sm' | 'modal-lg' | 'modal-xl';
}

const GenericModal: React.FC<GenericModalProps> = ({ title, isOpen, onClose, onSave, children, size }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                <div className={`modal-dialog ${size || ''} modal-dialog-centered`}>
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header bg-light">
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                            {onSave && (
                                <button type="button" className="btn btn-primary" onClick={onSave}>
                                    Guardar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
};

export default GenericModal;
