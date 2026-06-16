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
            {/*  '!user' for dev purpose it'll be removed  */}
            {(user?.rol === 'admin' || !user) && (
                <AdminDashboardContent />
            )}

            {user?.rol === 'doktor' && (
                <DoctorDashboardContent />
            )}

            {(user?.rol === 'hasta') && (
                <PatientDashboardContent />
            )}

        </MainLayout>
    )
}


function AdminDashboardContent() {

    const bolumDagilimi = [ // fake data for dev purpos
        { name: "Kardiyoloji", value: 5 },
        { name: "Nöroloji", value: 3 },
        { name: "Diş", value: 4 },
        { name: "Ortopedi", value: 2 },
        { name: "Göz", value: 2 },
    ];

    const aylikRandevular = [ // // fake data for dev purpos
        { ay: "Oca", randevu: 120 },
        { ay: "Şub", randevu: 95 },
        { ay: "Mar", randevu: 140 },
        { ay: "Nis", randevu: 180 },
        { ay: "May", randevu: 160 },
        { ay: "Haz", randevu: 210 },
    ];

    const stats = [// fake data for dev purpos
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

    const appointments = [// fake data for dev purpos
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


            {/* // data-table starts */}
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
            {/* // data-table  ends */}
        </>
    )
}

function PatientDashboardContent() {

    return (
        <>
            <h2 className="mb-4">
                Hasta Dashboard
            </h2>

            <div className="alert alert-success">
                Randevularınız burada gösterilecek.
            </div>
        </>
    )
}

function DoctorDashboardContent() {

    return (
        <>
            <h2 className="mb-4">
                Doktor Dashboard
            </h2>

            <div className="alert alert-info">
                Yaklaşan randevularınız burada gösterilecek.
            </div>
        </>
    )
}

export default DashboardPage