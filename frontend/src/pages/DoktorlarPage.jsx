import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MainLayout } from '../components/layout';
import SearchBar from '../components/common/SearchBar';
import ConfirmModal from '../components/common/ConfirmModal';
import AlertMessage from '../components/common/AlertMessage';
import Badge from '../components/common/Badge';
import DoktorForm from '../components/forms/DoktorForm';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import {
    getDoktorlarApi,
    createDoktorApi,
    updateDoktorApi,
    deleteDoktorApi,
    getDoktorRandevularApi
} from '../api/doktor.api';

const Modal = ({ show, title, onClose, children }) => {
    if (!show) return null;
    return (
        <>
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1045 }}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
        </>
    );
};

const DoktorlarPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';
    const isPatient = user?.rol === 'hasta';
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [bolumler, setBolumler] = useState([]);
    const [selectedBolumId, setSelectedBolumId] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [alert, setAlert] = useState({ message: '', type: '' });
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

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

    const fetchDoctors = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDoktorlarApi(selectedBolumId);
            setDoctors(data);
        } catch (err) {
            setAlert({ message: 'Doktorlar yüklenirken hata oluştu.', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    }, [selectedBolumId]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    useEffect(() => {
        const handleNavbarAction = () => {
            if (isAdmin) {
                setSelectedDoctor(null);
                setShowFormModal(true);
            }
        };
        window.addEventListener('navbar-action-click', handleNavbarAction);
        return () => window.removeEventListener('navbar-action-click', handleNavbarAction);
    }, [isAdmin]);

    const handleSearch = (term) => {
        setSearch(term.toLowerCase());
    };

    const handleAddClick = () => {
        setSelectedDoctor(null);
        setShowFormModal(true);
    };

    const handleEditClick = (e, doctor) => {
        e.stopPropagation();
        setSelectedDoctor(doctor);
        setShowFormModal(true);
    };

    const handleDeleteClick = (e, doctor) => {
        e.stopPropagation();
        setSelectedDoctor(doctor);
        setShowDeleteModal(true);
    };

    const handleDetailClick = async (doctor) => {
        setSelectedDoctor(doctor);
        setShowDetailModal(true);
        setIsLoadingAppointments(true);
        try {
            const data = await getDoktorRandevularApi(doctor.id);
            setDoctorAppointments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedDoctor) {
                await updateDoktorApi(selectedDoctor.id, formData);
                setAlert({ message: 'Doktor başarıyla güncellendi.', type: 'success' });
            } else {
                await createDoktorApi(formData);
                setAlert({ message: 'Doktor başarıyla oluşturuldu.', type: 'success' });
            }
            setShowFormModal(false);
            fetchDoctors();
        } catch (err) {
            const errMsg = err.response?.data?.message || 'İşlem sırasında bir hata oluştu.';
            setAlert({ message: errMsg, type: 'danger' });
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteDoktorApi(selectedDoctor.id);
            setAlert({ message: 'Doktor başarıyla silindi.', type: 'success' });
            setShowDeleteModal(false);
            fetchDoctors();
        } catch (err) {
            setAlert({ message: 'Doktor silinirken hata oluştu.', type: 'danger' });
        }
    };

    const formatWorkingHours = (calismaSaatleri) => {
        if (!calismaSaatleri || Object.keys(calismaSaatleri).length === 0) return 'Çalışma saati girilmemiş';
        const dayShortNames = {
            Pazartesi: 'Pzt',
            Sali: 'Sal',
            Carsamba: 'Çar',
            Persembe: 'Per',
            Cuma: 'Cum',
            Cumartesi: 'Cmt',
            Pazar: 'Paz'
        };
        return Object.keys(calismaSaatleri).map(day => {
            const shortDay = dayShortNames[day] || day;
            const times = calismaSaatleri[day];
            if (Array.isArray(times) && times.length > 0) {
                return `${shortDay}: ${times[0]}`;
            }
            return '';
        }).filter(Boolean).join(', ');
    };

    const filteredDoctors = doctors.filter(doc => {
        const fullName = `${doc.ad} ${doc.soyad}`.toLowerCase();
        const spec = (doc.uzmanlik || '').toLowerCase();
        const dept = (doc.bolum_adi || '').toLowerCase();
        return fullName.includes(search) || spec.includes(search) || dept.includes(search);
    });

    return (
        <MainLayout>
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    {alert.message && (
                        <AlertMessage
                            message={alert.message}
                            type={alert.type}
                            onClose={() => setAlert({ message: '', type: '' })}
                        />
                    )}

                    <div className="row g-3 mb-4 align-items-center">
                        <div className="col-lg-4 col-md-6 col-12">
                            <SearchBar onSearch={handleSearch} placeholder="Doktor adı veya uzmanlık ile ara..." />
                        </div>
                        <div className="col-lg-3 col-md-6 col-12">
                            <select
                                className="form-select"
                                value={selectedBolumId}
                                onChange={(e) => setSelectedBolumId(e.target.value)}
                            >
                                <option value="">Tüm Bölümler</option>
                                {bolumler.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.bolum_adi}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {isAdmin && (
                            <div className="col-lg-5 col-12 text-lg-end text-start">
                                <button className="btn btn-primary d-flex align-items-center gap-2 ms-lg-auto" onClick={handleAddClick}>
                                    <i className="bi bi-plus-lg"></i> Yeni Doktor Ekle
                                </button>
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="d-flex justify-content-center my-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Yükleniyor...</span>
                            </div>
                        </div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="alert alert-info text-center py-4">
                            Kayıtlı doktor bulunamadı.
                        </div>
                    ) : (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                            {filteredDoctors.map(doctor => (
                                <div key={doctor.id} className="col">
                                    <div
                                        className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer transition-all"
                                        onClick={() => handleDetailClick(doctor)}
                                        style={{ transition: 'box-shadow 0.3s ease' }}
                                    >
                                        <div className="card-body">
                                            <div className="d-flex align-items-start gap-3">
                                                <div
                                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center"
                                                    style={{ width: '64px', height: '64px', minWidth: '64px' }}
                                                >
                                                    <i className="bi bi-person-badge fs-2"></i>
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <h5 className="fw-bold mb-1 text-truncate">
                                                        Dr. {doctor.ad} {doctor.soyad}
                                                    </h5>
                                                    <p className="text-primary fw-medium mb-1 small text-capitalize">
                                                        {doctor.bolum_adi} — {doctor.uzmanlik}
                                                    </p>
                                                    <div className="d-flex align-items-center gap-1 mb-2 text-warning small">
                                                        <i className="bi bi-star-fill"></i>
                                                        <span className="text-dark fw-semibold">4.8</span>
                                                        <span className="text-muted">| {doctor.aktif ? 'Aktif' : 'Pasif'}</span>
                                                    </div>
                                                    <p className="card-text text-muted small mb-3 text-truncate-2" style={{ height: '36px', overflow: 'hidden' }}>
                                                        {doctor.biyografi || 'Biyografi bilgisi girilmemiş.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-muted small d-block">Muayene Ücreti</span>
                                                    <span className="fw-bold text-dark fs-5">{doctor.muayene_ucreti} TL</span>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    {isPatient && (
                                                        <button
                                                            className="btn btn-primary btn-sm px-3"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/randevular?doktor_id=${doctor.id}`);
                                                            }}
                                                        >
                                                            Randevu Al
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={(e) => handleEditClick(e, doctor)}
                                                                title="Düzenle"
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={(e) => handleDeleteClick(e, doctor)}
                                                                title="Sil"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                show={showFormModal}
                title={selectedDoctor ? 'Doktor Bilgilerini Güncelle' : 'Yeni Doktor Kaydet'}
                onClose={() => setShowFormModal(false)}
            >
                <DoktorForm
                    initialData={selectedDoctor}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowFormModal(false)}
                />
            </Modal>

            <Modal
                show={showDetailModal}
                title="Doktor Detay Profili"
                onClose={() => setShowDetailModal(false)}
            >
                {selectedDoctor && (
                    <div>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center" style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-person-badge fs-1"></i>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1">Dr. {selectedDoctor.ad} {selectedDoctor.soyad}</h4>
                                <p className="text-muted mb-0">{selectedDoctor.bolum_adi} — {selectedDoctor.uzmanlik}</p>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <h6 className="text-muted mb-1">E-posta</h6>
                                <p className="mb-0">{selectedDoctor.email}</p>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-muted mb-1">Diploma Numarası</h6>
                                <p className="mb-0">{selectedDoctor.diploma_no || '-'}</p>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-muted mb-1">Muayene Ücreti</h6>
                                <p className="fw-bold mb-0">{selectedDoctor.muayene_ucreti} TL</p>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-muted mb-1">Durum</h6>
                                <p className="mb-0">
                                    <Badge
                                        text={selectedDoctor.aktif ? 'aktif' : 'pasif'}
                                        variant={selectedDoctor.aktif ? 'success' : 'secondary'}
                                    />
                                </p>
                            </div>
                            <div className="col-md-12">
                                <h6 className="text-muted mb-1">Çalışma Takvimi</h6>
                                <p className="mb-0 bg-light p-2 rounded small">
                                    {formatWorkingHours(selectedDoctor.calisma_saatleri)}
                                </p>
                            </div>
                            <div className="col-md-12">
                                <h6 className="text-muted mb-1">Biyografi</h6>
                                <p className="mb-0 text-secondary">{selectedDoctor.biyografi || 'Biyografi bilgisi girilmemiş.'}</p>
                            </div>
                        </div>

                        <hr />

                        <h5 className="fw-bold mb-3">Randevu Takvimi</h5>
                        {isLoadingAppointments ? (
                            <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                            </div>
                        ) : doctorAppointments.length === 0 ? (
                            <div className="alert alert-light text-center border">
                                Aktif randevu bulunmamaktadır.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-hover align-middle border">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Tarih</th>
                                            <th>Saat</th>
                                            <th>Hasta</th>
                                            <th>Durum</th>
                                            <th>Şikayet</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctorAppointments.map(app => (
                                            <tr key={app.id}>
                                                <td>{formatDate(app.randevu_tarihi)}</td>
                                                <td>{app.randevu_saati ? app.randevu_saati.substring(0, 5) : ''}</td>
                                                <td>{app.hasta_ad} {app.hasta_soyad}</td>
                                                <td>
                                                    <Badge
                                                        text={app.durum}
                                                        variant={
                                                            app.durum === 'onaylandi' ? 'success' :
                                                            app.durum === 'beklemede' ? 'warning' :
                                                            app.durum === 'iptal' ? 'danger' : 'primary'
                                                        }
                                                    />
                                                </td>
                                                <td className="small text-truncate" style={{ maxWidth: '200px' }} title={app.sikayet}>
                                                    {app.sikayet || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <ConfirmModal
                show={showDeleteModal}
                title="Doktoru Sil"
                message={`Dr. ${selectedDoctor?.ad} ${selectedDoctor?.soyad} isimli doktoru silmek istediğinizden emin misiniz? Bu işlem bağlı tüm kayıtları silecektir.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
            />
        </MainLayout>
    );
};

export default DoktorlarPage;