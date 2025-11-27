
// This file simulates the Backend Microservices described in TECHNICAL_DESIGN.md
// It acts as the API Gateway + DB Layer + Worker Queue

export type UserRole = 'student' | 'tutor' | 'admin';

export interface Course {
  id: string;
  title: string;
  code: string;
  students: number;
  progress: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

const MOCK_COURSES: Course[] = [
  { id: 'c1', title: 'Year 10 Mathematics Advanced', code: 'MATH10-ADV', students: 12, progress: 68 },
  { id: 'c2', title: 'Year 10 English', code: 'ENG10', students: 12, progress: 45 },
  { id: 'c3', title: 'Ryze AI Arena Beta', code: 'AI-BETA', students: 150, progress: 92 },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', courseId: 'c1', title: 'Quadratic Equations Quiz', dueDate: '2025-11-25', status: 'graded', grade: 88 },
  { id: 'a2', courseId: 'c1', title: 'Non-linear Graphs Project', dueDate: '2025-12-01', status: 'submitted' },
  { id: 'a3', courseId: 'c2', title: 'Poetry Analysis Essay', dueDate: '2025-12-05', status: 'pending' },
];

export const BackendService = {
  // --- LMS Core ---
  async getCourses(): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Network latency
    return MOCK_COURSES;
  },

  async getAssignments(): Promise<Assignment[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_ASSIGNMENTS;
  },

  // --- Ingestion Worker Simulation ---
  async startIngestionJob(file: File): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random().toString(36).substring(7); // Job ID
  }
};
