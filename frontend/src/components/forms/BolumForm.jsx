import React, { useState, useEffect } from 'react';

const BolumForm = ({ initialData, onSubmit, onCancel }) => {
    const [bolumAdi, setBolumAdi] = useState('');
    const [aciklama, setAciklama] = useState('');
    const [kat, setKat] = useState('');
    const [dahili, setDahili] = useState('');
    const [aktif, setAktif] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (initialData) {
            setBolumAdi(initialData.bolum_adi || '');
            setAciklama(initialData.aciklama || '');
            setKat(initialData.kat || '');
            setDahili(initialData.dahili || '');
            setAktif(initialData.aktif === undefined ? true : !!initialData.aktif);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!bolumAdi.trim()) {
            setErrorMsg('Bölüm adı gereklidir.');
            return;
        }

        onSubmit({
            bolum_adi: bolumAdi.trim(),
            aciklama: aciklama.trim(),
            kat: kat.trim(),
            dahili: dahili.trim(),
            aktif: aktif ? 1 : 0
        });
    };

    return (
        <form onSubmit={handleSubmit} className="needs-validation">
            {errorMsg && (
                <div className="alert alert-danger border-0 shadow-sm mb-3">
                    {errorMsg}
                </div>
            )}

            <div className="mb-3">
                <label htmlFor="bolumAdi" className="form-label fw-bold">Bölüm Adı</label>
                <input
                    type="text"
                    id="bolumAdi"
                    className="form-control"
                    value={bolumAdi}
                    onChange={(e) => setBolumAdi(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="aciklama" className="form-label fw-bold">Açıklama</label>
                <textarea
                    id="aciklama"
                    className="form-control"
                    rows="3"
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                ></textarea>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label htmlFor="kat" className="form-label fw-bold">Bulunduğu Kat</label>
                    <input
                        type="text"
                        id="kat"
                        className="form-control"
                        value={kat}
                        onChange={(e) => setKat(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="dahili" className="form-label fw-bold">Dahili Telefon</label>
                    <input
                        type="text"
                        id="dahili"
                        className="form-control"
                        value={dahili}
                        onChange={(e) => setDahili(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="form-check form-switch">
                    <input
                        type="checkbox"
                        id="aktif"
                        className="form-check-input"
                        checked={aktif}
                        onChange={(e) => setAktif(e.target.checked)}
                    />
                    <label htmlFor="aktif" className="form-check-label fw-bold">Bölüm Aktif</label>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={onCancel}
                >
                    İptal
                </button>
                <button
                    type="submit"
                    className="btn btn-primary px-4"
                >
                    Kaydet
                </button>
            </div>
        </form>
    );
};

export default BolumForm;
