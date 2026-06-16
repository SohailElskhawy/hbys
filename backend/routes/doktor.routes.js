const express = require('express');
const router = express.Router();
const doktorController = require('../controllers/doktor.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', doktorController.getDoktorlar);
router.get('/:id', doktorController.getDoktorById);
router.post('/', auth, role('admin'), doktorController.createDoktor);
router.put('/:id', auth, doktorController.updateDoktor);
router.delete('/:id', auth, role('admin'), doktorController.deleteDoktor);
router.get('/:id/randevular', auth, doktorController.getDoktorRandevular);
router.get('/:id/musaitsaatler', doktorController.getDoktorMusaitSaatler);

module.exports = router;
