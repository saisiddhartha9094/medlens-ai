<<<<<<< HEAD
# medlens-ai
AI-powered clinical record organizer that extracts lab values from medical reports, validates reference ranges against source text to prevent hallucination, tracks field-level provenance (patient vs AI), and generates safe, non-diagnostic summaries.
=======
# 🩺 MedLens — AI-Powered Clinical Information Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HL7 FHIR](https://img.shields.io/badge/Standards-HL7%20FHIR%20R4-firebrick.svg)](https://hl7.org/fhir/)
[![ABDM Ready](https://img.shields.io/badge/ABDM-Sandbox%20Compliant-teal.svg)](https://abdm.gov.in/)
[![Zero Hallucination](https://img.shields.io/badge/Safety-Zero%20Hallucination%20Guard-emerald.svg)](#anti-hallucination-validator)

> **MedLens** is an end-to-end, responsible clinical information structuring and intelligence platform built for the **Smart India Hackathon (SIH)**. It ingests messy medical inputs (patient-entered details + uploaded reports/prescriptions) and turns them into clean, structured, traceable patient records with plain-language summaries — **without ever pretending to be a doctor**.

---

## 🚀 Key Innovations & Differentiators

1. **🛡️ Anti-Hallucination Reference-Range Validator (The Core SIH USP)**
   - Algorithmic check matching every extracted reference range against verbatim substrings and strict numeric boundary containment in the raw source OCR text.
   - Refuses to evaluate High/Low status if the range is absent or fabricated, preventing AI hallucinations from leaking into clinical records.
   - Includes an interactive **Guardrail Playground** to demonstrate live interception of altered ranges.

2. **🏷️ Full Field-Level Source Provenance**
   - Every single observation is tagged:
     - 🟢 `Patient-Reported` (demographics, medications, allergies, symptoms)
     - 🔵 `AI-Verified (Grounded)` (verified against source OCR text)
     - 🟠 `Needs Review` (unverified or missing biological range)
     - 🟣 `Derived / System` (clinical indices)

3. **📑 Side-by-Side Interactive Source Highlighting**
   - Clicking any observation in the structured table automatically scrolls and highlights the exact line in the raw OCR view.

4. **👥 Dual Presentation Modes**
   - **Clinician Dashboard**: Dense tabular view with LOINC codes (e.g., `718-7`, `1975-2`), biological intervals, abnormality filters, and audit logs.
   - **Patient-Friendly View**: Plain-language biomarker explanations, visual gauge bars, and "Questions to Ask Your Doctor" with strict non-diagnostic disclaimers.

5. **📈 Longitudinal Biomarker Trajectory Analysis**
   - Visual time-series charts tracking biomarkers (HbA1c, Fasting Blood Sugar, Total Cholesterol, TSH) across multi-month visits with normal reference bands.

6. **🇮🇳 HL7 FHIR R4 & ABDM Interoperability**
   - Exports valid **HL7 FHIR R4 Bundles** with `Patient`, `Observation`, and `DiagnosticReport` resources.
   - Fully compliant with India's **Ayushman Bharat Digital Mission (ABDM)** ABHA ID standard (`XX-XXXX-XXXX-XXXX`).

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                    │
│  Patient Intake | Report Upload | Clinician View | Patient View │
│  Source Highlighter | Longitudinal Trends | Guardrail Playground│
└───────────────────────────────┬─────────────────────────────────┘
                                │ REST API Proxy (/api)
┌───────────────────────────────▼─────────────────────────────────┐
│                   BACKEND (Express.js / Node.js)                │
│  Intake Service | Ingestion Gateway | Clinical Extraction Engine │
└──────┬───────────────┬───────────────┬────────────────┬─────────┘
       │               │               │                │
       ▼               ▼               ▼                ▼
 ┌───────────┐  ┌──────────────┐ ┌─────────────┐  ┌──────────────┐
 │ Document  │  │ Structured   │ │ Anti-       │  │ Guardrailed  │
 │ Parser /  │→ │ LOINC Entity │→│ Hallucination│→│ Plain-       │
 │ OCR Stream│  │ Extraction   │ │ Range Guard │  │ Summarizer   │
 └───────────┘  └──────────────┘ └─────────────┘  └──────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │    HL7 FHIR R4 Bundle Store   │
                 │  + Field Provenance Audit Log │
                 └───────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Custom Responsive SVG Timeline Engine
- **Backend**: Node.js, Express.js, REST API, Multer
- **Clinical Standards**: HL7 FHIR R4, LOINC Coding Dictionary, ABDM/ABHA Format
- **Safety & Verification**: Grounded substring containment, numeric token boundary extraction, contextual Levenshtein verification

---

## ⚡ Quick Start & Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/saisiddhartha9094/medlens-ai.git
cd medlens-ai
```

### 2. Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 3. Run the Application
In terminal 1 (Backend):
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
>>>>>>> fa3b6f7 (feat: Initial commit of MedLens AI-Powered Clinical Information Intelligence)
