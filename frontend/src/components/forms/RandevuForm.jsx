import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getHastalarApi } from '../../api/hasta.api';
import { getBolumlerApi } from '../../api/bolum.api';
import { getDoktorlarApi, getDoktorMusaitSaatlerApi } from '../../api/doktor.api';

const RandevuForm = ({ onSubmitSuccess, onCancel }) => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';

    const [step, setStep] = useState(isAdmin ? 1 : 2);
    const [patients, setPatients] = useState([]);
    const [searchPatient, setSearchPatient] = useState('');
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableHours, setAvailableHours] = useState([]);
    const [isLoadingHours, setIsLoadingHours] = useState(false);

    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedBolumId, setSelectedBolumId] = useState('');
    const [selectedDoktorId, setSelectedDoktorId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedHour, setSelectedHour] = useState('');
    const [sikayet, setSikayet] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isAdmin) {
            getHastalarApi(1, 50, searchPatient)
                .then(res => setPatients(res.data))
                .catch(() => setErrorMsg('Hastalar yuklenirken hata olustu.'));
        }
    }, [isAdmin, searchPatient]);

    useEffect(() => {
        getBolumlerApi()
            .then(res => setDepartments(res))
            .catch(() => setErrorMsg('Bolumler yuklenirken hata olustu.'));
    }, []);

    useEffect(() => {
        if (selectedBolumId) {
            getDoktorlarApi(selectedBolumId)
                .then(res => setDoctors(res))
                .catch(() => setErrorMsg('Doktorlar yuklenirken hata olustu.'));
        } else {
            setDoctors([]);
        }
        setSelectedDoktorId('');
        setSelectedHour('');
        setAvailableHours([]);
    }, [selectedBolumId]);

    useEffect(() => {
        if (selectedDoktorId && selectedDate) {
            setIsLoadingHours(true);
            getDoktorMusaitSaatlerApi(selectedDoktorId, selectedDate)
                .then(res => setAvailableHours(res))
                .catch(() => setErrorMsg('Musait saatler yuklenirken hata olustu.'))
                .finally(() => setIsLoadingHours(false));
        } else {
            setAvailableHours([]);
        }
        setSelectedHour('');
    }, [selectedDoktorId, selectedDate]);

    const handleNext = () => {
        setErrorMsg('');
        if (step === 1 && !selectedPatientId) {
            setErrorMsg('Lutfen bir hasta secin.');
            return;
        }
        if (step === 2 && !selectedBolumId) {
            setErrorMsg('Lutfen bir bolum secin.');
            return;
        }
        if (step === 3 && !selectedDoktorId) {
            setErrorMsg('Lutfen bir doktor secin.');
            return;
        }
        if (step === 4 && (!selectedDate || !selectedHour)) {
            setErrorMsg('Lutfen tarih ve saat secin.');
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setErrorMsg('');
        setStep(prev => prev - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!sikayet.trim()) {
            setErrorMsg('Lutfen sikayetinizi aciklayin.');
            return;
        }

        const payload = {
            hasta_id: isAdmin ? parseInt(selectedPatientId) : user.profile_id,
            doktor_id: parseInt(selectedDoktorId),
            bolum_id: parseInt(selectedBolumId),
            randevu_tarihi: selectedDate,
            randevu_saati: `${selectedHour}:00`,
            sikayet: sikayet.trim()
        };

        onSubmitSuccess(payload);
    };

    const getStepProgress = () => {
        const totalSteps = isAdmin ? 5 : 4;
        const currentProgress = isAdmin ? step : step - 1;
        return (currentProgress / totalSteps) * 100;
    };

    return (
        <div className="card border-0">
            <div className="progress mb-4" style={{ height: '8px' }}>
                <div 
                    className="progress-bar bg-primary progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: `${getStepProgress()}%` }}
                ></div>
            </div>

            {errorMsg && (
                <div className="alert alert-danger border-0 shadow-sm mb-3">
                    {errorMsg}
                </div>
            )}

            <div className="mb-4">
                {step === 1 && isAdmin && (
                    <div>
                        <h5 className="fw-bold mb-3">Adim 1: Hasta Secimi</h5>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Hasta ismi ile ara..."
                                value={searchPatient}
                                onChange={(e) => setSearchPatient(e.target.value)}
                            />
                            <div className="list-group overflow-auto" style={{ maxHeight: '200px' }}>
                                {patients.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className={`list-group-item list-group-item-action border-0 mb-1 rounded d-flex justify-content-between align-items-center ${selectedPatientId === String(p.id) ? 'active' : 'bg-light'}`}
                                        onClick={() => setSelectedPatientId(String(p.id))}
                                    >
                                        <span>{p.ad} {p.soyad}</span>
                                        <small className={selectedPatientId === String(p.id) ? 'text-white' : 'text-muted'}>TC: {p.tc_kimlik}</small>
                                    </button>
                                ))}
                                {patients.length === 0 && (
                                    <div className="text-center py-3 text-muted">Hasta bulunamadi.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h5 className="fw-bold mb-3">Bolum Secimi</h5>
                        <div className="row g-3">
                            {departments.map(d => (
                                <div className="col-12 col-md-6" key={d.id}>
                                    <div 
                                        className={`card h-100 border-0 shadow-sm cursor-pointer p-3 transition ${selectedBolumId === String(d.id) ? 'bg-primary text-white' : 'bg-light'}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedBolumId(String(d.id))}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`p-2 rounded-circle ${selectedBolumId === String(d.id) ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                                <i className="bi bi-building"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0">{d.bolum_adi}</h6>
                                                <small className={selectedBolumId === String(d.id) ? 'text-white-50' : 'text-muted'}>Kat: {d.kat} | Dahili: {d.dahili}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h5 className="fw-bold mb-3">Doktor Secimi</h5>
                        <div className="row g-3">
                            {doctors.map(d => (
                                <div className="col-12 col-md-6" key={d.id}>
                                    <div 
                                        className={`card h-100 border-0 shadow-sm cursor-pointer p-3 transition ${selectedDoktorId === String(d.id) ? 'bg-primary text-white' : 'bg-light'}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedDoktorId(String(d.id))}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`p-2 rounded-circle ${selectedDoktorId === String(d.id) ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                                <i className="bi bi-person-badge"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0">{d.ad} {d.soyad}</h6>
                                                <small className={selectedDoktorId === String(d.id) ? 'text-white-50' : 'text-muted'}>{d.uzmanlik} | Ucret: {d.muayene_ucreti} TL</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {doctors.length === 0 && (
                                <div className="text-center py-4 text-muted w-100">Bu bolumde aktif doktor bulunmamaktadir.</div>
                            )}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <h5 className="fw-bold mb-3">Tarih ve Saat Secimi</h5>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Randevu Tarihi</label>
                            <input
                                type="date"
                                className="form-control"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        {selectedDate && (
                            <div>
                                <label className="form-label fw-bold d-block">Musait Saatler</label>
                                {isLoadingHours ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableHours.map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={`btn btn-sm px-3 py-2 ${selectedHour === slot ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setSelectedHour(slot)}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                        {availableHours.length === 0 && (
                                            <div className="text-muted small py-2">Secilen tarihte musait saat bulunmamaktadir.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {step === (isAdmin ? 5 : 5) && (
                    <div>
                        <h5 className="fw-bold mb-3">Sikayetiniz ve Onay</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Sikayetiniz nedir?</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={sikayet}
                                    onChange={(e) => setSikayet(e.target.value)}
                                    placeholder="Lutfen belirtilerinizi ve sikayetlerinizi kisaca aciklayin..."
                                    required
                                ></textarea>
                            </div>
                            <div className="card bg-light border-0 p-3 mb-3">
                                <h6 className="fw-bold mb-2">Randevu Ozeti</h6>
                                <div className="row g-2 small">
                                    <div className="col-4 text-muted">Bolum:</div>
                                    <div className="col-8 fw-bold">{departments.find(d => String(d.id) === selectedBolumId)?.bolum_adi}</div>
                                    <div className="col-4 text-muted">Doktor:</div>
                                    <div className="col-8 fw-bold">{doctors.find(d => String(d.id) === selectedDoktorId)?.ad} {doctors.find(d => String(d.id) === selectedDoktorId)?.soyad}</div>
                                    <div className="col-4 text-muted">Tarih & Saat:</div>
                                    <div className="col-8 fw-bold text-success">{selectedDate} - {selectedHour}</div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-between pt-3 border-top">
                <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={onCancel}
                >
                    Iptal
                </button>
                <div className="d-flex gap-2">
                    {step > (isAdmin ? 1 : 2) && (
                        <button
                            type="button"
                            className="btn btn-secondary px-4"
                            onClick={handleBack}
                        >
                            Geri
                        </button>
                    )}
                    {step < (isAdmin ? 5 : 5) ? (
                        <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={handleNext}
                        >
                            Devam Et
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-success px-4"
                            onClick={handleSubmit}
                        >
                            Randevu Al
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RandevuForm;
