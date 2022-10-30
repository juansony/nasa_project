const axios = require("axios");
const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100, //flight number
//   mission: "Kepler exploration x", // name
//   rocket: "Explorer IS1", // rocket.name
//   launchDate: new Date("December 27, 2030"), //date_local
//   target: "Kepler-442 b", // N/A
//   customers: ["ZTM", "NASA"], // payloads.customers for each payload
//   upcoming: true, // upcoming
//   success: true, // success
// };

const SPACE_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Downloading launches data");
  const response = await axios.post(SPACE_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;

  for (const ldoc of launchDocs) {
    const payloads = ldoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });

    const launch = {
      flightNumber: ldoc["flight_number"],
      mission: ldoc["name"],
      rocket: ldoc["rocket"]["name"],
      launchDate: ldoc["date_local"],
      upcoming: ldoc["upcoming"],
      success: ldoc["success"],
      customers,
    };
    // console.log(`${launch.flightNumber} ${launch.mission}`);
    saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });


  if (firstLaunch) {
    console.log("Launch data already loaded");
    return;
  } else {
    await populateLaunches();
  }
}

async function getLatestFlightNumber() {
  const currentFlightNumber = await launches.findOne().sort("-flightNumber");

  if (!currentFlightNumber) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return currentFlightNumber.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launches.find({}, { _id: 0, __v: 0 }).sort({flightNumber : 1}).skip(skip).limit(limit);
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const validPlanet = planets.findOne({ keplerName: launch.target });

  if (!validPlanet) {
    throw new Error("The planet selected is not on the valid list of planets.");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function checkIfLaunchExist(launchID) {
  return await findLaunch({ flightNumber: launchID });
}

async function abortLaunchByID(launchID) {
  const aborted = await launches.updateOne(
    { flightNumber: launchID },
    { upcoming: false, success: false }
  );

  return aborted.ok === 1 && aborted.nModified === 1;
}

module.exports = {
  launches,
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  checkIfLaunchExist,
  abortLaunchByID,
};
