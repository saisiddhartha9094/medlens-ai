/**
 * MedLens - Multilingual Health Literacy & Native Web Speech TTS Engine
 * 
 * Supports:
 * - English (en)
 * - Hindi (hi - हिंदी)
 * - Telugu (te - తెలుగు)
 * - Tamil (ta - தமிழ்)
 * 
 * Zero External Dependencies:
 * Combines a high-fidelity vernacular clinical dictionary with standard Web Speech API (window.speechSynthesis).
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeName: "English", bcp47: "en-IN" },
  { code: "hi", label: "Hindi", nativeName: "हिंदी", bcp47: "hi-IN" },
  { code: "te", label: "Telugu", nativeName: "తెలుగు", bcp47: "te-IN" },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்", bcp47: "ta-IN" }
];

// Offline verified clinical terminology dictionary
export const VERNACULAR_TRANSLATIONS = {
  hi: {
    summaryTitle: "मरीज स्वास्थ्य सारांश",
    overviewLabel: "आपकी जांच रिपोर्ट का विवरण:",
    disclaimer: "मेड लेंस एक सूचनात्मक प्रणाली है। यह बीमारी का निदान नहीं करता। हमेशा अपने डॉक्टर से परामर्श लें।",
    totalTests: "कुल जांच",
    normalTests: "सामान्य परिणाम",
    abnormalTests: "चिकित्सक से चर्चा योग्य",
    keyFindings: "मुख्य निष्कर्ष",
    doctorQuestions: "अपने डॉक्टर से पूछने के लिए महत्वपूर्ण सवाल:",
    optimal: "सामान्य दायरा",
    borderline: "सीमांत मान",
    high: "उच्च (अधिक)",
    low: "निम्न (कम)",
    careGapsTitle: "निवारक स्वास्थ्य जांच अनुस्मारक (Care Gaps)",
    overdue: "जांच लंबित",
    dueNow: "जांच का समय",
    listenButton: "सारांश सुनें",
    stopButton: "आवाज़ रोकें",
    speaking: "सारांश पढ़ा जा रहा है..."
  },
  te: {
    summaryTitle: "రోగి ఆరోగ్య సారాంశం",
    overviewLabel: "మీ ల్యాబ్ నివేదిక వివరాలు:",
    disclaimer: "మెడ్ లెన్స్ అనేది కేవలం సమాచార వ్యవస్థ. ఇది వ్యాధి నిర్ధారణ చేయదు. దయచేసి మీ వైద్యుడిని సంప్రదించండి.",
    totalTests: "మొత్తం పరీక్షలు",
    normalTests: "సాధారణ ఫలితాలు",
    abnormalTests: "వైద్యుడితో చర్చించాల్సినవి",
    keyFindings: "ముఖ్యమైన అంశాలు",
    doctorQuestions: "మీ వైద్యుడిని అడగవలసిన ముఖ్యమైన ప్రశ్నలు:",
    optimal: "సాధారణ పరిమితి",
    borderline: "సరిహద్దు పరిమితి",
    high: "ఎక్కువ",
    low: "తక్కువ",
    careGapsTitle: "ముందస్తు నివారణ పరీక్షల సూచనలు (Care Gaps)",
    overdue: "సమయం మించిన పరీక్షలు",
    dueNow: "ఇప్పుడు చేయించాల్సినవి",
    listenButton: "సారాంశం వినండి",
    stopButton: "ఆపండి",
    speaking: "చదువుతోంది..."
  },
  ta: {
    summaryTitle: "நோயாளி சுகாதார சுருக்கம்",
    overviewLabel: "உங்கள் ஆய்வக அறிக்கை விவரங்கள்:",
    disclaimer: "மெட் லென்ஸ் என்பது ஒரு தகவல் அமைப்பு மட்டுமே. இது நோயைக் கண்டறியாது. உங்கள் மருத்துவரை அணுகவும்.",
    totalTests: "மொத்த சோதனைகள்",
    normalTests: "சாதாரண முடிவுகள்",
    abnormalTests: "மருத்துவரிடம் விவாதிக்க வேண்டியவை",
    keyFindings: "முக்கிய குறிப்புகள்",
    doctorQuestions: "உங்கள் மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்:",
    optimal: "சாதாரண அளவு",
    borderline: "எல்லைக்கோடு",
    high: "அதிகம்",
    low: "குறைவு",
    careGapsTitle: "தடுப்பு சுகாதார பரிசோதனை நினைவூட்டல்கள்",
    overdue: "தாமதமான சோதனைகள்",
    dueNow: "இப்போது செய்ய வேண்டியவை",
    listenButton: "சுருக்கத்தைக் கேளுங்கள்",
    stopButton: "நிறுத்து",
    speaking: "வாசிக்கப்படுகிறது..."
  }
};

/**
 * Translates dynamic English text to target language
 * Checks vernacular dictionary first, with graceful fallback
 */
export async function translateText(text, targetLang = "en") {
  if (!text || targetLang === "en") return text;

  // If exact vernacular mapping exists
  if (VERNACULAR_TRANSLATIONS[targetLang]?.[text]) {
    return VERNACULAR_TRANSLATIONS[targetLang][text];
  }

  // Attempt free client-side translation via MyMemory API
  try {
    const encoded = encodeURIComponent(text.slice(0, 500));
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (err) {
    console.warn("[MedLens Translation] Public API unavailable, using source text:", err);
  }

  return text;
}

/**
 * Text-to-Speech playback using Native Browser Speech Synthesis
 */
export class SpeechController {
  static isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  static speak(text, langCode = "en", onStart, onEnd) {
    if (!this.isSupported() || !text) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    utterance.lang = langObj ? langObj.bcp47 : "en-IN";
    utterance.rate = 0.95; // Slightly slower for clear clinical understanding
    utterance.pitch = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.warn("[MedLens TTS] Speech error:", e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  static stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}
