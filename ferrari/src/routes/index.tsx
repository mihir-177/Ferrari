import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "motion/react";
import { useEffect, useRef, useState, useCallback, useId } from "react";
import { LoaderOverlay } from "../components/LoaderOverlay";
import driver1 from "../assets/driver_1.jpg";
import driver2 from "../assets/driver_2.jpg";
import driver3 from "../assets/driver_3.jpg";
import driver4 from "../assets/driver_4.jpg";
import driver5 from "../assets/driver_5.jpg";
import driver6 from "../assets/driver_6.jpg";
import logoImg from "../assets/logo.png";
import slide1 from "../assets/slide_1.jpg";
import slide2 from "../assets/slide_2.jpg";
import slide3 from "../assets/slide_3.jpg";
import slide4 from "../assets/slide_4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AF CORSE × WEC // 499 SEASON LOG" },
      { name: "description", content: "Unofficial fan tribute season log for the AF Corse #50 and #51 hypercar programme in the FIA WEC. Race stats, footage, and the gravitational pull of yellow." },
      { property: "og:title", content: "AF CORSE × WEC // 499 SEASON LOG" },
      { property: "og:description", content: "Fan tribute. Hypercar season log. Footage, telemetry vibes, and yellow." },
    ],
  }),
  component: Index,
});

function Index() {
  const [loading, setLoading] = useState(true);
  const [globalSound, setGlobalSound] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeoutId: any;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoaderOverlay onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <main className="bg-background text-foreground noise selection:bg-[var(--accent-red)] selection:text-white">
        <TopTicker />
        <Nav />
        <Hero globalSound={globalSound} setGlobalSound={setGlobalSound} isScrolling={isScrolling} />
        <FullscreenScrollVideo globalSound={globalSound} isScrolling={isScrolling} />
        <Marquee />
        <Standings />
        <HorizontalScrollVideo globalSound={globalSound} isScrolling={isScrolling} />
        <SartheChronicles />
        <BigStatement />
        <PartnerWall globalSound={globalSound} isScrolling={isScrolling} />
        <DriverGrid />
        <VideoDivider globalSound={globalSound} isScrolling={isScrolling} />
        <PressRoll />
        <Manifesto />
        <Footer />
      </main>
    </>
  );
}

/* ---------- shared ---------- */

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.06, ease },
  }),
};

const LOCAL_VIDEOS = {
  hero: "/videos/Ferrari SF-25 Makes Its Debut with Charles Leclerc & Lewis Hamilton On Track! (1).mov",
  alt1: "/videos/Ferrari SF-25 REVEALED! First Look at Ferrari’s 2025 F1 Car.mov",
  alt2: "/videos/Lewis Hamilton's First Lap As A Ferrari Formula 1 Driver.mov",
  alt3: "/videos/Tris FERRARI alla 24 ore di Le Mans! Kubica porta in trionfo l'AF Corse #83 _ RIVIVI L'ARRIVO.mov",
  partnerLV: "/videos/Sempre Forza Ferrari.mov",
};

interface LocalVideoPlayerProps {
  src: string;
  shouldPlayAudio: boolean;
  className?: string;
  loop?: boolean;
  start?: number; // start time in seconds
  end?: number;   // end time in seconds
}

function LocalVideoPlayer({
  src,
  shouldPlayAudio,
  className = "",
  loop = true,
  start,
  end
}: LocalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video audio/playback state with viewport visibility state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlayAudio) {
      video.muted = false;
      video.volume = 1.0;
      video.play().catch((err) => {
        console.warn("Autoplay with audio blocked. Attempting muted autoplay:", err);
        video.muted = true;
        video.play().catch(() => {});
      });
    } else {
      video.muted = true;
      video.pause();
    }
  }, [shouldPlayAudio]);

  // Handle loop boundaries (for example, the 1 minute loop on the hero video)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (start != null) {
      video.currentTime = start;
    }

    const handleTimeUpdate = () => {
      if (end != null && video.currentTime >= end) {
        video.currentTime = start != null ? start : 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [start, end]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop={end == null && loop}
      muted
      playsInline
      webkit-playsinline="true"
    />
  );
}

function ImgSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden border border-white/20 bg-[#0d0d0d] flex items-center justify-center ${className}`}>
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 14px, white 14px 15px)",
        }}
      />
      <div className="relative text-center px-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">[ image slot ]</div>
        <div className="mt-2 font-display text-white/80 text-sm md:text-base">{label}</div>
      </div>
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.25em] text-white/40">▢ frame</span>
      <span className="absolute bottom-2 right-2 text-[9px] uppercase tracking-[0.25em] text-white/40">drop in</span>
    </div>
  );
}

/* ---------- top live ticker ---------- */

function TopTicker() {
  const items = [
    "● LIVE FROM FIORANO",
    "TRACK TEMP 38°C",
    "WIND SE 7KM/H",
    "FUEL LOAD 71KG",
    "TYRE SOFT C3",
    "STINT 14 / LAP 22",
    "GAP +0.412",
    "DRS ARMED",
    "RADIO OK",
    "TELEMETRY NOMINAL",
  ];
  const row = [...items, ...items, ...items];
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[var(--accent-red)] text-white text-[10px] uppercase tracking-[0.25em] py-1 overflow-hidden border-b border-black/20">
      <div className="flex gap-8 marquee-fast whitespace-nowrap w-max">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="opacity-60">/</span>{t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- nav ---------- */

function Nav() {
  const [time, setTime] = useState("");
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " CET"
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 mix-blend-difference">
      <div className="flex items-center justify-between px-5 md:px-8 py-3">
        <a href="#" className="flex items-center gap-3 text-white">
          <img src={logoImg} alt="AF Corse" className="h-6 md:h-8 w-auto object-contain brightness-0 invert" />
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 hidden sm:inline">unofficial · fan log</span>
        </a>
        <nav className="hidden md:flex gap-7 text-[11px] uppercase tracking-[0.25em] text-white">
          <a href="#standings" className="hover:text-[var(--accent-red)]">Standings</a>
          <a href="#wall" className="hover:text-[var(--accent-red)]">Footage</a>
          <a href="#partners" className="hover:text-[var(--accent-red)]">Partners</a>
          <a href="#drivers" className="hover:text-[var(--accent-red)]">Drivers</a>
          <a href="#press" className="hover:text-[var(--accent-red)]">Press</a>
        </nav>
        <div className="text-[10px] uppercase tracking-[0.3em] text-white flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="hover:text-[var(--accent-red)] border border-white/40 px-2 py-0.5 transition-colors cursor-pointer"
          >
            {theme === "light" ? "● dark" : "○ light"}
          </button>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] blink" />
          <span className="hidden sm:inline">{time}</span>
        </div>
      </div>
    </header>
  );
}

