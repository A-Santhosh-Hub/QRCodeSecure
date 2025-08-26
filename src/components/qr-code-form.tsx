"use client";

import { useState, useMemo } from 'react';
import { useForm, FieldErrors, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { CalendarIcon, Download, Loader2, User, Mail, Phone, GraduationCap, Briefcase, Users, Info, KeyRound, FileText, CheckSquare, MessageSquare, Calendar as CalendarIconLucid, Building, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { getSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// Schemas for different forms
const studentBioSchema = z.object({
  formType: z.literal('studentBio').default('studentBio'),
  password: z.string().min(6, "Password must be at least 6 characters."),
  fullName: z.string().min(3, "Full name is required"),
  dob: z.date({ required_error: "Date of birth is required." }),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender." }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number."),
  email: z.string().email("Please enter a valid email address."),
  address: z.string().min(5, "Address is required."),
  courseDepartment: z.string().min(2, "Course/Department is required."),
  enrollmentNumber: z.string().min(1, "Enrollment number is required."),
});

const jobApplicationSchema = z.object({
  formType: z.literal('jobApplication').default('jobApplication'),
  password: z.string().min(6, "Password must be at least 6 characters."),
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number."),
  position: z.string().min(2, "Position is required."),
  resumeAttached: z.boolean().default(false),
  experience: z.string().min(1, "Experience is required"),
  skills: z.string().min(5, "Skills are required."),
  coverLetter: z.string().optional(),
});

const eventRegistrationSchema = z.object({
  formType: z.literal('eventRegistration').default('eventRegistration'),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number."),
  eventName: z.string().min(2, "Event name is required."),
  preferredSlot: z.string().min(2, "Preferred slot is required."),
  paymentMethod: z.enum(["Online", "Offline"], { required_error: "Please select a payment method." }),
});

const contactFormSchema = z.object({
  formType: z.literal('contactForm').default('contactForm'),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number."),
  subject: z.string().min(2, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

const collegeAdmissionSchema = z.object({
  formType: z.literal('collegeAdmission').default('collegeAdmission'),
  password: z.string().min(6, "Password must be at least 6 characters."),
  fullName: z.string().min(3, "Full name is required"),
  dob: z.date({ required_error: "Date of birth is required." }),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender." }),
  fatherName: z.string().min(3, "Father's name is required."),
  motherName: z.string().min(3, "Mother's name is required."),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number."),
  email: z.string().email("Please enter a valid email address."),
  address: z.string().min(5, "Address is required."),
  courseApplied: z.string().min(2, "Course applied for is required."),
  prevQualification: z.string().min(2, "Previous qualification is required."),
  marks: z.string().min(1, "Marks are required."),
});

const formSchemas = {
  studentBio: studentBioSchema,
  jobApplication: jobApplicationSchema,
  eventRegistration: eventRegistrationSchema,
  contactForm: contactFormSchema,
  collegeAdmission: collegeAdmissionSchema,
};

const defaultValues: Record<FormType, any> = {
    studentBio: {
        formType: 'studentBio',
        password: '',
        fullName: '',
        dob: undefined,
        gender: undefined,
        phone: '',
        email: '',
        address: '',
        courseDepartment: '',
        enrollmentNumber: '',
    },
    jobApplication: {
        formType: 'jobApplication',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        position: '',
        resumeAttached: false,
        experience: '',
        skills: '',
        coverLetter: '',
    },
    eventRegistration: {
        formType: 'eventRegistration',
        password: '',
        name: '',
        email: '',
        phone: '',
        eventName: '',
        preferredSlot: '',
        paymentMethod: undefined,
    },
    contactForm: {
        formType: 'contactForm',
        password: '',
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    },
    collegeAdmission: {
        formType: 'collegeAdmission',
        password: '',
        fullName: '',
        dob: undefined,
        gender: undefined,
        fatherName: '',
        motherName: '',
        phone: '',
        email: '',
        address: '',
        courseApplied: '',
        prevQualification: '',
        marks: '',
    }
};

type FormType = keyof typeof formSchemas;
type FormData = z.infer<typeof studentBioSchema> | z.infer<typeof jobApplicationSchema> | z.infer<typeof eventRegistrationSchema> | z.infer<typeof contactFormSchema> | z.infer<typeof collegeAdmissionSchema>;

const formTemplates = [
    { value: "studentBio", label: "Student Bio", icon: GraduationCap },
    { value: "jobApplication", label: "Job Application", icon: Briefcase },
    { value: "eventRegistration", label: "Event Registration", icon: CalendarIconLucid },
    { value: "contactForm", label: "Contact Form", icon: MessageSquare },
    { value: "collegeAdmission", label: "College Admission", icon: Building },
];

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
  const [activeTab, setActiveTab] = useState<FormType>("studentBio");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState<{ summary: string, values: any } | null>(null);
  const { toast } = useToast();

  const currentSchema = useMemo(() => formSchemas[activeTab], [activeTab]);
  
  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: useMemo(() => defaultValues[activeTab], [activeTab]),
    key: activeTab, // Re-mounts the form on tab change
  });
  
  const formFieldsConfig: Record<FormType, any[]> = {
    studentBio: [
        { name: 'password', label: 'Password', type: 'password', placeholder: "Enter a secure password", required: true, span: true },
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: "Santhosh A", required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Other'], required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: "+91 9876543210", required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: "santhosh@example.com", required: true },
        { name: 'enrollmentNumber', label: 'Enrollment Number', type: 'text', placeholder: "URK21CS100", required: true },
        { name: 'courseDepartment', label: 'Course/Department', type: 'text', placeholder: "B.Sc Computer Science", required: true, span: true },
        { name: 'address', label: 'Address', type: 'textarea', placeholder: "123 Main St, City, Country", required: true, span: true },
    ],
    jobApplication: [
        { name: 'password', label: 'Password', type: 'password', placeholder: "Enter a secure password", required: true, span: true },
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: "Santhosh A", required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: "santhosh@example.com", required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: "+91 9876543210", required: true },
        { name: 'position', label: 'Position Applied For', type: 'text', placeholder: "Software Engineer", required: true },
        { name: 'experience', label: 'Experience (Years)', type: 'text', placeholder: "5", required: true },
        { name: 'resumeAttached', label: 'Resume Attached', type: 'checkbox' },
        { name: 'skills', label: 'Skills', type: 'textarea', placeholder: "React, Node.js, TypeScript", required: true, span: true },
        { name: 'coverLetter', label: 'Cover Letter', type: 'textarea', placeholder: "Your cover letter...", span: true },
    ],
    eventRegistration: [
        { name: 'password', label: 'Password', type: 'password', placeholder: "Enter a secure password", required: true, span: true },
        { name: 'name', label: 'Name', type: 'text', placeholder: "Santhosh A", required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: "santhosh@example.com", required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: "+91 9876543210", required: true },
        { name: 'eventName', label: 'Event Name', type: 'text', placeholder: "Tech Conference 2024", required: true },
        { name: 'preferredSlot', label: 'Preferred Slot', type: 'text', placeholder: "Morning Session", required: true },
        { name: 'paymentMethod', label: 'Payment Method', type: 'radio', options: ['Online', 'Offline'], required: true },
    ],
    contactForm: [
        { name: 'password', label: 'Password', type: 'password', placeholder: "Enter a secure password", required: true, span: true },
        { name: 'name', label: 'Name', type: 'text', placeholder: "Santhosh A", required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: "santhosh@example.com", required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: "+91 9876543210", required: true },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: "Inquiry about your services", required: true, span: true },
        { name: 'message', label: 'Message', type: 'textarea', placeholder: "Your message...", required: true, span: true },
    ],
    collegeAdmission: [
        { name: 'password', label: 'Password', type: 'password', placeholder: "Enter a secure password", required: true, span: true },
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: "Santhosh A", required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Other'], required: true },
        { name: 'fatherName', label: "Father's Name", type: 'text', placeholder: "Father's Name", required: true },
        { name: 'motherName', label: "Mother's Name", type: 'text', placeholder: "Mother's Name", required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: "+91 9876543210", required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: "santhosh@example.com", required: true },
        { name: 'courseApplied', label: 'Course Applied', type: 'text', placeholder: "B.Tech Computer Science", required: true },
        { name: 'prevQualification', label: 'Previous Qualification', type: 'text', placeholder: "12th Grade / High School", required: true },
        { name: 'marks', label: 'Marks Obtained (%)', type: 'text', placeholder: "95", required: true },
        { name: 'address', label: 'Address', type: 'textarea', placeholder: "123 Main St, City, Country", required: true, span: true },
    ]
  };

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
    const formattedData = formatDataToString(values);
    
    if (formattedData.length > 2000) {
        const result = await getSummary(formattedData);
        if (result.success && result.data) {
            setSummaryInfo({ summary: result.data.summary, values });
        } else {
            toast({
                variant: "destructive",
                title: "Summarization Failed",
                description: result.error || "Could not shorten the data. Please edit manually.",
            });
            setIsLoading(false);
        }
    } else {
        await generateAndSaveQRCode(formattedData, values);
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
    link.download = `${activeTab}-QRCodeSecure.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as FormType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto">
              {formTemplates.map((template) => (
                <TabsTrigger key={template.value} value={template.value} className="flex-col sm:flex-row gap-2 h-auto py-2">
                  <template.icon className="h-5 w-5"/>
                  <span>{template.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {formFieldsConfig[activeTab].map((field) => (
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
            </div>
          </Tabs>
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
