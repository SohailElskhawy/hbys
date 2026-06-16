import React, { useEffect } from 'react';

const AlertMessage = ({ message, type = 'danger', onClose }) => {
    useEffect(() => {
        if (onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className={`alert alert-${type} alert-dismissible fade show shadow-sm border-0`} role="alert">
            <div className="d-flex align-items-center gap-2">
                <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                <span>{message}</span>
            </div>
            {onClose && (
                <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            )}
        </div>
    );
};

export default AlertMessage;
