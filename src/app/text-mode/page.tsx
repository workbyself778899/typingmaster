'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Type, Calculator, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TextModePage() {
  const [text, setText] = useState('');
  const [showResult, setShowResult] = useState(false);

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  const handleFinish = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setText('');
    setShowResult(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Free Text Mode</h1>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Just type whatever is on your mind. Calculate your word count when you're done.
            </p>
          </div>

          <Card className="shadow-lg border-[hsl(var(--border))]">
            <CardContent className="p-0">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (showResult) setShowResult(false);
                }}
                placeholder="Start typing here..."
                className="w-full min-h-[400px] resize-y bg-transparent p-6 text-lg outline-none focus:ring-0 rounded-xl"
                autoFocus
              />
            </CardContent>
          </Card>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-6 rounded-lg bg-[hsl(var(--secondary))] p-4 shadow-sm"
              >
                <div className="text-center">
                  <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">Words</p>
                  <p className="text-3xl font-bold text-[hsl(var(--primary))]">{wordCount}</p>
                </div>
                <div className="h-10 w-px bg-[hsl(var(--border))]" />
                <div className="text-center">
                  <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">Characters</p>
                  <p className="text-3xl font-bold text-[hsl(var(--primary))]">{charCount}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-4">
            {!showResult ? (
              <Button onClick={handleFinish} size="lg" className="gap-2" disabled={text.length === 0}>
                <Calculator className="h-4 w-4" />
                Calculate Word Count
              </Button>
            ) : (
              <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear Text
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
