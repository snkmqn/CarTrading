const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
    try {
        const {username, password} = req.body;

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({message: "Invalid username"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid password"});
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.json({token, message: "Login successful"});

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

module.exports = router;
