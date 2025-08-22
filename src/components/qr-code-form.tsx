"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { CalendarIcon, Download, Loader2, User, Mail, Phone, GraduationCap, Briefcase, Users, Info, HeartPulse, Flag, Building, MapPin, NotebookText, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { getSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const formSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  dob: z.date({ required_error: "Date of birth is required." }),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender." }),
  bloodGroup: z.string().optional(),
  nationality: z.string().min(2, "Nationality is required"),
  password: z.string().min(6, "Password must be at least 6 characters."),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number."),
  email: z.string().email("Please enter a valid email address."),
  address: z.string().min(5, "Address is required."),
  rollNumber: z.string().min(1, "Roll number is required."),
  course: z.string().min(2, "Course/Degree is required."),
  department: z.string().min(2, "Department is required."),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  hobbies: z.string().optional(),
  otherInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const formSections = [
    { value: "personal", label: "Personal", icon: User },
    { value: "security", label: "Security", icon: KeyRound },
    { value: "contact", label: "Contact", icon: Phone },
    { value: "academic", label: "Academic", icon: GraduationCap },
    { value: "family", label: "Family", icon: Users },
    { value: "additional", label: "Additional Info", icon: Info },
];

export function QRCodeForm() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState<{ summary: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      nationality: "Indian",
      password: "",
      mobileNumber: "",
      email: "",
      address: "",
      rollNumber: "",
      course: "",
      department: "",
      fatherName: "",
      fatherOccupation: "",
      motherName: "",
      motherOccupation: "",
      hobbies: "",
      otherInfo: "",
    },
  });

  const generateQRCode = async (data: string) => {
    try {
      const encodedData = btoa(unescape(encodeURIComponent(data)));
      const urlToEncode = `${window.location.origin}/view?data=${encodedData}`;
      const dataUrl = await QRCode.toDataURL(urlToEncode, {
        width: 300,
        margin: 2,
        color: {
            dark: '#0A4D68',
            light: '#F0F8FF'
        }
      });
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('QR Code Generation Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code.",
      });
    }
  };

  const formatDataToString = (data: FormData): string => {
    return `Password: ${data.password}
Full Name: ${data.fullName}
Roll Number: ${data.rollNumber}
Date of Birth: ${format(data.dob, "PPP")}
Gender: ${data.gender}
Mobile Number: ${data.mobileNumber}
Email Address: ${data.email}
Course / Degree: ${data.course}
Department: ${data.department}
Blood Group: ${data.bloodGroup || 'N/A'}
Nationality: ${data.nationality}
Address: ${data.address}
Father's Name: ${data.fatherName || 'N/A'}
Father's Occupation: ${data.fatherOccupation || 'N/A'}
Mother's Name: ${data.motherName || 'N/A'}
Mother's Occupation: ${data.motherOccupation || 'N/A'}
Hobbies: ${data.hobbies || 'N/A'}
Additional Info: ${data.otherInfo || 'N/A'}`;
  };

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    setQrCodeUrl(null);
    const formattedData = formatDataToString(values);
    
    if (formattedData.length > 2000) {
        const result = await getSummary(formattedData);
        if (result.success && result.data) {
            setSummaryInfo({ summary: result.data.summary });
        } else {
            toast({
                variant: "destructive",
                title: "Summarization Failed",
                description: result.error || "Could not shorten the data. Please edit manually.",
            });
            setIsLoading(false);
            return;
        }
    } else {
        await generateQRCode(formattedData);
    }
    
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'QRCodeSecure.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 h-auto">
                    {formSections.map((section) => (
                         <TabsTrigger key={section.value} value={section.value} className="flex-col sm:flex-row gap-2 h-auto py-2">
                            <section.icon className="h-5 w-5"/>
                            <span>{section.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="p-6">
                <TabsContent value="personal">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="Santhosh A" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dob" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 pt-2">
                            <FormItem><FormControl><RadioGroupItem value="Male" /></FormControl><FormLabel className="font-normal ml-2">Male</FormLabel></FormItem>
                            <FormItem><FormControl><RadioGroupItem value="Female" /></FormControl><FormLabel className="font-normal ml-2">Female</FormLabel></FormItem>
                            <FormItem><FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel className="font-normal ml-2">Other</FormLabel></FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a blood group" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="nationality" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality *</FormLabel>
                        <FormControl><Input placeholder="Indian" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>
                <TabsContent value="security">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter a secure password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>
                <TabsContent value="contact">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl><Input type="tel" placeholder="9876543210" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl><Input type="email" placeholder="example@gmail.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address *</FormLabel>
                        <FormControl><Textarea placeholder="123 Main St, City, Country" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>
                <TabsContent value="academic">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="rollNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number / Register Number *</FormLabel>
                        <FormControl><Input placeholder="URK21CS100" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="course" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course / Degree *</FormLabel>
                        <FormControl><Input placeholder="B.Sc Computer Science" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Department *</FormLabel>
                        <FormControl><Input placeholder="School of Computing" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>
                 <TabsContent value="family">
                    <div className="grid md:grid-cols-2 gap-6">
                       <FormField control={form.control} name="fatherName" render={({ field }) => (
                            <FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Father's Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
                            <FormItem><FormLabel>Father's Occupation</FormLabel><FormControl><Input placeholder="e.g., Engineer" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="motherName" render={({ field }) => (
                            <FormItem><FormLabel>Mother's Name</FormLabel><FormControl><Input placeholder="Mother's Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="motherOccupation" render={({ field }) => (
                           <FormItem><FormLabel>Mother's Occupation</FormLabel><FormControl><Input placeholder="e.g., Doctor" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </TabsContent>
                <TabsContent value="additional">
                   <div className="grid grid-cols-1 gap-6">
                        <FormField control={form.control} name="hobbies" render={({ field }) => (
                            <FormItem><FormLabel>Hobbies</FormLabel><FormControl><Textarea placeholder="e.g., Reading books, playing cricket" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="otherInfo" render={({ field }) => (
                            <FormItem><FormLabel>Any Other Information</FormLabel><FormControl><Textarea placeholder="Any other relevant information" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                   </div>
                </TabsContent>
                </div>
              </Tabs>
              <div className="px-6 pb-6 flex justify-end">
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
                    generateQRCode(summaryInfo.summary);
                }
            }}>Use Summary</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
