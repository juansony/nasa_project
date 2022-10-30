const API_URL = "http://localhost:8000/v1";

async function httpGetPlanets() {
  const resp = await fetch(`${API_URL}/planets`);
  return await resp.json();
}

async function httpGetLaunches() {
  const resp = await fetch(`${API_URL}/launches`);
  const fetchedLaunches = await resp.json();

  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    const resp = await fetch(`${API_URL}/launches`, {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(launch),
    });
    return resp;
  } catch (error) {
    console.log(error);
    return {
      ok: false,
    };
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: "delete",
    });
  } catch (error) {
    console.log(error);
    return {
      ok: false,
    };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
