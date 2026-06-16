import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { validateEmail, validateRequired } from '../../utils/validators';

const DAYS_OF_WEEK = [
    { key: 'Pazartesi', label: 'Pazartesi' },
    { key: 'Sali', label: 'Salı' },
    { key: 'Carsamba', label: 'Çarşamba' },
    { key: 'Persembe', label: 'Perşembe' },
    { key: 'Cuma', label: 'Cuma' },
    { key: 'Cumartesi', label: 'Cumartesi' },
    { key: 'Pazar', label: 'Pazar' }
];

const DoktorForm = ({ initialData, onSubmit, onCancel }) => {
    const isEdit = !!initialData;
    const [bolumler, setBolumler] = useState([]);
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
        sifre: '',
        bolum_id: '',
        uzmanlik: '',
        diploma_no: '',
        muayene_ucreti: '',
        biyografi: '',
        aktif: 1
    });

    const [schedule, setSchedule] = useState({
        Pazartesi: { active: true, start: '09:00', end: '17:00' },
        Sali: { active: true, start: '09:00', end: '17:00' },
        Carsamba: { active: true, start: '09:00', end: '17:00' },
        Persembe: { active: true, start: '09:00', end: '17:00' },
        Cuma: { active: true, start: '09:00', end: '17:00' },
        Cumartesi: { active: false, start: '09:00', end: '17:00' },
        Pazar: { active: false, start: '09:00', end: '17:00' }
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchBolumler = async () => {
            try {
                const res = await axios.get('/api/bolumler');
                setBolumler(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBolumler();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ad: initialData.ad || '',
                soyad: initialData.soyad || '',
                email: initialData.email || '',
                sifre: '',
                bolum_id: initialData.bolum_id || '',
                uzmanlik: initialData.uzmanlik || '',
                diploma_no: initialData.diploma_no || '',
                muayene_ucreti: initialData.muayene_ucreti || '',
                biyografi: initialData.biyografi || '',
                aktif: initialData.aktif !== undefined ? initialData.aktif : 1
            });

            if (initialData.calisma_saatleri) {
                const loadedSchedule = {
                    Pazartesi: { active: false, start: '09:00', end: '17:00' },
                    Sali: { active: false, start: '09:00', end: '17:00' },
                    Carsamba: { active: false, start: '09:00', end: '17:00' },
                    Persembe: { active: false, start: '09:00', end: '17:00' },
                    Cuma: { active: false, start: '09:00', end: '17:00' },
                    Cumartesi: { active: false, start: '09:00', end: '17:00' },
                    Pazar: { active: false, start: '09:00', end: '17:00' }
                };

                const calismaSaatleri = initialData.calisma_saatleri;
                Object.keys(calismaSaatleri).forEach(day => {
                    const times = calismaSaatleri[day];
                    if (Array.isArray(times) && times.length > 0) {
                        const [start, end] = times[0].split('-');
                        loadedSchedule[day] = {
                            active: true,
                            start: start || '09:00',
                            end: end || '17:00'
                        };
                    }
                });
                setSchedule(loadedSchedule);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'aktif' ? Number(value) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleScheduleCheck = (day) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                active: !prev[day].active
            }
        }));
    };

    const handleScheduleTimeChange = (day, type, value) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value
            }
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!validateRequired(formData.ad)) newErrors.ad = 'Ad alanı zorunludur';
        if (!validateRequired(formData.soyad)) newErrors.soyad = 'Soyad alanı zorunludur';
        
        if (!validateRequired(formData.email)) {
            newErrors.email = 'E-posta alanı zorunludur';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Geçersiz e-posta formatı';
        }

        if (!isEdit && !validateRequired(formData.sifre)) {
            newErrors.sifre = 'Şifre alanı zorunludur';
        }

        if (!validateRequired(formData.bolum_id)) newErrors.bolum_id = 'Bölüm seçimi zorunludur';
        if (!validateRequired(formData.uzmanlik)) newErrors.uzmanlik = 'Uzmanlık alanı zorunludur';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const calisma_saatleri = {};
        DAYS_OF_WEEK.forEach(day => {
            const daySched = schedule[day.key];
            if (daySched.active) {
                calisma_saatleri[day.key] = [`${daySched.start}-${daySched.end}`];
            }
        });

        const submitData = {
            ...formData,
            calisma_saatleri
        };

        if (isEdit && !submitData.sifre) {
            delete submitData.sifre;
        }

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleFormSubmit} className="needs-validation">
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Ad</label>
                    <input
                        type="text"
                        name="ad"
                        className={`form-control ${errors.ad ? 'is-invalid' : ''}`}
                        value={formData.ad}
                        onChange={handleChange}
                    />
                    {errors.ad && <div className="invalid-feedback">{errors.ad}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Soyad</label>
                    <input
                        type="text"
                        name="soyad"
                        className={`form-control ${errors.soyad ? 'is-invalid' : ''}`}
                        value={formData.soyad}
                        onChange={handleChange}
                    />
                    {errors.soyad && <div className="invalid-feedback">{errors.soyad}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">E-posta</label>
                    <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">{isEdit ? 'Şifre (Değiştirmek istemiyorsanız boş bırakın)' : 'Şifre'}</label>
                    <input
                        type="password"
                        name="sifre"
                        className={`form-control ${errors.sifre ? 'is-invalid' : ''}`}
                        value={formData.sifre}
                        onChange={handleChange}
                    />
                    {errors.sifre && <div className="invalid-feedback">{errors.sifre}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Bölüm</label>
                    <select
                        name="bolum_id"
                        className={`form-select ${errors.bolum_id ? 'is-invalid' : ''}`}
                        value={formData.bolum_id}
                        onChange={handleChange}
                    >
                        <option value="">Bölüm Seçiniz</option>
                        {bolumler.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.bolum_adi}
                            </option>
                        ))}
                    </select>
                    {errors.bolum_id && <div className="invalid-feedback">{errors.bolum_id}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Uzmanlık</label>
                    <input
                        type="text"
                        name="uzmanlik"
                        className={`form-control ${errors.uzmanlik ? 'is-invalid' : ''}`}
                        value={formData.uzmanlik}
                        onChange={handleChange}
                    />
                    {errors.uzmanlik && <div className="invalid-feedback">{errors.uzmanlik}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Diploma No</label>
                    <input
                        type="text"
                        name="diploma_no"
                        className="form-control"
                        value={formData.diploma_no}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Muayene Ücreti (TL)</label>
                    <input
                        type="number"
                        name="muayene_ucreti"
                        step="0.01"
                        className="form-control"
                        value={formData.muayene_ucreti}
                        onChange={handleChange}
                    />
                </div>

                {isEdit && (
                    <div className="col-md-12">
                        <label className="form-label">Durum</label>
                        <select
                            name="aktif"
                            className="form-select"
                            value={formData.aktif}
                            onChange={handleChange}
                        >
                            <option value={1}>Aktif</option>
                            <option value={0}>Pasif</option>
                        </select>
                    </div>
                )}

                <div className="col-md-12">
                    <label className="form-label">Biyografi</label>
                    <textarea
                        name="biyografi"
                        rows="3"
                        className="form-control"
                        value={formData.biyografi}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="col-md-12">
                    <label className="form-label fw-bold">Çalışma Saatleri</label>
                    <div className="card p-3 bg-light border-0">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day.key} className="row align-items-center mb-2 g-2">
                                <div className="col-sm-4 col-12">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`check-${day.key}`}
                                            checked={schedule[day.key].active}
                                            onChange={() => handleScheduleCheck(day.key)}
                                        />
                                        <label className="form-check-label" htmlFor={`check-${day.key}`}>
                                            {day.label}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-4 col-6">
                                    <input
                                        type="time"
                                        className="form-control form-control-sm"
                                        disabled={!schedule[day.key].active}
                                        value={schedule[day.key].start}
                                        onChange={(e) => handleScheduleTimeChange(day.key, 'start', e.target.value)}
                                    />
                                </div>
                                <div className="col-sm-4 col-6">
                                    <input
                                        type="time"
                                        className="form-control form-control-sm"
                                        disabled={!schedule[day.key].active}
                                        value={schedule[day.key].end}
                                        onChange={(e) => handleScheduleTimeChange(day.key, 'end', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    İptal
                </button>
                <button type="submit" className="btn btn-primary">
                    {isEdit ? 'Güncelle' : 'Kaydet'}
                </button>
            </div>
        </form>
    );
};

export default DoktorForm;
