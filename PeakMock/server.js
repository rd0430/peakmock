require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { GoogleGenAI, Type } = require('@google/genai');
const { SEED_TESTS } = require('./data/seed');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'peakmock_enterprise_secret_2026';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'rozimatovdoniyor4@gmail.com').toLowerCase().trim();
const GEMINI_MODEL = 'gemini-3-flash-preview';

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Papkalarni yaratish
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_AUDIO_DIR = path.join(__dirname, 'uploads', 'audio');
const UPLOADS_DOCS_DIR = path.join(__dirname, 'uploads', 'docs');
const UPLOADS_IMAGES_DIR = path.join(__dirname, 'uploads', 'images');

[DATA_DIR, UPLOADS_AUDIO_DIR, UPLOADS_DOCS_DIR, UPLOADS_IMAGES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Atomic JSON Datastore
const DB_PATH = path.join(DATA_DIR, 'db.json');
const LEGACY_TESTS_PATH = path.join(DATA_DIR, 'tests.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = {
      users: [],
      tests: [...SEED_TESTS],
      history: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.users)) parsed.users = [];
    if (!Array.isArray(parsed.tests) || parsed.tests.length === 0) parsed.tests = [...SEED_TESTS];
    if (!Array.isArray(parsed.history)) parsed.history = [];
    return parsed;
  } catch (err) {
    console.error('DB read error, reinitializing:', err);
    return { users: [], tests: [...SEED_TESTS], history: [] };
  }
}

function saveDB(db) {
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_PATH);
}

// Avval data/tests.json ga yozilib qolgan testlar bo'lsa, asosiy bazaga birlashtirish
(function migrateLegacyTests() {
  const db = loadDB();
  if (fs.existsSync(LEGACY_TESTS_PATH)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(LEGACY_TESTS_PATH, 'utf-8') || '[]');
      if (Array.isArray(legacy) && legacy.length > 0) {
        let added = 0;
        legacy.forEach((lt) => {
          if (lt && lt.id && !db.tests.some((t) => t.id === lt.id)) {
            db.tests.unshift(lt);
            added++;
          }
        });
        if (added > 0) saveDB(db);
      }
    } catch (e) {
      console.error('Legacy tests migration skipped:', e.message);
    }
  }
})();

// Gemini Client Helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, UPLOADS_AUDIO_DIR);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, UPLOADS_IMAGES_DIR);
    } else {
      cb(null, UPLOADS_DOCS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Auth Helpers & Middlewares
function isAdminEmail(email) {
  return typeof email === 'string' && email.toLowerCase().trim() === ADMIN_EMAIL;
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider || 'local',
      isAdmin: isAdminEmail(user.email)
    },
    JWT_SECRET,
    { expiresIn: '14d' }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    decoded.isAdmin = isAdminEmail(decoded.email);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sessiya muddati tugagan. Qayta kiring.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !isAdminEmail(req.user.email)) {
    return res.status(403).json({ error: 'Ruxsat etilmagan: faqat bosh administrator uchun.' });
  }
  next();
}

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PeakMock',
    aiModel: GEMINI_MODEL,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// ================= AUTH ROUTES =================
// Server.js ga qo'shiladigan qism
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google ma’lumotlari topilmadi.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = loadDB();
    let user = db.users.find((u) => u.email === normalizedEmail);

    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: (name && name.trim()) || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        provider: 'google',
        targetIelts: '8.0',
        targetSat: '1520',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDB(db);
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        targetIelts: user.targetIelts || '8.0',
        targetSat: user.targetSat || '1520',
        isAdmin: isAdminEmail(user.email),
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Google orqali kirishda xatolik yuz berdi.' });
  }
});
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // ro'yxatdan o'tkazish logikasi
    res.json({ success: true, message: "Muvaffaqiyatli ro'yxatdan o'tdingiz" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email va parolni kiriting.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const db = loadDB();
    const user = db.users.find((u) => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Email yoki parol noto‘g‘ri.' });
    }
    if (!user.passwordHash) {
      return res.status(400).json({
        error: `Bu hisob ${user.provider.toUpperCase()} orqali yaratilgan. Shu tugma orqali kiring.`
      });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Email yoki parol noto‘g‘ri.' });
    }
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        targetIelts: user.targetIelts || '8.0',
        targetSat: user.targetSat || '1520',
        isAdmin: isAdminEmail(user.email),
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Kirishda xatolik yuz berdi.' });
  }
});

