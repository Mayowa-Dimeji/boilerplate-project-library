"use strict";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config(); // Ensure the .env file is loaded

// Log the Mongo URI to verify it's being read correctly
console.log("Mongo URI:", process.env.MONGO_URI);

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      try {
        const books = await Book.find({});
        res.json(
          books.map((book) => ({
            _id: book._id,
            title: book.title,
            commentcount: book.comments.length,
          }))
        );
      } catch (err) {
        res.status(500).send("Internal server error");
      }
    })

    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.send("missing required field title");
      }
      try {
        const newBook = new Book({ title });
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.status(500).send("Internal server error");
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.send("complete delete successful");
      } catch (err) {
        console.error(err); // Log the error
        res.status(500).send("Internal server error");
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send("no book exists");
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send("no book exists");
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.send("missing required field comment");
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send("no book exists");
        }
        book.comments.push(comment);
        const updatedBook = await book.save();
        res.json({
          _id: updatedBook._id,
          title: updatedBook.title,
          comments: updatedBook.comments,
          commentcount: updatedBook.comments.length,
        });
      } catch (err) {
        res.status(500).send("Internal server error");
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.send("no book exists");
        }
        res.send("delete successful");
      } catch (err) {
        console.error(err); // Log the error
        res.status(500).send("Internal server error");
      }
    });
};
