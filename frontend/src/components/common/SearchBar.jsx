import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Ara...' }) => {
    const [term, setTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(term);
        }, 400);

        return () => clearTimeout(timer);
    }, [term, onSearch]);

    return (
        <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
            </span>
            <input
                type="text"
                className="form-control border-start-0"
                placeholder={placeholder}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
