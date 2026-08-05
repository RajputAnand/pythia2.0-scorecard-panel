import { User, UserRole } from "@/types/user";

interface DemoUser {
  initials: string;
  name: string;
  role: UserRole;
  token?: string;
  score?: number;
  jobTitle?: string;
  email: string;
  password: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: "employee@demo.com",
    password: "demo1234",
    initials: "MR",
    name: "Marcus R.",
    role: "employee",
    score: 84,
    jobTitle: "Cashier",
  },
  {
    email: "manager@demo.com",
    password: "demo1234",
    initials: "JL",
    name: "Jamie L.",
    role: "manager",
  },
  {
    email: "owner@demo.com",
    password: "demo1234",
    initials: "SB",
    name: "Sam B.",
    role: "owner",
  },
];
