import { z } from 'zod';
import { GraduationCap, Briefcase, Calendar as CalendarIconLucid, MessageSquare, Building } from 'lucide-react';

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

export const formSchemas = {
  studentBio: studentBioSchema,
  jobApplication: jobApplicationSchema,
  eventRegistration: eventRegistrationSchema,
  contactForm: contactFormSchema,
  collegeAdmission: collegeAdmissionSchema,
};

export type FormType = keyof typeof formSchemas;
export type FormData = z.infer<typeof studentBioSchema> | z.infer<typeof jobApplicationSchema> | z.infer<typeof eventRegistrationSchema> | z.infer<typeof contactFormSchema> | z.infer<typeof collegeAdmissionSchema>;


export const defaultValues: Record<FormType, any> = {
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

export const formTemplates = [
    { value: "studentBio", label: "Student Bio", icon: GraduationCap },
    { value: "jobApplication", label: "Job Application", icon: Briefcase },
    { value: "eventRegistration", label: "Event Registration", icon: CalendarIconLucid },
    { value: "contactForm", label: "Contact Form", icon: MessageSquare },
    { value: "collegeAdmission", label: "College Admission", icon: Building },
];

export const formFieldsConfig: Record<FormType, any[]> = {
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
