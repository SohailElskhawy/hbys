import axios from 'axios';

export const getBolumlerApi = async () => {
    const response = await axios.get('/api/bolumler');
    return response.data;
};

export const getBolumByIdApi = async (id) => {
    const response = await axios.get(`/api/bolumler/${id}`);
    return response.data;
};

export const createBolumApi = async (data) => {
    const response = await axios.post('/api/bolumler', data);
    return response.data;
};

export const updateBolumApi = async (id, data) => {
    const response = await axios.put(`/api/bolumler/${id}`, data);
    return response.data;
};

export const deleteBolumApi = async (id) => {
    const response = await axios.delete(`/api/bolumler/${id}`);
    return response.data;
};
