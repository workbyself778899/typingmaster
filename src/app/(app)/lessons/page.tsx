'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  Keyboard,
  ChevronRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export interface LessonItem {
  id: string;
  title: string;
  desc: string;
  keys: string[];
  est: number;
  content: string;
  language: 'english' | 'nepali-unicode' | 'nepali-preeti' | 'nepali-kantipur';
}

export interface LessonCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  fontTag: 'English' | 'Unicode' | 'Preeti' | 'Kantipur';
  lessons: LessonItem[];
}

const lessonCategories: LessonCategory[] = [
  // ================= ENGLISH LESSONS =================
  {
    id: 'en-home-row',
    name: 'Home Row (English)',
    icon: '🏠',
    description: 'Master the foundation keys: A S D F G H J K L',
    difficulty: 'beginner',
    fontTag: 'English',
    lessons: [
      { id: 'hr-1', title: 'F and J Keys', desc: 'The index finger home keys', keys: ['f', 'j'], est: 3, content: 'fjf jfj ffj jjf fjf jfj fff jjj fjf jfj', language: 'english' },
      { id: 'hr-2', title: 'D and K Keys', desc: 'Middle finger keys', keys: ['d', 'k'], est: 3, content: 'dkd kdk ddk kkd dkd kdk ddd kkk dkd kdk', language: 'english' },
      { id: 'hr-3', title: 'S and L Keys', desc: 'Ring finger keys', keys: ['s', 'l'], est: 3, content: 'sls lsl ssl lls sls lsl sss lll sls lsl', language: 'english' },
      { id: 'hr-4', title: 'A and Semicolon', desc: 'Pinky finger keys', keys: ['a', ';'], est: 3, content: 'aaa lll sss ddd fff jjj kkk lll aaa sss', language: 'english' },
      { id: 'hr-5', title: 'Full Home Row', desc: 'All home row keys combined', keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], est: 5, content: 'ask dad fall lads gash flash salad glad half shall', language: 'english' },
    ],
  },
  {
    id: 'en-top-row',
    name: 'Top Row (English)',
    icon: '⬆️',
    description: 'Learn the keys above the home row: Q W E R T Y U I O P',
    difficulty: 'easy',
    fontTag: 'English',
    lessons: [
      { id: 'tr-1', title: 'R and U Keys', desc: 'Index fingers reaching up', keys: ['r', 'u'], est: 4, content: 'rur uru rru uur rur uru rrr uuu rur uru', language: 'english' },
      { id: 'tr-2', title: 'E and I Keys', desc: 'Middle fingers reaching up', keys: ['e', 'i'], est: 4, content: 'eie iei eei iie eie iei eee iii eie iei', language: 'english' },
      { id: 'tr-3', title: 'W and O Keys', desc: 'Ring fingers reaching up', keys: ['w', 'o'], est: 4, content: 'wow owo wwo oow wow owo www ooo wow owo', language: 'english' },
      { id: 'tr-4', title: 'Q and P Keys', desc: 'Pinky fingers reaching up', keys: ['q', 'p'], est: 4, content: 'qpq pqp qqp ppq qpq pqp qqq ppp qpq pqp', language: 'english' },
      { id: 'tr-5', title: 'T and Y Keys', desc: 'Index finger stretch keys', keys: ['t', 'y'], est: 4, content: 'the yet try your type they quite pretty youth truly', language: 'english' },
    ],
  },
  {
    id: 'en-bottom-row',
    name: 'Bottom Row (English)',
    icon: '⬇️',
    description: 'Master the keys below the home row: Z X C V B N M',
    difficulty: 'easy',
    fontTag: 'English',
    lessons: [
      { id: 'br-1', title: 'V and M Keys', desc: 'Index fingers reaching down', keys: ['v', 'm'], est: 4, content: 'vim move vam mav vim move vvv mmm vim move', language: 'english' },
      { id: 'br-2', title: 'C and Comma', desc: 'Middle fingers reaching down', keys: ['c', ','], est: 4, content: 'came, care, once, could, clean, come, call, much, each,', language: 'english' },
      { id: 'br-3', title: 'X and Period', desc: 'Ring fingers reaching down', keys: ['x', '.'], est: 4, content: 'next. text. box. fix. mix. six. exit. exact. extra.', language: 'english' },
      { id: 'br-4', title: 'Z and Slash', desc: 'Pinky fingers reaching down', keys: ['z', '/'], est: 4, content: 'zip zone zero quiz fizz buzz maze gaze blaze craze', language: 'english' },
      { id: 'br-5', title: 'B and N Keys', desc: 'Index finger stretch', keys: ['b', 'n'], est: 4, content: 'been bone burn know number begin between brown band bank', language: 'english' },
    ],
  },

  // ================= NEPALI UNICODE LESSONS =================
  {
    id: 'np-unicode-basics',
    name: 'स्वर र व्यञ्जन (Nepali Unicode Basics)',
    icon: '🇳🇵',
    description: 'नेपाली युनिकोडमा स्वर वर्ण र व्यञ्जन वर्णको आधारभूत अभ्यास',
    difficulty: 'beginner',
    fontTag: 'Unicode',
    lessons: [
      { id: 'uni-1', title: 'क, ख, ग, घ, ङ (क वर्ग)', desc: 'क वर्गका वर्णहरूको अभ्यास', keys: ['k', 'K', 'g', 'G', '<'], est: 4, content: 'क ख ग घ ङ कखगघङ कगखघङ कखगघङ', language: 'nepali-unicode' },
      { id: 'uni-2', title: 'च, छ, ज, झ, ञ (च वर्ग)', desc: 'च वर्गका वर्णहरूको अभ्यास', keys: ['c', 'C', 'j', 'J', 'Y'], est: 4, content: 'च छ ज झ ञ चछजझञ चजछझञ चछजझञ', language: 'nepali-unicode' },
      { id: 'uni-3', title: 'ट, ठ, ड, ढ, ण (ट वर्ग)', desc: 'ट वर्गका वर्णहरूको अभ्यास', keys: ['q', 'Q', 'x', 'X', 'N'], est: 4, content: 'ट ठ ड ढ ण टठडढण टडठढण टठडढण', language: 'nepali-unicode' },
      { id: 'uni-4', title: 'त, थ, द, ध, न (त वर्ग)', desc: 'त वर्गका वर्णहरूको अभ्यास', keys: ['t', 'T', 'd', 'D', 'n'], est: 4, content: 'त थ द ध न तथदधन तदथधन तथदधन', language: 'nepali-unicode' },
      { id: 'uni-5', title: 'प, फ, ब, भ, म (प वर्ग)', desc: 'प वर्गका वर्णहरूको अभ्यास', keys: ['p', 'P', 'b', 'B', 'm'], est: 4, content: 'प फ ब भ म पफबभम पबफभम पफबभम', language: 'nepali-unicode' },
    ],
  },
  {
    id: 'np-unicode-words',
    name: 'मात्रा र शब्दहरू (Unicode Matra & Words)',
    icon: '📝',
    description: 'आकार (ा), इकार (ि), ईकार (ी), उकार (ु) र आधारभूत नेपाली शब्दहरू',
    difficulty: 'medium',
    fontTag: 'Unicode',
    lessons: [
      { id: 'uni-w1', title: 'मात्रा अभ्यास', desc: 'का, कि, की, कु, कू, के, कै, को, कौ, कं', keys: ['a', 'i', 'I', 'u', 'U', 'e', 'E', 'o', 'w', 'M'], est: 5, content: 'का कि की कु कू के कै को कौ कं कः', language: 'nepali-unicode' },
      { id: 'uni-w2', title: 'सरल नेपाली शब्दहरू', desc: 'नेपाल, काठमाडौँ, हिमाल, देश, शान्ति', keys: [], est: 5, content: 'नेपाल हिमाल देश शान्ति समय धन ज्ञान शिक्षा फल प्रकृति', language: 'nepali-unicode' },
      { id: 'uni-w3', title: 'नेपाली वाक्यहरू', desc: 'नेपाली युनिकोडमा पूरा वाक्य टाइपिङ', keys: [], est: 6, content: 'नेपाल एक सुन्दर देश हो । सगरमाथा संसारको सबैभन्दा अग्लो हिमाल हो । काठमाडौँ नेपालको राजधानी हो ।', language: 'nepali-unicode' },
    ],
  },

  // ================= PREETI FONT LESSONS =================
  {
    id: 'np-preeti-basics',
    name: 'होम र टप रो (Preeti Font Basics)',
    icon: '⌨️',
    description: 'पारम्परिक प्रिती फन्टको कीबोर्ड लेआउट र अक्षरहरू अभ्यास',
    difficulty: 'beginner',
    fontTag: 'Preeti',
    lessons: [
      { id: 'pr-1', title: 'प्रिती होम रो (Home Row)', desc: 's=क, v=ख, u=ग, 3=घ, r=च, t=त, k=प, a=ब, d=म', keys: ['s', 'v', 'u', '3', 'r', 't', 'k', 'a', 'd'], est: 4, content: 's v u 3 r t k a d s v u 3 r t k a d', language: 'nepali-preeti' },
      { id: 'pr-2', title: 'प्रिती टप रो (Top Row)', desc: 'f=ा, L=ी, \'=ु, " =ू, ]=े, }=ै, c=अ, p=उ', keys: ['f', 'L', "'", '"', ']', '}', 'c', 'p'], est: 4, content: 'f L \' " ] } c p f L \' " ] } c p', language: 'nepali-preeti' },
      { id: 'pr-3', title: 'प्रिती मात्रा अभ्यास', desc: 'sf (का), sl (कि), sL (की), s\' (कु), s" (कू)', keys: ['f', 'l', 'L', "'", '"'], est: 5, content: 'sf sl sL s\' s" s] s} sf] sf} sfF', language: 'nepali-preeti' },
      { id: 'pr-4', title: 'प्रिती शब्द अभ्यास', desc: 'g]kfn (नेपाल), b]z (देश), lxdfn (हिमाल)', keys: [], est: 5, content: 'g]kfn b]z lxdfn zfGt ljsf; Uofg lzIff lg/Gt/', language: 'nepali-preeti' },
      { id: 'pr-5', title: 'प्रिती पूरा वाक्यहरू', desc: 'पारम्परिक प्रिती फन्टमा वाक्य टाइपिङ', keys: [], est: 7, content: 'g]kfn Ps ;\'Gb/ b]z xf] . ;u/dfyf ;+;f/sf] ;a}eGbf cUnf] lxdfn xf] . sf7df8f}F g]kfnsf] /fhwfgL xf] .', language: 'nepali-preeti' },
    ],
  },

  // ================= KANTIPUR FONT LESSONS =================
  {
    id: 'np-kantipur-basics',
    name: 'कान्तिपुर फन्ट (Kantipur Font Practice)',
    icon: '📰',
    description: 'नेपाली पत्र-पत्रिका तथा छापामा प्रयोग हुने कान्तिपुर फन्ट टाइपिङ',
    difficulty: 'medium',
    fontTag: 'Kantipur',
    lessons: [
      { id: 'kt-1', title: 'कान्तिपुर वर्णमाला अभ्यास', desc: 'कान्तिपुर फन्टमा आधारभूत वर्णहरू', keys: ['s', 'v', 'u', 'k', 'a', 'd', 'n', 'j', 'z'], est: 4, content: 's v u 3 r t b w g k K a e d o / n j z i ; x', language: 'nepali-kantipur' },
      { id: 'kt-2', title: 'कान्तिपुर मात्रा र शब्द', desc: 'मात्रा संयोजन र मुख्य नेपाली शब्दहरू', keys: ['f', 'L', ']', '}'], est: 5, content: 'sf sl sL s] s} sf] sf} g]kfn b]z lxdfn sf7df8f}F', language: 'nepali-kantipur' },
      { id: 'kt-3', title: 'कान्तिपुर समाचार वाक्य', desc: 'कान्तिपुर फन्ट शैलीमा पूरा वाक्य टाइपिङ', keys: [], est: 6, content: 'g]kfn Ps ;\'Gb/ b]z xf] . sf7df8f}F g]kfnsf] /fhwfgL xf] . s[lif / ko{6g g]kfnsf] ljsf;sf] d\'Vo cfwf/ xf] .', language: 'nepali-kantipur' },
    ],
  },
];

