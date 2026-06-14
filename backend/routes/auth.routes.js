const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login", authController.login);

router.get("/me", authMiddleware, authController.me);

router.post("/logout", authMiddleware, authController.logout);

router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;