/* ---------- hero ---------- */

function Hero({
  globalSound,
  setGlobalSound,
  isScrolling,
}: {
  globalSound: boolean;
  setGlobalSound: React.Dispatch<React.SetStateAction<boolean>>;
  isScrolling: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  const isInView = useInView(ref, { amount: 0.1 });
  const shouldPlayAudio = globalSound && !isScrolling && isInView;

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden pt-20">
      {/* Background video */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/30 via-ink/10 to-ink" />
        <div className="absolute inset-0 z-10 mix-blend-multiply" style={{
          background: "radial-gradient(ellipse at 70% 30%, transparent 0%, rgba(0,0,0,0.6) 70%)"
        }} />
        <LocalVideoPlayer
          src={LOCAL_VIDEOS.hero}
          shouldPlayAudio={shouldPlayAudio}
          start={0}
          end={60}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[100vh] min-w-full min-h-full grayscale-[40%] saturate-[1.3]"
        />
      </div>

      {/* Crosshair corners */}
      <Crosshair />

      <motion.div style={{ y }} className="relative z-20 px-5 md:px-8 pt-10">
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/80"
        >
          <Tag>fia wec · 2025</Tag>
          <Tag>hypercar</Tag>
          <Tag tone="red">car #50 · #51 · #83</Tag>
          <Tag>maranello → spa → le mans</Tag>
        </motion.div>

        <h1 className="mt-8 font-display font-bold leading-[0.82] tracking-[-0.04em] text-white text-[18vw] md:text-[13vw]">
          {["AF", "COR—", "SE."].map((w, i) => (
            <motion.span key={i} variants={fadeUp} initial="hidden" animate="show" custom={i + 1} className="block">
              {i === 1 ? (
                <span>
                  COR<span className="text-[var(--accent-red)]">—</span>
                  <span className="italic font-normal text-stroke">SE</span>
                </span>
              ) : i === 2 ? (
                <span>
                  HYPER<span className="text-[var(--accent-red)]">CAR.</span>
                </span>
              ) : (
                w
              )}
            </motion.span>
          ))}
        </h1>

        <div className="mt-10 grid grid-cols-12 gap-4 items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1, ease }}
            className="col-span-12 md:col-span-5 text-white/80 text-sm md:text-base leading-relaxed"
          >
            A fan-built season log for the squadra from Piacenza running the
            yellow-and-red 499P in the World Endurance Championship. Stats,
            footage, and the gravitational pull of a flat-plane V6 at 9,000 rpm.
          </motion.p>
          <div className="col-span-12 md:col-span-4 md:col-start-7 grid grid-cols-3 gap-3 text-white">
            <Stat k="Wins" v="04" sub="2024-25" />
            <Stat k="Podiums" v="11" sub="hyc class" />
            <Stat k="Poles" v="03" sub="qual avg P3" />
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <button
              onClick={() => setGlobalSound((v) => !v)}
              className="group relative w-full md:w-auto border border-white/40 hover:border-[var(--accent-red)] px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-white hover:text-[var(--accent-red)] transition-colors glitch-hover"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] mr-2 align-middle blink" />
              {globalSound ? "engine on · cut audio" : "engine off · tap for v6"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* bottom corner labels */}
      <div className="absolute bottom-4 left-5 right-5 z-20 flex justify-between text-[10px] uppercase tracking-[0.3em] text-white/60">
        <span>↳ scroll · season log</span>
        <span>n 44°31′55″ · e 11°50′53″</span>
      </div>
    </section>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "red" }) {
  return (
    <span className={`px-2.5 py-1 border ${tone === "red" ? "border-[var(--accent-red)] text-[var(--accent-red)]" : "border-white/40 text-white"}`}>
      {children}
    </span>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="border-t border-white/30 pt-2">
      <div className="font-display text-3xl md:text-4xl leading-none">{v}</div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 mt-1">{k}</div>
      {sub && <div className="text-[9px] uppercase tracking-[0.25em] text-white/40">{sub}</div>}
    </div>
  );
}

function Crosshair() {
  return (
    <>
      {["top-24 left-5", "top-24 right-5", "bottom-12 left-5", "bottom-12 right-5"].map((p, i) => (
        <div key={i} className={`absolute ${p} z-20 w-4 h-4 pointer-events-none`}>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
        </div>
      ))}
    </>
  );
}

/* ---------- marquee ---------- */

