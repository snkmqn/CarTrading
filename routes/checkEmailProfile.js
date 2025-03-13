const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middlewares/auth.js");

const router = express.Router();

router.post("/check-email", verifyToken, async (req, res) => {
    const { newEmail } = req.body;
    try {
        const user = await User.findOne({ email: newEmail });
        if (user) {
            return res.json({ exists: true });
        }
        return res.json({ exists: false });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
});

module.exports = router;
