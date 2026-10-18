import { useEffect, useRef } from "react";

const CHAPTERS = [
  { n: "01", t: "It listens.", d: "Every nuance of your question is held in context — the whole conversation, never just the last line." },
  { n: "02", t: "It reasons.", d: "A frontier model thinks before it speaks, weighing options with the patience of an expert." },
  { n: "03", t: "It remembers.", d: "Your conversation is kept privately in your account, ready the moment you return." },
];

const MANIFESTO =
  "We believe intelligence should feel like craftsmanship — quiet, considered, and made entirely for you. Aurum is a conversation, finished by hand.";

export function Story() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const pin = root.current!.querySelector<HTMLElement>("[data-pin]")!;
        const mm = gsap.matchMedia();
        mm.add("(min-width: 768px)", () => {
          gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: { trigger: pin, pin: true, scrub: 1, end: () => `+=${track.scrollWidth}`, invalidateOnRefresh: true },
          });
        });
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: { trigger: "[data-manifesto]", start: "top 75%", end: "bottom 45%", scrub: true },
          },
        );
        gsap.to("[data-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${track.scrollWidth}`, scrub: true },
        });
      }, root);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={root}>
      <section data-manifesto className="mx-auto max-w-5xl px-6 py-40 md:py-56">
        <p className="eyebrow mb-10">Manifesto</p>
        <p className="font-display text-4xl leading-[1.1] md:text-6xl">
          {MANIFESTO.split(" ").map((w, i) => (
            <span key={i} data-word className="inline-block">
              {w}&nbsp;
            </span>
          ))}
        </p>
      </section>

      <section data-pin className="relative overflow-hidden md:h-screen">
        <div className="absolute left-6 top-10 right-6 z-10 flex items-center gap-6 md:left-12 md:right-12">
          <span className="eyebrow">The method</span>
          <div className="h-px flex-1 bg-border">
            <div data-progress className="h-px origin-left scale-x-0 bg-gold" />
          </div>
        </div>
        <div data-track className="flex h-full flex-col gap-6 px-6 pt-24 pb-24 md:w-max md:flex-row md:items-center md:gap-10 md:px-12 md:pt-0 md:pb-0">
          {CHAPTERS.map((c) => (
            <article
              key={c.n}
              className="group relative flex min-h-[60vh] w-full shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/40 p-10 backdrop-blur md:h-[70vh] md:w-[42vw]"
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-soft blur-3xl transition-opacity duration-700 group-hover:opacity-100 md:opacity-40" />
              <span className="font-mono text-sm text-gold">{c.n}</span>
              <div>
                <h3 className="font-display text-6xl md:text-8xl">{c.t}</h3>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            </article>
          ))}
          <div className="hidden w-[20vw] shrink-0 md:block" />
        </div>
      </section>
    </div>
  );
}
