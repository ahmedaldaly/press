const router = require('express').Router();
const {Register , LogIn ,LogOut} = require('../controller/authController');
router.post('/register',Register);
router.post('/login',LogIn);
router.post('/logout',LogOut);
module.exports =router