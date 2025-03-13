const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({message: "Access denied"});
    }

    try {
        console.log('Received JWT:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {algorithms: ['HS256']});
        console.log('Decoded JWT:', decoded);
        req.user = {userId : decoded.userId};
        next()
    } catch (error) {
        console.error("Invalid JWT:", error);
        res.status(400).json({message: "Invalid JWT"});
    }
};

module.exports = verifyToken;
