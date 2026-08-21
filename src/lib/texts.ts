// ===== English Word & Sentence Banks =====
// Used to generate random typing content for tests and practice

const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
];

const intermediateWords = [
  'between', 'should', 'still', 'system', 'every', 'during', 'through', 'world',
  'before', 'large', 'must', 'home', 'under', 'water', 'story', 'keep',
  'never', 'start', 'life', 'city', 'earth', 'eyes', 'light', 'thought',
  'head', 'together', 'children', 'always', 'important', 'example', 'while',
  'number', 'country', 'might', 'school', 'answer', 'found', 'study', 'learn',
  'plant', 'cover', 'food', 'sun', 'four', 'state', 'both', 'below',
  'animal', 'house', 'point', 'page', 'letter', 'mother', 'picture', 'change',
  'right', 'different', 'move', 'away', 'again', 'place', 'near', 'small',
  'next', 'sound', 'question', 'complete', 'develop', 'problem', 'begin', 'group',
  'often', 'run', 'early', 'idea', 'enough', 'open', 'face', 'order',
];

const advancedWords = [
  'acknowledge', 'algorithm', 'anonymous', 'atmosphere', 'bureaucracy',
  'characteristic', 'collaborate', 'comprehensive', 'contemporary', 'demonstrate',
  'distinguished', 'elaborate', 'enthusiasm', 'environment', 'essentially',
  'extraordinary', 'fundamental', 'government', 'hypothesis', 'immediately',
  'infrastructure', 'interpretation', 'jurisdiction', 'knowledgeable', 'legitimate',
  'maintenance', 'nevertheless', 'observation', 'opportunity', 'particularly',
  'phenomenon', 'professional', 'qualification', 'recommendation', 'responsibility',
  'sophisticated', 'theoretical', 'understanding', 'vulnerability', 'approximately',
  'circumstance', 'communication', 'configuration', 'determination', 'establishment',
  'functionality', 'implementation', 'investigation', 'manufacturing', 'organizational',
];

const technicalWords = [
  'function', 'variable', 'constant', 'interface', 'component',
  'database', 'server', 'client', 'protocol', 'framework',
  'library', 'module', 'package', 'deployment', 'repository',
  'algorithm', 'iteration', 'recursion', 'callback', 'promise',
  'asynchronous', 'middleware', 'endpoint', 'authentication', 'authorization',
  'encryption', 'debugging', 'refactoring', 'optimization', 'scalability',
  'responsive', 'typescript', 'javascript', 'programming', 'development',
  'application', 'architecture', 'microservice', 'containerization', 'kubernetes',
  'monitoring', 'analytics', 'performance', 'accessibility', 'integration',
  'deployment', 'continuous', 'pipeline', 'automation', 'infrastructure',
];

const sentences = [
  'The quick brown fox jumps over the lazy dog.',
  'Pack my box with five dozen liquor jugs.',
  'How vexingly quick daft zebras jump.',
  'The five boxing wizards jump quickly.',
  'A wonderful serenity has taken possession of my entire soul.',
  'I am so happy my dear friend so absorbed in the exquisite sense of mere tranquil existence.',
  'The early morning sun cast long shadows across the dewy meadow.',
  'She opened the old book carefully its pages yellowed with age.',
  'The children played happily in the park while their parents watched.',
  'Technology continues to transform the way we live and work.',
  'Learning something new every day keeps the mind sharp and curious.',
  'The mountains stood tall against the backdrop of a brilliant sunset.',
  'Good communication is the foundation of every successful relationship.',
  'Practice makes perfect is a saying that holds true in many aspects of life.',
  'The ocean waves crashed against the rocky shore creating a rhythmic sound.',
  'Innovation requires both creativity and the willingness to take risks.',
  'A balanced diet combined with regular exercise leads to better health.',
  'The library was quiet except for the occasional turning of pages.',
  'Understanding different cultures broadens our perspective of the world.',
  'The stars twinkled brightly in the clear night sky above the countryside.',
  'Patience and persistence are key ingredients for achieving long term goals.',
  'The garden was filled with colorful flowers attracting butterflies and bees.',
  'Education is the most powerful weapon which you can use to change the world.',
  'The train arrived at the station precisely on time despite the heavy rain.',
  'Music has the power to evoke emotions and bring people together.',
  'The scientist carefully recorded the results of the experiment in her notebook.',
  'A journey of a thousand miles begins with a single step forward.',
  'The city skyline glittered with lights as darkness settled over the landscape.',
  'Reading books regularly can significantly improve vocabulary and writing skills.',
  'The autumn leaves drifted slowly to the ground painting the path in gold.',
];

