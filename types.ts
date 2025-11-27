
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  credentials: string[];
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

// Course Data Types
export interface Topic {
  title: string;
  description: string;
  weeks?: string;
}

export interface SubjectModule {
  name: string; // e.g., "Mathematics", "English", "Thinking Skills"
  description: string;
  keyOutcomes: string[];
  topics: Topic[];
}

export interface CourseStream {
  name: string; // e.g. "Advanced", "Extension 1", "Extension 2" for HSC
  description: string;
  modules: SubjectModule[];
}

export interface CourseData {
  id: string;
  title: string;
  gradeLevel: string; // "Year 3", "Year 12", etc.
  category: 'Primary' | 'Secondary';
  heroImage: string;
  description: string;
  // Primary usually has subjects (Maths, English), Secondary Yr 11/12 has streams (Adv, Ext)
  // We can unify this by putting subjects into 'streams' for consistency, or handling separately.
  // Let's use 'subjects' for Primary and 'streams' for Secondary structure, or a unified approach.
  subjects: SubjectModule[]; 
  streams?: CourseStream[]; // Optional, primarily for Senior Secondary
  
  whyChoose?: {
    title: string;
    description: string;
    icon: LucideIcon;
  }[];
}
