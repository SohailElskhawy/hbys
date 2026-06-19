import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/layout'
import PieChart from "../components/charts/PieChart"
import BarChart from '../components/charts/BarChart'
import StatCard from "../components/common/StatCard"
import LoadingSpinner from "../components/common/LoadingSpinner"
import AlertMessage from "../components/common/AlertMessage"
import { useAuth } from '../hooks/useAuth'
import { getHastalarApi, getHastaRandevularApi } from '../api/hasta.api'
import { getDoktorlarApi, getDoktorRandevularApi } from '../api/doktor.api'
import { getRandevularApi } from '../api/randevu.api'
import { getBolumlerApi } from '../api/bolum.api'
import { getGenelIstatistiklerApi } from '../api/istatistik.api'
import { formatDate, formatTime } from '../utils/formatDate'

const DashboardPage = () => {
    const { user } = useAuth()

    return (
        <MainLayout>
            {(user?.rol === 'admin') && (
                <AdminDashboardContent />
            )}

            {(user?.rol === 'doktor') && (
                <DoctorDashboardContent />
            )}

            {(user?.rol === 'hasta' || !user) && (
                <PatientDashboardContent />
            )}
        </MainLayout>
    )
}

function AdminDashboardContent() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [stats, setStats] = useState([])
    const [bolumDagilimi, setBolumDagilimi] = useState([])
    const [aylikRandevular, setAylikRandevular] = useState([])
    const [appointments, setAppointments] = useState([])

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [patientsData, doctorsData, appointmentsData, departmentsData, statsData] = await Promise.all([
                    getHastalarApi(1, 1),
                    getDoktorlarApi(),
                    getRandevularApi(),
                    getBolumlerApi(),
                    getGenelIstatistiklerApi()
                ])

                setStats([
                    {
                        title: "Hastalar",
                        value: patientsData.total || 0,
                        icon: "bi-people",
                        variant: "primary"
                    },
                    {
                        title: "Doktorlar",
                        value: doctorsData.length || 0,
                        icon: "bi-person-badge",
                        variant: "success"
                    },
                    {
                        title: "Randevular",
                        value: appointmentsData.length || 0,
                        icon: "bi-calendar-check",
                        variant: "warning"
                    },
                    {
                        title: "Bölümler",
                        value: departmentsData.length || 0,
                        icon: "bi-building",
                        variant: "danger"
                    }
                ])

                const mappedBolum = statsData.map(row => ({
                    name: row.bolum_adi,
                    value: row.toplam_randevu
                }))
                setBolumDagilimi(mappedBolum)

                const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]
                const monthlyCounts = {}
                monthNames.forEach(name => {
                    monthlyCounts[name] = 0
                })

                appointmentsData.forEach(app => {
                    if (app.randevu_tarihi) {
                        const date = new Date(app.randevu_tarihi)
                        if (!isNaN(date.getTime())) {
                            const monthIndex = date.getMonth()
                            const monthName = monthNames[monthIndex]
                            monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1
                        }
                    }
                })

                const formattedAylik = monthNames.map(name => ({
                    ay: name,
                    randevu: monthlyCounts[name]
                }))
                setAylikRandevular(formattedAylik)

                const slicedAppointments = appointmentsData.slice(0, 5).map(app => {
                    let durumStr = app.durum
                    if (app.durum === 'beklemede') durumStr = 'Bekliyor'
                    else if (app.durum === 'onaylandi') durumStr = 'Onaylandı'
                    else if (app.durum === 'iptal') durumStr = 'İptal'
                    else if (app.durum === 'tamamlandi') durumStr = 'Tamamlandı'

                    return {
                        id: app.id,
                        hasta: `${app.hasta_ad} ${app.hasta_soyad}`,
                        doktor: `Dr. ${app.doktor_ad} ${app.doktor_soyad}`,
                        bolum: app.bolum_adi,
                        tarih: formatDate(app.randevu_tarihi),
                        durum: durumStr
                    }
                })
                setAppointments(slicedAppointments)
            } catch (err) {
                setError('Veriler yuklenirken hata olustu.')
            } finally {
                setLoading(false)
            }
        }

        fetchAdminData()
    }, [])

    if (loading) return <LoadingSpinner />
    if (error) return <AlertMessage type="danger" message={error} />

    return (
        <>
            <div className="row g-4 mb-4">
                {stats.map((item) => (
                    <div className="col-12 col-sm-6 col-xl-3" key={item.title}>
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            variant={item.variant}
                        />
                    </div>
                ))}
            </div>

            <div className="row">
                <div className="col-lg-6">
                    <BarChart data={aylikRandevular} name={'Aylık Randevu Grafiği'} />
                </div>
                <div className="col-md-6">
                    <PieChart data={bolumDagilimi} name={'Bölüm Dağılımı'} />
                </div>
            </div>

            <br />
            <br />

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Son Randevular</h5>
                </div>

                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Hasta</th>
                                <th>Doktor</th>
                                <th>Bölüm</th>
                                <th>Tarih</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.hasta}</td>
                                    <td>{item.doktor}</td>
                                    <td>{item.bolum}</td>
                                    <td>{item.tarih}</td>
                                    <td>
                                        <span
                                            className={`badge ${item.durum === "Onaylandı"
                                                ? "bg-success"
                                                : item.durum === "Bekliyor"
                                                    ? "bg-warning text-dark"
                                                    : item.durum === "İptal"
                                                        ? "bg-danger"
                                                        : "bg-primary"
                                                }`}
                                        >
                                            {item.durum}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

