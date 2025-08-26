"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, FieldErrors, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { CalendarIcon, Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { getSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { formTemplates, formSchemas, defaultValues, formFieldsConfig, FormType, FormData } from '@/lib/form-config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';


const renderFormField = (field: any, form: UseFormReturn<any>) => {
    const commonProps = { control: form.control, name: field.name };
    switch(field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'password':
            return <FormField {...commonProps} render={({ field: formField }) => (
                <FormItem className={field.span ? "md:col-span-2" : ""}><FormLabel>{field.label} {field.required && '*'}</FormLabel><FormControl><Input type={field.type} placeholder={field.placeholder} {...formField} /></FormControl><FormMessage /></FormItem>
            )} />;
        case 'textarea':
             return <FormField {...commonProps} render={({ field: formField }) => (
                <FormItem className={field.span ? "md:col-span-2" : ""}><FormLabel>{field.label} {field.required && '*'}</FormLabel><FormControl><Textarea placeholder={field.placeholder} {...formField} /></FormControl><FormMessage /></FormItem>
            )} />;
        case 'date':
            return <FormField {...commonProps} render={({ field: formField }) => (
                <FormItem className="flex flex-col"><FormLabel>{field.label} *</FormLabel>
                <Popover><PopoverTrigger asChild>
                    <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !formField.value && "text-muted-foreground")}>
                        {formField.value ? format(formField.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button></FormControl>
                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={formField.value} onSelect={formField.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage />
                </FormItem>
            )} />;
        case 'radio':
            return <FormField {...commonProps} render={({ field: formField }) => (
                <FormItem><FormLabel>{field.label} *</FormLabel>
                <FormControl><RadioGroup onValueChange={formField.onChange} defaultValue={formField.value} className="flex space-x-4 pt-2">
                    {field.options.map((opt: string) => <FormItem key={opt}><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal ml-2">{opt}</FormLabel></FormItem>)}
                </RadioGroup></FormControl><FormMessage />
                </FormItem>
            )} />;
        case 'checkbox':
            return <FormField {...commonProps} render={({ field: formField }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl><Checkbox checked={formField.value} onCheckedChange={formField.onChange} /></FormControl>
                  <div className="space-y-1 leading-none"><FormLabel>{field.label}</FormLabel></div>
                </FormItem>
            )} />;
        default:
            return null;
    }
}

export function QRCodeForm() {
  const [activeFormType, setActiveFormType] = useState<FormType>("studentBio");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState<{ summary: string, values: any } | null>(null);
  const { toast } = useToast();

  const currentSchema = useMemo(() => formSchemas[activeFormType], [activeFormType]);
  
  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: useMemo(() => defaultValues[activeFormType], [activeFormType]),
  });

  useEffect(() => {
    form.reset(defaultValues[activeFormType]);
  }, [activeFormType, form]);
  

  const generateAndSaveQRCode = async (data: string, values: FormData) => {
    try {
      const encodedData = btoa(unescape(encodeURIComponent(data)));
      const urlToEncode = `${window.location.origin}/view?data=${encodedData}`;
      const dataUrl = await QRCode.toDataURL(urlToEncode, {
        width: 300,
        margin: 2,
        color: { dark: '#0A4D68', light: '#F0F8FF' }
      });
      setQrCodeUrl(dataUrl);
      saveToHistory(dataUrl, values);
    } catch (error) {
      console.error('QR Code Generation Error:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate QR code." });
    }
  };

  const saveToHistory = (qrCodeUrl: string, formData: any) => {
    if (typeof window === 'undefined') return;
    const newItem = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        qrCodeUrl,
        formData: {
            formType: formData.formType,
            fullName: formData.fullName || formData.name, // Handle different field names
            ...formData,
        }
    };
    const storedHistory = localStorage.getItem('qrCodeHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.unshift(newItem);
    localStorage.setItem('qrCodeHistory', JSON.stringify(history.slice(0, 50)));
    // Dispatch a storage event to update other components like the history sheet
    window.dispatchEvent(new Event("storage"));
  };

  const formatDataToString = (data: any): string => {
    let formattedString = `Password: ${data.password}\n`;
    formattedString += `Form Type: ${formTemplates.find(f => f.value === data.formType)?.label || 'Unknown'}\n\n`;

    for (const key in data) {
        if (key !== 'password' && key !== 'formType' && data[key] !== undefined && data[key] !== null && data[key] !== '') {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            let value = data[key];
            if (value instanceof Date) {
                value = format(value, "PPP");
            } else if (typeof value === 'boolean') {
                value = value ? 'Yes' : 'No';
            }
            formattedString += `${label}: ${value}\n`;
        }
    }
    return formattedString;
  };

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    setQrCodeUrl(null);
    const formattedData = formatDataToString({ ...values, formType: activeFormType });
    
    if (formattedData.length > 2000) {
        const result = await getSummary(formattedData);
        if (result.success && result.data) {
            setSummaryInfo({ summary: result.data.summary, values: { ...values, formType: activeFormType } });
        } else {
            toast({
                variant: "destructive",
                title: "Summarization Failed",
                description: result.error || "Could not shorten the data. Please edit manually.",
            });
            setIsLoading(false);
        }
    } else {
        await generateAndSaveQRCode(formattedData, { ...values, formType: activeFormType });
    }
    
    setIsLoading(false);
  };
  
  const onFormError = (errors: FieldErrors<FormData>) => {
    const errorMessages = Object.values(errors).map(e => e?.message).filter(Boolean);
    toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: errorMessages.length > 0 ? errorMessages.join(' ') : "Please fill out all required fields.",
    });
  }

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${activeFormType}-QRCodeSecure.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-6">
            <div className="mb-6">
              <Label>Select Form Template</Label>
              <Select onValueChange={(value) => setActiveFormType(value as FormType)} defaultValue={activeFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a form template" />
                </SelectTrigger>
                <SelectContent>
                  {formTemplates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      <div className="flex items-center gap-2">
                        <template.icon className="h-5 w-5"/>
                        <span>{template.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                {formFieldsConfig[activeFormType].map((field) => (
                    <div key={field.name} className={field.span ? 'md:col-span-2' : ''}>
                        {renderFormField(field, form)}
                    </div>
                ))}
                </div>
                <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate QR Code'}
                </Button>
                </div>
            </form>
            </Form>
        </CardContent>
      </Card>
      
      {qrCodeUrl && (
        <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-4 text-primary">Your QR Code is Ready!</h3>
            <div className="flex justify-center p-4 bg-white rounded-lg">
                <Image src={qrCodeUrl} alt="Generated QR Code" width={250} height={250} data-ai-hint="qrcode" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">Scan this code to view the details after entering the password.</p>
            <Button onClick={handleDownload} className="mt-6 w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!summaryInfo} onOpenChange={() => setSummaryInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Data Too Long for QR Code</AlertDialogTitle>
            <AlertDialogDescription>
              The data you entered is too long to reliably fit in a QR code. We've generated a summary.
              Would you like to use this summary, or go back and edit your information manually?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-muted rounded-md text-sm max-h-60 overflow-y-auto">
            <p className="whitespace-pre-wrap">{summaryInfo?.summary}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Edit Manually</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                if (summaryInfo) {
                    generateAndSaveQRCode(summaryInfo.summary, summaryInfo.values);
                }
            }}>Use Summary</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
