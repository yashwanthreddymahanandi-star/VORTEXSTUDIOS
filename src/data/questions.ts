/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, Subject, GradeBand } from "../types";

export const ALL_QUESTIONS: Question[] = [
  // --- GRADES 1-6 : MATHS ---
  {
    id: "m_1_6_l1_1",
    gradeBand: "1-6",
    subject: "Maths",
    level: 1,
    question: "What is the value of 3/4 + 2/4 expressed as a single fraction?",
    options: ["5/4", "5/8", "1/4", "6/8"],
    correctOptionIndex: 0,
    explanation: "Since the denominators are both 4, add the numerators: 3 + 2 = 5. So, 3/4 + 2/4 = 5/4."
  },
  {
    id: "m_1_6_l1_2",
    gradeBand: "1-6",
    subject: "Maths",
    level: 1,
    question: "How many sides does a regular hexagon have?",
    options: ["5", "6", "8", "10"],
    correctOptionIndex: 1,
    explanation: "A hexagon by definition has 6 straight sides and 6 interior angles."
  },
  {
    id: "m_1_6_l2_1",
    gradeBand: "1-6",
    subject: "Maths",
    level: 2,
    question: "If a rectangle has a perimeter of 30 cm and a length of 9 cm, what is its width?",
    options: ["6 cm", "12 cm", "7 cm", "4.5 cm"],
    correctOptionIndex: 0,
    explanation: "Perimeter = 2 × (Length + Width). 30 = 2 × (9 + Width) -> 15 = 9 + Width -> Width = 6 cm."
  },
  {
    id: "m_1_6_l3_1",
    gradeBand: "1-6",
    subject: "Maths",
    level: 3,
    question: "What is the Least Common Multiple (LCM) of 12, 18, and 24?",
    options: ["48", "72", "96", "144"],
    correctOptionIndex: 1,
    explanation: "Prime factorizations: 12 = 2² × 3, 18 = 2 × 3², 24 = 2³ × 3. LCM = 2³ × 3² = 8 × 9 = 72."
  },

  // --- GRADES 1-6 : ENGLISH ---
  {
    id: "e_1_6_l1_1",
    gradeBand: "1-6",
    subject: "English",
    level: 1,
    question: "Which of the following words is a synonym for 'Courageous'?",
    options: ["Timid", "Brave", "Weary", "Careless"],
    correctOptionIndex: 1,
    explanation: "'Brave' means having or showing mental or moral strength in facing danger, identical in meaning to courageous."
  },
  {
    id: "e_1_6_l2_1",
    gradeBand: "1-6",
    subject: "English",
    level: 2,
    question: "Identify the part of speech of the word 'quickly' in: 'The cheetah ran quickly through the savanna.'",
    options: ["Adjective", "Adverb", "Noun", "Preposition"],
    correctOptionIndex: 1,
    explanation: "'Quickly' modifies the verb 'ran', answering how the action occurred, making it an adverb."
  },
  {
    id: "e_1_6_l3_1",
    gradeBand: "1-6",
    subject: "English",
    level: 3,
    question: "Choose the sentence with the correct subject-verb agreement:",
    options: [
      "Neither the teacher nor the students was present.",
      "The bouquet of red roses smell wonderful.",
      "Every one of the books on the shelves is cataloged.",
      "A swarm of bees were flying toward the hive."
    ],
    correctOptionIndex: 2,
    explanation: "'Every one' is singular, so it takes the singular verb 'is cataloged'."
  },

  // --- GRADES 1-6 : TELUGU ---
  {
    id: "t_1_6_l1_1",
    gradeBand: "1-6",
    subject: "Telugu",
    level: 1,
    question: "తెలుగు వర్ణమాలలో అచ్చులు ఎన్ని?",
    options: ["16", "36", "52", "12"],
    correctOptionIndex: 0,
    explanation: "తెలుగు వర్ణమాలలో అ నుండి అః వరకు 16 అచ్చులు ఉంటాయి."
  },
  {
    id: "t_1_6_l2_1",
    gradeBand: "1-6",
    subject: "Telugu",
    level: 2,
    question: "‘కనువిప్పు’ అనే జాతీయానికి సరైన అర్థం ఏమిటి?",
    options: ["నిద్రపోవడం", "జ్ఞానోదయం కలగడం", "కళ్లు మూసుకోవడం", "కోపం రావడం"],
    correctOptionIndex: 1,
    explanation: "'కనువిప్పు' అంటే తప్పు తెలుసుకుని నిజం గ్రహించడం లేదా జ్ఞానోదయం కలగడం."
  },
  {
    id: "t_1_6_l3_1",
    gradeBand: "1-6",
    subject: "Telugu",
    level: 3,
    question: "సుమతీ శతకాన్ని రచించిన కవి ఎవరు?",
    options: ["వేమన", "బద్దెన", "ధూర్జటి", "పోతన"],
    correctOptionIndex: 1,
    explanation: "సుమతీ శతకాన్ని బద్దెన నరసింహ కవి రచించారు."
  },

  // --- GRADES 1-6 : SCIENCE (Physics / Biology / Chemistry) ---
  {
    id: "p_1_6_l1_1",
    gradeBand: "1-6",
    subject: "Physics",
    level: 1,
    question: "What type of energy does a moving bicycle possess?",
    options: ["Kinetic energy", "Potential energy", "Chemical energy", "Nuclear energy"],
    correctOptionIndex: 0,
    explanation: "Energy possessed by an object due to its motion is called kinetic energy."
  },
  {
    id: "b_1_6_l1_1",
    gradeBand: "1-6",
    subject: "Biology",
    level: 1,
    question: "Which green pigment in plant leaves absorbs sunlight for photosynthesis?",
    options: ["Chlorophyll", "Hemoglobin", "Carotene", "Melanin"],
    correctOptionIndex: 0,
    explanation: "Chlorophyll is the green pigment in chloroplasts that absorbs light energy for photosynthesis."
  },
  {
    id: "c_1_6_l1_1",
    gradeBand: "1-6",
    subject: "Chemistry",
    level: 1,
    question: "What is the chemical formula for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctOptionIndex: 0,
    explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom: H2O."
  },

  // --- GRADES 1-6 : SOCIAL ---
  {
    id: "s_1_6_l1_1",
    gradeBand: "1-6",
    subject: "Social",
    level: 1,
    question: "Which imaginary horizontal line divides the Earth into the Northern and Southern Hemispheres?",
    options: ["Prime Meridian", "Equator", "Tropic of Cancer", "Arctic Circle"],
    correctOptionIndex: 1,
    explanation: "The Equator is the 0° latitude line that divides Earth into Northern and Southern Hemispheres."
  },

  // --- GRADES 1-6 : HINDI ---
  {
    id: "h_1_6_l1_1",
    gradeBand: "1-6",
    subject: "Hindi",
    level: 1,
    question: "‘सूरज’ शब्द का सही पर्यायवाची शब्द क्या है?",
    options: ["दिनकर", "निशाकर", "जलज", "पवन"],
    correctOptionIndex: 0,
    explanation: "'सूरज' का पर्यायवाची 'दिनकर', 'भास्कर' और 'सूर्य' है।"
  },

  // ==========================================
  // --- GRADES 7-10 : MATHS ---
  // ==========================================
  {
    id: "m_7_10_l1_1",
    gradeBand: "7-10",
    subject: "Maths",
    level: 1,
    question: "Solve for x: 3x - 7 = 2x + 8",
    options: ["x = 15", "x = 1", "x = -15", "x = 14"],
    correctOptionIndex: 0,
    explanation: "Subtract 2x from both sides: x - 7 = 8. Add 7 to both sides: x = 15."
  },
  {
    id: "m_7_10_l2_1",
    gradeBand: "7-10",
    subject: "Maths",
    level: 2,
    question: "What are the roots of the quadratic equation: x² - 5x + 6 = 0?",
    options: ["x = 2 and x = 3", "x = -2 and x = -3", "x = 1 and x = 6", "x = -1 and x = 6"],
    correctOptionIndex: 0,
    explanation: "Factoring: (x - 2)(x - 3) = 0. Therefore roots are x = 2 and x = 3."
  },
  {
    id: "m_7_10_l3_1",
    gradeBand: "7-10",
    subject: "Maths",
    level: 3,
    question: "In a right triangle, if sin(θ) = 3/5, what is the value of tan(θ)?",
    options: ["3/4", "4/3", "4/5", "5/3"],
    correctOptionIndex: 0,
    explanation: "Opposite = 3, Hypotenuse = 5 -> Adjacent = √(5² - 3²) = 4. tan(θ) = Opposite/Adjacent = 3/4."
  },

  // --- GRADES 7-10 : PHYSICS ---
  {
    id: "p_7_10_l1_1",
    gradeBand: "7-10",
    subject: "Physics",
    level: 1,
    question: "What is the SI unit of electric current?",
    options: ["Volt", "Ampere", "Ohm", "Watt"],
    correctOptionIndex: 1,
    explanation: "The SI unit of electric current is the Ampere (A)."
  },
  {
    id: "p_7_10_l2_1",
    gradeBand: "7-10",
    subject: "Physics",
    level: 2,
    question: "An object of mass 5 kg accelerates at 4 m/s². What is the net force acting on it?",
    options: ["20 N", "1.25 N", "9 N", "0.8 N"],
    correctOptionIndex: 0,
    explanation: "According to Newton's Second Law: Force = mass × acceleration = 5 kg × 4 m/s² = 20 N."
  },
  {
    id: "p_7_10_l3_1",
    gradeBand: "7-10",
    subject: "Physics",
    level: 3,
    question: "What is the focal length of a concave mirror with a radius of curvature of 30 cm?",
    options: ["-15 cm", "-60 cm", "+15 cm", "-30 cm"],
    correctOptionIndex: 0,
    explanation: "Focal length f = R/2 = -30/2 = -15 cm (using standard cartesian sign convention)."
  },

  // --- GRADES 7-10 : CHEMISTRY ---
  {
    id: "c_7_10_l1_1",
    gradeBand: "7-10",
    subject: "Chemistry",
    level: 1,
    question: "What is the pH value of a neutral aqueous solution at 25°C?",
    options: ["0", "7", "14", "1"],
    correctOptionIndex: 1,
    explanation: "At 25°C, pure neutral water has [H+] = [OH-] = 10⁻⁷ M, yielding a pH of 7."
  },
  {
    id: "c_7_10_l2_1",
    gradeBand: "7-10",
    subject: "Chemistry",
    level: 2,
    question: "Which gas is evolved when dilute hydrochloric acid reacts with zinc metal?",
    options: ["Oxygen", "Hydrogen", "Carbon dioxide", "Chlorine"],
    correctOptionIndex: 1,
    explanation: "Zn + 2HCl → ZnCl₂ + H₂↑. Hydrogen gas is evolved with a pop sound."
  },
  {
    id: "c_7_10_l3_1",
    gradeBand: "7-10",
    subject: "Chemistry",
    level: 3,
    question: "What is the general molecular formula for the Alkyne homologous hydrocarbon series?",
    options: ["CnH2n+2", "CnH2n", "CnH2n-2", "CnH2n+1"],
    correctOptionIndex: 2,
    explanation: "Alkynes contain a carbon-carbon triple bond and adhere to general formula CnH2n-2 (e.g., Ethyne C₂H₂)."
  },

  // --- GRADES 7-10 : BIOLOGY ---
  {
    id: "b_7_10_l1_1",
    gradeBand: "7-10",
    subject: "Biology",
    level: 1,
    question: "Which cell organelle is famously known as the 'Powerhouse of the Cell'?",
    options: ["Ribosome", "Mitochondria", "Golgi apparatus", "Lysosome"],
    correctOptionIndex: 1,
    explanation: "Mitochondria generate cellular energy in the form of ATP through aerobic cellular respiration."
  },
  {
    id: "b_7_10_l2_1",
    gradeBand: "7-10",
    subject: "Biology",
    level: 2,
    question: "What is the structural and functional unit of the human kidney?",
    options: ["Neuron", "Nephron", "Alveolus", "Villus"],
    correctOptionIndex: 1,
    explanation: "Nephrons filter blood and produce urine in human kidneys."
  },

  // --- GRADES 7-10 : SOCIAL ---
  {
    id: "s_7_10_l1_1",
    gradeBand: "7-10",
    subject: "Social",
    level: 1,
    question: "Who is known as the Chief Architect of the Constitution of India?",
    options: ["Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Sardar Vallabhbhai Patel"],
    correctOptionIndex: 1,
    explanation: "Dr. B.R. Ambedkar was the Chairman of the Drafting Committee of the Constituent Assembly."
  },

  // --- GRADES 7-10 : TELUGU ---
  {
    id: "t_7_10_l1_1",
    gradeBand: "7-10",
    subject: "Telugu",
    level: 1,
    question: "‘రామాలయం’ అనే పదాన్ని విడదీస్తే సరైన సంధి రూపం ఏమిటి?",
    options: ["రామ + ఆలయం (సవర్ణదీర్ఘ సంధి)", "రామా + లయం", "రామ్ + ఆలయం", "రామ + లయం"],
    correctOptionIndex: 0,
    explanation: "రామ (అ) + ఆలయం (ఆ) = రామాలయం (సవర్ణదీర్ఘ సంధి)."
  },

  // --- GRADES 7-10 : HINDI ---
  {
    id: "h_7_10_l1_1",
    gradeBand: "7-10",
    subject: "Hindi",
    level: 1,
    question: "‘यथाशक्ति’ शब्द में कौन-सा समास है?",
    options: ["तत्पुरुष समास", "अव्ययीभाव समास", "द्विगु समास", "कर्मधारय समास"],
    correctOptionIndex: 1,
    explanation: "'यथा' एक अव्यय है, इसलिए 'यथाशक्ति' में अव्ययीभाव समास है (शक्ति के अनुसार)।"
  },

  // ==========================================
  // --- GRADES 11-12 : MATHS ---
  // ==========================================
  {
    id: "m_11_12_l1_1",
    gradeBand: "11-12",
    subject: "Maths",
    level: 1,
    question: "What is the first derivative of f(x) = x³ · sin(x) with respect to x?",
    options: [
      "3x² sin(x) + x³ cos(x)",
      "3x² cos(x)",
      "x³ cos(x) - 3x² sin(x)",
      "3x² + cos(x)"
    ],
    correctOptionIndex: 0,
    explanation: "Applying the Product Rule: d/dx[u · v] = u'v + uv'. Here u=x³, v=sin(x) -> 3x² sin(x) + x³ cos(x)."
  },
  {
    id: "m_11_12_l2_1",
    gradeBand: "11-12",
    subject: "Maths",
    level: 2,
    question: "Evaluate the definite integral: ∫ from 0 to π/2 of cos(x) dx.",
    options: ["0", "1", "π/2", "-1"],
    correctOptionIndex: 1,
    explanation: "∫ cos(x) dx = sin(x). Evaluated from 0 to π/2: sin(π/2) - sin(0) = 1 - 0 = 1."
  },
  {
    id: "m_11_12_l3_1",
    gradeBand: "11-12",
    subject: "Maths",
    level: 3,
    question: "What is the determinant of a 2x2 matrix A = [[3, 5], [2, 4]]?",
    options: ["2", "22", "-2", "12"],
    correctOptionIndex: 0,
    explanation: "det(A) = (3 × 4) - (5 × 2) = 12 - 10 = 2."
  },

  // --- GRADES 11-12 : PHYSICS ---
  {
    id: "p_11_12_l1_1",
    gradeBand: "11-12",
    subject: "Physics",
    level: 1,
    question: "According to Einstein's photoelectric equation, what does the slope of the stopping potential vs frequency graph represent?",
    options: ["h/e", "h · e", "Work function Φ", "1/(h·e)"],
    correctOptionIndex: 0,
    explanation: "eV₀ = hν - Φ -> V₀ = (h/e)ν - (Φ/e). The slope of V₀ vs ν is Planck's constant divided by elementary charge (h/e)."
  },
  {
    id: "p_11_12_l2_1",
    gradeBand: "11-12",
    subject: "Physics",
    level: 2,
    question: "What is the de Broglie wavelength of an electron accelerated through a potential difference of V volts?",
    options: ["λ = 1.227 / √V nm", "λ = 12.27 √V nm", "λ = 0.1227 / V nm", "λ = 1.227 V² nm"],
    correctOptionIndex: 0,
    explanation: "λ = h/p = h / √(2m_e eV) ≈ 1.227 / √V nanometers."
  },

  // --- GRADES 11-12 : CHEMISTRY ---
  {
    id: "c_11_12_l1_1",
    gradeBand: "11-12",
    subject: "Chemistry",
    level: 1,
    question: "What is the hybridization and geometric shape of the central Sulfur atom in SF₆?",
    options: ["sp³d², Octahedral", "sp³d, Trigonal bipyramidal", "sp³, Tetrahedral", "dsp², Square planar"],
    correctOptionIndex: 0,
    explanation: "Sulfur has 6 valence electrons and forms 6 single bonds with no lone pairs -> steric number 6 = sp³d² octahedral geometry."
  },
  {
    id: "c_11_12_l2_1",
    gradeBand: "11-12",
    subject: "Chemistry",
    level: 2,
    question: "In the Nernst equation for a galvanic cell at 298 K, E_cell = E°_cell - (0.0591 / n) log(Q). What does 'n' represent?",
    options: [
      "Number of moles of electrons transferred in balanced redox reaction",
      "Number of moles of reactant",
      "Avogadro's constant",
      "Equilibrium constant exponent"
    ],
    correctOptionIndex: 0,
    explanation: "'n' is the number of moles of electrons transferred in the balanced cell reaction."
  },

  // --- GRADES 11-12 : BIOLOGY ---
  {
    id: "b_11_12_l1_1",
    gradeBand: "11-12",
    subject: "Biology",
    level: 1,
    question: "Which enzyme is primarily responsible for unzipping the DNA double helix during replication?",
    options: ["DNA Helicase", "DNA Polymerase", "DNA Ligase", "RNA Primase"],
    correctOptionIndex: 0,
    explanation: "Helicase unwinds and unzips the hydrogen bonds holding the two complementary DNA strands together."
  },

  // --- GRADES 11-12 : ENGLISH ---
  {
    id: "e_11_12_l1_1",
    gradeBand: "11-12",
    subject: "English",
    level: 1,
    question: "In Shakespeare's 'Hamlet', which rhetorical device is predominantly used in the soliloquy 'To be, or not to be'?",
    options: ["Antithesis", "Hyperbole", "Synecdoche", "Onomatopoeia"],
    correctOptionIndex: 0,
    explanation: "'To be, or not to be' directly juxtaposes two opposing conceptual states (existence vs non-existence), exemplifying Antithesis."
  },

  // --- GRADES 11-12 : SOCIAL / ECONOMICS ---
  {
    id: "s_11_12_l1_1",
    gradeBand: "11-12",
    subject: "Social",
    level: 1,
    question: "What is defined as the total market value of all final goods and services produced within a country in a given fiscal year?",
    options: ["Gross Domestic Product (GDP)", "Gross National Product (GNP)", "Net National Product (NNP)", "Purchasing Power Parity (PPP)"],
    correctOptionIndex: 0,
    explanation: "Gross Domestic Product (GDP) measures final monetary output produced within domestic borders."
  },

  // --- GRADES 11-12 : TELUGU ---
  {
    id: "t_11_12_l1_1",
    gradeBand: "11-12",
    subject: "Telugu",
    level: 1,
    question: "శ్రీమదాంధ్ర మహాభారతంలో మొదటి మూడు పర్వాలను రచించిన ఆదికవి ఎవరు?",
    options: ["నన్నయ భట్టారకుడు", "తిక్కన సోమయాజి", "ఎఱ్ఱాప్రగడ", "శ్రీనాథుడు"],
    correctOptionIndex: 0,
    explanation: "ఆదికవి నన్నయ ఆది, సభా పర్వాలు మరియు అరణ్య పర్వంలో కొంత భాగాన్ని రచించారు."
  },

  // --- GRADES 11-12 : HINDI ---
  {
    id: "h_11_12_l1_1",
    gradeBand: "11-12",
    subject: "Hindi",
    level: 1,
    question: "हिंदी साहित्य के किस काल को ‘स्वर्ण युग’ (Golden Era) कहा जाता है?",
    options: ["भक्तिकाल", "आदिकाल", "रीतिकाल", "आधुनिक काल"],
    correctOptionIndex: 0,
    explanation: "कबीर, तुलसी, सूरदास, और मीराबाई के उत्कृष्ट भक्ति रचनाओं के कारण भक्तिकाल को हिंदी साहित्य का स्वर्ण युग कहा जाता है।"
  }
];

export function getFilteredQuestions(gradeBand: GradeBand, subject?: Subject, level?: number): Question[] {
  return ALL_QUESTIONS.filter(q => {
    if (q.gradeBand !== gradeBand) return false;
    if (subject && q.subject !== subject) return false;
    if (level && q.level !== level) return false;
    return true;
  });
}
