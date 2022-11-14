import express from "express";
import pick from "lodash/pick.js";
import { body, validationResult } from "express-validator";

const booksRouter = express.Router();

booksRouter.get("/books", async (request, response) => {
  const books = await request.app.locals.prisma.book.findMany();
  response.send({ data: books, message: "ok" });
});

booksRouter.get("/books/:bookId", async (request, response) => {
  const bookId = request.params.bookId;
  const book = await request.app.locals.prisma.book.findUnique({
    where: {
      id: Number.parseInt(bookId),
    },
  });

  response.send({ data: book, message: book ? "ok" : "not found" });
});

booksRouter.get("/books/:bookId/author", async (request, response) => {
  const bookId = request.params.bookId;
  const book = await request.app.locals.prisma.book.findUnique({
    where: {
      id: Number.parseInt(bookId),
    },
    include: {
      author: true,
    },
  });

  if (!book) {
    response.send({ data: null, message: "not found" });
    return;
  }

  response.send({ data: book.author, message: "ok" });
});

booksRouter.get("/books/:bookId/genres", async (request, response) => {
  const bookId = request.params.bookId;
  const book = await request.app.locals.prisma.book.findUnique({
    where: {
      id: Number.parseInt(bookId),
    },
    include: {
      genres: {
        include: {
          genre: true,
        },
      },
    },
  });
  const genres = book.genres.map(({ genre }) => genre);
  response.send({ data: genres, message: "ok" });
});

booksRouter.post(
  "/books",
  [
    body("title")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage(
        "Book must contain `title` and must be at least 5 characters"
      ),
    body("subtitle")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage(
        "Book must contain `subtitle` and must be at least 5 characters"
      ),
    body("pages")
      .notEmpty()
      .isNumeric()
      .withMessage("Book must contain `pages` and must be an integer value"),
    body("published").notEmpty().withMessage("Book must contain `published`"),
    body("publisher").notEmpty().withMessage("Book must contain `publisher`"),
    body("website").notEmpty().withMessage("Book must contain `website`"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const filteredBody = pick(request.body, [
      "title",
      "subtitle",
      "published",
      "publisher",
      "pages",
      "description",
      "website",
      "authorId",
    ]);

    if (request.body.genreIds) {
      const genres = request.body.genreIds.map((genreId) => ({
        genre: {
          connect: {
            id: Number.parseInt(genreId),
          },
        },
      }));
      filteredBody.genres = {
        create: genres,
      };
    }

    const book = await request.app.locals.prisma.book.create({
      data: filteredBody,
    });

    response.send({ data: book, message: "ok" });
  }
);

booksRouter.put("/books/:bookId", async (request, response) => {
  const bookId = request.params.bookId;

  const filteredBody = pick(request.body, [
    "title",
    "subtitle",
    "published",
    "publisher",
    "pages",
    "description",
    "website",
    "authorId",
  ]);

  const updatedBook = await request.app.locals.prisma.book.update({
    where: {
      id: Number.parseInt(bookId),
    },
    data: filteredBody,
  });

  response.send({ data: updatedBook, message: "ok" });
});

booksRouter.delete("/books/:bookId", async (request, response) => {
  const bookId = request.params.bookId;
  try {
    const deletedBook = await request.app.locals.prisma.book.delete({
      where: {
        id: Number.parseInt(bookId),
      },
    });
    response.send({
      data: deletedBook,
      message: deletedBook ? "ok" : "not found",
    });
  } catch {
    response.send({
      data: null,
      message: "resource not found",
    });
  }
});

export default booksRouter;
