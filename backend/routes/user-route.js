const router = require('express').Router()

const userController = require('../controllers/user-controller')

router.post('/api/signup', userController.signup)

router.post('/api/login', userController.login)

module.exports = router