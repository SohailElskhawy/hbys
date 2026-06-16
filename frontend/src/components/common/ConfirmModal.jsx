import React from 'react';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <>
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button type="button" className="btn-close" onClick={onCancel}></button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-0">{message}</p>
                        </div>
                        <div className="modal-footer flex-nowrap p-0 border-top-0">
                            <button
                                type="button"
                                className="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0 border-end"
                                onClick={onCancel}
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                className="btn btn-lg btn-link fs-6 text-decoration-none col-6 py-3 m-0 rounded-0 text-danger fw-bold"
                                onClick={onConfirm}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
    );
};

export default ConfirmModal;
