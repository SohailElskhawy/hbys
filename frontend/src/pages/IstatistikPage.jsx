import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import {
    getGenelIstatistiklerApi,
    getDoktorYukuApi,
    getAktifHastalarApi,
    getMusaitDoktorlarApi
} from '../api/istatistik.api';

const IstatistikPage = () => {
    const [activeTab, setActiveTab] = useState('genel');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [genelData, setGenelData] = useState([]);
    const [doktorYukuData, setDoktorYukuData] = useState([]);
    const [aktifHastalarData, setAktifHastalarData] = useState([]);

    const [searchTarih, setSearchTarih] = useState('2025-06-15');
    const [searchSaat, setSearchSaat] = useState('10:00');
    const [musaitDoktorlarData, setMusaitDoktorlarData] = useState([]);
    const [loadingMusait, setLoadingMusait] = useState(false);

    useEffect(() => {
        if (activeTab === 'genel') {
            setLoading(true);
            getGenelIstatistiklerApi()
                .then(res => setGenelData(res))
                .catch(() => setError('Genel istatistikler yuklenirken hata olustu.'))
                .finally(() => setLoading(false));
        } else if (activeTab === 'yuku') {
            setLoading(true);
            getDoktorYukuApi()
                .then(res => setDoktorYukuData(res))
                .catch(() => setError('Doktor yuk raporu yuklenirken hata olustu.'))
                .finally(() => setLoading(false));
        } else if (activeTab === 'hastalar') {
            setLoading(true);
            getAktifHastalarApi()
                .then(res => setAktifHastalarData(res))
                .catch(() => setError('Aktif hastalar raporu yuklenirken hata olustu.'))
                .finally(() => setLoading(false));
        }
    }, [activeTab]);

    const handleSearchMusait = (e) => {
        e.preventDefault();
        setLoadingMusait(true);
        setError('');
        getMusaitDoktorlarApi(searchTarih, searchSaat)
            .then(res => setMusaitDoktorlarData(res))
            .catch(() => setError('Musait doktorlar sorgulanirken hata olustu.'))
            .finally(() => setLoadingMusait(false));
    };

    return (
        <MainLayout>
            <div className="container-fluid py-4">
                <h3 className="fw-bold mb-4">Istatistikler ve Raporlar</h3>

                {error && (
                    <div className="mb-4">
                        <AlertMessage message={error} type="danger" />
                    </div>
                )}

                <ul className="nav nav-tabs mb-4" id="statsTabs" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link fw-semibold ${activeTab === 'genel' ? 'active' : ''}`}
                            onClick={() => setActiveTab('genel')}
                        >
                            Bolum Istatisikleri
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link fw-semibold ${activeTab === 'yuku' ? 'active' : ''}`}
                            onClick={() => setActiveTab('yuku')}
                        >
                            Doktor Yuk ve Gelir
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link fw-semibold ${activeTab === 'hastalar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('hastalar')}
                        >
                            Aktif Hastalar
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link fw-semibold ${activeTab === 'musait' ? 'active' : ''}`}
                            onClick={() => setActiveTab('musait')}
                        >
                            Musait Doktor Sorgulama
                        </button>
                    </li>
                </ul>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="tab-content">
                        {activeTab === 'genel' && (
                            <div>
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="fw-bold mb-0">Bolume Gore Randevu Dagilimi</h5>
                                    </div>
                                    <div className="card-body" style={{ height: '350px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={genelData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="bolum_adi" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="toplam_randevu" name="Toplam Randevu" fill="#0d6efd" />
                                                <Bar dataKey="tamamlanan" name="Tamamlanan" fill="#198754" />
                                                <Bar dataKey="iptal_edilen" name="Iptal Edilen" fill="#dc3545" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Bolum Adi</th>
                                                        <th>Toplam Randevu</th>
                                                        <th>Tamamlanan</th>
                                                        <th>Beklemede</th>
                                                        <th>Iptal Edilen</th>
                                                        <th>Tamamlanma Orani</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {genelData.map((row, i) => (
                                                        <tr key={i}>
                                                            <td className="fw-semibold">{row.bolum_adi}</td>
                                                            <td>{row.toplam_randevu}</td>
                                                            <td className="text-success">{row.tamamlanan}</td>
                                                            <td className="text-warning">{row.beklemede}</td>
                                                            <td className="text-danger">{row.iptal_edilen}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '80px' }}>
                                                                        <div
                                                                            className="progress-bar bg-success"
                                                                            style={{ width: `${row.tamamlanma_yuzdesi}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <small className="fw-bold">{row.tamamlanma_yuzdesi}%</small>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {genelData.length === 0 && (
                                                        <tr>
                                                            <td colSpan="6" className="text-center py-4 text-muted">Veri bulunamadi.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'yuku' && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white py-3">
                                    <h5 className="fw-bold mb-0">Doktorlarin Aylik Yuk ve Geliri</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Doktor Adi</th>
                                                    <th>Bolum</th>
                                                    <th>Ay</th>
                                                    <th>Randevu Sayisi</th>
                                                    <th>Toplam Gelir</th>
                                                    <th>Aylik Sektor Ortalamasi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {doktorYukuData.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="fw-semibold">{row.doktor_adi}</td>
                                                        <td>{row.bolum_adi}</td>
                                                        <td>{row.ay || '-'}</td>
                                                        <td>{row.randevu_sayisi}</td>
                                                        <td className="text-success fw-bold">{row.toplam_gelir ? `${row.toplam_gelir} TL` : '0 TL'}</td>
                                                        <td className="text-muted">{row.ay_ortalamasi} randevu</td>
                                                    </tr>
                                                ))}
                                                {doktorYukuData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-4 text-muted">Son 6 aya ait veri bulunamadi.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'hastalar' && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white py-3">
                                    <h5 className="fw-bold mb-0">En Cok Randevu Alan Hastalar (Son 3 Ay)</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Hasta Adi</th>
                                                    <th>Kan Grubu</th>
                                                    <th>Toplam Randevu</th>
                                                    <th>En Sık Ziyaret Edilen Doktor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {aktifHastalarData.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="fw-semibold">{row.hasta_adi}</td>
                                                        <td>
                                                            <span className="badge bg-secondary">{row.kan_grubu}</span>
                                                        </td>
                                                        <td className="fw-bold text-primary">{row.toplam_randevu}</td>
                                                        <td>{row.en_cok_gidilen_doktor}</td>
                                                    </tr>
                                                ))}
                                                {aktifHastalarData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted">Son 3 ayda en az 2 randevusu olan hasta bulunamadi.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'musait' && (
                            <div>
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        <form onSubmit={handleSearchMusait} className="row g-3 align-items-end">
                                            <div className="col-12 col-md-4">
                                                <label className="form-label fw-bold">Sorgu Tarihi</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={searchTarih}
                                                    onChange={(e) => setSearchTarih(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="form-label fw-bold">Sorgu Saati</label>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    value={searchSaat}
                                                    onChange={(e) => setSearchSaat(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <button type="submit" className="btn btn-primary w-100 py-2">
                                                    <i className="bi bi-search me-2"></i>Musait Doktorlari Bul
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {loadingMusait ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white py-3">
                                            <h5 className="fw-bold mb-0">{searchTarih} Gunu Saat {searchSaat} İcin Musait Doktorlar</h5>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Doktor Adi</th>
                                                            <th>Bolum</th>
                                                            <th>Muayene Ucreti</th>
                                                            <th>Gunun Toplam Randevusu</th>
                                                            <th>Toplam Tamamlanan Randevular</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {musaitDoktorlarData.map((row, i) => (
                                                            <tr key={i}>
                                                                <td className="fw-semibold">{row.doktor_adi}</td>
                                                                <td>{row.bolum_adi}</td>
                                                                <td>{row.muayene_ucreti} TL</td>
                                                                <td>{row.bugunun_randevu_sayisi}</td>
                                                                <td className="text-success">{row.toplam_tamamlanan}</td>
                                                            </tr>
                                                        ))}
                                                        {musaitDoktorlarData.length === 0 && (
                                                            <tr>
                                                                <td colSpan="5" className="text-center py-4 text-muted">Belirtilen saatte musait doktor bulunamadi.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default IstatistikPage;