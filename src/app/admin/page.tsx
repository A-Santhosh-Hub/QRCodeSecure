"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShieldCheck, LogOut, Trash2, Pencil, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { formTemplates as initialFormTemplates, FormType } from '@/lib/form-config';

const ADMIN_PASSWORD = '1922K1396s*';

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [formTemplates, setFormTemplates] = useState(initialFormTemplates);
  const { toast } = useToast();

  const handleDelete = (formValue: FormType) => {
    setFormTemplates(currentTemplates => currentTemplates.filter(template => template.value !== formValue));
    toast({
        title: "Form Deleted",
        description: `The form template has been successfully deleted.`,
    });
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Form Management</CardTitle>
                    <CardDescription>
                        Add, edit, or delete form templates.
                    </CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Form
                </Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <ul className="divide-y">
                        {formTemplates.map((template) => (
                            <li key={template.value} className="flex items-center justify-between p-4 hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <template.icon className="h-6 w-6 text-primary" />
                                    <span className="font-medium">{template.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" disabled>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the form template.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(template.value as FormType)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </div>
                            </li>
                        ))}
                         {formTemplates.length === 0 && (
                            <li className="p-4 text-center text-muted-foreground">No form templates found.</li>
                         )}
                    </ul>
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
