import axios from 'axios';

export const getDoktorlarApi = async (bolum_id = '') => {
    const response = await axios.get('/api/doktorlar', {
        params: { bolum_id }
    });
    return response.data;
};

export const getDoktorByIdApi = async (id) => {
    const response = await axios.get(`/api/doktorlar/${id}`);
    return response.data;
};

export const createDoktorApi = async (data) => {
    const response = await axios.post('/api/doktorlar', data);
    return response.data;
};

export const updateDoktorApi = async (id, data) => {
    const response = await axios.put(`/api/doktorlar/${id}`, data);
    return response.data;
};

export const deleteDoktorApi = async (id) => {
    const response = await axios.delete(`/api/doktorlar/${id}`);
    return response.data;
};

export const getDoktorRandevularApi = async (id) => {
    const response = await axios.get(`/api/doktorlar/${id}/randevular`);
    return response.data;
};

export const getDoktorMusaitSaatlerApi = async (id, tarih) => {
    const response = await axios.get(`/api/doktorlar/${id}/musaitsaatler`, {
        params: { tarih }
    });
    return response.data;
};