app.post('/api/auth/oauth', (req, res) => {
  try {
    const { provider, email, name } = req.body;
    if (!email || !provider) {
      return res.status(400).json({ error: 'OAuth ma’lumotlari to‘liq emas.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const cleanName = (name && name.trim()) || normalizedEmail.split('@')[0];
    const db = loadDB();
    let user = db.users.find((u) => u.email === normalizedEmail);
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: cleanName,
        email: normalizedEmail,
        provider: 'google',
        targetIelts: '8.0',
        targetSat: '1520',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDB(db);
    }
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        targetIelts: user.targetIelts || '8.0',
        targetSat: user.targetSat || '1520',
        isAdmin: isAdminEmail(user.email),
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).json({ error: 'OAuth avtorizatsiyada xatolik.' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.json({
      user: {
        ...req.user,
        isAdmin: isAdminEmail(req.user.email)
      }
    });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider || 'local',
      targetIelts: user.targetIelts || '8.0',
      targetSat: user.targetSat || '1520',
      isAdmin: isAdminEmail(user.email),
      createdAt: user.createdAt
    }
  });
});

app.patch('/api/auth/profile', authenticate, (req, res) => {
  const { name, targetIelts, targetSat } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
  if (name && name.trim()) user.name = name.trim();
  if (targetIelts) user.targetIelts = String(targetIelts);
  if (targetSat) user.targetSat = String(targetSat);
  saveDB(db);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider || 'local',
      targetIelts: user.targetIelts,
      targetSat: user.targetSat,
      isAdmin: isAdminEmail(user.email),
      createdAt: user.createdAt
    }
  });
});

// ================= TESTS ROUTES =================
app.get('/api/tests', authenticate, (req, res) => {
  const { exam, section, part } = req.query;
  const db = loadDB();
  let list = db.tests;
  if (exam) list = list.filter((t) => t.exam.toLowerCase() === exam.toLowerCase());
  if (section) list = list.filter((t) => t.section.toLowerCase() === section.toLowerCase());
  if (part) list = list.filter((t) => t.part.toLowerCase() === part.toLowerCase());
  res.json({ tests: list });
});

app.get('/api/tests/:id', authenticate, (req, res) => {
  const db = loadDB();
  const test = db.tests.find((t) => t.id === req.params.id);
  if (!test) return res.status(404).json({ error: 'Test topilmadi.' });
  res.json({ test });
});

// ================= HISTORY ROUTES =================
app.get('/api/history', authenticate, (req, res) => {
  const { exam, section } = req.query;
  const db = loadDB();
  let items = db.history.filter((h) => h.userEmail === req.user.email);
  if (exam) items = items.filter((h) => h.exam.toLowerCase() === exam.toLowerCase());
  if (section) items = items.filter((h) => h.section.toLowerCase() === section.toLowerCase());
  items.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  res.json({ history: items });
});

app.post('/api/history', authenticate, (req, res) => {
  const { exam, section, part, mode, title, scoreDisplay, rawScore, totalQuestions, durationSeconds, feedback } = req.body;
  const db = loadDB();
  const entry = {
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: req.user.id,
    userEmail: req.user.email,
    exam: exam || 'IELTS',
    section: section || 'General',
    part: part || 'Full',
    mode: mode || 'Practice',
    title: title || `${exam} ${section}`,
    scoreDisplay: scoreDisplay || 'N/A',
    rawScore: rawScore ?? null,
    totalQuestions: totalQuestions ?? null,
    durationSeconds: durationSeconds || 0,
    feedback: feedback || null,
    completedAt: new Date().toISOString()
  };
  db.history.push(entry);
  saveDB(db);
  res.json({ entry });
});

