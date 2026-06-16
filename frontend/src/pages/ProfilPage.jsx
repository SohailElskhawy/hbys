import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import AlertMessage from '../components/common/AlertMessage';
import { useAuth } from '../hooks/useAuth';
import { changePasswordApi } from '../api/auth.api';
import { getHastaByIdApi, updateHastaApi } from '../api/hasta.api';
import { getDoktorByIdApi, updateDoktorApi } from '../api/doktor.api';

const ProfilPage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [personalInfo, setPersonalInfo] = useState({
        ad: '',
        soyad: '',
        email: '',
        telefon: '',
        adres: '',
        biyografi: ''
    });

    const [passwordData, setPasswordData] = useState({
        mevcutSifre: '',
        yeniSifre: '',
        yeniSifreTekrar: ''
    });

    const [alert, setAlert] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user || !user.profile_id) {
                setPersonalInfo({
                    ad: user?.ad || '',
                    soyad: user?.soyad || '',
                    email: user?.email || '',
                    telefon: '',
                    adres: '',
                    biyografi: ''
                });
                return;
            }

            try {
                if (user.rol === 'hasta') {
                    const data = await getHastaByIdApi(user.profile_id);
                    setProfileData(data);
                    setPersonalInfo({
                        ad: data.ad || '',
                        soyad: data.soyad || '',
                        email: data.email || '',
                        telefon: data.telefon || '',
                        adres: data.adres || '',
                        biyografi: ''
                    });
                } else if (user.rol === 'doktor') {
                    const data = await getDoktorByIdApi(user.profile_id);
                    setProfileData(data);
                    setPersonalInfo({
                        ad: data.ad || '',
                        soyad: data.soyad || '',
                        email: data.email || '',
                        telefon: '',
                        adres: '',
                        biyografi: data.biyografi || ''
                    });
                }
            } catch (err) {
                setAlert({ message: 'Profil bilgileri yüklenemedi.', type: 'danger' });
            }
        };

        loadProfile();
    }, [user]);

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        if (!personalInfo.ad || !personalInfo.soyad) {
            setAlert({ message: 'Ad ve Soyad alanları zorunludur.', type: 'danger' });
            return;
        }

        setIsLoading(true);
        try {
            if (user.rol === 'hasta') {
                const updatedPayload = {
                    ...profileData,
                    ad: personalInfo.ad,
                    soyad: personalInfo.soyad,
                    email: personalInfo.email,
                    telefon: personalInfo.telefon,
                    adres: personalInfo.adres
                };
                await updateHastaApi(user.profile_id, updatedPayload);
            } else if (user.rol === 'doktor') {
                const updatedPayload = {
                    ...profileData,
                    ad: personalInfo.ad,
                    soyad: personalInfo.soyad,
                    email: personalInfo.email,
                    biyografi: personalInfo.biyografi
                };
                await updateDoktorApi(user.profile_id, updatedPayload);
            }
            setAlert({ message: 'Profil bilgileri başarıyla güncellendi.', type: 'success' });
        } catch (err) {
            setAlert({ message: 'Bilgiler güncellenirken bir hata oluştu.', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const { mevcutSifre, yeniSifre, yeniSifreTekrar } = passwordData;

        if (!mevcutSifre || !yeniSifre || !yeniSifreTekrar) {
            setAlert({ message: 'Tüm şifre alanları doldurulmalıdır.', type: 'danger' });
            return;
        }

        if (yeniSifre !== yeniSifreTekrar) {
            setAlert({ message: 'Yeni şifreler eşleşmiyor.', type: 'danger' });
            return;
        }

        setIsLoading(true);
        try {
            await changePasswordApi(mevcutSifre, yeniSifre);
            setAlert({ message: 'Şifreniz başarıyla güncellendi.', type: 'success' });
            setPasswordData({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.';
            setAlert({ message: errMsg, type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="container-fluid p-0" style={{ maxWidth: '800px' }}>
                {alert.message && (
                    <AlertMessage
                        message={alert.message}
                        type={alert.type}
                        onClose={() => setAlert({ message: '', type: '' })}
                    />
                )}

                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center" style={{ width: '72px', height: '72px' }}>
                                <i className="bi bi-person-fill fs-1"></i>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1">{personalInfo.ad} {personalInfo.soyad}</h4>
                                <p className="text-muted text-capitalize mb-0">Rol: {user?.rol}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {(user?.rol === 'hasta' || user?.rol === 'doktor') && (
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Kişisel Bilgiler</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleInfoSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Ad</label>
                                        <input
                                            type="text"
                                            name="ad"
                                            className="form-control"
                                            value={personalInfo.ad}
                                            onChange={handleInfoChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Soyad</label>
                                        <input
                                            type="text"
                                            name="soyad"
                                            className="form-control"
                                            value={personalInfo.soyad}
                                            onChange={handleInfoChange}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label">E-posta</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            value={personalInfo.email}
                                            disabled
                                        />
                                    </div>
                                    {user.rol === 'hasta' && (
                                        <>
                                            <div className="col-md-12">
                                                <label className="form-label">Telefon</label>
                                                <input
                                                    type="text"
                                                    name="telefon"
                                                    className="form-control"
                                                    value={personalInfo.telefon}
                                                    onChange={handleInfoChange}
                                                />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label">Adres</label>
                                                <textarea
                                                    name="adres"
                                                    rows="3"
                                                    className="form-control"
                                                    value={personalInfo.adres}
                                                    onChange={handleInfoChange}
                                                ></textarea>
                                            </div>
                                        </>
                                    )}
                                    {user.rol === 'doktor' && (
                                        <div className="col-md-12">
                                            <label className="form-label">Biyografi</label>
                                            <textarea
                                                name="biyografi"
                                                rows="3"
                                                className="form-control"
                                                value={personalInfo.biyografi}
                                                onChange={handleInfoChange}
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 text-end">
                                    <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>
                                        Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold">Şifre Değiştir</h5>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label">Mevcut Şifre</label>
                                    <input
                                        type="password"
                                        name="mevcutSifre"
                                        className="form-control"
                                        value={passwordData.mevcutSifre}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        name="yeniSifre"
                                        className="form-control"
                                        value={passwordData.yeniSifre}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Yeni Şifre Tekrar</label>
                                    <input
                                        type="password"
                                        name="yeniSifreTekrar"
                                        className="form-control"
                                        value={passwordData.yeniSifreTekrar}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 text-end">
                                <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>
                                    Güncelle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfilPage;