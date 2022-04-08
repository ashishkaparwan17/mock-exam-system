const jwt = require('jsonwebtoken')

const checkAuth = (req, res, next) => {
    // get the authorization token
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({ message: "token not provided" })
    }
    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch (err) {
        // Catch the error if token was expired or incorrect
        return res.status(400).json({ message: "You are not authorized", err: err });
    }
    // All the protected routes will receive the user id in request
    req.id = decodedToken.id
    next()
}

module.exports = checkAuth;