// ================= AI EVALUATION ROUTES =================
app.post('/api/ai/evaluate-writing', authenticate, async (req, res) => {
  try {
    const { taskType, prompt, responseText } = req.body;
    if (!responseText || responseText.trim().length < 20) {
      return res.status(400).json({ error: 'Baholash uchun kamida 20 ta belgi yozing.' });
    }
    const wordCount = responseText.trim().split(/\s+/).length;
    const ai = getGeminiClient();

    if (!ai) {
      const minTarget = taskType === 'Task 1' ? 150 : 250;
      const baseBand = wordCount >= minTarget ? 6.5 : 5.5;
      return res.json({
        evaluation: {
          overallBand: baseBand,
          taskAchievement: baseBand,
          coherenceCohesion: baseBand,
          lexicalResource: baseBand,
          grammaticalRange: baseBand,
          wordCount,
          summaryUz: `GEMINI_API_KEY sozlanmagan. Dastlabki so‘z soni tahlili: ${wordCount} ta so‘z (talab: ${minTarget}+).`,
          strengths: ['Mavzu doirasida yozilgan', `So‘zlar soni: ${wordCount}`],
          improvements: ['Muhit o‘zgaruvchilariga GEMINI_API_KEY ni qo‘shing'],
          sampleUpgrade: responseText.slice(0, 220) + '...'
        }
      });
    }

    const systemInstruction = `You are a certified senior IELTS Writing Examiner. Evaluate the candidate's ${taskType || 'Task 2'} essay strictly according to official IELTS Band Descriptors (0.0 to 9.0 in 0.5 increments). Provide constructive, academic feedback in Uzbek language for 'summaryUz', 'strengths', and 'improvements', while keeping 'sampleUpgrade' in high-band (Band 8.5) academic English.`;

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Task Prompt:\n${prompt}\n\nCandidate Response (${wordCount} words):\n${responseText}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallBand: { type: Type.NUMBER },
            taskAchievement: { type: Type.NUMBER },
            coherenceCohesion: { type: Type.NUMBER },
            lexicalResource: { type: Type.NUMBER },
            grammaticalRange: { type: Type.NUMBER },
            summaryUz: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            sampleUpgrade: { type: Type.STRING }
          },
          required: [
            'overallBand',
            'taskAchievement',
            'coherenceCohesion',
            'lexicalResource',
            'grammaticalRange',
            'summaryUz',
            'strengths',
            'improvements',
            'sampleUpgrade'
          ]
        }
      }
    });

    const parsed = JSON.parse(result.text);
    parsed.wordCount = wordCount;
    res.json({ evaluation: parsed });
  } catch (err) {
    console.error('AI Writing eval error:', err);
    res.status(500).json({ error: 'AI Writing baholashda xatolik: ' + err.message });
  }
});

app.post('/api/ai/evaluate-speaking', authenticate, async (req, res) => {
  try {
    const { part, prompt, transcript } = req.body;
    if (!transcript || transcript.trim().length < 15) {
      return res.status(400).json({ error: 'Speaking javobingizni kiriting yoki mikrofonda gapiring.' });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        evaluation: {
          overallBand: 6.5,
          fluencyCoherence: 6.5,
          lexicalResource: 6.5,
          grammaticalRange: 6.5,
          pronunciation: 6.5,
          summaryUz: 'GEMINI_API_KEY sozlanmagan. To‘liq AI Speaking tahlili uchun GEMINI_API_KEY qo‘shing.',
          strengths: ['Javob mantiqiy tuzilgan'],
          improvements: ['Murakkab bog‘lovchilar va idiomatik iboralardan ko‘proq foydalaning'],
          band8Sample: 'In my view, integrating structured digital tools into daily study routines significantly enhances long-term retention...'
        }
      });
    }

    const systemInstruction = `You are a certified senior IELTS Speaking Examiner. Evaluate the candidate's spoken transcript for IELTS Speaking ${part || 'Part 2'} on the official 0.0–9.0 scale (0.5 increments) across Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation clarity indicators. Write 'summaryUz', 'strengths', and 'improvements' in clear Uzbek, and provide a natural Band 8.5 English model answer in 'band8Sample'.`;

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Examiner Prompt:\n${prompt}\n\nCandidate Spoken Transcript:\n${transcript}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallBand: { type: Type.NUMBER },
            fluencyCoherence: { type: Type.NUMBER },
            lexicalResource: { type: Type.NUMBER },
            grammaticalRange: { type: Type.NUMBER },
            pronunciation: { type: Type.NUMBER },
            summaryUz: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            band8Sample: { type: Type.STRING }
          },
          required: [
            'overallBand',
            'fluencyCoherence',
            'lexicalResource',
            'grammaticalRange',
            'pronunciation',
            'summaryUz',
            'strengths',
            'improvements',
            'band8Sample'
          ]
        }
      }
    });

    const parsed = JSON.parse(result.text);
    res.json({ evaluation: parsed });
  } catch (err) {
    console.error('AI Speaking eval error:', err);
    res.status(500).json({ error: 'AI Speaking baholashda xatolik: ' + err.message });
  }
});

// ================= ADMIN STUDIO ROUTES =================
app.get('/api/admin/tests', authenticate, requireAdmin, (req, res) => {
  const db = loadDB();
  res.json({ tests: db.tests });
});

app.delete('/api/admin/tests/:id', authenticate, requireAdmin, (req, res) => {
  const db = loadDB();
  const before = db.tests.length;
  db.tests = db.tests.filter((t) => t.id !== req.params.id);
  if (db.tests.length === before) {
    return res.status(404).json({ error: 'Test topilmadi.' });
  }
  saveDB(db);
  res.json({ success: true });
});

