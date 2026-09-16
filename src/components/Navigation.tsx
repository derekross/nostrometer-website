import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GitHubIcon } from '@/components/GitHubIcon';
import { Wordmark } from '@/components/MeterMark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NAV_LINKS } from '@/lib/nav';
import { REPO_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'inline-flex h-9 items-center rounded-md px-3 text-[15px] font-semibold transition-colors',
    'hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
    isActive ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8' : 'text-muted-foreground',
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label="Nostrometer home"
        >
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {l.label}
            </NavLink>
          ))}
          <Button asChild variant="ghost" size="icon" className="ml-1">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Nostrometer on GitHub">
              <GitHubIcon />
            </a>
          </Button>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1 px-2">
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 text-lg font-semibold',
                        isActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-md px-3 py-2 text-lg font-semibold text-foreground hover:bg-muted"
                >
                  <GitHubIcon /> GitHub
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
