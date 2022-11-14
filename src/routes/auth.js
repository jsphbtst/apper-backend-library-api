import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pick from "lodash/pick.js";
import omit from "lodash/omit.js";

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

    const filteredUser = omit(user, ["id", "password"]);

    response.send({ data: filteredUser, message: user ? "ok" : "error" });
  }
);

// POST /sign-in
authRouter.post(
  "/sign-in",
  [
    body("password")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage("Sign In requires a valid `password`"),
    body("email")
      .notEmpty()
      .isEmail()
      .withMessage("Sign In requires a valid `email`"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const filteredBody = pick(request.body, ["email", "password"]);
    const user = await request.app.locals.prisma.user.findUnique({
      where: { email: filteredBody.email },
    });

    if (!user) {
      response.status(404).json({ data: null, message: "error not found" });
      return;
    }

    const isCorrectPassword = await bcrypt.compare(
      filteredBody.password,
      user.password
    );

    if (!isCorrectPassword) {
      response
        .status(401)
        .json({ data: null, message: "incorrect credentials" });
      return;
    }

    const filteredUser = omit(user, ["id", "password"]);

    const jwtSessionObject = {
      uid: user.id,
      email: user.email,
    };

    const maxAge = 1 * 24 * 60 * 60;
    const jwtSession = await jwt.sign(
      jwtSessionObject,
      process.env.JWT_SECRET,
      {
        expiresIn: maxAge, // this jwt will expire in 24 hours
        // expiresIn requires time in milliseconds
      }
    );

    response.cookie("sessionId", jwtSession, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

    response.send({ data: filteredUser, message: "ok" });
  }
);

// POST /sign-out
authRouter.post("/sign-out", (request, response) => {
  response.send({ data: null, message: "ok" });
});

export default authRouter;
