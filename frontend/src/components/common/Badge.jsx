import React from 'react';

const Badge = ({ text, variant = 'secondary' }) => {
    return (
        <span className={`badge bg-${variant} text-capitalize`}>
            {text}
        </span>
    );
};

export default Badge;