const paragraphs = [
  'The art of typing is more than just pressing keys on a keyboard. It is a skill that requires coordination between your eyes, brain, and fingers. With regular practice, anyone can improve their typing speed and accuracy. The key is to maintain proper posture, keep your fingers on the home row, and avoid looking at the keyboard while typing.',
  'In today\'s digital world, typing has become an essential skill for both personal and professional life. Whether you are writing emails, coding software, or chatting with friends, the ability to type quickly and accurately can save you valuable time. Studies show that the average person types around 40 words per minute, while professional typists can exceed 100 words per minute.',
  'Learning to touch type is one of the most valuable investments you can make in yourself. Touch typing means typing without looking at the keyboard, relying instead on muscle memory to find each key. The process begins with the home row keys and gradually expands to include all keys on the keyboard. With dedicated practice, most people can learn to touch type within a few weeks.',
  'The history of typing dates back to the invention of the typewriter in the 1860s. The QWERTY keyboard layout, which is still the most common layout today, was designed by Christopher Latham Sholes in 1873. Despite various alternative layouts being proposed over the years, QWERTY has remained the standard due to its widespread adoption and the difficulty of changing established habits.',
  'Proper typing technique involves keeping your wrists slightly elevated, your back straight, and your eyes on the screen rather than the keyboard. Each finger is assigned specific keys to press, which allows for maximum efficiency and speed. The index fingers rest on the F and J keys, which typically have small bumps to help you find the home row without looking.',
];

// ===== Home-row focused content for beginners =====
const homeRowWords = [
  'sad', 'has', 'had', 'ash', 'dash', 'lad', 'lass', 'fall', 'shall',
  'glad', 'flash', 'glass', 'flag', 'half', 'lash', 'gash', 'lag', 'jag',
  'add', 'all', 'ask', 'dad', 'fad', 'gal', 'gas', 'hall', 'lags',
  'salad', 'flask', 'shall', 'alas', 'dads', 'gala', 'hagas', 'alga',
];

// ===== Generator Functions =====

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export type TextDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type TextType = 'words' | 'sentences' | 'paragraphs' | 'home-row';

/**
 * Generate random words based on difficulty level with optional numbers and punctuation.
 */
export function generateRandomWords(
  count: number,
  difficulty: TextDifficulty = 'medium',
  options?: { includeNumbers?: boolean; includePunctuation?: boolean }
): string {
  let wordPool: string[];

  switch (difficulty) {
    case 'beginner':
      wordPool = [...homeRowWords];
      break;
    case 'easy':
      wordPool = [...commonWords];
      break;
    case 'medium':
      wordPool = [...commonWords, ...intermediateWords];
      break;
    case 'hard':
      wordPool = [...intermediateWords, ...advancedWords];
      break;
    case 'expert':
      wordPool = [...advancedWords, ...technicalWords];
      break;
    default:
      wordPool = [...commonWords, ...intermediateWords];
  }

  const numberPool = ['1', '2', '5', '10', '20', '50', '100', '2026', '7', '12', '99', '365', '45', '80'];
  const punctuationMarks = ['.', ',', '?', '!', ';'];

  const result: string[] = [];
  const shuffled = shuffle(wordPool);

  for (let i = 0; i < count; i++) {
    let word = shuffled[i % shuffled.length];

    // Inject numbers every ~6 words if includeNumbers is true
    if (options?.includeNumbers && i % 6 === 2) {
      word = numberPool[Math.floor(Math.random() * numberPool.length)];
    }

    // Inject punctuation every ~5 words if includePunctuation is true
    if (options?.includePunctuation && i % 5 === 4) {
      const p = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      word = `${word}${p}`;
    }

    result.push(word);
  }

  // Capitalize sentence starts if punctuation is enabled
  if (options?.includePunctuation && result.length > 0) {
    result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      if (prev.endsWith('.') || prev.endsWith('?') || prev.endsWith('!')) {
        result[i] = result[i].charAt(0).toUpperCase() + result[i].slice(1);
      }
    }
  }

  return result.join(' ');
}

/**
 * Generate random sentences.
 */
export function generateSentences(count: number): string {
  const shuffled = shuffle(sentences);
  return shuffled.slice(0, Math.min(count, shuffled.length)).join(' ');
}

/**
 * Generate a random paragraph.
 */
export function generateParagraph(): string {
  return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

/**
 * Generate text based on type, difficulty, numbers, and punctuation.
 */
export function generateText(options: {
  type?: TextType;
  difficulty?: TextDifficulty;
  duration?: number; // seconds
  wordCount?: number;
  includeNumbers?: boolean;
  includePunctuation?: boolean;
}): string {
  const {
    type = 'words',
    difficulty = 'medium',
    duration = 60,
    wordCount,
    includeNumbers = false,
    includePunctuation = false,
  } = options;

  const estimatedWords = wordCount || Math.ceil((duration / 60) * 70);

  switch (type) {
    case 'home-row':
      return generateRandomWords(estimatedWords, 'beginner', { includeNumbers, includePunctuation });
    case 'sentences':
      return generateSentences(Math.ceil(estimatedWords / 10));
    case 'paragraphs':
      return generateParagraph();
    case 'words':
    default:
      return generateRandomWords(estimatedWords, difficulty, { includeNumbers, includePunctuation });
  }
}
