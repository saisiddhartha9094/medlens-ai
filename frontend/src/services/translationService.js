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
  { code: "ta", label: "Tamil", nativeName: "தமிழ்", bcp47: "ta-IN" },
  { code: "bn", label: "Bengali", nativeName: "বাংলা", bcp47: "bn-IN" },
  { code: "mr", label: "Marathi", nativeName: "मराठी", bcp47: "mr-IN" },
  { code: "es", label: "Spanish", nativeName: "Español", bcp47: "es-ES" }
];

// Offline verified clinical terminology dictionary
export const VERNACULAR_TRANSLATIONS = {
  hi: {
    summaryTitle: "मरीज स्वास्थ्य सारांश",
    overviewLabel: "आपकी जांच रिपोर्ट का विवरण:",
    disclaimer: "मेड लेंस एक सूचनात्मक प्रणाली है। यह बीमारी का निदान नहीं करता। हमेशा अपने डॉक्टर से परामर्श लें।",
    disclaimerTitle: "मेड लेंस स्वास्थ्य सूचना अस्वीकरण",
    totalTests: "कुल जांच",
    normalTests: "सामान्य परिणाम",
    abnormalTests: "चिकित्सक से चर्चा योग्य",
    keyFindings: "मुख्य निष्कर्ष (डॉक्टर से चर्चा करें)",
    doctorQuestions: "अपने डॉक्टर से पूछने के लिए महत्वपूर्ण सवाल:",
    optimal: "सामान्य दायरा",
    borderline: "सीमांत मान",
    high: "उच्च (अधिक)",
    low: "निम्न (कम)",
    careGapsTitle: "निवारक स्वास्थ्य जांच अनुस्मारक (Care Gaps)",
    overdue: "जांच लंबित (Overdue)",
    dueNow: "जांच का समय (Due Now)",
    listenButton: "सारांश सुनें",
    stopButton: "आवाज़ रोकें",
    speaking: "सारांश पढ़ा जा रहा है..."
  },
  te: {
    summaryTitle: "రోగి ఆరోగ్య సారాంశం",
    overviewLabel: "మీ ల్యాబ్ నివేదిక వివరాలు:",
    disclaimer: "మెడ్ లెన్స్ అనేది కేవలం సమాచార వ్యవస్థ. ఇది వ్యాధి నిర్ధారణ చేయదు. దయచేసి మీ వైద్యుడిని సంప్రదించండి.",
    disclaimerTitle: "వైద్య సమాచార ప్రకటన",
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
    disclaimerTitle: "மருத்துவ தகவல் பொறுப்புத்துறப்பு",
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
  },
  bn: {
    summaryTitle: "রোগীর স্বাস্থ্য সারাংশ",
    overviewLabel: "আপনার ল্যাব রিপোর্ট বিবরণ:",
    disclaimer: "মেড লেন্স একটি তথ্যমূলক প্ল্যাটফর্ম। এটি রোগ নির্ণয় করে না। চিকিৎসকের পরামর্শ নিন।",
    disclaimerTitle: "মেড লেন্স স্বাস্থ্য তথ্য বিজ্ঞপ্তি",
    totalTests: "মোট পরীক্ষা",
    normalTests: "স্বাভাবিক ফলাফল",
    abnormalTests: "চিকিৎসকের সাথে আলোচনা প্রয়োজন",
    keyFindings: "প্রধান ফলাফল",
    doctorQuestions: "চিকিৎসককে জিজ্ঞাসা করার প্রশ্নাবলী:",
    optimal: "স্বাভাবিক পরিসর",
    borderline: "প্রান্তিক মান",
    high: "উচ্চ",
    low: "নিম্ন",
    careGapsTitle: "প্রতিরোধমূলক স্বাস্থ্য স্ক্রিনিং অনুস্মারক",
    overdue: "বাকি পরীক্ষা (Overdue)",
    dueNow: "এখনই করণীয়",
    listenButton: "সারাংশ শুনুন",
    stopButton: "থামান",
    speaking: "পড়া হচ্ছে..."
  },
  mr: {
    summaryTitle: "रुग्ण आरोग्य सारांश",
    overviewLabel: "तुमच्या लॅब अहवालाचा तपशील:",
    disclaimer: "मेड लेन्स ही केवळ एक माहिती प्रणाली आहे. हे कोणत्याही आजाराचे निदान करत नाही. डॉक्टरांचा सल्ला घ्या.",
    disclaimerTitle: "वैद्यकीय माहिती अस्वीकरण",
    totalTests: "एकूण चाचण्या",
    normalTests: "सामान्य निष्कर्ष",
    abnormalTests: "डॉक्टरांशी चर्चेचे मुद्दे",
    keyFindings: "प्रमुख निष्कर्ष",
    doctorQuestions: "डॉक्टरांना विचारण्यासाठी महत्त्वाचे प्रश्न:",
    optimal: "सामान्य श्रेणी",
    borderline: "सीमावर्ती",
    high: "जास्त",
    low: "कमी",
    careGapsTitle: "प्रतिबंधात्मक आरोग्य तपासणी स्मरणपत्रे",
    overdue: "प्रलंबित चाचण्या",
    dueNow: "आता करावयाच्या चाचण्या",
    listenButton: "सारांश ऐका",
    stopButton: "थांबवा",
    speaking: "वाचत आहे..."
  },
  es: {
    summaryTitle: "Resumen de Salud del Paciente",
    overviewLabel: "Detalles del informe de laboratorio:",
    disclaimer: "MedLens es una herramienta informativa. No diagnostica enfermedades ni prescribe tratamientos. Consulte a su médico.",
    disclaimerTitle: "Aviso Legal Médico",
    totalTests: "Total de Pruebas",
    normalTests: "Resultados Normales",
    abnormalTests: "Parámetros Fuera de Rango",
    keyFindings: "Hallazgos Principales",
    doctorQuestions: "Preguntas para su Médico:",
    optimal: "Rango Óptimo",
    borderline: "Límite",
    high: "Elevado",
    low: "Bajo",
    careGapsTitle: "Recordatorios de Detección Preventiva (Care Gaps)",
    overdue: "Vencido",
    dueNow: "Pendiente Ahora",
    listenButton: "Escuchar Resumen",
    stopButton: "Detener Audio",
    speaking: "Reproduciendo audio..."
  }
};

