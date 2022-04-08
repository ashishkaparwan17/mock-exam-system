const yup = require('yup');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user-model');

// schema to validate incoming sign up data
const signupValidationSchema = yup.object({
    name: yup.string().min(2, 'Name must have atleast 2 characters').max(30, 'Name must be less than 30 characters').required('Name required'),
    email: yup.string().matches(/.+@.+\...+/, 'Invalid email').email('Invalid email').required('Email required'),
    password: yup.string().min(5, 'Password should be 5 characters minimum').required('Password required'),
    cpassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password required')
})

const signup = async (req, res) => {

    const { name, email, password } = req.body;

    // validate the sign up data received from the client
    try {
        await signupValidationSchema.validate(req.body);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
    // find whether email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) return res.status(400).json({ message: "User already exists!" });

    // store the hashed password in the database
    let hashed_password = await bcrypt.hash(password, 12);

    // Capitalize first letter of every word in the name
    const capitalized_name = name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // create the user and save it in the database
    const newUser = new User({ name: capitalized_name, email, password: hashed_password, tests: [] });
    await newUser.save();

    return res.status(200).json({ message: "User created. Please log in now!" });
}

const loginValidationSchema = yup.object({
    email: yup.string().matches(/.+@.+\...+/, 'Invalid email').email('Invalid email').required('Email required'),
    password: yup.string().min(5, 'Password should be 5 characters minimum').required('Password required'),
});

const login = async (req, res) => {

    const { email, password } = req.body;

    // validate the login data received from the client
    try {
        await loginValidationSchema.validate(req.body);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

    // check whether email already exists
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) return res.status(400).json({ message: "User is not registered. Please sign up first!" });

    // if email exists then check the correctness of password
    let validPassword = await bcrypt.compare(password, existingUser.password)
    if (!validPassword) return res.status(400).json({ message: "Incorrect password. Please try again!" });

    const payload = {
        id: existingUser._id,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7h' })

    return res.status(200).json({
        token: token,
        name: existingUser.name,
        id: existingUser._id
    });
}

module.exports = { signup, login }