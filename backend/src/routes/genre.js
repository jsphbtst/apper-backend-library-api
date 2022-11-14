import express from "express";
import pick from "lodash/pick.js";
import { body, validationResult } from "express-validator";

const genresRouter = express.Router("/genres");

genresRouter.get("/", async (request, response) => {
  const genres = await request.app.locals.prisma.genre.findMany();
  response.send({ data: genres, message: "ok" });
});

genresRouter.get("/:genreId", async (request, response) => {
  const genreId = request.params.genreId;
  const genre = await request.app.locals.prisma.genre.findUnique({
    where: {
      id: Number.parseInt(genreId),
    },
  });

  response.send({ data: genre, message: genre ? "ok" : "not found" });
});

genresRouter.get("/:genreId/books", async (request, response) => {
  const genreId = request.params.genreId;
  const genre = await request.app.locals.prisma.genre.findUnique({
    where: {
      id: Number.parseInt(genreId),
    },
    include: {
      books: {
        include: {
          book: true,
        },
      },
    },
  });
  const books = genre.books.map(({ book }) => book);
  response.send({ data: books, message: "ok" });
});

genresRouter.post(
  "/",
  [
    body("title")
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Genre requires `title` and should be minimum 3 characters long"
      ),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const filteredBody = pick(request.body, ["title"]);

    const genre = await request.app.locals.prisma.genre.create({
      data: filteredBody,
    });

    response.send({ data: genre, message: "ok" });
  }
);

genresRouter.put(
  "/:genreId",
  [
    body("title")
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Genre requires `title` and should be minimum 3 characters long"
      ),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const genreId = request.params.genreId;

    const filteredBody = pick(request.body, ["title"]);

    const updatedGenre = await request.app.locals.prisma.genre.update({
      where: {
        id: Number.parseInt(genreId),
      },
      data: filteredBody,
    });

    response.send({ data: updatedGenre, message: "ok" });
  }
);

genresRouter.delete("/:genreId", async (request, response) => {
  const genreId = request.params.genreId;
  try {
    const deletedGenre = await request.app.locals.prisma.genre.delete({
      where: {
        id: Number.parseInt(genreId),
      },
    });
    response.send({
      data: deletedGenre,
      message: deletedGenre ? "ok" : "not found",
    });
  } catch {
    response.send({
      data: null,
      message: "resource not found",
    });
  }
});

export default genresRouter;