// Client-side translation cache to avoid hitting rate limits
const clientTranslationCache = new Map();

/**
 * Translates dynamic English text to target language
 * Checks vernacular dictionary first, then client cache, then backend proxy / MyMemory API
 */
export async function translateText(text, targetLang = "en") {
  if (!text || targetLang === "en") return text;

  // 1. If exact vernacular dictionary mapping exists
  if (VERNACULAR_TRANSLATIONS[targetLang]?.[text]) {
    return VERNACULAR_TRANSLATIONS[targetLang][text];
  }

  // 2. Check local client cache
  const cacheKey = `${targetLang}:${text.trim().substring(0, 120)}`;
  if (clientTranslationCache.has(cacheKey)) {
    return clientTranslationCache.get(cacheKey);
  }

  // 3. Attempt free translation via MyMemory API directly
  try {
    const encoded = encodeURIComponent(text.slice(0, 500));
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        clientTranslationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (directErr) {
    // Direct browser fetch failed (e.g. CORS/offline), try backend proxy
    try {
      const proxyRes = await fetch("/api/intake/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang })
      });
      const proxyData = await proxyRes.json();
      if (proxyData?.success && proxyData.translatedText) {
        clientTranslationCache.set(cacheKey, proxyData.translatedText);
        return proxyData.translatedText;
      }
    } catch (proxyErr) {
      console.warn("[MedLens Translation] Backend proxy unreachable:", proxyErr);
    }
  }

  return text;
}

/**
 * Text-to-Speech playback using Native Browser Web Speech API
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
    const targetBcp47 = langObj ? langObj.bcp47 : "en-IN";
    utterance.lang = targetBcp47;
    utterance.rate = 0.92; // Slightly slower for crisp clinical understanding
    utterance.pitch = 1.0;

    // Pick matching voice if available in browser
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find(v => 
          v.lang === targetBcp47 || 
          v.lang.startsWith(langCode) ||
          v.lang.replace('_', '-').toLowerCase().includes(langCode.toLowerCase())
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }
    } catch (vErr) {
      // Graceful voice selection fallback
    }

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
