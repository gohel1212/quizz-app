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
      question: 'Which of the following best describes a growth mindset in a professional career?',
      optionA: 'Believing your skills and intelligence are fixed traits',
      optionB: 'Embracing challenges and learning from failures as opportunities to grow',
      optionC: 'Avoiding difficult tasks to maintain a perfect record',
      optionD: 'Relying only on formal education for career advancement',
      correctAnswer: 'B',
    },
    {
      order: 2,
      question: 'What is the primary purpose of creating a personal brand on LinkedIn?',
      optionA: 'To show off your personal life and hobbies',
      optionB: 'To increase your follower count for social validation',
      optionC: 'To communicate your professional value and attract career opportunities',
      optionD: 'To copy successful professionals and replicate their strategies',
      correctAnswer: 'C',
    },
    {
      order: 3,
      question: 'When switching careers, which strategy is most effective?',
      optionA: 'Quit your current job immediately and start fresh',
      optionB: 'Identify transferable skills and bridge skill gaps through targeted learning',
      optionC: 'Apply for every available job in the new field',
      optionD: 'Wait until you have 10+ years of experience in the new domain',
      correctAnswer: 'B',
    },
    {
      order: 4,
      question: 'What does SMART goal-setting stand for in career planning?',
      optionA: 'Simple, Manageable, Achievable, Realistic, Timely',
      optionB: 'Strategic, Meaningful, Actionable, Relevant, Tested',
      optionC: 'Specific, Measurable, Achievable, Relevant, Time-bound',
      optionD: 'Structured, Motivational, Aspirational, Resourceful, Trackable',
      correctAnswer: 'C',
    },
    {
      order: 5,
      question: 'Which of the following is a key indicator that a career path suits your personality?',
      optionA: 'It pays the highest salary in the market',
      optionB: 'Your parents or teachers recommended it',
      optionC: 'You feel energized and engaged even during challenging tasks',
      optionD: 'It is the most popular career choice among your peers',
      correctAnswer: 'C',
    },
    {
      order: 6,
      question: 'What is "networking" in a professional context?',
      optionA: 'Setting up computer networks for businesses',
      optionB: 'Building genuine relationships that create mutual professional value',
      optionC: 'Collecting as many business cards as possible at events',
      optionD: 'Only connecting with people who can offer you a job immediately',
      correctAnswer: 'B',
    },
    {
      order: 7,
      question: 'Which skill is considered MOST critical for long-term career success in the 21st century?',
      optionA: 'Memorizing large amounts of domain-specific information',
      optionB: 'Continuous learning and adaptability to change',
      optionC: 'Maintaining the exact same job role for decades',
      optionD: 'Avoiding new technologies to preserve existing skills',
      correctAnswer: 'B',
    },
    {
      order: 8,
      question: 'What does "T-shaped professional" mean?',
      optionA: 'Someone who only works in technical fields',
      optionB: 'A person with broad general knowledge and deep expertise in one area',
      optionC: 'A person who changes careers every 2 years',
      optionD: 'Someone who only values teamwork over individual skills',
      correctAnswer: 'B',
    },
    {
      order: 9,
      question: 'When should you start preparing for your career?',
      optionA: 'Only after completing your degree',
      optionB: 'After you receive your first rejection letter',
      optionC: 'As early as possible — during education through internships, projects, and networking',
      optionD: 'When you turn 25 years old',
      correctAnswer: 'C',
    },
    {
      order: 10,
      question: 'What is the most important thing to research before a job interview?',
      optionA: 'The interviewer\'s personal social media profiles',
      optionB: 'The company\'s culture, mission, recent news, and how your role fits its goals',
      optionC: 'The exact salary you will be offered',
      optionD: 'Whether the company has a cafeteria or gym',
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
