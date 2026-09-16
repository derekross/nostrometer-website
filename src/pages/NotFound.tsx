import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MeterMark } from '@/components/MeterMark';

const NotFound = () => {
  useSeoMeta({
    title: 'Not found · Nostrometer',
    description: 'The page you are looking for could not be found.',
  });

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-4 py-24 sm:px-6 md:py-32">
      <MeterMark size={48} className="text-muted-foreground" />
      <p className="eyebrow mt-8">404</p>
      <h1 className="t-h1 mt-3">Nothing on this dial.</h1>
      <p className="mt-6 max-w-[65ch] text-xl leading-8 text-muted-foreground">
        The page does not exist, or the identifier is not one this site knows how to read.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/results">Results</Link>
        </Button>
      </div>
    </section>
  );
};

export default NotFound;
