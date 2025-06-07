// Obvisouly, I vibe-coded this with Cursor.
// CSS is my achilles heel (well, frontend in general)

"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLoading } from "@/contexts/LoadingContext";

const RadialGradient = () => {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isMoving = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      isMoving.current = true;
    };

    const handleMouseUp = () => {
      isMoving.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    const animateGradient = () => {
      if (isMoving.current) {
        animate(x, mouseX.current, { ease: "easeOut", duration: 0.5 });
        animate(y, mouseY.current, { ease: "easeOut", duration: 0.5 });
      } else {
        animate(x, Math.random() * window.innerWidth, {
          ease: "easeInOut",
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
        });
        animate(y, Math.random() * window.innerHeight, {
          ease: "easeInOut",
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
        });
      }
      requestAnimationFrame(animateGradient);
    };

    animateGradient();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [x, y]);

  const backgroundStyle = useTransform(
    [x, y],
    ([currentX, currentY]) =>
      `radial-gradient(600px at ${currentX}px ${currentY}px, rgba(140, 45, 25, 0.6), transparent 80%)`
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <motion.div
        className="absolute inset-0 rounded-full opacity-30 blur-3xl"
        style={{ background: backgroundStyle }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    </div>
  );
};

const AnimatedTrendingUp = () => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white drop-shadow-lg"
    >
      <motion.circle
        cx="13.5"
        cy="15.5"
        r="0"
        fill="url(#gradientGlow)"
        initial={{ r: 0, opacity: 0 }}
        animate={{ r: [0, 8, 0], opacity: [0, 0.7, 0] }}
        transition={{
          duration: 1,
          ease: "circOut",
          repeat: Infinity,
          repeatType: "mirror",
          repeatDelay: 0.5,
        }}
      />
      <defs>
        <radialGradient id="gradientGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff7b5c" stopOpacity="1" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.polyline
        points="22 7 13.5 15.5 8.5 10.5 2 17"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 1,
          ease: "circOut",
          repeat: Infinity,
          repeatType: "mirror",
          repeatDelay: 0.5,
        }}
      />
      <motion.polyline
        points="16 7 22 7 22 13"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 1,
          ease: "circOut",
          repeat: Infinity,
          repeatType: "mirror",
          repeatDelay: 0.5,
        }}
      />
    </motion.svg>
  );
};

const LoadingMessages = () => {
  const messages = [
    "Crunching the numbers...",
    "Analyzing alumni trajectories...",
    "Uncovering career insights...",
    "Mapping success stories...",
    "Polishing the data...",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * messages.length);
        } while (newIndex === prevIndex);
        return newIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={messages[index]}
        className="text-white/80 text-lg font-medium"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {messages[index]}
      </motion.p>
    </AnimatePresence>
  );
};

