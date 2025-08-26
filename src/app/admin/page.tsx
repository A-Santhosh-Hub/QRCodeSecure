"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

const ADMIN_PASSWORD = '1922K1396s*';

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <Button variant="outline" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Form Management</CardTitle>
                <CardDescription>
                    Here you can add, edit, or delete form templates. This functionality is under construction.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center h-48 bg-muted rounded-md">
                    <p className="text-muted-foreground">Admin controls for form management will be here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: 'Success',
        description: 'Logged in as Admin.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Incorrect password.',
      });
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    toast({
        title: 'Success',
        description: 'Logged out.',
      });
  }

  return (
    <div className="bg-background font-body">
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        {isAuthenticated ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="items-center text-center">
              <ShieldCheck className="h-12 w-12 text-primary" />
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>Enter the password to access the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
