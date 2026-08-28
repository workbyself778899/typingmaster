/**
 * Seed script to populate MongoDB with built-in lesson data.
 *
 * Usage:  npx tsx src/lib/db/seed-lessons.ts
 *
 * This reads the same lesson data that the lessons page uses
 * and inserts it into the Lesson collection so the /api/lessons
 * endpoint returns real data.
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || process.env.DB_NAME;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Import Lesson model
import Lesson from '../../models/Lesson';

// ===== Lesson data (matches the built-in data in lessons page) =====
const lessons = [
  // Home Row
  {
    title: 'F and J Keys',
    description: 'The index finger home keys',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'beginner',
    category: 'home-row',
    content: ['fjf jfj ffj jjf fjf jfj fff jjj fjf jfj'],
    targetKeys: ['f', 'j'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 15,
    order: 1,
    estimatedMinutes: 3,
  },
  {
    title: 'D and K Keys',
    description: 'Middle finger keys',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'beginner',
    category: 'home-row',
    content: ['dkd kdk ddk kkd dkd kdk ddd kkk dkd kdk'],
    targetKeys: ['d', 'k'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 15,
    order: 2,
    estimatedMinutes: 3,
  },
  {
    title: 'S and L Keys',
    description: 'Ring finger keys',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'beginner',
    category: 'home-row',
    content: ['sls lsl ssl lls sls lsl sss lll sls lsl'],
    targetKeys: ['s', 'l'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 15,
    order: 3,
    estimatedMinutes: 3,
  },
  {
    title: 'A and Semicolon',
    description: 'Pinky finger keys',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'beginner',
    category: 'home-row',
    content: ['aaa lll sss ddd fff jjj kkk lll aaa sss'],
    targetKeys: ['a', ';'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 15,
    order: 4,
    estimatedMinutes: 3,
  },
  {
    title: 'Full Home Row',
    description: 'All home row keys combined',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'beginner',
    category: 'home-row',
    content: ['ask dad fall lads gash flash salad glad half shall'],
    targetKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 15,
    order: 5,
    estimatedMinutes: 5,
  },

  // Top Row
  {
    title: 'R and U Keys',
    description: 'Index fingers reaching up',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'top-row',
    content: ['rur uru rru uur rur uru rrr uuu rur uru'],
    targetKeys: ['r', 'u'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 6,
    estimatedMinutes: 4,
  },
  {
    title: 'E and I Keys',
    description: 'Middle fingers reaching up',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'top-row',
    content: ['eie iei eei iie eie iei eee iii eie iei'],
    targetKeys: ['e', 'i'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 7,
    estimatedMinutes: 4,
  },
  {
    title: 'W and O Keys',
    description: 'Ring fingers reaching up',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'top-row',
    content: ['wow owo wwo oow wow owo www ooo wow owo'],
    targetKeys: ['w', 'o'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 8,
    estimatedMinutes: 4,
  },
  {
    title: 'Q and P Keys',
    description: 'Pinky fingers reaching up',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'top-row',
    content: ['qpq pqp qqp ppq qpq pqp qqq ppp qpq pqp'],
    targetKeys: ['q', 'p'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 9,
    estimatedMinutes: 4,
  },
  {
    title: 'T and Y Keys',
    description: 'Index finger stretch keys',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'top-row',
    content: ['the yet try your type they quite pretty youth truly'],
    targetKeys: ['t', 'y'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 10,
    estimatedMinutes: 4,
  },

  // Bottom Row
  {
    title: 'V and M Keys',
    description: 'Index fingers reaching down',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'bottom-row',
    content: ['vim move vam mav vim move vvv mmm vim move'],
    targetKeys: ['v', 'm'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 11,
    estimatedMinutes: 4,
  },
  {
    title: 'C and Comma',
    description: 'Middle fingers reaching down',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'bottom-row',
    content: ['came, care, once, could, clean, come, call, much, each,'],
    targetKeys: ['c', ','],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 12,
    estimatedMinutes: 4,
  },
  {
    title: 'X and Period',
    description: 'Ring fingers reaching down',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'bottom-row',
    content: ['next. text. box. fix. mix. six. exit. exact. extra.'],
    targetKeys: ['x', '.'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 13,
    estimatedMinutes: 4,
  },
  {
    title: 'Z and Slash',
    description: 'Pinky fingers reaching down',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'bottom-row',
    content: ['zip zone zero quiz fizz buzz maze gaze blaze craze'],
    targetKeys: ['z', '/'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 14,
    estimatedMinutes: 4,
  },
  {
    title: 'B and N Keys',
    description: 'Index finger stretch',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'easy',
    category: 'bottom-row',
    content: ['been bone burn know number begin between brown band bank'],
    targetKeys: ['b', 'n'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 15,
    estimatedMinutes: 4,
  },

  // Common Words
  {
    title: 'Top 25 Words',
    description: 'Most common English words',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'medium',
    category: 'common-words',
    content: ['the be to of and a in that have I it for not on with he as you do at this but his by from'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 92,
    minimumWpm: 25,
    order: 16,
    estimatedMinutes: 5,
  },
  {
    title: 'Action Words',
    description: 'Common verbs',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'medium',
    category: 'common-words',
    content: ['make can like time know take come could think look want give use find tell ask work seem feel try leave call'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 92,
    minimumWpm: 25,
    order: 17,
    estimatedMinutes: 5,
  },
  {
    title: 'Descriptive Words',
    description: 'Common adjectives',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'medium',
    category: 'common-words',
    content: ['good new first last long great little own old right big high different small large next early young important few public'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 92,
    minimumWpm: 25,
    order: 18,
    estimatedMinutes: 5,
  },

  // Sentences
  {
    title: 'Short Sentences',
    description: 'Simple sentence practice',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'medium',
    category: 'sentences',
    content: ['The dog ran fast. She likes to read. We went to the park. It was a good day. They are coming home.'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 92,
    minimumWpm: 25,
    order: 19,
    estimatedMinutes: 5,
  },
  {
    title: 'Medium Sentences',
    description: 'Intermediate length sentences',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'medium',
    category: 'sentences',
    content: ['The early morning sun cast long shadows across the field. She opened the old book carefully and began reading. The children played in the park while their parents watched from a bench.'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 22,
    order: 20,
    estimatedMinutes: 7,
  },
  {
    title: 'Complex Sentences',
    description: 'Advanced sentence structures',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'hard',
    category: 'sentences',
    content: ['Although the weather forecast predicted rain, the sky remained clear throughout the afternoon. The committee decided to postpone the meeting until all members could attend. Despite the challenging circumstances, the team managed to complete the project ahead of schedule.'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 88,
    minimumWpm: 20,
    order: 21,
    estimatedMinutes: 10,
  },

  // Numbers
  {
    title: 'Basic Numbers',
    description: '0-9 practice',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'hard',
    category: 'numbers',
    content: ['123 456 789 012 345 678 901 234 567 890 111 222 333 444 555'],
    targetKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 20,
    order: 22,
    estimatedMinutes: 5,
  },
  {
    title: 'Phone Numbers',
    description: 'Number patterns',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'hard',
    category: 'numbers',
    content: ['555-1234 987-6543 123-4567 800-555-1212 212-555-3456 415-555-7890'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 90,
    minimumWpm: 18,
    order: 23,
    estimatedMinutes: 5,
  },
  {
    title: 'Mixed Content',
    description: 'Words and numbers together',
    language: 'english',
    keyboardLayout: 'qwerty',
    difficulty: 'hard',
    category: 'numbers',
    content: ['Order 12345 was shipped on June 15. The price is $49.99 for 3 items. Room 204 is on the 2nd floor.'],
    targetKeys: [],
    targetCombinations: [],
    minimumAccuracy: 88,
    minimumWpm: 18,
    order: 24,
    estimatedMinutes: 7,
  },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');

  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    ...(MONGODB_DB_NAME ? { dbName: MONGODB_DB_NAME } : {}),
  };

  await mongoose.connect(MONGODB_URI!, opts);
  console.log('✅ Connected to MongoDB');

  console.log('🗑️  Clearing existing lessons...');
  await Lesson.deleteMany({});

  console.log(`📝 Inserting ${lessons.length} lessons...`);
  await Lesson.insertMany(lessons);

  console.log('✅ Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
