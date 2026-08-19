import Link from 'next/link';
import { Zap, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white">
                <Zap className="h-4 w-4" />
              </div>
              TypingMaster Nepal
            </Link>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              Improve your typing speed and accuracy with personalized lessons, 
              adaptive learning, and support for English and Nepali typing.
            </p>
          </div>

          {/* Typing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Typing</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/typing" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Typing Test
                </Link>
              </li>
              <li>
                <Link href="/lessons" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Lessons
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Practice
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Statistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Languages</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/typing?lang=english" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  English Typing
                </Link>
              </li>
              <li>
                <Link href="/typing?lang=nepali-unicode" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Nepali Unicode
                </Link>
              </li>
              <li>
                <Link href="/typing?lang=nepali-preeti" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Preeti Typing
                </Link>
              </li>
              <li>
                <Link href="/typing?lang=nepali-kantipur" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Kantipur Typing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-8 sm:flex-row">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            © {new Date().getFullYear()} TypingMaster Nepal. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              aria-label="GitHub"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              aria-label="Twitter"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
