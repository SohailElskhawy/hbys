import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../components/layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import Badge from '../components/common/Badge';
import BolumForm from '../components/forms/BolumForm';
import { useAuth } from '../hooks/useAuth';
import {
    getBolumlerApi,
    getBolumByIdApi,
    createBolumApi,
    updateBolumApi,
    deleteBolumApi
} from '../api/bolum.api';

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

const BolumlerPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';

    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ message: '', type: '' });

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBolum, setSelectedBolum] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const fetchDepartments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getBolumlerApi();
            setDepartments(data);
        } catch (err) {
            setAlert({ message: 'Bölümler yüklenirken bir hata oluştu.', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        const handleNavbarAction = () => {
            if (isAdmin) {
                setSelectedBolum(null);
                setShowFormModal(true);
            }
        };
        window.addEventListener('navbar-action-click', handleNavbarAction);
        return () => window.removeEventListener('navbar-action-click', handleNavbarAction);
    }, [isAdmin]);

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedBolum) {
                await updateBolumApi(selectedBolum.id, formData);
                setAlert({ message: 'Bölüm başarıyla güncellendi.', type: 'success' });
            } else {
                await createBolumApi(formData);
                setAlert({ message: 'Bölüm başarıyla oluşturuldu.', type: 'success' });
            }
            setShowFormModal(false);
            fetchDepartments();
        } catch (err) {
            const errMsg = err.response?.data?.message || 'İşlem sırasında bir hata oluştu.';
            setAlert({ message: errMsg, type: 'danger' });
        }
    };

    const handleEditClick = (bolum) => {
        setSelectedBolum(bolum);
        setShowFormModal(true);
    };

    const handleDetailClick = async (bolum) => {
        setSelectedBolum(bolum);
        setShowDetailModal(true);
        setIsLoadingDetail(true);
        try {
            const data = await getBolumByIdApi(bolum.id);
            setDetailData(data);
        } catch (err) {
            setAlert({ message: 'Bölüm detayları yüklenirken hata oluştu.', type: 'danger' });
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('Bu bölümü silmek istediğinize emin misiniz?')) return;
        try {
            await deleteBolumApi(id);
            setAlert({ message: 'Bölüm başarıyla silindi.', type: 'success' });
            fetchDepartments();
        } catch (err) {
            setAlert({ message: 'Bölüm silinirken bir hata oluştu.', type: 'danger' });
        }
    };

    return (
        <MainLayout>
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">Bölümler</h3>
                    {isAdmin && (
                        <button 
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={() => {
                                setSelectedBolum(null);
                                setShowFormModal(true);
                            }}
                        >
                            <i className="bi bi-plus-circle"></i>
                            Yeni Bölüm
                        </button>
                    )}
                </div>

                {alert.message && (
                    <div className="mb-4">
                        <AlertMessage message={alert.message} type={alert.type} />
                    </div>
                )}

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="row g-4">
                        {departments.map(d => (
                            <div className="col-12 col-md-6 col-lg-4" key={d.id}>
                                <div className="card h-100 border-0 shadow-sm transition card-hover">
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                                                    <i className="bi bi-building fs-4"></i>
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-1">{d.bolum_adi}</h5>
                                                    <small className="text-muted">Kat: {d.kat} | Dahili: {d.dahili}</small>
                                                </div>
                                            </div>
                                            <Badge text={d.aktif ? 'aktif' : 'pasif'} variant={d.aktif ? 'success' : 'secondary'} />
                                        </div>

                                        <p className="text-muted small flex-grow-1 text-truncate-3 mb-4">
                                            {d.aciklama || 'Bu bölüm için açıklama belirtilmemiş.'}
                                        </p>

                                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                            <span className="text-primary small fw-semibold">
                                                <i className="bi bi-person-badge-fill me-1"></i>
                                                {d.doktor_sayisi || 0} Doktor
                                            </span>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary px-3"
                                                    onClick={() => handleDetailClick(d)}
                                                >
                                                    Detay
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button 
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleEditClick(d)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteClick(d.id)}
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
                        {departments.length === 0 && (
                            <div className="text-center py-5 text-muted w-100">
                                Kayıtlı bölüm bulunamadı.
                            </div>
                        )}
                    </div>
                )}

                <Modal 
                    show={showFormModal} 
                    title={selectedBolum ? 'Bölümü Düzenle' : 'Yeni Bölüm Ekle'} 
                    onClose={() => setShowFormModal(false)}
                >
                    <BolumForm 
                        initialData={selectedBolum}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowFormModal(false)}
                    />
                </Modal>

                <Modal 
                    show={showDetailModal} 
                    title={`${selectedBolum?.bolum_adi || 'Bölüm'} Detayları`} 
                    onClose={() => {
                        setShowDetailModal(false);
                        setDetailData(null);
                    }}
                >
                    {isLoadingDetail || !detailData ? (
                        <LoadingSpinner />
                    ) : (
                        <div>
                            <div className="mb-4">
                                <h6 className="fw-bold mb-2">Açıklama</h6>
                                <p className="text-muted bg-light p-3 rounded">{detailData.aciklama || 'Açıklama belirtilmemiş.'}</p>
                            </div>
                            <div className="row mb-4">
                                <div className="col-6">
                                    <h6 className="fw-bold mb-1">Bulunduğu Kat</h6>
                                    <span className="badge bg-secondary">{detailData.kat || '-'}</span>
                                </div>
                                <div className="col-6">
                                    <h6 className="fw-bold mb-1">Dahili Telefon</h6>
                                    <span className="badge bg-secondary">{detailData.dahili || '-'}</span>
                                </div>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-3">Görevli Doktorlar</h6>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Doktor Adı</th>
                                                <th>Uzmanlık</th>
                                                <th>Ücret (TL)</th>
                                                <th>E-posta</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailData.doktorlar?.map(doc => (
                                                <tr key={doc.id}>
                                                    <td className="fw-semibold">{doc.ad} {doc.soyad}</td>
                                                    <td>{doc.uzmanlik}</td>
                                                    <td>{doc.muayene_ucreti} TL</td>
                                                    <td className="text-muted small">{doc.email}</td>
                                                </tr>
                                            ))}
                                            {(!detailData.doktorlar || detailData.doktorlar.length === 0) && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-muted">
                                                        Bu bölümde görevli aktif doktor bulunmuyor.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </MainLayout>
    );
};

export default BolumlerPage;