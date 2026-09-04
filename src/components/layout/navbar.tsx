'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  GraduationCap,
  Target,
  Menu,
  X,
  Zap,
  Type,
  ChevronDown,
  Swords,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/typing', label: 'Typing Test', icon: Keyboard },
  {
    label: 'Lessons',
    icon: GraduationCap,
    dropdown: [
      { href: '/lessons?lang=english', label: 'English' },
      { href: '/lessons?lang=nepali', label: 'Nepali' },
    ],
  },
  { href: '/practice', label: 'Practice', icon: Target },
  { href: '/text-mode', label: 'Text Mode', icon: Type },
  { href: '/game', label: 'Game', icon: Swords },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.95)] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background)/0.6)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white">
            <Zap className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">TypingMaster</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.dropdown) {
              const isActive = pathname.startsWith('/lessons');
              return (
                <DropdownMenu key="lessons-dropdown">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 text-sm',
                        isActive && 'bg-[hsl(var(--secondary))] font-medium'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.dropdown.map((drop) => (
                      <DropdownMenuItem key={drop.href} asChild>
                        <Link href={drop.href} className="w-full cursor-pointer">
                          {drop.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            const isActive = item.href && pathname.startsWith(item.href);
            return (
              <Link key={item.href || item.label} href={item.href || '#'}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2 text-sm',
                    isActive && 'bg-[hsl(var(--secondary))] font-medium'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[hsl(var(--border))] md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navItems.map((item) => {
                if (item.dropdown) {
                  return (
                    <div key="mobile-lessons" className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <div className="ml-6 space-y-1 border-l border-[hsl(var(--border))] pl-3">
                        {item.dropdown.map((drop) => (
                          <Link
                            key={drop.href}
                            href={drop.href}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] transition-colors"
                          >
                            {drop.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                const isActive = item.href && pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href || item.label}
                    href={item.href || '#'}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-[hsl(var(--secondary))] font-medium'
                        : 'hover:bg-[hsl(var(--accent))]'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
