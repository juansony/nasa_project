const express = require("express");
const { planetsRouter } = require("./planets/planets_router");
const launchesRouter = require("./launches/launches_router");

const apiV1 = express.Router();

apiV1.use('/planets', planetsRouter);
apiV1.use('/launches', launchesRouter);

module.exports = apiV1;