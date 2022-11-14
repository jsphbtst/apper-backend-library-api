import express from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import pick from "lodash/pick.js";

const SALT_ROUNDS = 10;
const authRouter = express.Router();

// GET /me
authRouter.get("/me", (request, response) => {
  response.send({ data: null, message: "ok" });
});

// POST /sign-up
authRouter.post(
  "/sign-up",
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
    body("password").notEmpty().isLength({ min: 5 }),
    // .isString()
    // .isLength({ min: 5 })
    // .not()
    // .isLowercase()
    // .not()
    // .isUppercase()
    // .not()
    // .isNumeric()
    // .not()
    // .isAlpha(),
    body("email")
      .notEmpty()
      .isEmail()
      .withMessage("Author requires a valid `email`"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const filteredBody = pick(request.body, [
      "firstName",
      "lastName",
      "email",
      "password",
    ]);

    const hashedPassword = await bcrypt.hash(
      filteredBody.password,
      SALT_ROUNDS
    );
    filteredBody.password = hashedPassword;

    const user = await request.app.locals.prisma.user.create({
      data: filteredBody,
    });

    response.send({ data: user, message: user ? "ok" : "error" });
  }
);

// POST /sign-in
authRouter.post("/sign-in", (request, response) => {
  response.send({ data: null, message: "ok" });
});

// POST /sign-out
authRouter.post("/sign-out", (request, response) => {
  response.send({ data: null, message: "ok" });
});

export default authRouter;
