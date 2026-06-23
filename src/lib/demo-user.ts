import { User } from "@/types/user"

interface DemoUser extends User {
  email: string
  password: string
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'employee@demo.com',
    password: 'demo1234',
    initials: 'MR',
    name: 'Marcus R.',
    role: 'employee',
    score: 84,
    jobTitle: 'Cashier',
  },
  {
    email: 'manager@demo.com',
    password: 'demo1234',
    initials: 'JL',
    name: 'Jamie L.',
    role: 'manager',
  },
  {
    email: 'owner@demo.com',
    password: 'demo1234',
    initials: 'SB',
    name: 'Sam B.',
    role: 'owner',
  },
]