function PatientDashboardContent() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [stats, setStats] = useState([])
    const [nextAppointment, setNextAppointment] = useState(null)
    const [favoriteDoctor, setFavoriteDoctor] = useState(null)

    useEffect(() => {
        const fetchPatientData = async () => {
            if (!user?.profile_id) {
                setLoading(false)
                return
            }
            try {
                const appointmentsData = await getHastaRandevularApi(user.profile_id)

                const upcoming = appointmentsData.filter(app => ['beklemede', 'onaylandi'].includes(app.durum))
                const completed = appointmentsData.filter(app => app.durum === 'tamamlandi')

                setStats([
                    {
                        title: "Yaklaşan Randevular",
                        value: upcoming.length,
                        icon: "bi-calendar-event",
                        variant: "primary"
                    },
                    {
                        title: "Tamamlanan Randevular",
                        value: completed.length,
                        icon: "bi-check-circle",
                        variant: "success"
                    }
                ])

                const sortedUpcoming = [...upcoming].sort((a, b) => {
                    const dateA = new Date(`${a.randevu_tarihi.split('T')[0]}T${a.randevu_saati}`)
                    const dateB = new Date(`${b.randevu_tarihi.split('T')[0]}T${b.randevu_saati}`)
                    return dateA - dateB
                })

                if (sortedUpcoming.length > 0) {
                    const next = sortedUpcoming[0]
                    setNextAppointment({
                        doktor: `Dr. ${next.doktor_ad} ${next.doktor_soyad}`,
                        bolum: next.bolum_adi,
                        tarih: formatDate(next.randevu_tarihi),
                        saat: formatTime(next.randevu_saati)
                    })
                }

                if (completed.length > 0) {
                    const doctorVisits = {}
                    completed.forEach(app => {
                        const key = `${app.doktor_ad} ${app.doktor_soyad}`
                        if (!doctorVisits[key]) {
                            doctorVisits[key] = {
                                isim: `Dr. ${key}`,
                                bolum: app.bolum_adi,
                                ziyaretSayisi: 0
                            }
                        }
                        doctorVisits[key].ziyaretSayisi += 1
                    })

                    let favDoc = null
                    Object.values(doctorVisits).forEach(doc => {
                        if (!favDoc || doc.ziyaretSayisi > favDoc.ziyaretSayisi) {
                            favDoc = doc
                        }
                    })
                    setFavoriteDoctor(favDoc)
                }
            } catch (err) {
                setError('Veriler yuklenirken hata olustu.')
            } finally {
                setLoading(false)
            }
        }

        fetchPatientData()
    }, [user])

    if (loading) return <LoadingSpinner />
    if (error) return <AlertMessage type="danger" message={error} />

    return (
        <>
            <div className="row g-4 mb-4">
                {stats.map((item) => (
                    <div className="col-md-6" key={item.title}>
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            variant={item.variant}
                        />
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Sıradaki Randevum</h5>
                        </div>
                        <div className="card-body">
                            {nextAppointment ? (
                                <>
                                    <h6 className="fw-bold">{nextAppointment.doktor}</h6>
                                    <p className="text-muted mb-2">{nextAppointment.bolum}</p>
                                    <p className="mb-1">📅 {nextAppointment.tarih}</p>
                                    <p className="mb-0">🕒 {nextAppointment.saat}</p>
                                </>
                            ) : (
                                <p className="text-muted">Yaklaşan randevunuz bulunmamaktadır.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Favori Doktorum</h5>
                        </div>
                        <div className="card-body">
                            {favoriteDoctor ? (
                                <>
                                    <h6 className="fw-bold">{favoriteDoctor.isim}</h6>
                                    <p className="text-muted">{favoriteDoctor.bolum}</p>
                                    <span className="badge bg-primary">
                                        {favoriteDoctor.ziyaretSayisi} ziyaret
                                    </span>
                                </>
                            ) : (
                                <p className="text-muted">Tamamlanmış randevunuz bulunmamaktadır.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Hızlı İşlemler</h5>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate('/randevular')}
                            >
                                <i className="bi bi-calendar-plus me-2"></i>
                                Yeni Randevu Al
                            </button>
                            <small className="text-muted mt-3 text-center">
                                En yakın uygun randevuları görüntüle.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function DoctorDashboardContent() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [stats, setStats] = useState([])
    const [todaySchedule, setTodaySchedule] = useState([])
    const [upcomingPatients, setUpcomingPatients] = useState([])

    useEffect(() => {
        const fetchDoctorData = async () => {
            if (!user?.profile_id) {
                setLoading(false)
                return
            }
            try {
                const appointmentsData = await getDoktorRandevularApi(user.profile_id)

                const todayStr = new Date().toISOString().split('T')[0]

                const todayAppts = appointmentsData.filter(app => {
                    if (!app.randevu_tarihi) return false
                    const apptDateStr = new Date(app.randevu_tarihi).toISOString().split('T')[0]
                    return apptDateStr === todayStr && app.durum !== 'iptal'
                })

                const pendingAppts = appointmentsData.filter(app => app.durum === 'beklemede')
                const completedAppts = appointmentsData.filter(app => app.durum === 'tamamlandi')

                setStats([
                    {
                        title: "Bugünkü Randevularım",
                        value: todayAppts.length,
                        icon: "bi-calendar-check",
                        variant: "primary"
                    },
                    {
                        title: "Bekleyen Randevular",
                        value: pendingAppts.length,
                        icon: "bi-hourglass-split",
                        variant: "warning"
                    },
                    {
                        title: "Tamamlanan Randevular",
                        value: completedAppts.length,
                        icon: "bi-check-circle",
                        variant: "success"
                    }
                ])

                const sortedToday = [...todayAppts].sort((a, b) => a.randevu_saati.localeCompare(b.randevu_saati))
                setTodaySchedule(sortedToday.map(app => ({
                    saat: formatTime(app.randevu_saati),
                    hasta: `${app.hasta_ad} ${app.hasta_soyad}`,
                    bolum: app.bolum_adi
                })))

                const upcoming = appointmentsData.filter(app => {
                    if (!app.randevu_tarihi) return false
                    const apptDateStr = new Date(app.randevu_tarihi).toISOString().split('T')[0]
                    return apptDateStr > todayStr && ['beklemede', 'onaylandi'].includes(app.durum)
                })

                const sortedUpcoming = [...upcoming].sort((a, b) => {
                    const dateA = new Date(`${a.randevu_tarihi.split('T')[0]}T${a.randevu_saati}`)
                    const dateB = new Date(`${b.randevu_tarihi.split('T')[0]}T${b.randevu_saati}`)
                    return dateA - dateB
                })

                setUpcomingPatients(sortedUpcoming.slice(0, 5).map(app => ({
                    id: app.id,
                    hasta: `${app.hasta_ad} ${app.hasta_soyad}`,
                    tarih: formatDate(app.randevu_tarihi),
                    saat: formatTime(app.randevu_saati)
                })))
            } catch (err) {
                setError('Veriler yuklenirken hata olustu.')
            } finally {
                setLoading(false)
            }
        }

        fetchDoctorData()
    }, [user])

    if (loading) return <LoadingSpinner />
    if (error) return <AlertMessage type="danger" message={error} />

    return (
        <>
            <div className="row g-4 mb-4">
                {stats.map((item) => (
                    <div className="col-md-4" key={item.title}>
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            variant={item.variant}
                        />
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Bugünkü Programım</h5>
                        </div>
                        <div className="card-body">
                            {todaySchedule.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {todaySchedule.map((item, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between">
                                            <span>
                                                <strong>{item.saat}</strong>
                                            </span>
                                            <span>{item.hasta}</span>
                                            <span className="text-muted">{item.bolum}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Bugün için programınızda aktif randevu bulunmamaktadır.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Yaklaşan Hastalar</h5>
                        </div>
                        <div className="card-body p-0">
                            {upcomingPatients.length > 0 ? (
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Hasta</th>
                                            <th>Tarih</th>
                                            <th>Saat</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcomingPatients.map((patient) => (
                                            <tr key={patient.id}>
                                                <td>{patient.hasta}</td>
                                                <td>{patient.tarih}</td>
                                                <td>{patient.saat}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-3">
                                    <p className="text-muted mb-0">Yaklaşan randevulu hasta bulunmamaktadır.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashboardPage