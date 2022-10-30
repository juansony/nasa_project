const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (planet) => {
        if (isHabitablePlanet(planet)) {
          savePlanets(planet);
        }
      })
      .on("error", (error) => {
        console.log(error);
        reject(error);
      })
      .on("end", async () => {
        const habitablePlanets = (await getAllPlanets()).length;
        console.log(`${habitablePlanets} habitable planets were found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({}, { _id: 0, __v: 0 });
}

async function savePlanets(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (err) {
    console.log(`Could not save planet, ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
