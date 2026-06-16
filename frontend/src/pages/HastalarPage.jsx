import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../components/layout';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import AlertMessage from '../components/common/AlertMessage';
import Badge from '../components/common/Badge';
import HastaForm from '../components/forms/HastaForm';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import {
    getHastalarApi,
    createHastaApi,
    updateHastaApi,
    deleteHastaApi,
    getHastaRandevularApi
} from '../api/hasta.api';

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

const HastalarPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';

    const [patients, setPatients] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [alert, setAlert] = useState({ message: '', type: '' });
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getHastalarApi(page, limit, search);
            setPatients(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (err) {
            setAlert({ message: 'Hastalar yüklenirken bir hata oluştu.', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    useEffect(() => {
        const handleNavbarAction = () => {
            if (isAdmin) {
                setSelectedPatient(null);
                setShowFormModal(true);
            }
        };
        window.addEventListener('navbar-action-click', handleNavbarAction);
        return () => window.removeEventListener('navbar-action-click', handleNavbarAction);
    }, [isAdmin]);

    const handleSearch = (term) => {
        setSearch(term);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleAddClick = () => {
        setSelectedPatient(null);
        setShowFormModal(true);
    };

    const handleEditClick = (patient) => {
        setSelectedPatient(patient);
        setShowFormModal(true);
    };

    const handleDeleteClick = (patient) => {
        setSelectedPatient(patient);
        setShowDeleteModal(true);
    };

    const handleDetailClick = async (patient) => {
        setSelectedPatient(patient);
        setShowDetailModal(true);
        setIsLoadingAppointments(true);
        try {
            const data = await getHastaRandevularApi(patient.id);
            setPatientAppointments(data);
        } catch (err) {
            setAlert({ message: 'Randevular yüklenirken hata oluştu.', type: 'danger' });
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedPatient) {
                await updateHastaApi(selectedPatient.id, formData);
                setAlert({ message: 'Hasta başarıyla güncellendi.', type: 'success' });
            } else {
                await createHastaApi(formData);
                setAlert({ message: 'Hasta başarıyla oluşturuldu.', type: 'success' });
            }
            setShowFormModal(false);
            fetchPatients();
        } catch (err) {
            const errMsg = err.response?.data?.message || 'İşlem sırasında bir hata oluştu.';
            setAlert({ message: errMsg, type: 'danger' });
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteHastaApi(selectedPatient.id);
            setAlert({ message: 'Hasta başarıyla silindi.', type: 'success' });
            setShowDeleteModal(false);
            fetchPatients();
        } catch (err) {
            setAlert({ message: 'Hasta silinirken bir hata oluştu.', type: 'danger' });
        }
    };

    const columns = [
        {
            header: '#',
            render: (_, index) => (page - 1) * limit + index + 1,
            style: { width: '60px' }
        },
        {
            header: 'Ad Soyad',
            render: (row) => <span className="fw-bold">{row.ad} {row.soyad}</span>
        },
        {
            header: 'TC / Tel',
            render: (row) => (
                <div>
                    <div className="small text-muted">TC: {row.tc_kimlik}</div>
                    <div>Tel: {row.telefon}</div>
                </div>
            )
        },
        {
            header: 'Kan Grubu',
            render: (row) => row.kan_grubu ? <Badge text={row.kan_grubu} variant="info" /> : '-'
        },
        {
            header: 'Durum',
            render: (row) => <Badge text={row.aktif ? 'aktif' : 'pasif'} variant={row.aktif ? 'success' : 'secondary'} />
        },
        {
            header: 'İşlem',
            render: (row) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() => handleDetailClick(row)}
                        title="Detay ve Randevular"
                    >
                        <i className="bi bi-eye"></i>
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleEditClick(row)}
                                title="Düzenle"
                            >
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteClick(row)}
                                title="Sil"
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        </>
                    )}
                </div>
            ),
            style: { width: '150px' }
        }
    ];

    return (
        <MainLayout>
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    {alert.message && (
                        <AlertMessage
                            message={alert.message}
                            type={alert.type}
                            onClose={() => setAlert({ message: '', type: '' })}
                        />
                    )}

                    <div className="row align-items-center mb-3 g-3">
                        <div className="col-md-6 col-12">
                            <SearchBar onSearch={handleSearch} placeholder="Hasta adı, soyadı veya TC no ile ara..." />
                        </div>
                        {isAdmin && (
                            <div className="col-md-6 col-12 text-md-end text-start">
                                <button className="btn btn-primary d-flex align-items-center gap-2 ms-md-auto" onClick={handleAddClick}>
                                    <i className="bi bi-plus-lg"></i> Yeni Hasta
                                </button>
                            </div>
                        )}
                    </div>

                    <DataTable
                        columns={columns}
                        data={patients}
                        isLoading={isLoading}
                        emptyMessage="Kayıtlı hasta bulunamadı."
                    />

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <Modal
                show={showFormModal}
                title={selectedPatient ? 'Hasta Güncelle' : 'Yeni Hasta Ekle'}
                onClose={() => setShowFormModal(false)}
            >
                <HastaForm
                    initialData={selectedPatient}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowFormModal(false)}
                />
            </Modal>

            <Modal
                show={showDetailModal}
                title="Hasta Detay & Tıbbi Kayıt"
                onClose={() => setShowDetailModal(false)}
            >
                {selectedPatient && (
                    <div>
                        <div className="row mb-4 g-3">
                            <div className="col-md-6">
                                <h6 className="text-muted mb-1">Ad Soyad</h6>
                                <p className="fw-bold fs-5 mb-0">{selectedPatient.ad} {selectedPatient.soyad}</p>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-muted mb-1">E-posta</h6>
                                <p className="mb-0">{selectedPatient.email}</p>
                            </div>
                            <div className="col-md-4">
                                <h6 className="text-muted mb-1">TC Kimlik No</h6>
                                <p className="mb-0">{selectedPatient.tc_kimlik}</p>
                            </div>
                            <div className="col-md-4">
                                <h6 className="text-muted mb-1">Telefon</h6>
                                <p className="mb-0">{selectedPatient.telefon}</p>
                            </div>
                            <div className="col-md-4">
                                <h6 className="text-muted mb-1">Kan Grubu</h6>
                                <p className="mb-0">
                                    {selectedPatient.kan_grubu ? (
                                        <Badge text={selectedPatient.kan_grubu} variant="info" />
                                    ) : '-'}
                                </p>
                            </div>
                            <div className="col-md-4">
                                <h6 className="text-muted mb-1">Doğum Tarihi</h6>
                                <p className="mb-0">{formatDate(selectedPatient.dogum_tarihi)}</p>
                            </div>
                            <div className="col-md-4">
                                <h6 className="text-muted mb-1">Cinsiyet</h6>
                                <p className="text-capitalize mb-0">{selectedPatient.cinsiyet}</p>
                            </div>
                            <div className="col-md-4">
                                <h6 className="text-muted mb-1">Sigorta No</h6>
                                <p className="mb-0">{selectedPatient.sigorta_no || '-'}</p>
                            </div>
                            <div className="col-md-12">
                                <h6 className="text-muted mb-1">Adres</h6>
                                <p className="mb-0 text-secondary">{selectedPatient.adres || 'Belirtilmemiş'}</p>
                            </div>
                        </div>

                        <hr />

                        <h5 className="fw-bold mb-3">Geçmiş Randevular</h5>
                        {isLoadingAppointments ? (
                            <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                            </div>
                        ) : patientAppointments.length === 0 ? (
                            <div className="alert alert-light text-center border">
                                Randevu geçmişi bulunmamaktadır.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-hover align-middle border">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Tarih</th>
                                            <th>Saat</th>
                                            <th>Bölüm</th>
                                            <th>Doktor</th>
                                            <th>Durum</th>
                                            <th>Şikayet</th>
                                            <th>Doktor Notu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patientAppointments.map(app => (
                                            <tr key={app.id}>
                                                <td>{formatDate(app.randevu_tarihi)}</td>
                                                <td>{app.randevu_saati ? app.randevu_saati.substring(0, 5) : ''}</td>
                                                <td>{app.bolum_adi}</td>
                                                <td>Dr. {app.doktor_ad} {app.doktor_soyad}</td>
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
                                                <td className="small text-truncate" style={{ maxWidth: '150px' }} title={app.sikayet}>
                                                    {app.sikayet || '-'}
                                                </td>
                                                <td className="small text-truncate" style={{ maxWidth: '150px' }} title={app.notlar}>
                                                    {app.notlar || '-'}
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
                title="Hastayı Sil"
                message={`${selectedPatient?.ad} ${selectedPatient?.soyad} isimli hastayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
            />
        </MainLayout>
    );
};

export default HastalarPage;