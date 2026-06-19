import React from 'react';

const DataTable = ({ columns, data, isLoading, emptyMessage = 'Kayıt bulunamadı.' }) => {
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="alert alert-info text-center my-4">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle border">
                <thead className="table-light">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={col.style}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
