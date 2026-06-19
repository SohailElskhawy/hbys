const express = require('express');
const router = express.Router();
const bolumController = require('../controllers/bolum.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', bolumController.getBolumler);
router.get('/:id', bolumController.getBolumById);
router.post('/', auth, role('admin'), bolumController.createBolum);
router.put('/:id', auth, role('admin'), bolumController.updateBolum);
router.delete('/:id', auth, role('admin'), bolumController.deleteBolum);

module.exports = router;
