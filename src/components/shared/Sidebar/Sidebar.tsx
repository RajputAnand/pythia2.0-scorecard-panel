"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import type { ReactNode } from "react";
import type { User, UserRole } from "@/types/user";
import { useUserStore } from "@/store/userStore";
import { useAdminConfigStore } from "@/store/adminConfigStore";
import { isMultiTenantEnabled } from "@/store/tenantStore";
import { PAGE_ID_BY_HREF } from "@/lib/admin-config-data";

type NavItem = {
  label: string;
  href: string;
  badge?: number | null;
  icon: ReactNode;
  mirrorsHref?: string;
};
type NavSection = { section: string; items: NavItem[] };

type SuperAdminView = "admin" | "manager" | "employee" | "owner";

const EMPLOYEE_NAV: NavSection[] = [
  {
    section: "My Dashboard",
    items: [
      {
        label: "Overview",
        href: "/dashboard/overview",
        icon: (
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
];

function getOwnerNav(mtEnabled: boolean): NavSection[] {
  if (mtEnabled) {
    return [
      {
        section: "Owner Tools",
        items: [
          {
            label: "Stores",
            href: "/owner/stores",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
          {
            label: "Managers",
            href: "/owner/managers",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              </svg>
            ),
          },
        ],
      },
    ];
  }

  return [
    {
      section: "Owner Tools",
      items: [
        {
          label: "Stores",
          href: "/owner/stores",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ),
        },
        {
          label: "Managers",
          href: "/owner/managers",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
            </svg>
          ),
        },
        {
          label: "ROI Attribution",
          href: "/owner/roi-attribution",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          ),
        },
        {
          label: "Benchmarking",
          href: "/owner/benchmarking",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
            </svg>
          ),
        },
      ],
    },
  ];
}

function getManagerNav(mtEnabled: boolean): NavSection[] {
  if (mtEnabled) {
    return [
      {
        section: "Manager Tools",
        items: [
          {
            label: "Employees",
            href: "/manager/employees",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              </svg>
            ),
          },
        ],
      },
    ];
  }

  return [
    {
      section: "Navigate",
      items: [
        {
          label: "Dashboard",
          href: "/manager/dashboard",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          ),
        },
        {
          label: "Employees",
          href: "/manager/employees",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
            </svg>
          ),
        },
      ],
    },
    {
      section: "Manager Tools",
      items: [
        {
          label: "Coach Tracker",
          href: "/manager/coaching-tracker",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          ),
        },
        {
          label: "Staffing",
          href: "/manager/staffing-intelligence",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ),
        },
        {
          label: "Unknown Identity",
          href: "/manager/unknown-identities",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        },
        {
          label: "Video Identities",
          href: "/manager/video-identities",
          icon: (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="5" width="15" height="14" rx="2" />
              <path d="M17 9l5-3v12l-5-3" />
            </svg>
          ),
        },
      ],
    },
  ];
}

function getSuperAdminNavByView(
  mtEnabled: boolean,
): Record<SuperAdminView, NavSection[]> {
  if (mtEnabled) {
    return {
      admin: [
        {
          section: "Super Admin",
          items: [
            {
              label: "Tenants",
              href: "/super-admin/tenants",
              icon: (
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
            {
              label: "Onboarding",
              href: "/super-admin/onboarding",
              icon: (
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ),
            },
            {
              label: "Owners",
              href: "/super-admin/owners",
              icon: (
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                </svg>
              ),
            },
          ],
        },
      ],
      manager: [
        {
          section: "Manager View",
          items: [
            {
              label: "Employees",
              href: "/super-admin/manager/employees",
              icon: (
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                </svg>
              ),
            },
          ],
        },
      ],
      employee: [
        {
          section: "Employee View",
          items: [
            {
              label: "Overview",
              href: "/super-admin/employee/overview",
              mirrorsHref: "/dashboard/overview",
              icon: (
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ),
            },
          ],
        },
      ],
      owner: [
        {
          section: "Owner View",
          items: [
            {
              label: "Stores",
              href: "/super-admin/owner/stores",
              mirrorsHref: "/owner/stores",
              icon: (
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
            },
            {
              label: "Managers",
              href: "/super-admin/owner/managers",
              mirrorsHref: "/owner/managers",
              icon: (
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                </svg>
              ),
            },
          ],
        },
      ],
    };
  }

  return {
    admin: [
      {
        section: "Super Admin",
        items: [
          {
            label: "KPI Visibility",
            href: "/super-admin/kpi-visibility",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ),
          },
          {
            label: "Device Health",
            href: "/super-admin/device-health",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M8 6h8M8 10h4" strokeLinecap="round" />
                <circle cx="16" cy="16" r="2" />
              </svg>
            ),
          },
          {
            label: "Post-Demo Recaps",
            href: "/super-admin/post-demo-recaps",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
            ),
          },
        ],
      },
    ],
    manager: [
      {
        section: "Manager View",
        items: [
          {
            label: "Dashboard",
            href: "/super-admin/manager/dashboard",
            mirrorsHref: "/manager/dashboard",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            ),
          },
          {
            label: "Employees",
            href: "/super-admin/manager/employees",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              </svg>
            ),
          },
          {
            label: "Coach Tracker",
            href: "/super-admin/manager/coaching-tracker",
            mirrorsHref: "/manager/coaching-tracker",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ),
          },
          {
            label: "Staffing",
            href: "/super-admin/manager/staffing-intelligence",
            mirrorsHref: "/manager/staffing-intelligence",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
          },
          {
            label: "Unknown Identity",
            href: "/super-admin/manager/unknown-identities",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ),
          },
          {
            label: "Video Identities",
            href: "/super-admin/manager/video-identities",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="5" width="15" height="14" rx="2" />
                <path d="M17 9l5-3v12l-5-3" />
              </svg>
            ),
          },
        ],
      },
    ],
    employee: [
      {
        section: "Employee View",
        items: [
          {
            label: "Overview",
            href: "/super-admin/employee/overview",
            mirrorsHref: "/dashboard/overview",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            ),
          },
        ],
      },
    ],
    owner: [
      {
        section: "Owner View",
        items: [
          {
            label: "Stores",
            href: "/super-admin/owner/stores",
            mirrorsHref: "/owner/stores",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
          {
            label: "Managers",
            href: "/super-admin/owner/managers",
            mirrorsHref: "/owner/managers",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              </svg>
            ),
          },
          {
            label: "ROI Attribution",
            href: "/super-admin/owner/roi-attribution",
            mirrorsHref: "/owner/roi-attribution",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
          },
          {
            label: "Benchmarking",
            href: "/super-admin/owner/benchmarking",
            mirrorsHref: "/owner/benchmarking",
            icon: (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
              </svg>
            ),
          },
        ],
      },
    ],
  };
}

