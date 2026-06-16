export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validateTc = (tc) => {
    const re = /^[1-9]\d{10}$/;
    return re.test(String(tc));
};

export const validatePhone = (phone) => {
    const re = /^[0]?[5]\d{9}$/;
    return re.test(String(phone).replace(/\s+/g, ''));
};

export const validateRequired = (value) => {
    if (value === null || value === undefined) return false;
    return String(value).trim() !== '';
};
