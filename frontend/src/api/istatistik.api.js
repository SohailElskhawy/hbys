import axios from 'axios';

export const getGenelIstatistiklerApi = async () => {
    const response = await axios.get('/api/istatistikler/genel');
    return response.data;
};

export const getDoktorYukuApi = async () => {
    const response = await axios.get('/api/istatistikler/doktor-yuku');
    return response.data;
};

export const getAktifHastalarApi = async () => {
    const response = await axios.get('/api/istatistikler/aktif-hastalar');
    return response.data;
};

export const getMusaitDoktorlarApi = async (tarih, saat) => {
    const response = await axios.get('/api/istatistikler/musaitdoktorlar', {
        params: { tarih, saat }
    });
    return response.data;
};
