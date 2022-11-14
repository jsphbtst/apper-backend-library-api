import express from "express";
import pick from "lodash/pick.js";
import { body, validationResult } from "express-validator";

const authorsRouter = express.Router("/authors");

authorsRouter.get("/", async (request, response) => {
  const authors = await request.app.locals.prisma.author.findMany();
  response.send({ data: authors, message: "ok" });
});

authorsRouter.get("/:authorId", async (request, response) => {
  const authorId = request.params.authorId;
  const author = await request.app.locals.prisma.author.findUnique({
    where: {
      id: Number.parseInt(authorId),
    },
  });

  response.send({ data: author, message: author ? "ok" : "not found" });
});

authorsRouter.get("/:authorId/books", async (request, response) => {
  const authorId = request.params.authorId;
  const author = await request.app.locals.prisma.author.findUnique({
    where: {
      id: Number.parseInt(authorId),
    },
    include: {
      books: true,
    },
    // include: {
    //   books: {
    //     include: {
    //       genres: {
    //         include: {
    //           genre: true,
    //         },
    //       },
    //     },
    //   },
    // },
  });
  response.send({ data: author?.books ?? [], message: "ok" });
});

authorsRouter.post(
  "/",
  [
    body("firstName")
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Author requires `firstName` and should be minimum 3 characters long"
      ),
    body("lastName")
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Author requires `lastName` and should be minimum 3 characters long"
      ),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const filteredBody = pick(request.body, ["firstName", "lastName"]);

    const author = await request.app.locals.prisma.author.create({
      data: filteredBody,
    });

    response.send({ data: author, message: "ok" });
  }
);

authorsRouter.put(
  "/:authorId",
  [
    body("firstName")
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Author requires `firstName` and should be minimum 3 characters long"
      ),
    body("lastName")
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage(
        "Author requires `lastName` and should be minimum 3 characters long"
      ),
  ],
  async (request, response) => {
    const authorId = request.params.authorId;

    const filteredBody = pick(request.body, ["firstName", "lastName"]);

    const updatedAuthor = await request.app.locals.prisma.author.update({
      where: {
        id: Number.parseInt(authorId),
      },
      data: filteredBody,
    });

    response.send({ data: updatedAuthor, message: "ok" });
  }
);

authorsRouter.delete("/:authorId", async (request, response) => {
  const authorId = request.params.authorId;
  try {
    const deletedAuthor = await request.app.locals.prisma.author.delete({
      where: {
        id: Number.parseInt(authorId),
      },
    });
    response.send({
      data: deletedAuthor,
      message: deletedAuthor ? "ok" : "not found",
    });
  } catch {
    response.send({
      data: null,
      message: "resource not found",
    });
  }
});

export default authorsRouter;
