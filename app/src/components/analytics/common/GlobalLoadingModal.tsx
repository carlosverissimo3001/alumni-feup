"use client";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function GlobalLoadingModal({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true);
    
    // Generate floating particles only on client
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 h-screen w-screen bg-gradient-to-br from-black/60 via-slate-900/50 to-black/80 backdrop-blur-md flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* Floating particles - only render on client */}
          {isClient && particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-[#8C2D19] to-[#ff7b5c] rounded-full opacity-30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.8,
              },
            }}
            exit={{ 
              scale: 0.9, 
              opacity: 0, 
              y: -10,
              transition: { duration: 0.2 }
            }}
            className="relative"
          >
            {/* Main container with glassmorphism */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl px-12 py-10 shadow-2xl border border-white/20 relative overflow-hidden min-w-[320px]">
              
              {/* Animated gradient backgrounds */}
              <motion.div
                className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#8C2D19]/40 to-[#ff7b5c]/30 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              <motion.div
                className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-tl from-blue-500/30 to-purple-500/20 rounded-full blur-3xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Center content */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                
                {/* Main icon with complex animations */}
                <motion.div className="relative mb-8">
                  
                  {/* Outer ring */}
                  <motion.div
                    className="absolute inset-0 w-24 h-24 rounded-full border-2 border-[#8C2D19]/30"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background: "conic-gradient(from 0deg, transparent, #8C2D19, transparent)",
                    }}
                  />
                  
                  {/* Middle ring */}
                  <motion.div
                    className="absolute inset-2 w-20 h-20 rounded-full border border-[#ff7b5c]/40"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  
                  {/* Inner glow */}
                  <motion.div
                    className="absolute inset-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#8C2D19]/20 to-[#ff7b5c]/10"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Icon */}
                  <motion.div
                    className="relative z-10 w-24 h-24 flex items-center justify-center"
                    animate={{
                      y: [-2, 2, -2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <TrendingUp className="h-10 w-10 text-white drop-shadow-lg" />
                  </motion.div>
                  
                  {/* Sparkle effects */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}px`,
                        left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 40}px`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="h-3 w-3 text-[#ff7b5c]" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Text with typewriter effect */}
                <motion.div className="text-center">
                  <motion.h3
                    className="text-2xl font-bold text-white mb-2 tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Alumni Insights
                  </motion.h3>
                  
                  <motion.p
                    className="text-white/80 text-lg font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    Crunching the numbers...
                  </motion.p>
                </motion.div>

                {/* Progress indicator */}
                <motion.div className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#8C2D19] via-[#ff7b5c] to-[#8C2D19] rounded-full"
                    animate={{
                      x: [-200, 200],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      width: "40%",
                    }}
                  />
                </motion.div>

                {/* Status dots */}
                <motion.div className="flex space-x-2 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-white/60 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Ambient light effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{
                  x: [-100, 300],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
