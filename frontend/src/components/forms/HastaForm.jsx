import React, { useState, useEffect } from 'react';
import { validateEmail, validateTc, validatePhone, validateRequired } from '../../utils/validators';

const HastaForm = ({ initialData, onSubmit, onCancel }) => {
    const isEdit = !!initialData;
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
        sifre: '',
        tc_kimlik: '',
        dogum_tarihi: '',
        cinsiyet: 'erkek',
        telefon: '',
        adres: '',
        kan_grubu: '',
        sigorta_no: '',
        aktif: 1
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                ad: initialData.ad || '',
                soyad: initialData.soyad || '',
                email: initialData.email || '',
                sifre: '',
                tc_kimlik: initialData.tc_kimlik || '',
                dogum_tarihi: initialData.dogum_tarihi ? initialData.dogum_tarihi.substring(0, 10) : '',
                cinsiyet: initialData.cinsiyet || 'erkek',
                telefon: initialData.telefon || '',
                adres: initialData.adres || '',
                kan_grubu: initialData.kan_grubu || '',
                sigorta_no: initialData.sigorta_no || '',
                aktif: initialData.aktif !== undefined ? initialData.aktif : 1
            });
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

        if (!validateRequired(formData.tc_kimlik)) {
            newErrors.tc_kimlik = 'TC Kimlik numarası zorunludur';
        } else if (!validateTc(formData.tc_kimlik)) {
            newErrors.tc_kimlik = 'TC Kimlik numarası 11 haneli olmalıdır';
        }

        if (!validateRequired(formData.dogum_tarihi)) {
            newErrors.dogum_tarihi = 'Doğum tarihi zorunludur';
        }

        if (!validateRequired(formData.telefon)) {
            newErrors.telefon = 'Telefon numarası zorunludur';
        } else if (!validatePhone(formData.telefon)) {
            newErrors.telefon = 'Geçersiz telefon numarası formatı';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const submitData = { ...formData };
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
                    <label className="form-label">TC Kimlik No</label>
                    <input
                        type="text"
                        name="tc_kimlik"
                        maxLength="11"
                        className={`form-control ${errors.tc_kimlik ? 'is-invalid' : ''}`}
                        value={formData.tc_kimlik}
                        onChange={handleChange}
                    />
                    {errors.tc_kimlik && <div className="invalid-feedback">{errors.tc_kimlik}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Doğum Tarihi</label>
                    <input
                        type="date"
                        name="dogum_tarihi"
                        className={`form-control ${errors.dogum_tarihi ? 'is-invalid' : ''}`}
                        value={formData.dogum_tarihi}
                        onChange={handleChange}
                    />
                    {errors.dogum_tarihi && <div className="invalid-feedback">{errors.dogum_tarihi}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Cinsiyet</label>
                    <select
                        name="cinsiyet"
                        className="form-select"
                        value={formData.cinsiyet}
                        onChange={handleChange}
                    >
                        <option value="erkek">Erkek</option>
                        <option value="kadin">Kadın</option>
                        <option value="diger">Diğer</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Telefon</label>
                    <input
                        type="text"
                        name="telefon"
                        placeholder="05xxxxxxxxx"
                        className={`form-control ${errors.telefon ? 'is-invalid' : ''}`}
                        value={formData.telefon}
                        onChange={handleChange}
                    />
                    {errors.telefon && <div className="invalid-feedback">{errors.telefon}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Kan Grubu</label>
                    <select
                        name="kan_grubu"
                        className="form-select"
                        value={formData.kan_grubu}
                        onChange={handleChange}
                    >
                        <option value="">Seçiniz</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="0+">0+</option>
                        <option value="0-">0-</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Sigorta Poliçe No</label>
                    <input
                        type="text"
                        name="sigorta_no"
                        className="form-control"
                        value={formData.sigorta_no}
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
                    <label className="form-label">Adres</label>
                    <textarea
                        name="adres"
                        rows="3"
                        className="form-control"
                        value={formData.adres}
                        onChange={handleChange}
                    ></textarea>
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

export default HastaForm;
