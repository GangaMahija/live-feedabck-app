const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Feedback Schema
const FeedbackSchema = new mongoose.Schema({
    eventId: String,
    user: String,
    rating: Number,
    comment: String,
});
const Feedback = mongoose.model("Feedback", FeedbackSchema);

// Submit Feedback
app.post("/feedback", async (req, res) => {
    const feedback = new Feedback(req.body);
    await feedback.save();
    io.emit("newFeedback", feedback);
    res.json(feedback);
});

// Get All Feedback
app.get("/feedback", async (req, res) => {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
