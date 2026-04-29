const { DatabaseSync } = require('node:sqlite');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcryptjs');

const db = new DatabaseSync('prisma/dev.db');

db.exec(`
CREATE TABLE IF NOT EXISTS Lead (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  college TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS QuizAttempt (
  id TEXT PRIMARY KEY NOT NULL,
  leadId TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL,
  totalQ INTEGER NOT NULL DEFAULT 10,
  passed BOOLEAN NOT NULL,
  completedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answers TEXT NOT NULL,
  CONSTRAINT QuizAttempt_leadId_fkey FOREIGN KEY (leadId) REFERENCES Lead (id)
);

CREATE TABLE IF NOT EXISTS Question (
  id TEXT PRIMARY KEY NOT NULL,
  question TEXT NOT NULL,
  optionA TEXT NOT NULL,
  optionB TEXT NOT NULL,
  optionC TEXT NOT NULL,
  optionD TEXT NOT NULL,
  correctAnswer TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Certificate (
  id TEXT PRIMARY KEY NOT NULL,
  attemptId TEXT NOT NULL UNIQUE,
  issuedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Certificate_attemptId_fkey FOREIGN KEY (attemptId) REFERENCES QuizAttempt (id)
);

CREATE TABLE IF NOT EXISTS AdminUser (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Settings (
  id TEXT PRIMARY KEY NOT NULL DEFAULT 'singleton',
  passScore INTEGER NOT NULL DEFAULT 7,
  demoLink TEXT NOT NULL DEFAULT '',
  quizTitle TEXT NOT NULL DEFAULT 'StackCode Career Quiz',
  updatedAt DATETIME NOT NULL
);
`);

const adminExists = db.prepare('SELECT id FROM AdminUser WHERE username = ?').get('admin');
if (!adminExists) {
  db.prepare('INSERT INTO AdminUser (id, username, password) VALUES (?, ?, ?)').run(
    randomUUID(),
    'admin',
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
  );
}

const settingsExists = db.prepare('SELECT id FROM Settings WHERE id = ?').get('singleton');
if (!settingsExists) {
  db.prepare('INSERT INTO Settings (id, passScore, demoLink, quizTitle, updatedAt) VALUES (?, ?, ?, ?, ?)').run(
    'singleton',
    7,
    'https://your-demo-link.com',
    'StackCode Career Quiz',
    new Date().toISOString(),
  );
}

const questions = [
  ['Which of the following best describes a growth mindset in a professional career?', 'Believing your skills and intelligence are fixed traits', 'Embracing challenges and learning from failures as opportunities to grow', 'Avoiding difficult tasks to maintain a perfect record', 'Relying only on formal education for career advancement', 'B'],
  ['What is the primary purpose of creating a personal brand on LinkedIn?', 'To show off your personal life and hobbies', 'To increase your follower count for social validation', 'To communicate your professional value and attract career opportunities', 'To copy successful professionals and replicate their strategies', 'C'],
  ['When switching careers, which strategy is most effective?', 'Quit your current job immediately and start fresh', 'Identify transferable skills and bridge skill gaps through targeted learning', 'Apply for every available job in the new field', 'Wait until you have 10+ years of experience in the new domain', 'B'],
  ['What does SMART goal-setting stand for in career planning?', 'Simple, Manageable, Achievable, Realistic, Timely', 'Strategic, Meaningful, Actionable, Relevant, Tested', 'Specific, Measurable, Achievable, Relevant, Time-bound', 'Structured, Motivational, Aspirational, Resourceful, Trackable', 'C'],
  ['Which of the following is a key indicator that a career path suits your personality?', 'It pays the highest salary in the market', 'Your parents or teachers recommended it', 'You feel energized and engaged even during challenging tasks', 'It is the most popular career choice among your peers', 'C'],
  ['What is "networking" in a professional context?', 'Setting up computer networks for businesses', 'Building genuine relationships that create mutual professional value', 'Collecting as many business cards as possible at events', 'Only connecting with people who can offer you a job immediately', 'B'],
  ['Which skill is considered MOST critical for long-term career success in the 21st century?', 'Memorizing large amounts of domain-specific information', 'Continuous learning and adaptability to change', 'Maintaining the exact same job role for decades', 'Avoiding new technologies to preserve existing skills', 'B'],
  ['What does "T-shaped professional" mean?', 'Someone who only works in technical fields', 'A person with broad general knowledge and deep expertise in one area', 'A person who changes careers every 2 years', 'Someone who only values teamwork over individual skills', 'B'],
  ['When should you start preparing for your career?', 'Only after completing your degree', 'After you receive your first rejection letter', 'As early as possible during education through internships, projects, and networking', 'When you turn 25 years old', 'C'],
  ['What is the most important thing to research before a job interview?', "The interviewer's personal social media profiles", "The company's culture, mission, recent news, and how your role fits its goals", 'The exact salary you will be offered', 'Whether the company has a cafeteria or gym', 'B'],
];

const insertQuestion = db.prepare(`
INSERT OR IGNORE INTO Question
(id, question, optionA, optionB, optionC, optionD, correctAnswer, "order", isActive, createdAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, ?)
`);

questions.forEach((q, index) => {
  insertQuestion.run(
    `${String(index + 1).padStart(8, '0')}-0000-0000-0000-000000000000`,
    q[0],
    q[1],
    q[2],
    q[3],
    q[4],
    q[5],
    index + 1,
    new Date().toISOString(),
  );
});

db.close();
console.log('Local SQLite database initialized.');