const fontTagColors: Record<string, string> = {
  English: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  Unicode: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  Preeti: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  Kantipur: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]',
  easy: 'bg-[hsl(var(--info)/0.1)] text-[hsl(var(--info))]',
  medium: 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]',
  hard: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]',
  expert: 'bg-[hsl(var(--chart-5)/0.1)] text-[hsl(var(--chart-5))]',
};

export default function LessonsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading lessons...</div>}>
      <LessonsContent />
    </Suspense>
  );
}

function LessonsContent() {
  const searchParams = useSearchParams();
  const langQuery = searchParams.get('lang');

  const getInitialFont = () => {
    if (!langQuery) return 'all';
    const lower = langQuery.toLowerCase();
    if (lower === 'nepali' || lower === 'np') return 'nepali';
    if (lower === 'english' || lower === 'en') return 'english';
    if (lower === 'unicode') return 'unicode';
    if (lower === 'preeti') return 'preeti';
    if (lower === 'kantipur') return 'kantipur';
    return 'all';
  };

  const [selectedFont, setSelectedFont] = useState<string>(getInitialFont());

  useEffect(() => {
    if (langQuery) {
      const lower = langQuery.toLowerCase();
      if (lower === 'nepali' || lower === 'np') setSelectedFont('nepali');
      else if (lower === 'english' || lower === 'en') setSelectedFont('english');
      else if (lower === 'unicode') setSelectedFont('unicode');
      else if (lower === 'preeti') setSelectedFont('preeti');
      else if (lower === 'kantipur') setSelectedFont('kantipur');
    }
  }, [langQuery]);

  const filteredCategories = lessonCategories.filter((c) => {
    if (selectedFont === 'all') return true;
    if (selectedFont === 'nepali') return c.fontTag !== 'English';
    if (selectedFont === 'english') return c.fontTag === 'English';
    return c.fontTag.toLowerCase() === selectedFont.toLowerCase();
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <GraduationCap className="h-8 w-8 text-[hsl(var(--primary))]" />
            Typing Lessons
          </h1>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">
            Structured lessons for English, Nepali Unicode, Preeti, and Kantipur fonts
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <Globe className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span>4 Font Styles Supported</span>
        </div>
      </motion.div>

      {/* Font Filter Tabs */}
      <Tabs value={selectedFont} onValueChange={setSelectedFont}>
        <TabsList className="mb-6 flex flex-wrap gap-2 h-auto p-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
          <TabsTrigger value="all" className="rounded-lg px-4 py-2 text-xs font-semibold">
            ✨ All Lessons
          </TabsTrigger>
          <TabsTrigger value="nepali" className="rounded-lg px-4 py-2 text-xs font-semibold gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            🇳🇵 Nepali (All)
          </TabsTrigger>
          <TabsTrigger value="english" className="rounded-lg px-4 py-2 text-xs font-semibold gap-1.5">
            🇺🇸 English
          </TabsTrigger>
          <TabsTrigger value="unicode" className="rounded-lg px-4 py-2 text-xs font-semibold gap-1.5">
            🇳🇵 Nepali Unicode
          </TabsTrigger>
          <TabsTrigger value="preeti" className="rounded-lg px-4 py-2 text-xs font-semibold gap-1.5">
            🇳🇵 Preeti Font
          </TabsTrigger>
          <TabsTrigger value="kantipur" className="rounded-lg px-4 py-2 text-xs font-semibold gap-1.5">
            📰 Kantipur Font
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedFont} className="mt-0">
          <div className="space-y-8">
            {filteredCategories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.08 }}
              >
                {/* Category Header */}
                <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[hsl(var(--border))] pb-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{category.name}</h2>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${fontTagColors[category.fontTag]}`}>
                        {category.fontTag}
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{category.description}</p>
                  </div>
                  <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium capitalize ${difficultyColors[category.difficulty]}`}>
                    {category.difficulty}
                  </span>
                </div>

                {/* Lessons Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.lessons.map((lesson, i) => (
                    <Link
                      key={lesson.id}
                      href={`/typing?text=${encodeURIComponent(lesson.content)}&lang=${lesson.language}`}
                    >
                      <Card className="group h-full cursor-pointer border-[hsl(var(--border))] transition-all hover:border-[hsl(var(--primary)/0.4)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.05)]">
                        <CardContent className="flex items-start gap-3 p-4">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] text-sm font-bold text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="font-semibold group-hover:text-[hsl(var(--primary))] transition-colors truncate text-sm sm:text-base">
                                {lesson.title}
                              </h3>
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mt-0.5">{lesson.desc}</p>
                            <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                                {lesson.est} min
                              </span>
                              {lesson.keys.length > 0 && (
                                <span className="flex items-center gap-1 font-mono text-[10px] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">
                                  <Keyboard className="h-3 w-3" />
                                  {lesson.keys.slice(0, 4).join(', ')}{lesson.keys.length > 4 ? '...' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1 group-hover:text-[hsl(var(--primary))]" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
