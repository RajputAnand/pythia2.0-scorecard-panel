import type { UserRole } from "@/types/user";

interface DemoUser {
  initials: string;
  name: string;
  role: UserRole;
  token?: string;
  score?: number;
  jobTitle?: string;
  email: string;
  password: string;
  id: string;
  tenantId: string;
  storeIds: string[];
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: "manager@demo.com",
    password: "demo1234",
    initials: "JL",
    name: "Jamie L.",
    role: "manager",
    id: 'DEMO-MANAGER',
    tenantId: 'TENANT-DEMO',
    storeIds: ['STORE-001'],
  },
  {
    email: "owner@demo.com",
    password: "demo1234",
    initials: "SB",
    name: "Sam B.",
    role: "owner",
    id: 'DEMO-OWNER',
    tenantId: 'TENANT-DEMO',
    storeIds: ['STORE-001', 'STORE-002', 'STORE-003'],
  },
];

export function isDemoModeEnabled(): boolean {
  return process.env.DEMO_MODE === 'true'
}
