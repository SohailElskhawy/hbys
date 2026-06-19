const express = require('express');
const router = express.Router();
const istatistikController = require('../controllers/istatistik.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/genel', auth, role('admin'), istatistikController.getGenelIstatistikler);
router.get('/doktor-yuku', auth, role('admin'), istatistikController.getDoktorYuku);
router.get('/aktif-hastalar', auth, role('admin'), istatistikController.getAktifHastalar);
router.get('/musaitdoktorlar', auth, role('admin', 'hasta'), istatistikController.getMusaitDoktorlar);

module.exports = router;
