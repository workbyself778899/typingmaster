'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Lock,
  CheckCircle,
  Clock,
  Zap,
  Target,
  ChevronRight,
  Keyboard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ===== Built-in lesson data (works without MongoDB) =====
const lessonCategories = [
  {
    id: 'home-row',
    name: 'Home Row',
    icon: '🏠',
    description: 'Master the foundation keys: A S D F G H J K L',
    difficulty: 'beginner',
    lessons: [
      { id: 'hr-1', title: 'F and J Keys', desc: 'The index finger home keys', keys: ['f', 'j'], est: 3, content: 'fjf jfj ffj jjf fjf jfj fff jjj fjf jfj' },
      { id: 'hr-2', title: 'D and K Keys', desc: 'Middle finger keys', keys: ['d', 'k'], est: 3, content: 'dkd kdk ddk kkd dkd kdk ddd kkk dkd kdk' },
      { id: 'hr-3', title: 'S and L Keys', desc: 'Ring finger keys', keys: ['s', 'l'], est: 3, content: 'sls lsl ssl lls sls lsl sss lll sls lsl' },
      { id: 'hr-4', title: 'A and Semicolon', desc: 'Pinky finger keys', keys: ['a', ';'], est: 3, content: 'aaa lll sss ddd fff jjj kkk lll aaa sss' },
      { id: 'hr-5', title: 'Full Home Row', desc: 'All home row keys combined', keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], est: 5, content: 'ask dad fall lads gash flash salad glad half shall' },
    ],
  },
  {
    id: 'top-row',
    name: 'Top Row',
    icon: '⬆️',
    description: 'Learn the keys above the home row: Q W E R T Y U I O P',
    difficulty: 'easy',
    lessons: [
      { id: 'tr-1', title: 'R and U Keys', desc: 'Index fingers reaching up', keys: ['r', 'u'], est: 4, content: 'rur uru rru uur rur uru rrr uuu rur uru' },
      { id: 'tr-2', title: 'E and I Keys', desc: 'Middle fingers reaching up', keys: ['e', 'i'], est: 4, content: 'eie iei eei iie eie iei eee iii eie iei' },
      { id: 'tr-3', title: 'W and O Keys', desc: 'Ring fingers reaching up', keys: ['w', 'o'], est: 4, content: 'wow owo wwo oow wow owo www ooo wow owo' },
      { id: 'tr-4', title: 'Q and P Keys', desc: 'Pinky fingers reaching up', keys: ['q', 'p'], est: 4, content: 'qpq pqp qqp ppq qpq pqp qqq ppp qpq pqp' },
      { id: 'tr-5', title: 'T and Y Keys', desc: 'Index finger stretch keys', keys: ['t', 'y'], est: 4, content: 'the yet try your type they quite pretty youth truly' },
    ],
  },
  {
    id: 'bottom-row',
    name: 'Bottom Row',
    icon: '⬇️',
    description: 'Master the keys below the home row: Z X C V B N M',
    difficulty: 'easy',
    lessons: [
      { id: 'br-1', title: 'V and M Keys', desc: 'Index fingers reaching down', keys: ['v', 'm'], est: 4, content: 'vim move vam mav vim move vvv mmm vim move' },
      { id: 'br-2', title: 'C and Comma', desc: 'Middle fingers reaching down', keys: ['c', ','], est: 4, content: 'came, care, once, could, clean, come, call, much, each,' },
      { id: 'br-3', title: 'X and Period', desc: 'Ring fingers reaching down', keys: ['x', '.'], est: 4, content: 'next. text. box. fix. mix. six. exit. exact. extra.' },
      { id: 'br-4', title: 'Z and Slash', desc: 'Pinky fingers reaching down', keys: ['z', '/'], est: 4, content: 'zip zone zero quiz fizz buzz maze gaze blaze craze' },
      { id: 'br-5', title: 'B and N Keys', desc: 'Index finger stretch', keys: ['b', 'n'], est: 4, content: 'been bone burn know number begin between brown band bank' },
    ],
  },
  {
    id: 'common-words',
    name: 'Common Words',
    icon: '📝',
    description: 'Practice the most frequently used English words',
    difficulty: 'medium',
    lessons: [
      { id: 'cw-1', title: 'Top 25 Words', desc: 'Most common English words', keys: [], est: 5, content: 'the be to of and a in that have I it for not on with he as you do at this but his by from' },
      { id: 'cw-2', title: 'Action Words', desc: 'Common verbs', keys: [], est: 5, content: 'make can like time know take come could think look want give use find tell ask work seem feel try leave call' },
      { id: 'cw-3', title: 'Descriptive Words', desc: 'Common adjectives', keys: [], est: 5, content: 'good new first last long great little own old right big high different small large next early young important few public' },
    ],
  },
  {
    id: 'sentences',
    name: 'Sentences',
    icon: '💬',
    description: 'Type complete sentences with proper punctuation',
    difficulty: 'medium',
    lessons: [
      { id: 'sn-1', title: 'Short Sentences', desc: 'Simple sentence practice', keys: [], est: 5, content: 'The dog ran fast. She likes to read. We went to the park. It was a good day. They are coming home.' },
      { id: 'sn-2', title: 'Medium Sentences', desc: 'Intermediate length sentences', keys: [], est: 7, content: 'The early morning sun cast long shadows across the field. She opened the old book carefully and began reading. The children played in the park while their parents watched from a bench.' },
      { id: 'sn-3', title: 'Complex Sentences', desc: 'Advanced sentence structures', keys: [], est: 10, content: 'Although the weather forecast predicted rain, the sky remained clear throughout the afternoon. The committee decided to postpone the meeting until all members could attend. Despite the challenging circumstances, the team managed to complete the project ahead of schedule.' },
    ],
  },
  {
    id: 'numbers',
    name: 'Numbers',
    icon: '🔢',
    description: 'Practice typing numbers and number combinations',
    difficulty: 'hard',
    lessons: [
      { id: 'nm-1', title: 'Basic Numbers', desc: '0-9 practice', keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], est: 5, content: '123 456 789 012 345 678 901 234 567 890 111 222 333 444 555' },
      { id: 'nm-2', title: 'Phone Numbers', desc: 'Number patterns', keys: [], est: 5, content: '555-1234 987-6543 123-4567 800-555-1212 212-555-3456 415-555-7890' },
      { id: 'nm-3', title: 'Mixed Content', desc: 'Words and numbers together', keys: [], est: 7, content: 'Order 12345 was shipped on June 15. The price is $49.99 for 3 items. Room 204 is on the 2nd floor.' },
    ],
  },
];

const difficultyColors: Record<string, string> = {
  beginner: 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]',
  easy: 'bg-[hsl(var(--info)/0.1)] text-[hsl(var(--info))]',
  medium: 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]',
  hard: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]',
  expert: 'bg-[hsl(var(--chart-5)/0.1)] text-[hsl(var(--chart-5))]',
};

export default function LessonsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCategories = selectedCategory === 'all'
    ? lessonCategories
    : lessonCategories.filter((c) => c.id === selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <GraduationCap className="h-8 w-8 text-[hsl(var(--primary))]" />
          Typing Lessons
        </h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Structured lessons to build your typing skills from scratch
        </p>
      </motion.div>

      {/* Category Filter */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          {lessonCategories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-0">
          <div className="space-y-8">
            {filteredCategories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                {/* Category Header */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold">{category.name}</h2>
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
                      href={`/typing?text=${encodeURIComponent(lesson.content)}&lesson=${lesson.id}`}
                    >
                      <Card className="group h-full cursor-pointer border-[hsl(var(--border))] transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md">
                        <CardContent className="flex items-start gap-3 p-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-sm font-bold text-[hsl(var(--primary))]">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold group-hover:text-[hsl(var(--primary))] transition-colors">
                              {lesson.title}
                            </h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{lesson.desc}</p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.est} min
                              </span>
                              {lesson.keys.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Keyboard className="h-3 w-3" />
                                  {lesson.keys.join(', ')}
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
