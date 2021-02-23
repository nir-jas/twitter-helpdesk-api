# RPT HelpDesk API

## System Requirements

The only dependencies of the framework are Node.js and npm.

Ensure your versions of those tools match the following criteria:

- Node.js >= 8.0.0
- npm >= 3.0.0
- git


## Installing AdonisJs
AdonisJs CLI is a command line tool to help you install AdonisJs.

Install it globally via npm like so:
```
npm i -g @adonisjs/cli
```

## Setup

- clone the repo and then run `npm install`.
- copy ```.env.example``` to ```.env```
- create database and update .env file

### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```

### Seeder

Run the following command to seed Inital data.

```js
adonis seed
```

### Run
```js
adonis serve --dev
```