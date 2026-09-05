import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/server.js";

describe("MedLens API Integration Tests", () => {

  it("GET /api/health returns healthy status and active security headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.service).toContain("MedLens");
    expect(res.body.security.helmet).toBe("Active");
  });

  it("GET /api/reports/samples returns preloaded synthetic templates", async () => {
    const res = await request(app).get("/api/reports/samples");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.samples.length).toBeGreaterThanOrEqual(4);
  });

  it("GET /api/reports returns active reports with observations", async () => {
    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reports).toBeInstanceOf(Array);
  });

  it("POST /api/validator/verify-range detects grounded range", async () => {
    const payload = {
      testName: "HAEMOGLOBIN",
      observedValue: "11.8",
      referenceRange: "13.0 - 17.0",
      sourceOcrText: "HAEMOGLOBIN 11.8 g/dL 13.0 - 17.0"
    };

    const res = await request(app)
      .post("/api/validator/verify-range")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.validation.isValid).toBe(true);
    expect(res.body.validation.status).toBe("VERIFIED_EXACT_MATCH");
  });

  it("POST /api/validator/verify-range rejects missing parameters", async () => {
    const res = await request(app)
      .post("/api/validator/verify-range")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/reports/upload rejects empty text input", async () => {
    const res = await request(app)
      .post("/api/reports/upload")
      .send({ rawText: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login authenticates demo clinician user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "doctor@medlens.health",
        password: "MedLensDoctor2026!"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("CLINICIAN");
  });

  it("POST /api/auth/login rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "doctor@medlens.health",
        password: "WrongPassword!"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

});
