import React, { useState } from "react";
import { X, UserCheck, Save, ShieldCheck, Heart, Pill, AlertCircle } from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";

export default function PatientIntakeModal({ isOpen, onClose, patient, onUpdatePatient }) {
  const [formData, setFormData] = useState({
    fullName: patient?.fullName || "Rajesh Kumar",
    age: patient?.age || 48,
    gender: patient?.gender || "Male",
    abhaId: patient?.abhaId || "91-4829-1029-4821",
    phone: patient?.phone || "+91 98765 43210",
    email: patient?.email || "rajesh.kumar@example.com",
    address: patient?.address || "Bengaluru, Karnataka",
    chiefComplaints: patient?.patientContext?.chiefComplaints || "",
    chronicConditions: (patient?.patientContext?.chronicConditions || []).join(", "),
    currentMedications: (patient?.patientContext?.currentMedications || []).join("; "),
    allergies: (patient?.patientContext?.allergies || []).join(", ")
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      fullName: formData.fullName,
      age: parseInt(formData.age),
      gender: formData.gender,
      abhaId: formData.abhaId,
      phone: formData.phone,
      email: formData.email,
      patientContext: {
        chiefComplaints: formData.chiefComplaints,
        chronicConditions: formData.chronicConditions.split(",").map(s => s.trim()).filter(Boolean),
        currentMedications: formData.currentMedications.split(";").map(s => s.trim()).filter(Boolean),
        allergies: formData.allergies.split(",").map(s => s.trim()).filter(Boolean)
      }
    };

    try {
      const res = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.patient) {
        onUpdatePatient(data.patient);
        onClose();
      }
    } catch (err) {
      console.error("Failed to update patient intake:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Patient Intake & Self-Reported Context</h3>
                <ProvenanceBadge type="PATIENT_ENTERED" showTooltip={false} />
              </div>
              <p className="text-xs text-slate-400">
                Ground truth patient-reported history. Tagged with field-level provenance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                ABHA ID (Ayushman Bharat Health Account)
              </label>
              <input
                type="text"
                required
                pattern="\d{2}-\d{4}-\d{4}-\d{4}"
                placeholder="14-digit ABHA (XX-XXXX-XXXX-XXXX)"
                value={formData.abhaId}
                onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Patient Self-Reported Context (Provenance: PATIENT_ENTERED)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Chief Complaints / Current Symptoms
                </label>
                <textarea
                  rows={2}
                  value={formData.chiefComplaints}
                  onChange={(e) => setFormData({ ...formData, chiefComplaints: e.target.value })}
                  placeholder="e.g. Occasional fatigue, increased thirst in evenings..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Chronic Diagnosed Conditions (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.chronicConditions}
                  onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Dyslipidemia"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Current Medications & Dosages (semicolon separated)
                </label>
                <input
                  type="text"
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  placeholder="e.g. Metformin 500mg BD; Telmisartan 40mg OD; Atorvastatin 10mg HS"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-300 block mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Reported Allergies (comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  className="w-full bg-slate-950 border border-rose-900/60 rounded-lg px-3 py-2 text-xs text-rose-300 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Patient Intake"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
