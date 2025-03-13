const express = require("express");
const router = express.Router();
const Car = require("../models/cars");

router.get("/search", async (req, res) => {
    try {
        const {name} = req.query;
        if (!name) {
            return res.status(400).json({message: "Please enter a car name for search."});
        }

        function escapeRegex(string) {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        const safeName = escapeRegex(name);
        const cars = await Car.find({name: {$regex: new RegExp(safeName, "i")}});

        if (cars.length === 0) {
            console.log("No cars found.");
            return res.status(404).json({message: "Cars not found"});
        }
        res.json(cars);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

module.exports = router;
