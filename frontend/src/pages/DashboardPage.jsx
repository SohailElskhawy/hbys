import React from 'react'
import { MainLayout } from '../components/layout'
import PieChart from "../components/charts/PieChart";
import BarChart from '../components/charts/BarChart';
import StatCard from "../components/common/StatCard";
import { useAuth } from '../hooks/useAuth'



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

    const bolumDagilimi = [
        { name: "Kardiyoloji", value: 5 },
        { name: "Nöroloji", value: 3 },
        { name: "Diş", value: 4 },
        { name: "Ortopedi", value: 2 },
        { name: "Göz", value: 2 },
    ];

    const aylikRandevular = [
        { ay: "Oca", randevu: 120 },
        { ay: "Şub", randevu: 95 },
        { ay: "Mar", randevu: 140 },
        { ay: "Nis", randevu: 180 },
        { ay: "May", randevu: 160 },
        { ay: "Haz", randevu: 210 },
    ];

    const stats = [
        {
            title: "Hastalar",
            value: 142,
            icon: "bi-people",
            variant: "primary"
        },
        {
            title: "Doktorlar",
            value: 28,
            icon: "bi-person-badge",
            variant: "success"
        },
        {
            title: "Randevular",
            value: 87,
            icon: "bi-calendar-check",
            variant: "warning"
        },
        {
            title: "Bölümler",
            value: 15,
            icon: "bi-building",
            variant: "danger"
        }
    ];

    const appointments = [
        {
            id: 1,
            hasta: "Ahmet Yılmaz",
            doktor: "Dr. Ayşe Demir",
            bolum: "Kardiyoloji",
            tarih: "15.06.2026",
            durum: "Onaylandı"
        },
        {
            id: 2,
            hasta: "Mehmet Kaya",
            doktor: "Dr. Ali Yıldız",
            bolum: "Ortopedi",
            tarih: "15.06.2026",
            durum: "Bekliyor"
        },
        {
            id: 3,
            hasta: "Fatma Şahin",
            doktor: "Dr. Elif Çelik",
            bolum: "Nöroloji",
            tarih: "16.06.2026",
            durum: "Tamamlandı"
        },


    ];

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

    const stats = [
        {
            title: "Yaklaşan Randevular",
            value: 2,
            icon: "bi-calendar-event",
            variant: "primary"
        },
        {
            title: "Tamamlanan Randevular",
            value: 14,
            icon: "bi-check-circle",
            variant: "success"
        }
    ];

    const nextAppointment = {
        doktor: "Dr. Ayşe Demir",
        bolum: "Kardiyoloji",
        tarih: "18.06.2026",
        saat: "14:30"
    };

    const favoriteDoctor = {
        isim: "Dr. Ayşe Demir",
        bolum: "Kardiyoloji",
        ziyaretSayisi: 6
    };

    return (
        <>
            {/* Stat Cards */}
            <div className="row g-4 mb-4">

                {stats.map((item) => (
                    <div
                        className="col-md-6"
                        key={item.title}
                    >
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            variant={item.variant}
                        />
                    </div>
                ))}

            </div>

            {/* Widgets */}
            <div className="row g-4">

                {/* Next Appointment */}
                <div className="col-lg-4">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                Sıradaki Randevum
                            </h5>
                        </div>

                        <div className="card-body">

                            <h6 className="fw-bold">
                                {nextAppointment.doktor}
                            </h6>

                            <p className="text-muted mb-2">
                                {nextAppointment.bolum}
                            </p>

                            <p className="mb-1">
                                📅 {nextAppointment.tarih}
                            </p>

                            <p className="mb-0">
                                🕒 {nextAppointment.saat}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Favorite Doctor */}
                <div className="col-lg-4">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                Favori Doktorum
                            </h5>
                        </div>

                        <div className="card-body">

                            <h6 className="fw-bold">
                                {favoriteDoctor.isim}
                            </h6>

                            <p className="text-muted">
                                {favoriteDoctor.bolum}
                            </p>

                            <span className="badge bg-primary">
                                {favoriteDoctor.ziyaretSayisi} ziyaret
                            </span>

                        </div>

                    </div>

                </div>

                {/* Quick Appointment */}
                <div className="col-lg-4">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                Hızlı İşlemler
                            </h5>
                        </div>

                        <div className="card-body d-flex flex-column justify-content-center">

                            <button
                                className="btn btn-primary btn-lg"
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
    );
}

function DoctorDashboardContent() {

    const stats = [
        {
            title: "Bugünkü Randevularım",
            value: 8,
            icon: "bi-calendar-check",
            variant: "primary"
        },
        {
            title: "Bekleyen Randevular",
            value: 3,
            icon: "bi-hourglass-split",
            variant: "warning"
        },
        {
            title: "Tamamlanan Randevular",
            value: 24,
            icon: "bi-check-circle",
            variant: "success"
        }
    ];

    const todaySchedule = [
        {
            saat: "09:00",
            hasta: "Ahmet Yılmaz",
            bolum: "Kardiyoloji"
        },
        {
            saat: "10:30",
            hasta: "Mehmet Kaya",
            bolum: "Kardiyoloji"
        },
        {
            saat: "13:00",
            hasta: "Fatma Şahin",
            bolum: "Kardiyoloji"
        }
    ];

    const upcomingPatients = [
        {
            id: 1,
            hasta: "Ayşe Demir",
            tarih: "17.06.2026",
            saat: "11:00"
        },
        {
            id: 2,
            hasta: "Ali Çelik",
            tarih: "17.06.2026",
            saat: "14:30"
        },
        {
            id: 3,
            hasta: "Zeynep Yıldız",
            tarih: "18.06.2026",
            saat: "09:15"
        }
    ];

    return (
        <>
            {/* Cards */}
            <div className="row g-4 mb-4">

                {stats.map((item) => (
                    <div
                        className="col-md-4"
                        key={item.title}
                    >
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            variant={item.variant}
                        />
                    </div>
                ))}

            </div>

            {/* Widgets */}
            <div className="row g-4">

                {/* Today's Schedule */}
                <div className="col-lg-6">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                Bugünkü Programım
                            </h5>
                        </div>

                        <div className="card-body">

                            <ul className="list-group list-group-flush">

                                {todaySchedule.map((item, index) => (

                                    <li
                                        key={index}
                                        className="list-group-item d-flex justify-content-between"
                                    >
                                        <span>
                                            <strong>{item.saat}</strong>
                                        </span>

                                        <span>
                                            {item.hasta}
                                        </span>

                                        <span className="text-muted">
                                            {item.bolum}
                                        </span>
                                    </li>

                                ))}

                            </ul>

                        </div>

                    </div>

                </div>

                {/* Upcoming Patients */}
                <div className="col-lg-6">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                Yaklaşan Hastalar
                            </h5>
                        </div>

                        <div className="card-body p-0">

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

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default DashboardPage