export default function GlobalLoadingModal() {
  const { isLoading } = useLoading();
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      delay: number;
      scale: number;
      vx: number;
      vy: number;
      color: string;
    }>
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      scale: Math.random() * 0.7 + 0.3,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: Math.random() > 0.5 ? "#ff7b5c" : "#8C2D19", // Assign one of two colors
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (isLoading) {
      // Save current scroll position and prevent scrolling
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scroll position when modal is closed
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLoading]);

  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [0, 500], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 500], [-10, 10]);
  const glareX = useTransform(mouseX, [0, 500], [-120, 120]);
  const glareY = useTransform(mouseY, [0, 500], [-80, 80]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  const handleMouseLeave = () => {
    animate(mouseX, 0, { duration: 0.5, ease: "easeOut" });
    animate(mouseY, 0, { duration: 0.5, ease: "easeOut" });
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 h-screen w-screen bg-black/70 backdrop-blur-lg flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {/* Floating particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full opacity-40"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                height: `${p.scale * 7}px`,
                width: `${p.scale * 7}px`,
                background: p.color,
              }}
              animate={{
                x: [0, p.vx, -p.vx, 0],
                y: [0, p.vy, -p.vy, 0],
                scale: [p.scale, p.scale * 1.3, p.scale],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: Math.random() * 6 + 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          ))}

          {/* Large, slow-moving particles/orbs for deep background */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`large-orb-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 50 + 30}px`,
                height: `${Math.random() * 50 + 30}px`,
                background: `radial-gradient(circle at center, rgba(255,255,255,0.05), transparent 70%)`,
              }}
              animate={{
                x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
                y: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
                scale: [1, 1.2, 1],
                opacity: [0, 0.2, 0],
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10,
              }}
            />
          ))}

          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, perspective: 800 }}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              boxShadow: [
                "0 0 0px rgba(140, 45, 25, 0)",
                "0 0 25px rgba(140, 45, 25, 0.7)",
                "0 0 50px rgba(140, 45, 25, 0.4)",
                "0 0 25px rgba(140, 45, 25, 0.7)",
                "0 0 0px rgba(140, 45, 25, 0)",
              ],
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              boxShadow: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "mirror",
              },
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              y: 50,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
            }}
            className="relative"
          >
            {/* Main container with glassmorphism */}
            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl px-12 py-10 shadow-2xl shadow-black/30 border border-white/10 relative overflow-hidden min-w-[340px]">
              {/* More dynamic background element */}
              <motion.div
                className="absolute inset-0 z-0 opacity-20"
                style={{
                  background:
                    "radial-gradient(circle at center, #8C2D19 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Subtle dust particles */}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`dust-${i}`}
                  className="absolute bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 1.5 + 0.5}px`,
                    height: `${Math.random() * 1.5 + 0.5}px`,
                  }}
                  animate={{
                    x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50],
                    y: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5,
                  }}
                />
              ))}

              {/* Animated gradient backgrounds */}
              <motion.div
                className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-[#8C2D19]/50 to-transparent rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 270, 0] }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "circInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-tl from-blue-500/40 to-transparent rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, -270, 0] }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "circInOut",
                  delay: 1,
                }}
              />

              {/* Interactive Glare */}
              <motion.div
                className="absolute inset-0 w-full h-full"
                style={{
                  background: `radial-gradient(circle at ${glareX}px ${glareY}px, rgba(255, 255, 255, 0.15), transparent 40%)`,
                }}
              />

              {/* Dynamic Radial Gradient */}
              <RadialGradient />

              {/* Subtle background texture overlay */}
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  background: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M9.919 4.908L7.919 2.908 3.919 6.908 5.919 8.908zM1.081 2.908L-0.919 4.908 2.081 7.908 4.081 5.908zM4.919 -0.092L2.919 -2.092 -0.081 0.908 1.919 2.908z'/%3E%3C/g%3E%3C/svg%3E")`,
                  opacity: 0.1,
                  mixBlendMode: "overlay",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              {/* Center content */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Main icon with complex animations */}
                <motion.div className="relative mb-8 w-28 h-28">
                  {/* Outer ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#8C2D19]/30"
                    style={{
                      background:
                        "conic-gradient(from 180deg at 50% 50%, #8C2D19 0deg, #ff7b5c 180deg, #8C2D19 360deg)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Middle ring */}
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-white/20"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Inner glow */}
                  <motion.div
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-[#8C2D19]/30 to-transparent"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatedTrendingUp />
                  </div>

                  {/* Sparkle effects */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: `50%`,
                        left: `50%`,
                        transform: `translate(-50%, -50%) rotate(${
                          i * 60
                        }deg) translateY(-56px)`,
                      }}
                      animate={{
                        scale: [0, 1.3, 0], // Slightly larger scale burst
                        opacity: [0, 1, 0],
                        x: [0, Math.random() * 5 - 2.5], // Subtle random horizontal movement
                        y: [0, Math.random() * 5 - 2.5], // Subtle random vertical movement
                      }}
                      transition={{
                        duration: 1.8, // Slightly longer duration
                        repeat: Infinity,
                        delay: i * 0.25, // Adjusted delay for more sequential burst
                        ease: "easeOut",
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-[#ff9c82]" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Text section */}
                <div className="text-center h-20 flex flex-col justify-center items-center">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">
                    Alumni Insights
                  </h3>
                  <LoadingMessages />
                </div>

                {/* Progress indicator */}
                <div className="mt-6 w-56 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#8C2D19] via-[#ff7b5c] to-[#8C2D19]"
                    style={{ width: "100%" }}
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatType: "mirror",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
