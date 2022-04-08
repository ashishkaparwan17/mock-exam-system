const router = require('express').Router()

const testController = require('../controllers/test-controller')
const checkAuth = require('../middleware/check-auth')

// Get all the tests for display on home page
router.get('/api/gettests',testController.getTests)

// Unauthorized access for below routes not allowed
router.use(checkAuth)

// Add a test to the database
router.post('/api/addtest',testController.addTest)
// Delete a test from the database
router.delete('/api/deletetest/:testId',testController.deleteTest)

module.exports = router