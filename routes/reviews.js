const express = require("express");
const Reviews = require("../models/reviews");
const verifyToken = require("../middlewares/auth.js");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/reviews", async (req, res) => {
    try {
        const {userId} = req.query;
        if (!userId) return res.status(400).json({error: "userId is required"});

        const reviews = await Reviews.find({userId}).populate("reviewerId", "username");

        const formattedReviews = reviews.map(review => ({
            _id: review._id,
            reviewerId: review.reviewerId,
            reviewerName: review.reviewerName,
            rating: review.rating,
            text: review.text,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        }));

        res.json(formattedReviews);
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

router.post("/reviews", verifyToken, async (req, res) => {
    try {
        const {userId, reviewerId, reviewerName, text, rating} = req.body;

        const newReview = new Reviews({
            userId,
            reviewerId,
            reviewerName,
            text,
            rating,
        });

        await newReview.save();
        res.status(201).json(newReview);

    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

router.put("/reviews/:id", verifyToken, async (req, res) => {
    try {
        const review = await Reviews.findById(req.params.id);
        if (!review) return res.status(404).json({error: "Review not found"});

        if (review.reviewerId.toString() !== req.user.userId) {
            return res.status(403).json({error: "Not allowed"});
        }

        review.text = req.body.text ?? review.text;
        review.rating = req.body.rating ?? review.rating;
        await review.save();

        res.json(review);
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

router.delete("/reviews/:id", verifyToken, async (req, res) => {
    try {
        const review = await Reviews.findById(req.params.id);
        if (!review) return res.status(404).json({error: "Review not found"});

        if (review.reviewerId.toString() !== req.user.userId) {
            return res.status(403).json({error: "Not allowed"});
        }

        await Reviews.deleteOne({_id: req.params.id});
        res.json({message: "Review deleted successfully"});
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});

module.exports = router;
