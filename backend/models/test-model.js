const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    test_name: { type: String, required: true },
    total_marks: { type: Number, required: true },
    test_duration: { type: Number, required: true },
    test_pin: { type: Number, required: true },
    number_of_questions: { type: Number, required: true },
    questions: [{
        title: { type: String, required: true },
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String, required: true },
        d: { type: String, required: true },
        correct: { type: Number, required: true }
    }],
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
})

module.exports = mongoose.model('Test', testSchema)