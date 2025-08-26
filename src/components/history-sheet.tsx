"use client";

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface HistoryItem {
  id: string;
  timestamp: string;
  qrCodeUrl: string;
  formData: Record<string, any> & { formType: string; fullName?: string, name?: string };
}

export function HistorySheet() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('qrCodeHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
        const storedHistory = localStorage.getItem('qrCodeHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        } else {
            setHistory([]);
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const clearHistory = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('qrCodeHistory');
        setHistory([]);
    }
  }

  if (!isClient) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <History className="h-5 w-5" />
          <span className="sr-only">View History</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>QR Code History</SheetTitle>
        </SheetHeader>
        <div className="flex justify-end mt-2">
            <Button variant="destructive" size="sm" onClick={clearHistory} disabled={history.length === 0}>
                <Trash2 className="mr-2 h-4 w-4"/>
                Clear History
            </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="p-4 border rounded-md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                       <Image src={item.qrCodeUrl} alt="QR Code" width={100} height={100} data-ai-hint="qrcode"/>
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <p className="font-semibold truncate">{item.formData.fullName || item.formData.name || "Untitled"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                       <p className="text-xs mt-2 text-primary/80 font-medium capitalize">
                        {item.formData.formType?.replace(/([A-Z])/g, ' $1').trim() || "Form"}
                       </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No history yet.</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
