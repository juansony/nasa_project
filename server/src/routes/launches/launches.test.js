const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launch api test", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  })

  describe("test GET /launches", () => {
    test("it should respond with 200 success code", async () => {
      await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("test POST /launches", () => {
    const data = {
      mission: "Kepler exploration x",
      rocket: "Explorer IS1",
      launchDate: "December 27, 2035",
      target: "Kepler-62 f",
    };
    const dataWithOutDate = {
      mission: "Kepler exploration x",
      rocket: "Explorer IS1",
      target: "Kepler-62 f",
    };
    const dataWithInvalidDate = {
      mission: "Kepler exploration x",
      rocket: "Explorer IS1",
      launchDate: "ewfwfwe",
      target: "Kepler-62 f",
    };

    test("it should respond with 201 created", async () => {
      const resp = await request(app)
        .post("/v1/launches")
        .send(data)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(data.launchDate).valueOf();
      const responseDate = new Date(resp.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);

      expect(resp.body).toMatchObject(dataWithOutDate);
    });

    test("it should catch missing required properties", async () => {
      const resp = await request(app)
        .post("/v1/launches")
        .send(dataWithOutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(resp.body).toStrictEqual({ error: "Missing required properties" });
    });

    test("it should catch invalid date", async () => {
      const resp = await request(app)
        .post("/v1/launches")
        .send(dataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(resp.body).toStrictEqual({ error: "fecha invalida" });
    });
  });
});
