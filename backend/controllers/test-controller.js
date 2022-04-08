const yup = require('yup')
const mongoose = require('mongoose')

const Test = require('../models/test-model')
const User = require('../models/user-model')

const getTests = async (req, res) => {
    // The creator key in tests will have a whole 
    // user document because we used populate
    const tests = await Test.find().populate('creator')
    return res.status(200).json({ tests: tests })    
}

const addTestValidationSchema = yup.object({
    test_name: yup.string()
        .min(2, 'Name must have atleast 2 characters')
        .max(20, 'Name must not exceed 20 characters')
        .required('Test name required'),
    total_marks: yup.number()
        .integer('Total marks must not include a decimal point')
        .min(10, 'Test must be of atleast 10 marks')
        .max(360, 'Test must not exceed 360 marks')
        .required('Total marks required'),
    test_duration: yup.number()
        .integer('Test duration must not include a decimal point')
        .min(1, 'Test must be of atleast 1 minute')
        .max(180, 'Test must not exceed 180 minutes')
        .required('Test duration required'),
    test_pin: yup.number()
        .integer('Test pin must not include a decimal point')
        .min(100000, 'Test pin must be of length 6')
        .max(999999, 'Test pin must be of length  6')
        .required('Test pin required'),
    questions: yup.array().of(
        yup.object({
            title: yup.string().required('Title required'),
            a: yup.string().required('Option A required'),
            b: yup.string().required('Option B required'),
            c: yup.string().required('Option C required'),
            d: yup.string().required('Option D required'),
            correct: yup.number()
                .strict(true)
                .integer('Option number must not include a decimal point')
                .min(1, 'Enter correct option number only (1,2,3,4)')
                .max(4, 'Enter correct option number only (1,2,3,4)')
                .required('Correct option required')
        })
    ).required('Questions required')
        .test('atleast-one-question-check', 'Please add questions!', arr => arr && arr.length !== 0)
})

const addTest = async (req, res) => {
    
    const { test_name, total_marks, test_duration, test_pin, questions } = req.body
    
    // The id of the user who is logged in
    const id = req.id

    // validate the add test data received from the client
    try {
        await addTestValidationSchema.validate(req.body)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }

    // find whether test pin already exists
    const existingTest = await Test.findOne({ test_pin: test_pin })
    if (existingTest) {
        return res.status(400).json({ message: "Use a different pin!" })
    }

    // Find whether authenticated user exists in the database or not
    const existingUser = await User.findById(id)
    if (!existingUser) {
        return res.status(400).json({ message: "No such user!" })
    }

    // create the test
    const newTest = new Test({
        test_name,
        total_marks,
        test_duration,
        test_pin,
        number_of_questions: questions.length,
        questions,
        creator: existingUser._id
    })
    // When a test is created we want the user id to be stored as
    // creator of the test and we also want the test pin to be stored
    // in the users collection. If any of these two operations fail then
    // we want to roll back both so using session and transaction here
    try {
        const session = await mongoose.startSession()
        session.startTransaction()
        // Save the test in the tests collection
        await newTest.save({ session: session })
        // Add test pin to the users collection
        existingUser.tests.push(test_pin)
        await existingUser.save({ session: session })
        await session.commitTransaction()
    } catch (err) {
        return res.status(500).json({ message: err })
    }

    return res.status(200).json({ message: "Test added!", test: newTest })
}

const deleteTest = async (req, res) => {

    const testId = req.params.testId
    // The id of the user who is logged in
    const id = req.id

    const test = await Test.findById(testId).populate('creator')
    if (!test) {
        return res.status(400).json({ message: "Test does not exists!" })
    }

    // Only the user who created the test can delete it
    if (id != test.creator._id) {
        return res.status(400).json({ message: "You are not allowed to delete this test!" })
    }

    // when we delete a test from tests collection, it should
    // also be removed from the user's list of tests
    try {
        const session = await mongoose.startSession()
        session.startTransaction()
        // remove the test
        await test.remove({ session: session })
        // remove the test pin from users collections        
        test.creator.tests.pull(test.test_pin)
        await test.creator.save({ session: session })
        session.commitTransaction()
    } catch (err) {
        return res.status(500).json({ message: err })
    }

    return res.status(200).json({ message: "Test deleted!", test: test })
}

module.exports = { getTests, addTest, deleteTest }