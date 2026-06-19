import React from 'react';

const Modal = ({ show, title, onClose, children }) => {
    if (!show) return null;
    return (
        <>
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1045 }}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
        </>
    );
};

export default Modal;
