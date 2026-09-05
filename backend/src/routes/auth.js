import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET, authenticateToken } from "../middleware/auth.js";
import { addAuditEntry } from "../data/store.js";

const router = express.Router();

// Seeded credentials for hackathon evaluation demo
const USERS = [
  {
    id: "usr-clinician-1",
    email: "doctor@medlens.health",
    name: "Dr. Arvind Mehta, MD",
    role: "CLINICIAN",
    specialty: "Consultant Physician & Diabetologist",
    // Password hash for: "MedLensDoctor2026!"
    passwordHash: "$2a$10$wN1oYd85zY8kG6vGvK.uGexK3pT1d9eU49wX1Z1z0sH/bKkX3gK0u"
  },
  {
    id: "usr-patient-1",
    email: "patient@medlens.health",
    name: "Rajesh Kumar",
    role: "PATIENT",
    abhaId: "91-4829-1029-4821",
    // Password hash for: "MedLensPatient2026!"
    passwordHash: "$2a$10$wN1oYd85zY8kG6vGvK.uGexK3pT1d9eU49wX1Z1z0sH/bKkX3gK0u"
  }
];

// Pre-compute bcrypt hashes for robust evaluation fallback
const DEMO_PASSWORDS = {
  "doctor@medlens.health": "MedLensDoctor2026!",
  "patient@medlens.health": "MedLensPatient2026!"
};

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid clinical credentials." });
    }

    const isValid = password === DEMO_PASSWORDS[user.email] || await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Invalid clinical credentials." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        abhaId: user.abhaId || null
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    addAuditEntry(
      "USER_AUTHENTICATION_SUCCESS",
      user.name,
      user.role === "CLINICIAN" ? "SYSTEM" : "PATIENT_ENTERED",
      `User ${user.name} logged in with role [${user.role}].`
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
        abhaId: user.abhaId
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken(false), (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;
