require("dotenv").config();

const path = require("path");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const Note = require("./models/Note");

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing");
} else {
  console.log("MONGODB_URI is available");
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/notes", async (request, response) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    response.json(notes);
  } catch (error) {
    response.status(500).json({ message: "Could not load notes." });
  }
});

app.post("/api/notes", async (request, response) => {
  try {
    const { title, category, content } = request.body;
    const note = await Note.create({ title, category, content });
    response.status(201).json(note);
  } catch (error) {
    response.status(400).json({ message: "Could not save note." });
  }
});

// This keeps the existing delete button working with notes stored in MongoDB.
app.delete("/api/notes/:id", async (request, response) => {
  try {
    const note = await Note.findByIdAndDelete(request.params.id);

    if (!note) {
      return response.status(404).json({ message: "Note not found." });
    }

    response.status(204).send();
  } catch (error) {
    response.status(400).json({ message: "Could not delete note." });
  }
});

app.get("*", (request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Little Notes is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
  });
