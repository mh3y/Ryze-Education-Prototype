import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { testimonials } from '../data/testimonials';
import { Testimonial } from '../types';

type StoryMetadata = {
  categoryPill: string;
  programTitle: string;
  trackLabel: string;
  verifiedLabel: string;
};

type TestimonialColumn =
  | { id: string; variant: 'featured'; items: [Testimonial] }
  | { id: string; variant: 'stack'; items: Testimonial[] };

const cleanText = (value: string) =>
  value
    .replace(/Ã¢â‚¬â€|â€”/g, '-')
    .replace(/Ã¢â‚¬â„¢|â€™/g, "'")
    .replace(/Ã¢â‚¬Å“|Ã¢â‚¬Â|â€œ|â€/g, '"')
    .replace(/Ã‚Â·|Â·/g, '/')
    .replace(/Ã‚|Â/g, '');

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');


const parseYear = (grade: string) => {
  const match = grade.match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const getStoryMetadata = (testimonial: Testimonial, reviewerTypeText: string): StoryMetadata => {
  const category = (testimonial.category || '').toLowerCase();
  const year = parseYear(testimonial.studentGrade);
  const achievementAndMessage = `${testimonial.achievement} ${testimonial.message}`.toLowerCase();
  const isHsc = category.includes('hsc') || testimonial.studentGrade === 'Year 12';
  const isSelective = category.includes('selective') || category.includes('oc');
  const isPrimary =
    category.includes('primary') || category.includes('naplan') || (year !== null && year <= 6);

  let categoryPill = 'Academic Success';
  if (isHsc) categoryPill = 'HSC Success';
  else if (isSelective) categoryPill = category.includes('oc') ? 'OC Success' : 'Selective Success';
  else if (isPrimary) categoryPill = 'Foundations';

  let programTitle = 'Student & Parent Story';
  if (isHsc) {
    if (achievementAndMessage.includes('extension 2') || achievementAndMessage.includes('4u')) {
      programTitle = 'Extension 2 Maths';
    } else if (
      achievementAndMessage.includes('advanced') ||
      achievementAndMessage.includes('2u') ||
      achievementAndMessage.includes('ext 1') ||
      achievementAndMessage.includes('3u')
    ) {
      programTitle = 'HSC Advanced Maths';
    } else {
      programTitle = 'HSC Maths';
    }
  } else if (isSelective) {
    programTitle = category.includes('oc') ? 'OC Preparation' : 'Selective Preparation';
  } else if (isPrimary) {
    programTitle = 'Primary Maths Foundations';
  } else if (category.includes('competition')) {
    programTitle = 'Competition Maths';
  }

  const reviewer = reviewerTypeText.toLowerCase();
  const isParent = reviewer.includes('parent');
  const trackLabel = isParent ? 'Parent Story' : 'Student Story';
  const verifiedLabel = isParent ? 'Verified Parent' : 'Verified Student';

  return {
    categoryPill,
    programTitle,
    trackLabel,
    verifiedLabel,
  };
};

const categoryPriority: Record<string, number> = {
  HSC: 0,
  Competitions: 1,
  NAPLAN: 2,
  Selective: 3,
  OC: 4,
  Primary: 5,
};

const preferredOrderWithinHsc = [
  'hsc-2',
  'hsc-1',
  'hsc-3',
  'hsc-9',
  'hsc-7',
  'hsc-11',
  'hsc-4',
  'hsc-10',
  'hsc-6',
  'hsc-5',
  'hsc-8',
];

const getReviewBucket = (testimonial: Testimonial) => {
  const year = parseYear(testimonial.studentGrade) ?? 0;
  const isHsc = testimonial.category.toLowerCase().includes('hsc') || year >= 11;

  if (isHsc) return 0;
  if (year >= 7 && year <= 10) return 1;
  return 2;
};

const orderTestimonials = (items: Testimonial[]) =>
  items.slice().sort((a, b) => {
    const bucketDiff = getReviewBucket(a) - getReviewBucket(b);
    if (bucketDiff !== 0) return bucketDiff;

    const yearA = parseYear(a.studentGrade) ?? 0;
    const yearB = parseYear(b.studentGrade) ?? 0;
    if (yearA !== yearB) return yearB - yearA;

    if (getReviewBucket(a) === 0) {
      const hscRankA = preferredOrderWithinHsc.indexOf(a.id);
      const hscRankB = preferredOrderWithinHsc.indexOf(b.id);
      if (hscRankA !== -1 || hscRankB !== -1) {
        if (hscRankA === -1) return 1;
        if (hscRankB === -1) return -1;
        if (hscRankA !== hscRankB) return hscRankA - hscRankB;
      }
    }

    const categoryDiff =
      (categoryPriority[a.category] ?? 99) - (categoryPriority[b.category] ?? 99);
    if (categoryDiff !== 0) return categoryDiff;

    return a.id.localeCompare(b.id);
  });

const buildColumns = (items: Testimonial[]): TestimonialColumn[] => {
  if (!items.length) return [];

  const [lead, ...rest] = items;
  const columns: TestimonialColumn[] = [{ id: `${lead.id}-featured`, variant: 'featured', items: [lead] }];

  for (let index = 0; index < rest.length; index += 2) {
    columns.push({
      id: `stack-${index}`,
      variant: 'stack',
      items: rest.slice(index, index + 2),
    });
  }

  return columns;
};

const accentMap: Record<string, string> = {
  orange: 'border-[rgba(184,132,30,0.24)] bg-[rgba(184,132,30,0.08)] text-[var(--accent)]',
  green: 'border-[rgba(90,120,95,0.22)] bg-[rgba(90,120,95,0.08)] text-[#55735b]',
  blue: 'border-[rgba(88,117,173,0.22)] bg-[rgba(88,117,173,0.08)] text-[#4f6797]',
  purple: 'border-[rgba(128,96,163,0.22)] bg-[rgba(128,96,163,0.08)] text-[#72578f]',
  yellow: 'border-[rgba(184,132,30,0.24)] bg-[rgba(184,132,30,0.08)] text-[var(--accent)]',
};

const ReviewCard = memo(function ReviewCard({
  testimonial,
  featured = false,
}: {
  testimonial: Testimonial;
  featured?: boolean;
}) {
  const { t } = useLanguage();
  const reviewerName = cleanText(t(testimonial.reviewerName));
  const reviewerType = cleanText(t(testimonial.reviewerType));
  const reviewerGrade = cleanText(t(testimonial.studentGrade));
  const achievement = cleanText(t(testimonial.achievement));
  const message = cleanText(t(testimonial.message));
  const meta = getStoryMetadata(testimonial, reviewerType);
  const accentClass = accentMap[testimonial.accent] || accentMap.orange;

  return (
    <article
      className={`flex h-full flex-col rounded-[1.6rem] border bg-[rgba(255,255,255,0.92)] shadow-[0_22px_52px_-40px_rgba(17,21,29,0.18)] ${
        featured
          ? 'border-[rgba(184,132,30,0.18)] p-5 sm:p-6'
          : 'border-[rgba(23,29,40,0.08)] p-4.5 sm:p-5'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] ryze-text-secondary">
            {meta.trackLabel}
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1 text-[var(--accent)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={12} className="fill-current" />
            ))}
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] ${accentClass}`}>
          {meta.categoryPill}
        </span>
      </div>

      <div className="mt-5 flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ryze-bg-surface-dark ryze-text-inverse">
          <Quote size={16} />
        </div>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {meta.verifiedLabel}
          </p>
          <h3
            className={`mt-3 font-display font-bold leading-[0.95] ryze-text-primary ${
              featured ? 'max-w-[11ch] text-[2.25rem] sm:text-[2.45rem]' : 'max-w-[13ch] text-[1.6rem] sm:text-[1.72rem]'
            }`}
          >
            {achievement}
          </h3>
          <p className={`mt-2.5 font-medium ryze-text-primary ${featured ? 'text-[1rem]' : 'text-[0.92rem]'}`}>
            {meta.programTitle}
          </p>
        </div>
      </div>

      <blockquote
        className={`mt-5 ryze-text-secondary ${featured ? 'max-w-[34ch] text-[0.98rem] leading-relaxed' : 'line-clamp-5 text-[0.92rem] leading-relaxed'}`}
      >
        &ldquo;{message}&rdquo;
      </blockquote>

      <div className="mt-auto pt-5">
        <div className="flex items-center gap-3 border-t border-[rgba(23,29,40,0.08)] pt-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full ryze-bg-surface-dark text-[0.68rem] font-bold uppercase tracking-[0.08em] ryze-text-inverse">
            {getInitials(reviewerName)}
          </span>
          <div>
            <p className="text-[0.92rem] font-semibold ryze-text-primary">{reviewerName}</p>
            <p className="text-[0.84rem] ryze-text-secondary">
              {reviewerType} / {reviewerGrade}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});

const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const railRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const metricsFrameRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [railState, setRailState] = useState({
    canScroll: false,
    isAtStart: true,
    isAtEnd: true,
  });

  const orderedTestimonials = useMemo(() => orderTestimonials(testimonials), []);
  const columns = useMemo(() => buildColumns(orderedTestimonials), [orderedTestimonials]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateMetrics = () => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      const nextState = {
        canScroll: maxScroll > 8,
        isAtStart: rail.scrollLeft <= 8,
        isAtEnd: maxScroll <= 8 || rail.scrollLeft >= maxScroll - 8,
      };

      setRailState((currentState) =>
        currentState.canScroll === nextState.canScroll &&
        currentState.isAtStart === nextState.isAtStart &&
        currentState.isAtEnd === nextState.isAtEnd
          ? currentState
          : nextState,
      );
    };

    const scheduleMetricsUpdate = () => {
      if (metricsFrameRef.current !== null) return;
      metricsFrameRef.current = window.requestAnimationFrame(() => {
        metricsFrameRef.current = null;
        updateMetrics();
      });
    };

    updateMetrics();
    rail.addEventListener('scroll', scheduleMetricsUpdate, { passive: true });

    resizeObserverRef.current = new ResizeObserver(scheduleMetricsUpdate);
    resizeObserverRef.current.observe(rail);
    if (rail.firstElementChild) resizeObserverRef.current.observe(rail.firstElementChild);

    return () => {
      rail.removeEventListener('scroll', scheduleMetricsUpdate);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      if (metricsFrameRef.current !== null) {
        window.cancelAnimationFrame(metricsFrameRef.current);
        metricsFrameRef.current = null;
      }
    };
  }, [columns.length]);

  const scrollRailBy = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.72, 320),
      behavior: 'smooth',
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!railRef.current) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: railRef.current.scrollLeft,
    };

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const dragState = dragStateRef.current;
    if (!rail || !dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    rail.scrollLeft = dragState.scrollLeft - deltaX;
  };

  const endDrag = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setIsDragging(false);
  };

  return (
    <section className="overflow-hidden ryze-bg-primary py-16 ryze-text-primary sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">Testimonials</div>
          <h2 className="mt-4 text-4xl font-display font-bold leading-[0.96] ryze-text-primary sm:text-5xl">
            Results that speak volumes.
          </h2>
          <p className="mt-2 text-[1.8rem] font-display text-[rgba(23,29,40,0.52)] sm:text-[2.2rem]">
            Read success stories.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-[0.98rem] leading-relaxed ryze-text-secondary">
            Student and parent stories from across HSC, selective, OC, primary, and foundational maths support.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-[1.45rem] border border-[rgba(23,29,40,0.08)] bg-[rgba(255,255,255,0.58)] px-4 py-4 shadow-[0_18px_40px_-34px_rgba(17,21,29,0.18)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Verified Stories
            </span>
            <span className="h-1 w-1 rounded-full bg-[rgba(23,29,40,0.18)]" />
            <span className="text-[0.92rem] font-medium ryze-text-secondary">
              {orderedTestimonials.length} student and parent reviews
            </span>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(184,132,30,0.18)] bg-[rgba(248,243,234,0.72)] px-4 py-2.5 shadow-[0_12px_28px_-18px_rgba(17,21,29,0.14)]">
            <div className="flex items-center gap-0.5 text-[var(--accent)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="fill-current" />
              ))}
            </div>
            <span className="text-[0.88rem] font-bold tracking-[-0.01em] ryze-text-primary">5.0</span>
            <span className="hidden h-4 w-px bg-[rgba(23,29,40,0.12)] sm:block" />
            <span className="hidden text-[0.82rem] font-medium ryze-text-secondary sm:block">from 250+ families</span>
          </div>
        </div>

        <div className="mt-8">
          <div className="relative rounded-[1.7rem] border border-[rgba(23,29,40,0.08)] bg-[rgba(255,255,255,0.34)] p-4 shadow-[0_20px_46px_-40px_rgba(17,21,29,0.18)] sm:p-5">
            {railState.canScroll && (
              <>
                <button
                  type="button"
                  aria-label="Scroll testimonials left"
                  onClick={() => scrollRailBy(-1)}
                  disabled={railState.isAtStart}
                  className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(23,29,40,0.08)] bg-[rgba(255,255,255,0.96)] ryze-text-primary shadow-[0_16px_34px_-22px_rgba(17,21,29,0.24)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 lg:inline-flex"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Scroll testimonials right"
                  onClick={() => scrollRailBy(1)}
                  disabled={railState.isAtEnd}
                  className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(23,29,40,0.08)] bg-[rgba(255,255,255,0.96)] ryze-text-primary shadow-[0_16px_34px_-22px_rgba(17,21,29,0.24)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 lg:inline-flex"
                >
                  <ArrowRight size={16} />
                </button>
              </>
            )}

            <div
              ref={railRef}
              tabIndex={0}
              aria-label="Scroll through student and parent testimonials"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={`ryze-review-rail snap-x snap-proximity overflow-x-auto pb-4 [touch-action:pan-y] ${
                isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
              }`}
            >
              <div className="flex min-w-max items-stretch gap-4 pr-4">
                {columns.map((column, columnIndex) =>
                  column.variant === 'featured' ? (
                    <div
                      key={column.id}
                      className="ryze-review-column ryze-review-column-featured w-[min(27rem,86vw)] shrink-0 snap-start"
                    >
                      <ReviewCard testimonial={column.items[0]} featured />
                    </div>
                  ) : (
                    <div
                      key={column.id}
                      className="ryze-review-column grid w-[min(18.5rem,80vw)] shrink-0 snap-start gap-4"
                    >
                      {column.items.map((testimonial) => (
                        <ReviewCard key={testimonial.id} testimonial={testimonial} />
                      ))}
                    </div>
                  ),
                )}
              </div>
            </div>

            {railState.canScroll && (
              <div className="mt-4 flex items-center justify-center gap-3 lg:hidden">
                <button
                  type="button"
                  aria-label="Scroll testimonials left"
                  onClick={() => scrollRailBy(-1)}
                  disabled={railState.isAtStart}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(23,29,40,0.08)] bg-[rgba(255,255,255,0.96)] ryze-text-primary shadow-[0_16px_34px_-22px_rgba(17,21,29,0.22)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Scroll testimonials right"
                  onClick={() => scrollRailBy(1)}
                  disabled={railState.isAtEnd}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(23,29,40,0.08)] bg-[rgba(255,255,255,0.96)] ryze-text-primary shadow-[0_16px_34px_-22px_rgba(17,21,29,0.22)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 text-[0.92rem] ryze-text-secondary sm:flex-row sm:items-center sm:justify-between">
            <p>
              {railState.canScroll
                ? 'Use the arrows, drag with the mouse, or swipe sideways to review every testimonial.'
                : 'All available review cards are currently visible.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
