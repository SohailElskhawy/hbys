const express = require('express');
const router = express.Router();
const hastaController = require('../controllers/hasta.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, role('admin', 'doktor'), hastaController.getHastalar);
router.get('/:id', auth, hastaController.getHastaById);
router.post('/', auth, role('admin'), hastaController.createHasta);
router.put('/:id', auth, hastaController.updateHasta);
router.delete('/:id', auth, role('admin'), hastaController.deleteHasta);
router.get('/:id/randevular', auth, hastaController.getHastaRandevular);

module.exports = router;
