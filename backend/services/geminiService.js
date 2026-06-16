const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;
let genAI;
let useMockAI = false;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('\n⚠️  WARNING: GEMINI_API_KEY is not configured or using placeholder.');
  console.warn('⚠️  Falling back to MOCK AI ANALYSIS MODE for testing.\n');
  useMockAI = true;
}

/**
 * Analyzes natural language symptoms using Google Gemini API
 * @param {string} userSymptoms - The symptoms entered by the user
 * @returns {Promise<object>} JSON analysis containing diseases, severity, precautions, diets, and advice
 */
async function analyzeSymptoms(userSymptoms) {
  if (useMockAI) {
    return generateMockAnalysis(userSymptoms);
  }

  try {
    // Using gemini-1.5-flash as the recommended fast and efficient model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are a medical symptom analysis assistant.

Analyze the following symptoms:
${userSymptoms}

Return JSON response in this format:

{
  "possibleDiseases": [],
  "severity": "",
  "precautions": [],
  "dietRecommendations": [],
  "healthAdvice": [],
  "doctorConsultationRequired": true
}

Provide educational guidance only.
Do not claim medical diagnosis.
Advise consulting a doctor for serious symptoms.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error('Error in Gemini API symptom analysis, falling back to local analysis:', error);
    return generateMockAnalysis(userSymptoms);
  }
}

/**
 * Helper to generate mock medical assessment responses locally
 */
function generateMockAnalysis(symptoms) {
  const sym = symptoms.toLowerCase();
  
  // 1. Chest pain / breathing (High severity)
  if (sym.includes('chest') || sym.includes('breath') || sym.includes('heart') || sym.includes('choke')) {
    return {
      possibleDiseases: ["Angina Pectoris", "Acute Bronchitis", "Cardiovascular Strain"],
      severity: "High",
      precautions: [
        "Avoid any form of physical strain or exercise immediately.",
        "Sit in an upright position to ease breathing.",
        "If pain radiates to the arm or jaw, seek emergency care."
      ],
      dietRecommendations: [
        "Consume small, light meals to avoid abdominal pressure.",
        "Drink warm water only, avoid caffeine or carbonated sodas.",
        "Strictly limit salt/sodium intake."
      ],
      healthAdvice: [
        "Do not ignore symptoms of chest discomfort.",
        "Maintain monitoring of pulse and blood pressure if a device is available.",
        "Seek a formal cardiologist checkup as soon as possible."
      ],
      doctorConsultationRequired: true
    };
  }

  // 2. Headache / migraine
  if (sym.includes('head') || sym.includes('migraine') || sym.includes('vision') || sym.includes('skull')) {
    return {
      possibleDiseases: ["Migraine Headache", "Tension Headache", "Dehydration-induced Cephalgia"],
      severity: "Medium",
      precautions: [
        "Rest in a quiet, dark room away from noise and bright lights.",
        "Apply a cold compress to your forehead or the back of your neck.",
        "Avoid looking at electronic screens (phones, computers, TV)."
      ],
      dietRecommendations: [
        "Stay hydrated by drinking plenty of water or electrolyte fluids.",
        "Consume magnesium-rich foods like almonds, spinach, or bananas.",
        "Avoid aged cheese, processed meats, and caffeine triggers."
      ],
      healthAdvice: [
        "Keep a headache diary to identify recurring triggers.",
        "Avoid skipping regular meals as low blood sugar can spark headaches.",
        "Seek immediate medical help if accompanied by speech slurring or motor weakness."
      ],
      doctorConsultationRequired: true
    };
  }

  // 3. Cough / Cold / Throat
  if (sym.includes('cough') || sym.includes('throat') || sym.includes('runny') || sym.includes('cold') || sym.includes('sniff')) {
    return {
      possibleDiseases: ["Common Cold (Viral Rhinopharyngitis)", "Mild Influenza (Flu)", "Allergic Rhinitis"],
      severity: "Low",
      precautions: [
        "Keep warm and gargle with warm salt water three times daily.",
        "Use a humidifier or inhale steam to soothe nasal passages.",
        "Cover your mouth when coughing and wash hands frequently."
      ],
      dietRecommendations: [
        "Drink warm fluids like herbal chamomile tea, honey-lemon water, or warm soups.",
        "Eat vitamin C rich foods such as oranges, kiwis, and bell peppers.",
        "Avoid spicy food, dry snacks, and ice-cold drinks."
      ],
      healthAdvice: [
        "Ensure you get at least 8 hours of sleep for immune recovery.",
        "Monitor your body temperature; note if fever exceeds 101.5°F.",
        "Rest your voice and avoid exposure to dusty environments or smoking."
      ],
      doctorConsultationRequired: false
    };
  }

  // 4. Stomach / Digestion
  if (sym.includes('stomach') || sym.includes('bloat') || sym.includes('indigestion') || sym.includes('acid') || sym.includes('burn') || sym.includes('vomit')) {
    return {
      possibleDiseases: ["Gastroesophageal Reflux (GERD)", "Gastritis", "Functional Dyspepsia"],
      severity: "Low",
      precautions: [
        "Eat smaller, more frequent meals rather than large portions.",
        "Do not lie down for at least 2 to 3 hours after eating.",
        "Avoid wearing tight clothing around your waist."
      ],
      dietRecommendations: [
        "Incorporate non-citrus fruits like bananas, melons, and apples.",
        "Drink soothing teas like ginger or peppermint tea.",
        "Stick to bland foods: white rice, boiled oats, and plain toast."
      ],
      healthAdvice: [
        "Identify and limit spicy, fatty, acidic, and deep-fried foods.",
        "Avoid drinking caffeine or alcohol which irritate the stomach lining.",
        "Avoid eating late at night or just before going to sleep."
      ],
      doctorConsultationRequired: false
    };
  }

  // 5. Default General Fallback
  return {
    possibleDiseases: ["Mild Viral Syndrome", "Physical Fatigue"],
    severity: "Low",
    precautions: [
      "Rest and avoid strenuous work or exercise.",
      "Wash your hands regularly and maintain physical hygiene."
    ],
    dietRecommendations: [
      "Eat light, easily digestible meals.",
      "Ensure sufficient fluid intake by drinking water throughout the day."
    ],
    healthAdvice: [
      "Allow your body to recover naturally with rest.",
      "If new symptoms develop or current symptoms persist for more than 3 days, seek physician care."
    ],
    doctorConsultationRequired: false
  };
}

module.exports = { analyzeSymptoms };
