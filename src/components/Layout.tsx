import { Outlet } from 'react-router-dom';
import { CanonicalLink } from '@/components/CanonicalLink';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';

/** Header, page body and footer for every route. */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <CanonicalLink />
      <Navigation />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Shared page shell: eyebrow, headline, lede. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 md:pt-24 md:pb-12">
      {eyebrow && <p className="eyebrow-readout mb-4">{eyebrow}</p>}
      <h1 className="t-h1 max-w-[20ch]">{title}</h1>
      {lede && <p className="mt-6 max-w-[65ch] text-xl leading-8 text-muted-foreground">{lede}</p>}
      {children}
    </header>
  );
}

/** Standard content section with the site's vertical rhythm. */
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section className={['mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </section>
  );
}
