/**
 * HeroBannerSlider.tsx — Auto-playing image carousel
 *
 * Uses the real gov1-gov6 government images available in src/assets/.
 * 3 slides highlighting key Maharashtra state initiatives.
 * Features: auto-play (5 s), pause-on-hover, prev/next controls, dot indicators,
 * smooth CSS cross-fade transitions.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

// Real assets from src/assets/
import gov1 from '../../assets/gov1.jpeg';
import gov2 from '../../assets/gov2.png';
import gov3 from '../../assets/gov3.jpeg';

// ── Slide data types ─────────────────────────────────────────────────────────
export interface SlideData {
  id: number;
  tag: string;
  title: string;
  description: string;
  ctaLink: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
}

// ── Slide definitions (using real gov assets) ────────────────────────────────
const SLIDES: SlideData[] = [
  {
    id: 1,
    tag: 'Pilot Programme',
    title: 'State Innovation Pilots',
    description:
      "Maharashtra's sandbox-to-field framework fast-tracks proven startup solutions into live municipal deployments — from smart water metering to AI-based road distress mapping.",
    ctaLink: '#lifecycle',
    ctaLabel: 'Explore Pilot Framework',
    imageSrc: gov1,
    imageAlt: 'State Innovation Pilots — Government initiative launch in Maharashtra',
  },
  {
    id: 2,
    tag: 'Grants & Funding',
    title: 'Grand Challenges & Grants',
    description:
      'Pilot grants of Rs.10L-Rs.50L are disbursed to shortlisted startups. Structured milestone-linked financing ensures accountability and evidence-driven scale decisions.',
    ctaLink: '#problems',
    ctaLabel: 'View Open Challenges',
    imageSrc: gov2,
    imageAlt: 'Grand Challenges and Grants — Government funding ceremony',
  },
  {
    id: 3,
    tag: 'Hackathon Showcase',
    title: 'Department-Startup Hackathon Winners',
    description:
      'Annual 48-hour hackathons co-hosted with government departments surface breakthrough ideas. Top teams receive fast-track evaluation slots and seed-grant access.',
    ctaLink: '#problems',
    ctaLabel: 'Register Your Startup',
    imageSrc: gov3,
    imageAlt: 'Department-Startup Hackathon showcase winners',
  },
];

// ── Component ────────────────────────────────────────────────────────────────
interface HeroBannerSliderProps {
  autoPlayInterval?: number;
  id?: string;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  autoPlayInterval = 5000,
  id,
}) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent((index + SLIDES.length) % SLIDES.length);
      setFading(false);
    }, 320);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, autoPlayInterval);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next, autoPlayInterval]);

  const slide = SLIDES[current];

  return (
    <section
      id={id}
      className="hbs-root"
      aria-label="Featured initiative carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hbs-inner">
        {/* Left Col: Slide content */}
        <div className="hbs-text-col">
          <div className={`hbs-content${fading ? ' hbs-content--fade' : ''}`}>
            <span className="hbs-tag">{slide.tag}</span>
            <h2 className="hbs-title">{slide.title}</h2>
            <p className="hbs-desc">{slide.description}</p>
            <a href={slide.ctaLink} className="hbs-cta">
              {slide.ctaLabel} <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Right Col: Slider image */}
        <div className="hbs-image-col">
          <div className={`hbs-bg${fading ? ' hbs-bg--fade' : ''}`}>
            <img src={slide.imageSrc} alt={slide.imageAlt} className="hbs-bg-img" draggable={false} />
          </div>

          {/* Prev / Next arrows */}
          <button className="hbs-arrow hbs-arrow--prev" onClick={prev} aria-label="Previous slide">
            <ChevronLeft size={22} />
          </button>
          <button className="hbs-arrow hbs-arrow--next" onClick={next} aria-label="Next slide">
            <ChevronRight size={22} />
          </button>

          {/* Dot indicators */}
          <div className="hbs-dots" role="tablist">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}: ${s.title}`}
                className={`hbs-dot${i === current ? ' hbs-dot--active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          {paused && <span className="hbs-paused-badge">Paused</span>}
        </div>
      </div>
    </section>
  );
};
