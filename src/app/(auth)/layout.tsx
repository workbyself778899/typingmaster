import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
          <Zap className="h-5 w-5" />
        </div>
        TypingMaster
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
