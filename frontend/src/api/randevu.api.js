import axios from 'axios';

export const getRandevularApi = async (params = {}) => {
    const response = await axios.get('/api/randevular', { params });
    return response.data;
};

export const getRandevuByIdApi = async (id) => {
    const response = await axios.get(`/api/randevular/${id}`);
    return response.data;
};

export const createRandevuApi = async (data) => {
    const response = await axios.post('/api/randevular', data);
    return response.data;
};

export const updateRandevuApi = async (id, data) => {
    const response = await axios.put(`/api/randevular/${id}`, data);
    return response.data;
};

export const updateRandevuDurumApi = async (id, durum) => {
    const response = await axios.patch(`/api/randevular/${id}/durum`, { durum });
    return response.data;
};

export const deleteRandevuApi = async (id) => {
    const response = await axios.delete(`/api/randevular/${id}`);
    return response.data;
};
