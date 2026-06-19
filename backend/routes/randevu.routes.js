const express = require('express');
const router = express.Router();
const randevuController = require('../controllers/randevu.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, role('admin'), randevuController.getRandevular);
router.get('/:id', auth, randevuController.getRandevuById);
router.post('/', auth, randevuController.createRandevu);
router.put('/:id', auth, role('admin', 'doktor'), randevuController.updateRandevu);
router.patch('/:id/durum', auth, randevuController.updateRandevuDurum);
router.delete('/:id', auth, role('admin'), randevuController.deleteRandevu);

module.exports = router;
