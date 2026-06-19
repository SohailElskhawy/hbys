import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="d-flex justify-content-center align-items-center py-5 w-100" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Yukleniyor...</span>
            </div>
        </div>
    );
};

export default LoadingSpinner;
