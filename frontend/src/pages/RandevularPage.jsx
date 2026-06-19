import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../components/layout';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import RandevuForm from '../components/forms/RandevuForm';
import { useAuth } from '../hooks/useAuth';
import { getBolumlerApi } from '../api/bolum.api';
import { getHastaRandevularApi } from '../api/hasta.api';
import { getDoktorRandevularApi } from '../api/doktor.api';
import {
    getRandevularApi,
    createRandevuApi,
    updateRandevuApi,
    updateRandevuDurumApi,
    deleteRandevuApi
} from '../api/randevu.api';

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

const RandevularPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';
    const isDoctor = user?.rol === 'doktor';
    const isPatient = user?.rol === 'hasta';

    const [appointments, setAppointments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ message: '', type: '' });

    const [filterBolum, setFilterBolum] = useState('');
    const [filterDurum, setFilterDurum] = useState('');
    const [filterTarih, setFilterTarih] = useState('');

    const [showWizard, setShowWizard] = useState(false);
    const [completingApp, setCompletingApp] = useState(null);
    const [doctorNotes, setDoctorNotes] = useState('');

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            let data = [];
            if (isAdmin) {
                const params = {};
                if (filterBolum) params.bolum_id = filterBolum;
                if (filterDurum) params.durum = filterDurum;
                if (filterTarih) params.randevu_tarihi = filterTarih;
                data = await getRandevularApi(params);
            } else if (isDoctor) {
                data = await getDoktorRandevularApi(user.profile_id);
            } else if (isPatient) {
                data = await getHastaRandevularApi(user.profile_id);
            }
            setAppointments(data);
        } catch (err) {
            setAlert({ message: 'Randevular yuklenirken hata olustu.', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, isDoctor, isPatient, user?.profile_id, filterBolum, filterDurum, filterTarih]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    useEffect(() => {
        getBolumlerApi()
            .then(res => setDepartments(res))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handleNavbarAction = () => {
            if (isAdmin || isPatient) {
                setShowWizard(true);
            }
        };
        window.addEventListener('navbar-action-click', handleNavbarAction);
        return () => window.removeEventListener('navbar-action-click', handleNavbarAction);
    }, [isAdmin, isPatient]);

    const handleCreateSubmit = async (formData) => {
        try {
            await createRandevuApi(formData);
            setAlert({ message: 'Randevu basariyla oluşturuldu.', type: 'success' });
            setShowWizard(false);
            fetchAppointments();
        } catch (err) {
            const msg = err.response?.data?.message || 'Randevu olusturulurken hata olustu.';
            setAlert({ message: msg, type: 'danger' });
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Bu randevuyu iptal etmek istediginize emin misiniz?')) return;
        try {
            await updateRandevuDurumApi(id, 'iptal');
            setAlert({ message: 'Randevu iptal edildi.', type: 'success' });
            fetchAppointments();
        } catch (err) {
            setAlert({ message: 'Randevu iptal edilirken hata olustu.', type: 'danger' });
        }
    };

    const handleApprove = async (id) => {
        try {
            await updateRandevuDurumApi(id, 'onaylandi');
            setAlert({ message: 'Randevu onaylandi.', type: 'success' });
            fetchAppointments();
        } catch (err) {
            setAlert({ message: 'Randevu onaylanirken hata olustu.', type: 'danger' });
        }
    };

    const handleCompleteClick = (app) => {
        setCompletingApp(app);
        setDoctorNotes(app.notlar || '');
    };

    const handleCompleteSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateRandevuApi(completingApp.id, {
                durum: 'tamamlandi',
                notlar: doctorNotes
            });
            setAlert({ message: 'Randevu tamamlandi olarak isaretlendi.', type: 'success' });
            setCompletingApp(null);
            fetchAppointments();
        } catch (err) {
            setAlert({ message: 'Randevu guncellenirken hata olustu.', type: 'danger' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu randevuyu sistemden tamamen silmek istediginize emin misiniz?')) return;
        try {
            await deleteRandevuApi(id);
            setAlert({ message: 'Randevu silindi.', type: 'success' });
            fetchAppointments();
        } catch (err) {
            setAlert({ message: 'Randevu silinirken hata olustu.', type: 'danger' });
        }
    };

    const getStatusBadgeVariant = (durum) => {
        switch (durum) {
            case 'beklemede': return 'warning text-dark';
            case 'onaylandi': return 'success';
            case 'tamamlandi': return 'info text-white';
            case 'iptal': return 'danger';
            default: return 'secondary';
        }
    };

    const getFilteredAppointmentsForNonAdmin = () => {
        if (isAdmin) return appointments;
        return appointments.filter(app => {
            const matchesBolum = filterBolum ? String(app.bolum_id) === filterBolum : true;
            const matchesDurum = filterDurum ? app.durum === filterDurum : true;
            const matchesTarih = filterTarih ? app.randevu_tarihi.startsWith(filterTarih) : true;
            return matchesBolum && matchesDurum && matchesTarih;
        });
    };

    const displayedAppointments = getFilteredAppointmentsForNonAdmin();

    return (
        <MainLayout>
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">Randevular</h3>
                    {(isAdmin || isPatient) && (
                        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowWizard(true)}>
                            <i className="bi bi-plus-circle"></i>
                            Yeni Randevu
                        </button>
                    )}
                </div>

                {alert.message && (
                    <div className="mb-4">
                        <AlertMessage message={alert.message} type={alert.type} />
                    </div>
                )}

                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-bold">Bolum</label>
                                <select 
                                    className="form-select"
                                    value={filterBolum}
                                    onChange={(e) => setFilterBolum(e.target.value)}
                                >
                                    <option value="">Tumu</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.bolum_adi}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-bold">Durum</label>
                                <select 
                                    className="form-select"
                                    value={filterDurum}
                                    onChange={(e) => setFilterDurum(e.target.value)}
                                >
                                    <option value="">Tumu</option>
                                    <option value="beklemede">Beklemede</option>
                                    <option value="onaylandi">Onaylandi</option>
                                    <option value="tamamlandi">Tamamlandi</option>
                                    <option value="iptal">Iptal</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-bold">Tarih</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filterTarih}
                                    onChange={(e) => setFilterTarih(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Tarih & Saat</th>
                                            {!isPatient && <th>Hasta</th>}
                                            {!isDoctor && <th>Doktor</th>}
                                            <th>Bolum</th>
                                            <th>Sikayet</th>
                                            <th>Doktor Notu</th>
                                            <th>Durum</th>
                                            <th className="text-end">Islemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedAppointments.map(app => (
                                            <tr key={app.id}>
                                                <td className="fw-semibold">
                                                    <div>{new Date(app.randevu_tarihi).toLocaleDateString()}</div>
                                                    <small className="text-muted">{app.randevu_saati.substring(0, 5)}</small>
                                                </td>
                                                {!isPatient && (
                                                    <td>{app.hasta_ad} {app.hasta_soyad}</td>
                                                )}
                                                {!isDoctor && (
                                                    <td>{app.doktor_ad || 'Dr. ' + (app.doktor_ad || '')} {app.doktor_soyad}</td>
                                                )}
                                                <td>{app.bolum_adi}</td>
                                                <td>
                                                    <span className="d-inline-block text-truncate" style={{ maxWidth: '180px' }} title={app.sikayet}>
                                                        {app.sikayet}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="d-inline-block text-truncate text-muted" style={{ maxWidth: '180px' }} title={app.notlar}>
                                                        {app.notlar || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Badge text={app.durum} variant={getStatusBadgeVariant(app.durum)} />
                                                </td>
                                                <td className="text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        {isDoctor && app.durum === 'beklemede' && (
                                                            <button 
                                                                className="btn btn-sm btn-outline-success"
                                                                onClick={() => handleApprove(app.id)}
                                                            >
                                                                Onayla
                                                            </button>
                                                        )}
                                                        {isDoctor && ['beklemede', 'onaylandi'].includes(app.durum) && (
                                                            <button 
                                                                className="btn btn-sm btn-outline-info"
                                                                onClick={() => handleCompleteClick(app)}
                                                            >
                                                                Tamamla
                                                            </button>
                                                        )}
                                                        {['beklemede', 'onaylandi'].includes(app.durum) && (isAdmin || isDoctor || isPatient) && (
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleCancel(app.id)}
                                                            >
                                                                Iptal Et
                                                            </button>
                                                        )}
                                                        {isAdmin && (
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(app.id)}
                                                            >
                                                                Sil
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {displayedAppointments.length === 0 && (
                                            <tr>
                                                <td colSpan={isAdmin ? 8 : 7} className="text-center py-5 text-muted">
                                                    Randevu bulunamadi.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <Modal show={showWizard} title="Yeni Randevu Al" onClose={() => setShowWizard(false)}>
                    <RandevuForm 
                        onSubmitSuccess={handleCreateSubmit} 
                        onCancel={() => setShowWizard(false)} 
                    />
                </Modal>

                <Modal show={!!completingApp} title="Randevuyu Tamamla ve Not Ekle" onClose={() => setCompletingApp(null)}>
                    {completingApp && (
                        <form onSubmit={handleCompleteSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Hasta:</label>
                                <input type="text" className="form-control-plaintext" readOnly value={`${completingApp.hasta_ad} ${completingApp.hasta_soyad}`} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Sikayet:</label>
                                <p className="small text-muted">{completingApp.sikayet}</p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Doktor Muayene Notlari</label>
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    value={doctorNotes}
                                    onChange={(e) => setDoctorNotes(e.target.value)}
                                    placeholder="Hasta ile ilgili tani, tedavi ve muayene notlarini girin..."
                                    required
                                ></textarea>
                            </div>
                            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setCompletingApp(null)}>Vazgec</button>
                                <button type="submit" className="btn btn-success">Muayeneyi Bitir ve Kaydet</button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div>
        </MainLayout>
    );
};

export default RandevularPage;