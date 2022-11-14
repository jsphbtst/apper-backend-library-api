import express from "express";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth.js";
import booksRouter from "./routes/book.js";
import authorsRouter from "./routes/author.js";
import genresRouter from "./routes/genre.js";

const app = express();
app.use(express.json()); // allows express to parse JSON from a network request

const prisma = new PrismaClient();

app.locals.prisma = prisma;

const PORT = 4000;

// Two ways of using express.Router
app.use(authRouter);
app.use(booksRouter);
app.use("/authors", authorsRouter);
app.use("/genres", genresRouter);

app.get("/", (request, response) => {
  response.send({ message: "hello, world!" });
});

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
