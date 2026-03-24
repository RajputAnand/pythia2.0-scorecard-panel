import { User } from "@/types/user";

/**
 * Change `role` here to test different sidebar layouts and page access:
 *   'employee' — shows employee nav + employee pill
 *   'owner'    — shows owner nav + view toggle + store pill
 *   'manager'  — same nav as owner but labelled manager
 */
export const DEMO_USER: User = {
  initials: 'MR',
  name: 'Marcus R.',
  role: 'owner',
  score: 84,
  jobTitle: 'Cashier',
  storeName: 'Main St. Store',
  storeLoc: 'Boise, ID',
  nodesOnline: 2,
}
