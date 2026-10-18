import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { lazy, Suspense, useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import mark from "@/assets/aurum-mark.png";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { SplitText } from "@/components/landing/SplitText";
import { Story } from "@/components/landing/Story";

const Orb = lazy(() => import("@/components/landing/Orb"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurum — The AI concierge, finished by hand" },
      { name: "description", content: "Aurum is a refined AI chatbot that listens, reasons and remembers. A quiet, luxurious conversation made for you." },
      { property: "og:title", content: "Aurum — The AI concierge" },
      { property: "og:description", content: "A refined AI chatbot that listens, reasons and remembers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PROMPTS = ["Plan a slow weekend in Kyoto", "Explain quantum entanglement simply", "Draft a gracious decline email", "Refactor this function", "Pair a wine with saffron risotto", "Summarise this contract"];

function Landing() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const start = () => navigate({ to: "/chat" });

  return (
    <div ref={pageRef} className="grain relative min-h-screen overflow-x-clip">
      <div className="spotlight pointer-events-none fixed inset-0 z-0" />

      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-12">
        <Link to="/" className="flex items-center gap-3">
          <img src={mark} alt="" width={36} height={36} className="h-9 w-9" />
          <span className="font-display text-2xl tracking-wide">Aurum</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <a href="#method" className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline">Method</a>
          <Link to="/chat" className="group inline-flex items-center gap-1 text-foreground">
            Open chat <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </header>

      <section ref={heroRef} className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-16 md:px-12">
        <motion.div style={{ y: orbY, scale: orbScale }} className="absolute inset-0 -z-10">
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <motion.div className="h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.2 }}>
                <Orb />
              </motion.div>
            </Suspense>
          </ClientOnly>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_78%)]" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} className="eyebrow mb-6">
              The AI concierge — Est. 2026
            </motion.p>
            <h1 className="font-display text-[15vw] leading-[0.88] tracking-tight md:text-[9.5vw]">
              <SplitText text="Intelligence," delay={0.4} />
              <br />
              <span className="italic text-gold-gradient">
                <SplitText text="finished by hand." delay={0.7} />
              </span>
            </h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4 md:pb-6"
          >
            <p className="mb-8 max-w-sm text-lg leading-relaxed text-muted-foreground">
              A quiet, considered conversation with a frontier mind. Ask anything — Aurum listens, reasons, and remembers.
            </p>
            <MagneticButton onClick={start}>
              Begin a conversation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      <div className="relative z-10 overflow-hidden border-y border-border py-6">
        <div className="animate-marquee flex w-max gap-12 whitespace-nowrap font-display text-3xl text-muted-foreground">
          {[...PROMPTS, ...PROMPTS].map((p, i) => (
            <span key={i} className="flex items-center gap-12">
              “{p}” <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
          ))}
        </div>
      </div>

      <div id="method" className="relative z-10">
        <Story />
      </div>

      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-soft blur-[120px]" />
        <motion.img
          src={mark}
          alt=""
          width={120}
          height={120}
          loading="lazy"
          className="relative mb-10 h-28 w-28"
          initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
          whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative font-display text-6xl leading-none md:text-9xl"
        >
          Say <span className="italic text-gold-gradient">hello.</span>
        </motion.h2>
        <p className="relative mt-8 max-w-md text-muted-foreground">Your first conversation takes ten seconds to begin and is kept privately in your account.</p>
        <div className="relative mt-12 flex flex-wrap justify-center gap-4">
          <MagneticButton onClick={start}>
            Open Aurum <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton variant="ghost" onClick={() => navigate({ to: "/auth" })}>
            Create account
          </MagneticButton>
        </div>
      </section>

      <footer className="relative z-10 flex flex-col justify-between gap-4 border-t border-border px-6 py-10 text-sm text-muted-foreground md:flex-row md:px-12">
        <span className="font-display text-xl text-foreground">Aurum</span>
        <span className="eyebrow">Crafted with care · © 2026</span>
      </footer>
    </div>
  );
}
