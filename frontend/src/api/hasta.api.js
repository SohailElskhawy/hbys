import axios from 'axios';

export const getHastalarApi = async (page = 1, limit = 10, search = '') => {
    const response = await axios.get('/api/hastalar', {
        params: { page, limit, search }
    });
    return response.data;
};

export const getHastaByIdApi = async (id) => {
    const response = await axios.get(`/api/hastalar/${id}`);
    return response.data;
};

export const createHastaApi = async (data) => {
    const response = await axios.post('/api/hastalar', data);
    return response.data;
};

export const updateHastaApi = async (id, data) => {
    const response = await axios.put(`/api/hastalar/${id}`, data);
    return response.data;
};

export const deleteHastaApi = async (id) => {
    const response = await axios.delete(`/api/hastalar/${id}`);
    return response.data;
};

export const getHastaRandevularApi = async (id) => {
    const response = await axios.get(`/api/hastalar/${id}/randevular`);
    return response.data;
};
