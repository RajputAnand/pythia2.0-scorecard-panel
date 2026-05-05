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
    storeName: 'Main St. Store',
    storeLoc: 'Boise, ID',
    nodesOnline: 2,
  },
  {
    email: 'manager@demo.com',
    password: 'demo1234',
    initials: 'JL',
    name: 'Jamie L.',
    role: 'manager',
    storeName: 'Main St. Store',
    storeLoc: 'Boise, ID',
    nodesOnline: 3,
  },
  {
    email: 'owner@demo.com',
    password: 'demo1234',
    initials: 'SB',
    name: 'Sam B.',
    role: 'owner',
    storeName: 'Main St. Store',
    storeLoc: 'Boise, ID',
    nodesOnline: 5,
    stores: [
      { id: 'store-1', name: 'Main St. Store',    location: 'Boise, ID',     nodesOnline: 5 },
      { id: 'store-2', name: 'Riverfront Plaza',  location: 'Portland, OR',  nodesOnline: 3 },
      { id: 'store-3', name: 'Eastside Market',   location: 'Seattle, WA',   nodesOnline: 4 },
      { id: 'store-4', name: 'Harbor View',       location: 'San Diego, CA', nodesOnline: 2 },
    ],
  },
]