app.post(
  '/api/admin/import-test',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'pdfFile', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { exam, section, part, customTitle, durationMinutes, rawText, rawTextFallback, adminComment } = req.body;
      const sourceText = (rawText || rawTextFallback || '').trim();

      const pdfFile = req.files && req.files.pdfFile ? req.files.pdfFile[0] : null;
      const audioFile = req.files && req.files.audioFile ? req.files.audioFile[0] : null;
      const imageFile = req.files && req.files.imageFile ? req.files.imageFile[0] : null;

      const audioUrl = audioFile ? `/uploads/audio/${audioFile.filename}` : '';
      const imageUrl = imageFile ? `/uploads/images/${imageFile.filename}` : '';

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({ error: 'GEMINI_API_KEY sozlanmagan (.env yoki Railway Variables ni tekshiring).' });
      }

      const partsPayload = [];

      if (pdfFile) {
        const pdfBytes = fs.readFileSync(pdfFile.path);
        partsPayload.push({
          inlineData: { mimeType: 'application/pdf', data: pdfBytes.toString('base64') }
        });
      }

      if (imageFile) {
        const imgBytes = fs.readFileSync(imageFile.path);
        partsPayload.push({
          inlineData: { mimeType: imageFile.mimetype, data: imgBytes.toString('base64') }
        });
      }

      if (sourceText) {
        partsPayload.push({
          text: `Source Exam Material:\n${sourceText}`
        });
      }

      if (partsPayload.length === 0 && !audioFile) {
        return res.status(400).json({ error: 'Kamida PDF fayl, rasm, audio yoki matn kiriting.' });
      }

      const instructionPrompt = `You are an expert academic assessment digitizer for PeakMock.
Convert the attached exam document/image/text into a clean, structured interactive test JSON object for ${exam} (${section} - ${part}).
${adminComment ? `\nAdmin Special Instructions/Comment:\n${adminComment}` : ''}

Rules:
- For multiple-choice or True/False/Not Given questions, put choices in "options" (e.g., ["A. ...", "B. ..."] or ["TRUE", "FALSE", "NOT GIVEN"]) and the correct answer in "answer".
- For gap-filling or short-answer questions, set "type": "gap_fill", leave "options": [], and put the exact expected short answer in "answer".
- For multiple-choice or True/False/Not Given questions, put choices in "options" (e.g., ["A. ...", "B. ..."] or ["TRUE", "FALSE", "NOT GIVEN"]) and the correct answer in "answer".
- For "Choose TWO/THREE letters" questions, either create a single question with "type": "multi", "maxSelect": 2, and "answer": "B, D" OR separate questions with their respective single answer.
- For gap-filling or short-answer questions, set "type": "gap_fill", leave "options": [], and put the exact expected short answer in "answer".
Return ONLY valid JSON with this exact schema:
{
  "passage": "Reading passage text if applicable, otherwise empty string",
  "transcript": "Listening transcript if applicable, otherwise empty string",
  "prompt": "Writing or Speaking task prompt if applicable, otherwise empty string",
  "minWords": 150,
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "prompt": "Question text",
      "options": ["A. Option 1", "B. Option 2"],
      "answer": "A",
      "explanation": "Brief explanation"
    }
  ]
}`;

      partsPayload.push({ text: instructionPrompt });

      const aiResponse = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: partsPayload,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawJsonText = (aiResponse.text || '{}')
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const structured = JSON.parse(rawJsonText);

      const normalizedQuestions = (structured.questions || []).map((q, idx) => ({
        id: q.id || idx + 1,
        type: q.type || (Array.isArray(q.options) && q.options.length > 0 ? 'mcq' : 'gap_fill'),
        prompt: q.prompt || q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) ? q.options : [],
        answer: q.answer || '',
        explanation: q.explanation || ''
      }));

      const newTest = {
        id: `${(exam || 'test').toLowerCase()}-${Date.now()}`,
        exam,
        section,
        part,
        title: (customTitle && customTitle.trim()) || `${exam} ${section} — ${part}`,
        durationMinutes: Number(durationMinutes) || 20,
        passage: structured.passage || '',
        transcript: structured.transcript || '',
        prompt: structured.prompt || '',
        minWords: structured.minWords || 150,
        audioUrl,
        imageUrl,
        questions: normalizedQuestions,
        createdBy: req.user ? req.user.email : 'admin',
        createdAt: new Date().toISOString()
      };

      const db = loadDB();
      db.tests.unshift(newTest);
      saveDB(db);

      return res.status(201).json({
        success: true,
        message: 'Test muvaffaqiyatli yaratildi va bazaga qo‘shildi!',
        test: newTest
      });
    } catch (error) {
      console.error('AI Test Digitizer Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Testni generatsiya qilishda xatolik yuz berdi'
      });
    }
  }
);

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PeakMock server running on port ${PORT} | AI Model: ${GEMINI_MODEL}`);
});