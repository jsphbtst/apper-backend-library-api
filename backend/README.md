## Dependency Installation

### Installing Prisma

```
npm install prisma --save-dev
npx prisma init --datasource-provider postgresql
```

### Installing Non-Prisma Deps

```
npm install lodash express-validator
```

Lodash: library containing array / object manipulation functions
Express Validator: library containing methods to validate incoming request contents

## Creating a Postgres DB in Heroku

```
heroku.com
new -> create app -> [insert name here]
resources -> add-ons -> heroku postgres
settings -> config vars -> DATABASE_URL
```

## Notes:

Prisma CRUD Operations:

- https://www.prisma.io/docs/concepts/components/prisma-client/crud

Prisma relationship modeling:

- https://www.youtube.com/watch?v=fpBYj55-zd8

Prisma Many-to-Many:

- https://www.prisma.io/docs/concepts/components/prisma-schema/relations/many-to-many-relations

Express Validator methods:

- https://express-validator.github.io/docs/schema-validation.html
- https://github.com/validatorjs/validator.js#sanitizers

## Seed Database

```
npx prisma db push
npx prisma db seed
```