function getViewDefaultRoutes(): Record<UserRole, string> {
  const mt = isMultiTenantEnabled();
  return {
    owner: mt ? "/owner/stores" : "/owner/managers",
    manager: mt ? "/manager/employees" : "/manager/coaching-tracker",
    employee: "/dashboard/overview",
    superadmin: mt ? "/super-admin/tenants" : "/super-admin/kpi-visibility",
  };
}

function getSuperAdminViewDefaultRoutes(): Record<SuperAdminView, string> {
  const mt = isMultiTenantEnabled();
  return {
    admin: mt ? "/super-admin/tenants" : "/super-admin/kpi-visibility",
    manager: mt
      ? "/super-admin/manager/employees"
      : "/super-admin/manager/dashboard",
    employee: "/super-admin/employee/overview",
    owner: mt ? "/super-admin/owner/stores" : "/super-admin/owner/managers",
  };
}

const SUPERADMIN_VIEW_OPTIONS: {
  id: SuperAdminView;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: "admin",
    label: "Admin",
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" />
      </svg>
    ),
  },
  {
    id: "owner",
    label: "Owner View",
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    id: "manager",
    label: "Manager View",
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "employee",
    label: "Employee View",
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
      </svg>
    ),
  },
];

function superAdminViewFromPath(pathname: string): SuperAdminView {
  if (pathname.startsWith("/super-admin/manager")) return "manager";
  if (pathname.startsWith("/super-admin/employee")) return "employee";
  if (pathname.startsWith("/super-admin/owner")) return "owner";
  return "admin";
}

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const mtEnabled = isMultiTenantEnabled();

  const [activeView, setActiveView] = useState<UserRole>(() => {
    if (user.role !== "owner") return user.role;
    return pathname.startsWith("/manager") ? "manager" : "owner";
  });
  const [superAdminView, setSuperAdminView] = useState<SuperAdminView>(() =>
    user.role === "superadmin" ? superAdminViewFromPath(pathname) : "admin",
  );
  const [isPending, startTransition] = useTransition();

  const currentScore = useUserStore((s) => s.currentScore);
  const storePoints = useUserStore((s) => s.points);
  const setPoints = useUserStore((s) => s.setPoints);
  const currentStore = useUserStore((s) => s.currentStore);
  const points = storePoints ?? user.points ?? 0;

  const pageVisibility = useAdminConfigStore((s) => s.visibility);
  const fetchPageVisibility = useAdminConfigStore((s) => s.fetchVisibility);

  useEffect(() => {
    if (user.points != null) setPoints(user.points);
  }, [user.points, setPoints]);

  useEffect(() => {
    if (!user.token || mtEnabled) return;
    fetchPageVisibility(user.token);
  }, [fetchPageVisibility, user.token, mtEnabled]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (user.role === "superadmin")
      setSuperAdminView(superAdminViewFromPath(pathname));
  }

  const roleSections =
    user.role === "superadmin"
      ? getSuperAdminNavByView(mtEnabled)[superAdminView]
      : user.role === "owner"
        ? activeView === "manager"
          ? getManagerNav(mtEnabled)
          : getOwnerNav(mtEnabled)
        : user.role === "manager"
          ? getManagerNav(mtEnabled)
          : EMPLOYEE_NAV;

  const navSections = roleSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const pageId = PAGE_ID_BY_HREF[item.mirrorsHref ?? item.href];
        return !pageId || (pageVisibility[pageId] ?? true);
      }),
    }))
    .filter((section) => section.items.length > 0);

  function handleViewToggle(view: UserRole) {
    if (user.role !== "owner") return;
    setActiveView(view);
    const routes = getViewDefaultRoutes();
    startTransition(() => {
      router.push(routes[view]);
    });
  }

  function handleSuperAdminViewToggle(view: SuperAdminView) {
    if (user.role === "superadmin" || view === superAdminView) {
      setSuperAdminView(view);
      const routes = getSuperAdminViewDefaultRoutes();
      startTransition(() => {
        router.push(routes[view]);
      });
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col bg-surface border-r border-border w-[210px]">
      {/* Logo */}
      <div className="flex items-center gap-[10px] px-5 border-b border-border pt-[22px] pb-[20px]">
        <div className="flex items-center justify-center shrink-0 rounded-[9px] bg-primary w-8 h-8">
          <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path
              stroke="white"
              strokeWidth="1.5"
              d="M12 2v3M12 19v3M2 12h3M19 12h3"
              fill="none"
            />
          </svg>
        </div>
        <div>
          <div className="text-[13.5px] font-semibold">Pythia</div>
          <div className="text-[10px] text-muted mt-px">
            {mtEnabled ? user.tenantName || "Tenant Workspace" : "Scorecard"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.section}>
            <div className="block px-2 uppercase text-muted font-medium tracking-[.1em] text-[9.5px] mt-[14px] mb-[5px]">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[9px] px-2 py-[9px] rounded-lg text-[13px] cursor-pointer transition-all duration-150 no-underline hover:bg-surface-alt hover:text-primary ${
                    isActive
                      ? "bg-accent-light text-accent font-medium"
                      : "text-secondary"
                  }`}
                >
                  <span
                    className={`shrink-0 w-[15px] h-[15px] ${isActive ? "opacity-100" : "opacity-75"}`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto font-mono font-bold text-white bg-danger rounded-[10px] text-[9.5px] px-[6px] py-px">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section — role-specific widgets */}
      {user.role === "superadmin" && (
        <div className="mx-3 pt-4 border-t border-border mb-3">
          <div className="text-muted uppercase tracking-[.08em] text-[10px] mb-2 px-[2px]">
            Current View
          </div>
          {SUPERADMIN_VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`${styles.toggleBtn} ${superAdminView === option.id ? styles.toggleBtnActive : ""} ${
                isPending ? "opacity-60" : ""
              }`}
              onClick={() => handleSuperAdminViewToggle(option.id)}
              disabled={isPending}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}

      {user.role === "owner" && (
        <div className="mx-3 pt-4 border-t border-border mb-3">
          <div className="text-muted uppercase tracking-[.08em] text-[10px] mb-2 px-[2px]">
            Current View
          </div>
          <button
            className={`${styles.toggleBtn} ${activeView === "owner" ? styles.toggleBtnActive : ""} ${
              isPending ? "opacity-60" : ""
            }`}
            onClick={() => handleViewToggle("owner")}
            disabled={isPending}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Owner View
          </button>
          <button
            className={`${styles.toggleBtn} ${activeView === "manager" ? styles.toggleBtnActive : ""} ${
              isPending ? "opacity-60" : ""
            }`}
            onClick={() => handleViewToggle("manager")}
            disabled={isPending}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
            </svg>
            Manager View
          </button>
        </div>
      )}

      {/* Bottom widget — employee scorecard pill */}
      {user.role === "employee" && (
        <div
          className="flex items-center gap-[10px] mx-3 mb-4 rounded-[10px] border px-[14px] py-[12px]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-accent-light), #D0EAD8)",
            borderColor: "#B8D9C6",
          }}
        >
          <div className="flex items-center justify-center shrink-0 rounded-full bg-accent text-white font-bold w-9 h-9 text-[12px]">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold text-accent truncate">
              {user.name}
            </div>
            <div className="text-accent-mid text-[10.5px] truncate">
              {user.jobTitle || "Employee"}
              {currentStore && ` · ${currentStore.name}`}
            </div>
          </div>
          {(currentScore ?? user.score) != null && (
            <div className="ml-auto text-right shrink-0">
              <div className="font-mono font-bold text-accent text-[18px]">
                {currentScore ?? user.score}
              </div>
              <div
                className="font-mono font-bold text-[11px]"
                style={{ color: "#F5C842" }}
              >
                {points.toLocaleString("en-US")} pts
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
