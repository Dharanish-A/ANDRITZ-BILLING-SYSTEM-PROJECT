import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, CheckSquare, Home, LogOut, Moon, Plane, ReceiptText, Sun, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";
import { AIAssistant } from "../components/AIAssistant";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/expenses/new", label: "New Expense", icon: Plane },
  { to: "/expenses", label: "Expenses", icon: ReceiptText },
  { to: "/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserCircle }
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    setDark((value) => {
      document.documentElement.classList.toggle("dark", !value);
      return !value;
    });
  }

  return (
    <div className="min-h-screen bg-andritz-light text-andritz-text dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
        <div className="flex h-20 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <div>
            <div className="text-2xl font-bold tracking-tight text-andritz-blue">ANDRITZ</div>
            <div className="text-xs font-semibold uppercase text-slate-500">Travel Expense & Billing</div>
          </div>
        </div>
        <nav className="space-y-1 px-4 py-6">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-andritz-blue text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.full_name ?? user?.email}</div>
            <div className="text-xs uppercase text-slate-500">{user?.role ?? "Enterprise user"}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="w-10 px-0" onClick={toggleTheme} title="Toggle dark mode">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
            >
              <LogOut size={16} />
              Sign out
            </Button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-1 px-1 py-2 text-[11px]", isActive ? "text-andritz-blue" : "text-slate-500")
            }
          >
            <item.icon size={18} />
            {item.label.split(" ")[0]}
          </NavLink>
        ))}
      </nav>

      <AIAssistant />
    </div>
  );
}
