export interface User {
  email: string;
  role: "admin" | "student";
  allowedCourses: string[];
  allowedTests?: string[];
}

export interface CourseSection {
  id: string;
  title: string;
  youtubeLink: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  sections: CourseSection[];
  createdAt?: any;
}

export interface TestQuestion {
  q: string;
  options: string[];
  answer: string;
}

export interface Test {
  id?: string;
  title: string;
  description?: string;
  questions: TestQuestion[];
  timeLimit: number;
  allowedUsers?: string[];
  createdAt?: any;
}

