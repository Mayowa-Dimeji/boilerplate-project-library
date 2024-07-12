/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Test Book" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, "response should be an object");
              assert.property(res.body, "title", "Book should contain title");
              assert.property(res.body, "_id", "Book should contain _id");
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get("/api/books/60d5f4839c10f724b87c5a5b")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        // First, create a book to get its ID
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Book for GET by ID test" })
          .end(function (err, res) {
            const bookId = res.body._id;
            chai
              .request(server)
              .get("/api/books/" + bookId)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body, "response should be an object");
                assert.property(res.body, "title", "Book should contain title");
                assert.property(res.body, "_id", "Book should contain _id");
                assert.property(
                  res.body,
                  "comments",
                  "Book should contain comments"
                );
                done();
              });
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          // First, create a book to get its ID
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book for POST comment test" })
            .end(function (err, res) {
              const bookId = res.body._id;
              chai
                .request(server)
                .post("/api/books/" + bookId)
                .send({ comment: "This is a test comment" })
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.isObject(res.body, "response should be an object");
                  assert.property(
                    res.body,
                    "title",
                    "Book should contain title"
                  );
                  assert.property(res.body, "_id", "Book should contain _id");
                  assert.property(
                    res.body,
                    "comments",
                    "Book should contain comments"
                  );
                  assert.include(res.body.comments, "This is a test comment");
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          // First, create a book to get its ID
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book for POST comment without comment field test" })
            .end(function (err, res) {
              const bookId = res.body._id;
              chai
                .request(server)
                .post("/api/books/" + bookId)
                .send({})
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, "missing required field comment");
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .post("/api/books/60d5f4839c10f724b87c5a5b")
            .send({ comment: "This is a test comment" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        // First, create a book to get its ID
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Book for DELETE test" })
          .end(function (err, res) {
            const bookId = res.body._id;
            chai
              .request(server)
              .delete("/api/books/" + bookId)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, "delete successful");
                done();
              });
          });
      });

      test("Test DELETE /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/60d5f4839c10f724b87c5a5b")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });
  });
});
