import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <nav className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
                Sayfa {currentPage} / {totalPages}
            </span>
            <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Önceki
                    </button>
                </li>
                {pages.map((p) => (
                    <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(p)}>
                            {p}
                        </button>
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Sonraki
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
