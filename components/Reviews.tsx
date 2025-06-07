'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useInView } from 'framer-motion';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

interface Review {
  title: string;
  body: string;
  id?: string;
  logo_url?: string;
}

const reviews: Array<Review> = [
  {
    title: 'National and Kapodistrian University of Athens',
    body: 'Greece’s oldest higher education institution, renowned for its faculties of law, medicine, and humanities. It offers a broad range of programs in the heart of the country’s historic capital.',
  },
  {
    title: 'Aristotle University of Thessaloniki',
    body: 'The largest university in Greece, notable for its diverse academic departments. Its campus is located in the vibrant city of Thessaloniki, offering a rich cultural environment.',
  },
  {
    title: 'University of Crete',
    body: 'With campuses in Rethymno and Heraklion, it focuses on research and innovation. Its coastal setting provides a scenic environment for both study and leisure.',
  },
  {
    title: 'University of Patras',
    body: 'Known for its strong emphasis on science and engineering programs. The campus overlooks the Gulf of Patras, blending academic pursuits with beautiful landscapes.',
  },
  {
    title: 'University of the Aegean',
    body: 'Spread across several Aegean islands, it emphasizes interdisciplinary studies and maritime research. Its unique multi-island structure offers a truly diverse academic experience.',
  },
  {
    title: 'University of Ioannina',
    body: 'Surrounded by a mountainous region, it excels in humanities, sciences, and medical studies. The tranquil setting near Lake Pamvotis creates a scenic backdrop for learning.',
  },
  {
    title: 'Athens University of Economics and Business',
    body: 'Specializing in economics, business administration, and IT. Located in central Athens, it fosters strong industry links and innovative research.',
  },
  {
    title: 'University of Piraeus',
    body: 'Originally established as a school for industrial studies, it now offers a range of business, finance, and maritime programs. Its proximity to Greece’s biggest port underpins its maritime focus.',
  },
  {
    title: 'Democritus University of Thrace',
    body: 'Spanning multiple campuses, it offers a variety of disciplines including law, engineering, and health sciences. It is a vital educational hub for Northeastern Greece.',
  },
  {
    title: 'Hellenic Open University',
    body: 'Greece’s only public university focused on distance learning. It provides flexible study programs for those balancing work, family, and education.',
  },
  {
    title: 'University of West Attica',
    body: 'Formed from the merger of two Technological Educational Institutes, it focuses on applied sciences and technology. With multiple campuses in the Attica region, it emphasizes innovation and hands-on learning.',
  },
];

function Review({
  title,
  body,
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'figure'>, keyof Review> & Review) {
  let animationDelay = useMemo(() => {
    let possibleAnimationDelays = ['0s', '0.1s', '0.2s', '0.3s', '0.4s', '0.5s'];
    return possibleAnimationDelays[Math.floor(Math.random() * possibleAnimationDelays.length)];
  }, []);

  return (
    <figure
      className={clsx(
        'animate-fade-in rounded-3xl bg-white p-6 opacity-0 shadow-md shadow-gray-900/5',
        className
      )}
      style={{ animationDelay }}
      {...props}
    >
      <blockquote className="text-gray-900">
        {props.logo_url && (
          <div className="mb-4 flex justify-center">
            <img
              src={props.logo_url}
              alt={`${title} logo`}
              className="h-12 w-12 rounded-full border border-gray-200 bg-white object-contain p-1"
            />
          </div>
        )}
        <p className="mt-4 text-lg font-semibold leading-6">
          {props.id ? (
            <a
              href={`/institutions/${props.id}`}
              className="transition-colors hover:text-green-600"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </p>
        <p className="mt-3 text-base leading-7">{body}</p>
      </blockquote>
    </figure>
  );
}

function splitArray<T>(array: Array<T>, numParts: number) {
  let result: Array<Array<T>> = [];
  for (let i = 0; i < array.length; i++) {
    let index = i % numParts;
    if (!result[index]) {
      result[index] = [];
    }
    result[index].push(array[i]);
  }
  return result;
}

function ReviewColumn({
  reviews,
  className,
  reviewClassName,
  msPerPixel = 0,
}: {
  reviews: Array<Review>;
  className?: string;
  reviewClassName?: (reviewIndex: number) => string;
  msPerPixel?: number;
}) {
  let columnRef = useRef<React.ElementRef<'div'>>(null);
  let [columnHeight, setColumnHeight] = useState(0);
  let duration = `${columnHeight * msPerPixel}ms`;

  useEffect(() => {
    if (!columnRef.current) {
      return;
    }

    let resizeObserver = new window.ResizeObserver(() => {
      setColumnHeight(columnRef.current?.offsetHeight ?? 0);
    });

    resizeObserver.observe(columnRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={columnRef}
      className={clsx('animate-marquee space-y-8 py-4', className)}
      style={{ '--marquee-duration': duration } as React.CSSProperties}
    >
      {reviews.concat(reviews).map((review, reviewIndex) => (
        <Review
          key={reviewIndex}
          aria-hidden={reviewIndex >= reviews.length}
          className={reviewClassName?.(reviewIndex % reviews.length)}
          {...review}
        />
      ))}
    </div>
  );
}

function ReviewGrid({ reviews: reviewItems = reviews }: { reviews?: Array<Review> }) {
  let containerRef = useRef<React.ElementRef<'div'>>(null);
  let isInView = useInView(containerRef, { once: true, amount: 0.4 });
  let columns = splitArray(reviewItems, 3);
  let column1 = columns[0] || [];
  let column2 = columns[1] || [];
  let column3 = columns[2] ? splitArray(columns[2], 2) : [[], []];

  return (
    <div
      ref={containerRef}
      className="relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
    >
      {isInView && (
        <>
          <ReviewColumn
            reviews={[...column1, ...column3.flat(), ...column2]}
            reviewClassName={(reviewIndex) =>
              clsx(
                reviewIndex >= column1.length + column3[0].length && 'md:hidden',
                reviewIndex >= column1.length && 'lg:hidden'
              )
            }
            msPerPixel={10}
          />
          <ReviewColumn
            reviews={[...column2, ...column3[1]]}
            className="hidden md:block"
            reviewClassName={(reviewIndex) => (reviewIndex >= column2.length ? 'lg:hidden' : '')}
            msPerPixel={15}
          />
          <ReviewColumn reviews={column3.flat()} className="hidden lg:block" msPerPixel={10} />
        </>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-50" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50" />
    </div>
  );
}

export function InstitutionsList({ institutions = [] }: { institutions?: any[] }) {
  // Modify the reviews array if institutions are provided
  const reviewsToDisplay =
    institutions.length > 0
      ? institutions.map((institution) => ({
          title: institution.name || 'Unknown Institution',
          body:
            institution.description ||
            'Educational institution providing various learning opportunities.',
          id: String(institution.id),
          logo_url: institution.logo_url,
        }))
      : reviews;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="pb-16 pt-20 sm:pb-24 sm:pt-32">
      <Container>
        <h2
          id="reviews-title"
          className="text-3xl font-medium tracking-tight text-gray-900 sm:text-center"
        >
          Learning Opportunity Providers
        </h2>
        {/*<p className="mt-2 text-lg text-gray-600 sm:text-center">*/}
        {/*  Lorem Ipsum*/}
        {/*</p>*/}
        <ReviewGrid reviews={reviewsToDisplay} />
        <div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Button href="/institutions" color="green">
              <span>See all institutions</span>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