function Marquee() {
  const items = [
    "QATAR 1812KM", "IMOLA 6H", "SPA 6H", "LE MANS 24H", "SÃO PAULO 6H",
    "AUSTIN 6H", "FUJI 6H", "BAHRAIN 8H",
  ];
  const row = [...items, ...items, ...items];
  return (
    <section className="border-y border-white/20 py-4 overflow-hidden bg-ink">
      <div className="flex w-max marquee-track gap-10 whitespace-nowrap text-[6.5vw] md:text-[4.5vw] font-display font-medium text-white">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={i % 2 ? "text-stroke" : ""}>{t}</span>
            <span className="text-[var(--accent-red)] font-normal">●</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------- standings ---------- */

function Standings() {
  const rounds = [
    { r: "01", track: "Qatar 1812km", date: "28.02", car50: "P2", car51: "P5", flag: "QA" },
    { r: "02", track: "Imola 6h", date: "20.04", car50: "P1", car51: "P3", flag: "IT" },
    { r: "03", track: "Spa-Francorchamps 6h", date: "10.05", car50: "DNF", car51: "P2", flag: "BE" },
    { r: "04", track: "Le Mans 24h", date: "14.06", car50: "P1", car51: "P4", flag: "FR" },
    { r: "05", track: "São Paulo 6h", date: "13.07", car50: "P4", car51: "P1", flag: "BR" },
    { r: "06", track: "Austin 6h", date: "07.09", car50: "P3", car51: "P6", flag: "US" },
    { r: "07", track: "Fuji 6h", date: "28.09", car50: "P2", car51: "P2", flag: "JP" },
    { r: "08", track: "Bahrain 8h", date: "08.11", car50: "—", car51: "—", flag: "BH" },
  ];
  return (
    <section id="standings" className="px-5 md:px-8 py-24 md:py-32">
      <SectionHead num="(02)" label="season log" title="Eight rounds. One yellow horse." />

      <div className="mt-10 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 border border-foreground/15">
          <div className="grid grid-cols-12 text-[10px] uppercase tracking-[0.25em] text-foreground/50 border-b border-foreground/15 px-4 py-2">
            <span className="col-span-1">rd</span>
            <span className="col-span-5">round</span>
            <span className="col-span-2">date</span>
            <span className="col-span-2 text-right">#50</span>
            <span className="col-span-2 text-right">#51</span>
          </div>
          {rounds.map((r, i) => (
            <motion.div
              key={r.r}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.04, ease }}
              className="grid grid-cols-12 items-center px-4 py-4 border-b border-foreground/10 hover:bg-[var(--accent-red)]/10 group"
            >
              <span className="col-span-1 text-foreground/40 text-xs">{r.r}</span>
              <span className="col-span-5 font-display text-lg md:text-2xl group-hover:text-[var(--accent-red)] transition-colors">
                <span className="text-foreground/40 text-xs mr-2">[{r.flag}]</span>{r.track}
              </span>
              <span className="col-span-2 text-foreground/60 text-xs">{r.date}.25</span>
              <span className={`col-span-2 text-right font-display ${r.car50 === "P1" ? "text-[var(--accent-red)]" : "text-foreground"}`}>{r.car50}</span>
              <span className={`col-span-2 text-right font-display ${r.car51 === "P1" ? "text-[var(--accent-red)]" : "text-foreground"}`}>{r.car51}</span>
            </motion.div>
          ))}
        </div>

        <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3 content-start">
          <BigStat n="P1" l="Le Mans 24h" sub="overall · class · drama" big />
          <BigStat n="9000" l="rpm redline" sub="twin-turbo v6" />
          <BigStat n="499" l="model · 499P" sub="hypercar regs" />
          <BigStat n="24h" l="longest stint" sub="le mans 14.06" />
          <BigStat n="04" l="class wins" sub="season to date" />
          <BigStat n="58.3°" l="avg track temp" sub="bahrain test" />
          <div className="col-span-2 border border-[var(--accent-red)] p-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-red)] mb-1">↘ telegram</div>
            <p className="font-display text-lg leading-tight">
              "Yellow first. Red forever. The horse comes home twice this year."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BigStat({ n, l, sub, big }: { n: string; l: string; sub: string; big?: boolean }) {
  return (
    <div className={`border border-foreground/15 p-4 ${big ? "col-span-2 bg-foreground text-background" : ""}`}>
      <div className={`font-display ${big ? "text-6xl" : "text-3xl"} leading-none`}>{n}</div>
      <div className={`text-[10px] uppercase tracking-[0.25em] mt-2 ${big ? "text-background/60" : "text-foreground/50"}`}>{l}</div>
      <div className={`text-[9px] uppercase tracking-[0.2em] ${big ? "text-background/40" : "text-foreground/40"}`}>{sub}</div>
    </div>
  );
}

function SectionHead({ num, label, title }: { num: string; label: string; title: string }) {
  return (
    <div className="grid grid-cols-12 gap-4 items-end">
      <div className="col-span-12 md:col-span-3">
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">{num}</div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent-red)] mt-1">{label}</div>
      </div>
      <motion.h2
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9, ease }}
        className="col-span-12 md:col-span-9 font-display font-medium text-3xl md:text-6xl tracking-tight leading-[1.05]"
      >
        {title}
      </motion.h2>
    </div>
  );
}

/* ---------- big statement ---------- */

function BigStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-15%", "5%"]);
  return (
    <section ref={ref} className="relative border-t border-foreground/20 py-24 md:py-40 overflow-hidden">
      <motion.h2
        style={{ x }}
        className="font-display font-bold text-[22vw] md:text-[18vw] leading-[0.82] tracking-[-0.05em] whitespace-nowrap"
      >
        <span className="text-stroke-theme">prancing</span> <span className="text-[var(--accent-red)]">horse,</span> hyper<span className="italic font-normal">car.</span>
      </motion.h2>
      <div className="px-5 md:px-8 mt-10 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-5 md:col-start-7 text-foreground/70 text-sm md:text-base leading-relaxed">
          Built in Piacenza. Tuned in Maranello. Sent at midnight through the
          Mulsanne in a yellow blur that smells like Pirelli, jet fuel, and
          twenty-four hours of nobody sleeping in the pit wall.
        </div>
      </div>
    </section>
  );
}

