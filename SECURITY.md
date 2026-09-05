# Security & Clinical Data Protection Policy — MedLens

## 🛡️ Threat Model & Security Posture

MedLens is an AI-powered clinical information organization tool designed to ingest, structure, and summarize sensitive patient diagnostic records while strictly preserving clinical trust, non-diagnostic boundaries, and zero-hallucination guarantees.

---

## 🔒 Implemented Security Controls

### 1. HTTP Hardening (Helmet)
- All HTTP responses include hardened security headers:
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking attacks)
  - `X-Content-Type-Options: nosniff` (mitigates MIME-confusion exploits)
  - `Referrer-Policy: no-referrer`
  - Removal of `X-Powered-By: Express` header to minimize technology fingerprinting.

### 2. Rate Limiting (`express-rate-limit`)
- **Global API Rate Limiter**: Capped at 200 requests per 15-minute window per IP.
- **Document Ingestion Limiter**: Stricter cap of 35 document upload/OCR requests per 15-minute window to protect local OCR compute resources and prevent denial-of-service abuse.

### 3. Strict CORS Scoping
- Permissive `*` wildcard CORS has been removed.
- Cross-origin requests are strictly restricted to explicit allowlisted frontend origins (`http://localhost:5173`, `http://127.0.0.1:5173`) and configurable production domains via the `ALLOWED_ORIGINS` environment variable.

### 4. Input Sanitization & Payload Bounds
- All `/api/reports/upload` requests are strictly verified:
  - Empty text detection rejects non-string payloads.
  - Maximum payload bound of **50,000 characters** prevents memory exhaustion buffer attacks.
- Multer enforces an explicit **10MB file limit** and restricts uploads strictly to medical image MIME types (`image/png`, `image/jpeg`, `image/webp`) and plain text documents.

### 5. Role-Based Access Control (RBAC) & JWT Authentication
- Passwords hashed using **bcrypt** with standard salt work factors.
- Session tokens signed via **HMAC-SHA256 JWTs** with embedded claims (`id`, `email`, `role`).
- Clinician-specific actions (e.g. `HUMAN_CORRECTED` observation modifications) require verified `CLINICIAN` authorization.

### 6. Responsible AI & Anti-Hallucination Guardrails
- Reference ranges are physically cross-checked against raw OCR strings before any status evaluation is performed.
- Fabricated ranges trigger an immediate `HALLUCINATION_BLOCKED` flag and prevent premature High/Low status labels.

---

## ⚖️ Indian Digital Personal Data Protection (DPDP) Act & HIPAA Considerations

For the SIH Prototype:
- Synthetic, de-identified patient data (Synthea-style) is utilized to eliminate privacy risks during live demonstrations.
- ABHA IDs follow the ABDM 14-digit format specification (`XX-XXXX-XXXX-XXXX`).

### Production Scaling Architecture (Future Scope):
1. **Encryption at Rest**: AES-256 GCM encryption for raw documents and structured PostgreSQL records.
2. **Encryption in Transit**: Strict TLS 1.3 encryption with certificate pinning.
3. **ABDM Consent Management**: Full integration with the ABDM Consent Manager (Milestones M1–M3) ensuring explicit time-bound patient consent before health record access.
4. **Immutable Audit Trails**: Blockchain or append-only tamper-evident logs for all observation provenance transitions.
