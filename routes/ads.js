const express = require("express");
const Car = require("../models/cars");
const router = express.Router();
const verifyToken = require("../middlewares/auth");


router.post("/", verifyToken, async (req, res) => {
    try {
        const {name, year, color, description, seller} = req.body;
        const image = req.file;

        const newCar = new Car({name, year, color, description, seller, image, rating: 5});
        await newCar.save();

        res.status(201).json(newCar);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        let query = {};
        if (req.query.seller) {
            query.seller = req.query.seller;
        }

        const ads = await Car.find(query);
        res.json(ads);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({error: "Car not found"});
        }
        res.json({message: "Ad deleted"});
    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

router.put("/:id", verifyToken, async (req, res) => {
    try {
        const {name, year, color, description} = req.body;
        const image = req.file || undefined;

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            {name, year, color, description, ...(image && {image})},
            {new: true}
        );

        res.json(updatedCar);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

module.exports = router;
