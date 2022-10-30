const { getAllLaunches,scheduleNewLaunch, checkIfLaunchExist, abortLaunchByID } = require("../../models/launches.model");
const { getPagination} = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const {skip, limit} = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  let launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required properties",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "fecha invalida",
    });
  }
  await scheduleNewLaunch(launch);
  // console.log(launch);

  return res.status(201).json(launch);
}

async function httpDeleteLaunch(req, res) {
  const launchID = Number(req.params.id);

  if (!checkIfLaunchExist(launchID)) {
    return res.status(400).json({error : "launch not found"});
  }

  const abort = await abortLaunchByID(launchID);

  if (!abort) {
    return res.status(400).json({error : "launch not aborted"});
  }

  return res.status(200).json({ok : true});
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpDeleteLaunch,
};
