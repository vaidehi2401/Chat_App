const express = require('express');
const authenticate = require('../middleware/auth')
const controller = require('../controllers/userController')
const messageController = require('../controllers/messageController')
const router = express.Router();

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.post('/message', authenticate , messageController.postMessage)
module.exports=router;