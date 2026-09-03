import { Navbar } from '@/components/layout/navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