/* ---------- distributed scroll videos ---------- */

/* ---------- distributed scroll videos ---------- */

function FullscreenScrollVideo({ globalSound, isScrolling }: { globalSound: boolean; isScrolling: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0.15, 0.48], [0.75, 1]);
  const borderRadius = useTransform(scrollYProgress, [0.15, 0.48], ["20px", "0px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.78, 0.95], [0.2, 1, 1, 0.2]);

  const isInView = useInView(containerRef, { amount: 0.2 });
  const shouldPlayAudio = globalSound && !isScrolling && isInView;

  return (
    <div id="wall" ref={containerRef} className="relative h-[135vh] bg-background overflow-hidden flex flex-col items-center justify-start pt-[20vh]">
      <motion.div
        style={{ scale, borderRadius, opacity }}
        className="sticky top-0 w-full h-[100vh] max-w-[90vw] md:max-w-none overflow-hidden border border-foreground/15 bg-ink"
      >
        <LocalVideoPlayer
          src={LOCAL_VIDEOS.alt1}
          shouldPlayAudio={shouldPlayAudio}
          className="absolute inset-0 w-full h-full scale-[1.35] grayscale-[15%] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />
        <div className="absolute top-8 left-8 text-[11px] uppercase tracking-[0.3em] text-white flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] blink" />
          rec · 01 / onboard
        </div>
        <div className="absolute bottom-16 left-8 md:left-16">
          <div className="font-display text-4xl md:text-8xl font-bold leading-[0.82] text-white tracking-[-0.04em]">
            ONBOARD // EAU ROUGE
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/60 mt-3">
            Spa-Francorchamps · Lap 1 · Flat out through the mist
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function HorizontalScrollVideo({ globalSound, isScrolling }: { globalSound: boolean; isScrolling: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const isInView = useInView(ref, { amount: 0.2 });
  const shouldPlayAudio = globalSound && !isScrolling && isInView;

  return (
    <div ref={ref} className="py-32 overflow-hidden border-y border-foreground/15 bg-ink relative">
      <motion.div style={{ x }} className="flex gap-10 items-center w-[160%] md:w-[130%] pl-8">
        <div className="w-[480px] md:w-[720px] shrink-0 aspect-video relative overflow-hidden border border-white/20 bg-black">
          <LocalVideoPlayer
            src={LOCAL_VIDEOS.alt2}
            shouldPlayAudio={shouldPlayAudio}
            className="absolute inset-0 w-full h-full scale-[1.35] grayscale-[20%] pointer-events-none"
          />
          <div className="absolute inset-0 bg-ink/30 pointer-events-none" />
        </div>
        <div className="shrink-0 max-w-xl text-white pr-8">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--accent-red)]">/ pit lane log</span>
          <h3 className="font-display font-medium text-4xl md:text-6xl tracking-tight leading-[1.05] mt-3">
            PIT STOP // DOUBLE STACK
          </h3>
          <p className="mt-4 text-white/70 text-sm md:text-base leading-relaxed max-w-md">
            Tire swap. Fuel reload. Driver switch. All completed in under 22 seconds under the dark skies of the Sarthe, while the rain starts falling.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function ParallaxVideoSlot({ globalSound, isScrolling }: { globalSound: boolean; isScrolling: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  const isInView = useInView(ref, { amount: 0.2 });
  const shouldPlayAudio = globalSound && !isScrolling && isInView;

  return (
    <div ref={ref} className="col-span-12 md:col-span-5 min-h-[320px] relative overflow-hidden border border-white/20 bg-ink">
      <motion.div style={{ y, height: "125%" }} className="absolute inset-x-0 -top-[12.5%] pointer-events-none">
        <LocalVideoPlayer
          src={LOCAL_VIDEOS.alt3}
          shouldPlayAudio={shouldPlayAudio}
          className="w-full h-full scale-[1.35] grayscale-[10%]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20 pointer-events-none" />
      <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-red)]">night run</div>
        <div className="font-display text-2xl font-bold leading-tight mt-1">Mulsanne Straight · 03:14 CET</div>
      </div>
    </div>
  );
}

function VideoDivider({ globalSound, isScrolling }: { globalSound: boolean; isScrolling: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 0.95]);

  const isInView = useInView(ref, { amount: 0.2 });
  const shouldPlayAudio = globalSound && !isScrolling && isInView;

  return (
    <div ref={ref} className="relative h-[65vh] overflow-hidden border-y border-foreground/15 bg-ink">
      <motion.div style={{ scale }} className="absolute inset-0 pointer-events-none">
        <LocalVideoPlayer
          src={LOCAL_VIDEOS.hero}
          shouldPlayAudio={shouldPlayAudio}
          start={0}
          end={60}
          className="w-full h-full scale-[1.35] grayscale-[30%] opacity-85"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-background pointer-events-none" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--accent-red)]">/ fiorano circuit</div>
        <h3 className="font-display font-medium text-4xl md:text-7xl tracking-tight leading-[1.05] mt-3 max-w-3xl text-foreground">
          COLD START IN THE GARAGE
        </h3>
      </div>
    </div>
  );
}

function PartnerVideoEmbed({ videoId, name }: { videoId: string; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });

  return (
    <div ref={ref} className="mt-6 aspect-video w-full rounded-sm overflow-hidden border border-foreground/10 bg-black/5 relative">
      <LocalVideoPlayer
        src={LOCAL_VIDEOS.partnerLV}
        shouldPlayAudio={isInView}
        className="w-full h-full"
      />
    </div>
  );
}

/* ---------- sarthe chronicles (slideshow) ---------- */

function SartheChronicles() {
  const slides = [
    {
      img: slide1,
      title: "GRAVITATIONAL FORCE",
      desc: "Entering the Arnage corner at dusk. A perfect symphony of carbon, light, and mechanical tension.",
      year: "2024",
    },
    {
      img: slide2,
      title: "LE MANS CENTENARY VICTORY",
      desc: "Car #50 crossing the line in front of the packed grandstands, claiming Ferrari's historic consecutive Le Mans 24 Hours crown.",
      year: "2024",
    },
    {
      img: slide3,
      title: "THE HORSE DOMINATES THE MIST",
      desc: "Ripping through the Porsche curves at midnight. Water spray vaporized at 280 km/h under yellow beams.",
      year: "2023",
    },
    {
      img: slide4,
      title: "MARANELLO POWER HOUSE",
      desc: "Telemetry readout: V6 twin-turbo internal combustion engine operating at peak thermodynamic efficiency.",
      year: "2023",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Automatically advance slides every 4 seconds and reset timer on slide change
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <section className="px-5 md:px-8 py-24 md:py-32 border-t border-foreground/20 bg-background text-foreground overflow-hidden">
      <div className="grid grid-cols-12 gap-4 items-end mb-12">
        <div className="col-span-12 md:col-span-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">(03) ARCHIVE</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent-red)] mt-1">sarthe chronicles</div>
        </div>
        <h2 className="col-span-12 md:col-span-9 font-display font-medium text-3xl md:text-6xl tracking-tight leading-[1.05]">
          A tribute in <span className="italic">pixels &amp; grit.</span>
        </h2>
      </div>

      <div className="relative aspect-[16/9] w-full max-w-6xl mx-auto overflow-hidden border border-foreground/15 bg-ink group">
        {/* Slide image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: ease }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={slides[currentIndex].img}
              alt={slides[currentIndex].title}
              className="w-full h-full object-cover grayscale-[20%] brightness-[0.85]"
            />
            {/* Visual scanlines overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent 0 2px, var(--foreground) 2px 4px)",
            }} />
          </motion.div>
        </AnimatePresence>

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Slide Info (Bottom Left) */}
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-xl text-white">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--accent-red)] font-semibold">
            {slides[currentIndex].year} · SLIDE 0{currentIndex + 1}
          </span>
          <h3 className="font-display font-bold text-2xl md:text-5xl tracking-tight mt-2 leading-[0.95]">
            {slides[currentIndex].title}
          </h3>
          <p className="mt-3 text-white/80 text-xs md:text-sm leading-relaxed font-sans">
            {slides[currentIndex].desc}
          </p>
        </div>

        {/* Slide Navigation (Bottom Right) */}
        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 border border-white/40 hover:border-[var(--accent-red)] text-white hover:text-[var(--accent-red)] flex items-center justify-center text-sm font-bold transition-all hover:bg-black/30 cursor-pointer"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 border border-white/40 hover:border-[var(--accent-red)] text-white hover:text-[var(--accent-red)] flex items-center justify-center text-sm font-bold transition-all hover:bg-black/30 cursor-pointer"
          >
            →
          </button>
        </div>

        {/* Corner Telemetry Details */}
        <span className="absolute top-4 left-4 text-[9px] uppercase tracking-[0.25em] text-white/50 pointer-events-none">
          SECURE_STREAM // CAM_50
        </span>
        <span className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.25em] text-white/50 pointer-events-none">
          SYSTEM_OK · LIVE
        </span>
      </div>

      {/* Slide Indicators (dots) */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === index
                ? "bg-[var(--accent-red)] w-6"
                : "bg-foreground/20 hover:bg-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- partners ---------- */

const PARTNERS = [
  {
    name: "Paramount+",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/Paramount+.webp",
    role: "Media & Entertainment Partner",
    category: "Streaming & Media",
    since: "2023",
    focus: "Global Content Delivery",
    bio: "Bringing the thrill of the grid to screens worldwide, Paramount+ streams exclusive trackside stories, behind-the-scenes documentaries, and live motorsport content.",
    logoClass: "logo-paramount",
    url: "https://www.paramountplus.com"
  },
  {
    name: "Puma",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/content/dam/fom-website/2020/sponsors/puma.webp",
    role: "Official Racewear Provider",
    category: "Apparel & Footwear",
    since: "2005",
    focus: "Flame-Resistant Engineering",
    bio: "Equipping our pilots with cutting-edge flame-resistant racing suits, boots, and undergarments engineered to survive extreme G-forces and heat.",
    logoClass: "logo-puma",
    url: "https://www.puma.com"
  },
  {
    name: "Lenovo",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/lenovo.webp",
    role: "Title Computing Partner",
    category: "Technology Systems",
    since: "2018",
    focus: "Pit Wall Data Calculations",
    bio: "Powering the pit wall and trackside engineering, Lenovo provides high-performance computing hardware that handles gigabytes of live telemetry data per second.",
    logoClass: "logo-lenovo",
    url: "https://www.lenovo.com"
  },
  {
    name: "McDonalds",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/content/dam/fom-website/2020/sponsors/mcdonalds.webp",
    role: "Nutrition & Hospitality Sponsor",
    category: "Hospitality & Retail",
    since: "2021",
    focus: "Grassroots Fan Activations",
    bio: "Supporting global racing initiatives and fan zones, McDonalds collaborates with Scuderia Ferrari on regional community projects and youth development.",
    logoClass: "logo-mcdonalds",
    url: "https://www.mcdonalds.com"
  },
  {
    name: "T-Mobile",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/common/f1/logo/tmobile/tmobile.webp",
    role: "Wireless Telecom Partner",
    category: "Telecommunications",
    since: "2022",
    focus: "5G High-Speed Connectivity",
    bio: "Enabling ultra-low latency data transfers between trackside telemetry sensors and the central Maranello factory via secure 5G networks.",
    logoClass: "logo-tmobile",
    url: "https://www.t-mobile.com"
  },
  {
    name: "Santander",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/santander.webp",
    role: "Primary Banking Partner",
    category: "Financial Services",
    since: "2010",
    focus: "ESG & Carbon Neutrality Projects",
    bio: "Our financial advisory partner, guiding the Scuderia's sustainability investments and auditing compliance on the road to net-zero carbon racing.",
    logoClass: "logo-santander",
    url: "https://www.santander.com"
  },
  {
    name: "Moët Hennessy",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/moet%20hennessy.webp",
    role: "Celebration & Lifestyle Partner",
    category: "Luxury Wines & Spirits",
    since: "2015",
    focus: "Podium Celebrations",
    bio: "Official podium champagne sponsor, celebrating our victories and elevating Scuderia Ferrari's global hospitality events with luxury heritage brands.",
    logoClass: "logo-moet",
    url: "https://www.moet.com"
  },
  {
    name: "Louis Vuitton",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/louis%20vuitton.webp",
    role: "Official Luggage Sponsor",
    category: "Luxury Goods",
    since: "2023",
    focus: "Bespoke Travel Solutions",
    bio: "Crafting customized leather travel cases and luggage coordinates for Scuderia pilots and engineers as they travel across five continents.",
    logoClass: "logo-louis",
    url: "https://www.louisvuitton.com",
    video: "rvpD9e-wPBk"
  },
  {
    name: "TAG Heuer",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/TAGH_Shield_Monochrome_White-pw1.webp",
    role: "Timing & Chronograph Partner",
    category: "Luxury Watchmaking",
    since: "2020",
    focus: "Split-Second Precision Timing",
    bio: "Measuring thousands of a second in the pit lane, TAG Heuer chronographs are the gold standard of precision timing at the pinnacle of racing.",
    logoClass: "logo-tag",
    url: "https://www.tagheuer.com"
  },
  {
    name: "Aggreko",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/aggreko.webp",
    role: "Power & Temp Control Partner",
    category: "Power Infrastructure",
    since: "2019",
    focus: "Zero-Failure Energy Systems",
    bio: "Aggreko provides state-of-the-art power distribution and server room cooling units to the Scuderia paddock, guaranteeing uninterrupted compute time.",
    logoClass: "logo-aggreko",
    url: "https://www.aggreko.com"
  },
  {
    name: "Barilla",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/barilla.webp",
    role: "Hospitality Food Partner",
    category: "Food & Nutrition",
    since: "2022",
    focus: "High-Performance Athlete Fuel",
    bio: "Providing premium Italian nutrition to our hospitality suites, paddock club, and team training center to fuel performance.",
    logoClass: "logo-barilla",
    url: "https://www.barilla.com"
  },
  {
    name: "Liqui Moly",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/liqui-moly.webp",
    role: "Official Lubricants Partner",
    category: "Performance Chemicals",
    since: "2020",
    focus: "Powertrain Friction Reduction",
    bio: "Supplying high-performance lubricants and engine treatments that reduce mechanical friction, optimizing powertrain power outputs and endurance.",
    logoClass: "logo-liqui",
    url: "https://www.liqui-moly.com"
  },
  {
    name: "Marsh",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/marsh.webp",
    role: "Risk Management & Advisory",
    category: "Risk Advisory & Brokerage",
    since: "2018",
    focus: "Global Logistics Insurance",
    bio: "Advising Scuderia Ferrari on complex logistics risks, operational insurance, and strategic liabilities across all global Grand Prix locations.",
    logoClass: "logo-marsh",
    url: "https://www.marsh.com"
  },
  {
    name: "Globant",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/globant.webp",
    role: "Digital Transformation Partner",
    category: "Software & Digital Tech",
    since: "2022",
    focus: "Fan App Development",
    bio: "Co-developing our digital systems and team platforms, Globant helps design high-fidelity mobile experiences for the global Tifosi community.",
    logoClass: "logo-globant",
    url: "https://www.globant.com"
  },
  {
    name: "Standard Chartered",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/common/f1/logo/standardchartered/standardchartered.webp",
    role: "Global Finance Partner",
    category: "Banking & Financial Services",
    since: "2022",
    focus: "Cross-Border Trade Finance",
    bio: "Supporting international currency operations, global supplier transactions, and supply chain trade banking solutions for Scuderia Ferrari.",
    logoClass: "logo-standard",
    url: "https://www.sc.com"
  },
  {
    name: "Las Vegas GP",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/las%20vegas.webp",
    role: "Race Promotion Partner",
    category: "Events & Hospitality",
    since: "2023",
    focus: "High-Profile Fan Experiences",
    bio: "Collaborating on the spectacular Las Vegas Grand Prix night race on the Strip, generating premier VIP experiences and custom vehicle displays.",
    logoClass: "logo-lasvegas",
    url: "https://www.f1lasvegasgp.com"
  },
  {
    name: "PwC",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/pwc.webp",
    role: "Audit & Assurance Partner",
    category: "Tax & Corporate Advisory",
    since: "2016",
    focus: "Regulatory Cost Cap Compliance",
    bio: "Ensuring our financial reports comply with FIA's strict cost-cap boundaries while advising on strategic corporate operations and taxes.",
    logoClass: "logo-pwc",
    url: "https://www.pwc.com"
  },
  {
    name: "Nestlé",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/nestle.webp",
    role: "Hydration & Health Partner",
    category: "Wellness & Beverages",
    since: "2022",
    focus: "Garage Crew Rehydration",
    bio: "Official water and hydration drink supplier, keeping the pit-crew and mechanics alert and recovered in humid, high-stress race climates.",
    logoClass: "logo-nestle",
    url: "https://www.nestle.com"
  },
  {
    name: "Amex",
    img: "https://media.formula1.com/image/upload/e_trim/c_fit,w_160,h_90/q_auto/v1740000001/fom-website/2020/sponsors/Amex.webp",
    role: "Global Payment Services",
    category: "Payment Networks",
    since: "2023",
    focus: "Premium Fan Ticket Benefits",
    bio: "Providing American Express Cardmembers with exclusive trackside access, early ticket pre-sales, and premium Scuderia fan events worldwide.",
    logoClass: "logo-amex",
    url: "https://www.americanexpress.com"
  }
];

function PartnerWall({ globalSound, isScrolling }: { globalSound: boolean; isScrolling: boolean }) {
  const [activePartner, setActivePartner] = useState(PARTNERS[0]);

  return (
    <section id="partners" className="px-5 md:px-8 py-24 md:py-32 border-t border-foreground/20 bg-background text-foreground transition-colors duration-300">
      <SectionHead num="(04)" label="system network" title="System Partners & Sponsors." />

      <div className="mt-12 grid grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Logo Matrix */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PARTNERS.map((p) => {
            const isActive = activePartner.name === p.name;
            return (
              <div
                key={p.name}
                onMouseEnter={() => setActivePartner(p)}
                className={`relative group h-24 flex items-center justify-center p-4 border transition-all duration-300 bg-white border-foreground/10 hover:border-[var(--accent-red)] rounded-sm select-none cursor-pointer ${
                  isActive ? "border-[var(--accent-red)] ring-1 ring-[var(--accent-red)]/30" : ""
                }`}
              >
                {/* L-shaped high-tech corners */}
                <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-foreground/20 group-hover:border-[var(--accent-red)] transition-colors ${
                  isActive ? "border-[var(--accent-red)]" : ""
                }`} />
                <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-foreground/20 group-hover:border-[var(--accent-red)] transition-colors ${
                  isActive ? "border-[var(--accent-red)]" : ""
                }`} />
                <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-foreground/20 group-hover:border-[var(--accent-red)] transition-colors ${
                  isActive ? "border-[var(--accent-red)]" : ""
                }`} />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-foreground/20 group-hover:border-[var(--accent-red)] transition-colors ${
                  isActive ? "border-[var(--accent-red)]" : ""
                }`} />

                {/* Laser scanner line effect */}
                <div className="absolute inset-x-0 h-[1px] bg-[var(--accent-red)]/30 top-0 group-hover:animate-scan opacity-0 group-hover:opacity-100 pointer-events-none" />

                {/* Logo Image */}
                <img
                  src={p.img}
                  alt={p.name}
                  className={`max-h-[70%] max-w-[85%] object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 ${p.logoClass} ${
                    isActive ? "opacity-100" : ""
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Right Column: Sponsor Showcase HUD */}
        <div className="col-span-12 lg:col-span-5">
          <div className="border border-foreground/15 bg-foreground/[0.02] p-8 h-full flex flex-col justify-between rounded-sm min-h-[380px] relative overflow-hidden transition-colors duration-300">
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-foreground/10 pb-4 font-mono text-[9px] uppercase tracking-widest text-foreground/50">
                <span>{activePartner.category}</span>
                <span className="text-[var(--accent-red)] font-bold">EST. {activePartner.since}</span>
              </div>

              {/* Display Info */}
              <div className="mt-6">
                <h3 className="font-display text-3xl md:text-4xl tracking-tight font-bold text-foreground">
                  {activePartner.name}
                </h3>
                <p className="font-mono text-foreground/60 text-[10px] uppercase tracking-widest mt-1 border-l-2 border-[var(--accent-red)] pl-3">
                  {activePartner.role}
                </p>
              </div>

              {/* Bio description */}
              <p className="mt-6 text-foreground/80 text-sm leading-relaxed max-w-md">
                {activePartner.bio}
              </p>

              {/* Video Embed */}
              {activePartner.video && (
                <PartnerVideoEmbed videoId={activePartner.video} name={activePartner.name} />
              )}
            </div>

            {/* Bottom details & explore CTA */}
            <div className="mt-8 border-t border-foreground/10 pt-6 space-y-6">
              <div className="flex flex-col space-y-1 font-mono text-[10px] tracking-widest">
                <span className="text-foreground/40">CORE PARTNERSHIP FOCUS</span>
                <span className="text-foreground font-bold uppercase">{activePartner.focus}</span>
              </div>

              <a
                href={activePartner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-foreground/30 px-5 py-3 text-[10px] font-mono uppercase tracking-widest hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 rounded-sm w-full sm:w-auto justify-center"
              >
                Explore Partner Site <span className="text-xs">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pitch panel for luxury houses */}
      <div className="mt-16 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-7 border border-foreground p-6 md:p-10 bg-foreground text-background">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent-red)] font-bold">↳ partner inquiry</div>
          <h3 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05] tracking-tight">
            Sit on the same flank as Richard Mille,<br/>Loro Piana &amp; Shell.
          </h3>
          <p className="mt-4 text-background/70 max-w-xl text-sm md:text-base">
            A limited number of livery zones, suit patches and hospitality
            allotments are released each season. We brief, design, and place — end to end.
          </p>
          <a href="#contact" className="inline-block mt-6 border border-background/40 px-5 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-background hover:text-foreground transition-colors">
            request a deck →
          </a>
        </div>
        <ParallaxVideoSlot globalSound={globalSound} isScrolling={isScrolling} />
      </div>
    </section>
  );
}

/* ---------- drivers ---------- */

function DriverGrid() {
  const drivers = [
    { car: "#16", n: "C. L.", full: "Charles Leclerc", nat: "MON", role: "Formula 1 Pilot", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkuhK3VxUWJE6up7gu3-JcI2btjnRa5M0XFEO7jOAfzk-va6nF7ejXul22&s=10" },
    { car: "#44", n: "L. H.", full: "Lewis Hamilton", nat: "GBR", role: "Formula 1 Pilot", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6HBCN1u-Sj-MHsXqxmMmlRfNR4anvSvnYSsCWfK4R_w&s=10" },
    { car: "WALL", n: "F. V.", full: "Frédéric Vasseur", nat: "FRA", role: "Team Principal", img: "https://imgs.search.brave.com/lBIXORDEDz0mu3OsPM8UCtb9UfvRQDl9_5bgMPTZQ_4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5mb3JtdWxhMS5j/b20vaW1hZ2UvdXBs/b2FkL2NfbGZpbGws/d18zMzkyL3FfYXV0/by92MTc0MDAwMDAw/MS9jb250ZW50L2Rh/bS9mb20td2Vic2l0/ZS9zdXR0b24vMjAx/OC9IdW5nYXJ5VGVz/dC9EYXklMjBPbmUv/ZGNkMTgzMWp5NDUx/LndlYnA" },
  ];
  return (
    <section id="drivers" className="px-5 md:px-8 py-24 md:py-32 border-t border-foreground/20">
      <SectionHead num="(05)" label="grid" title="Two pilots. One team principal. One pit wall." />
      <div className="mt-10 grid grid-cols-12 gap-3 md:gap-4">
        {drivers.map((d, i) => (
          <motion.article
            key={d.full}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.05, ease }}
            className="col-span-6 md:col-span-4 border border-foreground/15 group hover:border-[var(--accent-red)] transition-colors"
          >
            <div className="aspect-[3/4] relative overflow-hidden border-b border-foreground/15 bg-ink">
              <img
                src={d.img}
                alt={d.full}
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            </div>
            <div className="p-4 flex items-baseline justify-between group-hover:border-[var(--accent-red)]">
              <div>
                <div className="font-display text-xl md:text-2xl">{d.full}</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 mt-1">{d.nat} · {d.role}</div>
              </div>
              <div className="font-display text-[var(--accent-red)] text-2xl">{d.car}</div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}


/* ---------- press roll ---------- */

function PressRoll() {
  const lines = [
    "“The yellow flank that owned Le Mans.” — Autosport",
    "“AF Corse turned the 24h into a colour theory exercise.” — The Race",
    "“Twin hypercars, one heartbeat from Piacenza.” — Motorsport.com",
    "“If endurance has a soul, it lives in garage 50.” — Sportscar365",
    "“A racing programme that brands queue to stand next to.” — RM Magazine",
  ];
  const row = [...lines, ...lines];
  return (
    <section id="press" className="border-y border-white/20 py-6 overflow-hidden bg-ink">
      <div className="flex w-max marquee-track gap-12 whitespace-nowrap text-base md:text-xl font-display text-white/80">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            <span className="text-[var(--accent-red)]">✱</span>
            <span>{t}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------- manifesto ---------- */

function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const words = "We race because going home would be louder than the engine.".split(" ");
  return (
    <section ref={ref} className="px-5 md:px-8 py-32 md:py-48 relative overflow-hidden">
      <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-[var(--accent-red)] blur-3xl opacity-20 pointer-events-none" />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-6">(06) Manifesto</p>
        <h2 className="font-display font-medium text-4xl md:text-7xl leading-[1.05] tracking-tight flex flex-wrap gap-x-3 gap-y-2 max-w-5xl">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0.15 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: "-200px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={w.includes("engine") ? "text-[var(--accent-red)] italic font-normal" : ""}
            >
              {w}
            </motion.span>
          ))}
        </h2>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer id="contact" className="bg-[var(--accent-red)] text-white relative overflow-hidden">
      <div className="px-5 md:px-8 pt-16 md:pt-24 pb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-6 opacity-80">(07) partner with the horse</p>
        <h2 className="font-display font-bold text-[14vw] md:text-[9vw] leading-[0.88] tracking-[-0.04em]">
          want to ride<br/>
          <span className="italic font-normal">shotgun?</span>
        </h2>
        <div className="mt-10 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-7">
            <a href="mailto:partners@af-corse.fan" className="inline-block text-xl md:text-3xl border-b border-white/60 hover:border-white">
              partners@af-corse.fan →
            </a>
            <p className="mt-6 max-w-xl text-white/80">
              Fan project. Independent. Not affiliated with Ferrari S.p.A.,
              AF Corse S.r.l., or the FIA. Made by people who think too much
              about racing in yellow.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-6 mt-8 md:mt-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-2">Pit base</p>
              <p>Piacenza · IT<br/>Maranello · IT<br/>Spa · BE</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-2">Elsewhere</p>
              <div className="flex flex-col gap-1">
                <a href="#" className="hover:opacity-70">Instagram</a>
                <a href="#" className="hover:opacity-70">YouTube</a>
                <a href="#" className="hover:opacity-70">Spotify · pit radio</a>
                <a href="#" className="hover:opacity-70">Are.na</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="font-display font-bold text-[22vw] leading-[0.8] tracking-[-0.05em] px-5 md:px-8 pb-2 overflow-hidden">
        AF/CORSE<span className="italic font-normal">.</span>
      </div>
      <div className="px-5 md:px-8 py-4 border-t border-white/30 flex flex-wrap justify-between gap-2 text-[10px] uppercase tracking-[0.3em] opacity-80">
        <span>© 2026 unofficial fan log</span>
        <span>built at 9000 rpm</span>
        <span>n 44°51′ · e 09°41′</span>
      </div>
    </footer>
  );
}

