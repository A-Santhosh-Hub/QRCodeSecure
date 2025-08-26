import { QRCodeForm } from '@/components/qr-code-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { HistorySheet } from '@/components/history-sheet';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background font-body">
      <header className="absolute top-0 right-0 p-4 flex gap-2">
        <HistorySheet />
        <ThemeToggle />
      </header>
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-4xl py-8">
          <div className="text-center mb-10">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary">
              QRCode<span className="text-accent-foreground">Secure</span>
            </h1>
            <p className="mt-4 text-lg text-foreground/80 max-w-3xl mx-auto">
              Select a form template, fill out the details, and generate a secure, password-protected QR code. All fields marked with * are required.
            </p>
          </div>
          <QRCodeForm />
        </div>
      </main>
      <footer className="w-full text-center text-muted-foreground p-4">
        <p>Developed by SANTHOSH_A | <Link href="/admin" className="text-primary hover:underline">Admin Panel</Link></p>
      </footer>
    </div>
  );
}
