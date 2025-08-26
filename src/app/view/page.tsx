'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

const ADMIN_PASSWORD = '007124';

function ViewQrCodeContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [userPassword, setUserPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const decodedString = decodeURIComponent(escape(atob(encodedData)));
        const passwordMatch = decodedString.match(/^Password: (.*)\n/);
        if (passwordMatch) {
            setUserPassword(passwordMatch[1]);
            setData(decodedString.substring(passwordMatch[0].length));
        } else {
            // Data might not be password protected
            setData(decodedString);
            setIsAuthenticated(true); // No password, so grant access
        }
      } catch (e) {
        console.error('Failed to decode data:', e);
        toast({
            variant: "destructive",
            title: "Invalid Data",
            description: "The data in the QR code is corrupted or invalid.",
        });
        setData("Error: Invalid data in QR code.");
      }
    } else {
        toast({
            variant: "destructive",
            title: "No Data Found",
            description: "No data was found in the QR code.",
        });
        setData("Error: No data found.");
    }
    setIsLoading(false);
  }, [searchParams, toast]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD || password === userPassword) {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Viewing secured information.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The password you entered is incorrect.",
      });
      setPassword('');
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
        </div>
    );
  }

  if (!data) {
     return (
        <Card className="w-full max-w-md">
            <CardHeader className="items-center text-center">
                 <ShieldOff className="h-12 w-12 text-destructive" />
                <CardTitle className="text-2xl">Error</CardTitle>
                <CardDescription>Could not load data from the QR code.</CardDescription>
            </CardHeader>
        </Card>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <CardTitle className="text-2xl">Verification Required</CardTitle>
          <CardDescription>Enter the password to view the details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center"
            />
            <Button type="submit" className="w-full">
              Unlock Details
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Secured Information</CardTitle>
        <CardDescription>This information was retrieved from the QR code.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="p-4 bg-muted rounded-md text-sm text-foreground whitespace-pre-wrap font-body overflow-x-auto">
            {data}
        </pre>
      </CardContent>
    </Card>
  );
}


export default function ViewQrCodePage() {
    return (
        <div className="bg-background font-body">
            <header className="absolute top-0 right-0 p-4">
                <ThemeToggle />
            </header>
            <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
                <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
                    <ViewQrCodeContent />
                </Suspense>
            </main>
             <footer className="w-full text-center text-muted-foreground p-4">
                <p>Developed by SANTHOSH_A</p>
            </footer>
        </div>
    );
}
