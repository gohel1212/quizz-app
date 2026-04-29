// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword },
  });

  // Seed settings
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      passScore: 7,
      demoLink: 'https://your-demo-link.com',
      quizTitle: 'StackCode Career Quiz',
    },
  });

  // Seed 10 career quiz questions
  const questions = [
    {
      order: 1,
      question: 'Which skill is most in demand for entry-level tech jobs in 2026?',
      optionA: 'Typing speed',
      optionB: 'AI tool usage (like ChatGPT, Copilot)',
      optionC: 'MS Paint',
      optionD: 'Basic HTML only',
      correctAnswer: 'B',
    },
    {
      order: 2,
      question: 'What is the biggest mistake students make while learning coding?',
      optionA: 'Watching tutorials only',
      optionB: 'Practicing daily',
      optionC: 'Building projects',
      optionD: 'Asking doubts',
      correctAnswer: 'A',
    },
    {
      order: 3,
      question: 'Which platform is best for building a strong tech portfolio?',
      optionA: 'WhatsApp',
      optionB: 'GitHub',
      optionC: 'Instagram',
      optionD: 'Snapchat',
      correctAnswer: 'B',
    },
    {
      order: 4,
      question: 'What matters more to recruiters today?',
      optionA: 'Degree only',
      optionB: 'Skills + Projects',
      optionC: 'College name only',
      optionD: 'Attendance',
      correctAnswer: 'B',
    },
    {
      order: 5,
      question: 'Which field is growing fastest right now?',
      optionA: 'Data Science / AI',
      optionB: 'Fax machine repair',
      optionC: 'Typing jobs',
      optionD: 'CD burning',
      correctAnswer: 'A',
    },
    {
      order: 6,
      question: 'What should you focus on first as a beginner?',
      optionA: 'Learning 10 languages',
      optionB: 'Mastering one skill deeply',
      optionC: 'Watching reels',
      optionD: 'Buying expensive courses',
      correctAnswer: 'B',
    },
    {
      order: 7,
      question: 'Which tool is commonly used for version control?',
      optionA: 'Excel',
      optionB: 'Git',
      optionC: 'Canva',
      optionD: 'Zoom',
      correctAnswer: 'B',
    },
    {
      order: 8,
      question: 'What is the biggest challenge students face in tech careers?',
      optionA: 'Lack of laptop',
      optionB: 'Lack of direction & roadmap',
      optionC: 'Internet speed',
      optionD: 'Friends',
      correctAnswer: 'B',
    },
    {
      order: 9,
      question: 'Which language is best for beginners in 2026?',
      optionA: 'Python',
      optionB: 'Assembly',
      optionC: 'COBOL',
      optionD: 'Binary',
      correctAnswer: 'A',
    },
    {
      order: 10,
      question: 'What helps you stand out in job applications?',
      optionA: 'Fancy resume design',
      optionB: 'Real-world projects',
      optionC: 'Long objective paragraph',
      optionD: 'Colorful fonts',
      correctAnswer: 'B',
    },
  ];

  for (const q of questions) {
    await prisma.question.upsert({
      where: { id: q.order.toString().padStart(8, '0') + '-0000-0000-0000-000000000000' },
      update: q,
      create: { id: q.order.toString().padStart(8, '0') + '-0000-0000-0000-000000000000', ...q },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
