const express = require("express");
const jwt = require("jsonwebtoken");
const getUser = require("../models/User");
const router = express.Router();

router.get("/user", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({message: "Access denied"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {algorithm: "HS256"});
        const userId = decoded.userId;

        const user = await getUser.findById(userId).select("username");
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.json({username: user.username});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

module.exports = router;
