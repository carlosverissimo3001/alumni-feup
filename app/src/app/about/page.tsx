"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const titleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AboutPage = () => {
  const [activeSection, setActiveSection] = useState("team");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["team", "acknowledgments", "open-source"];

      let closestSection = sections[0];
      let minDistance = Infinity;

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top);

        if (distance < minDistance) {
          minDistance = distance;
          closestSection = section;
        }
      });

      setActiveSection(closestSection);
    };

    let isThrottled = false;
    const throttledScroll = () => {
      if (!isThrottled) {
        requestAnimationFrame(() => {
          handleScroll();
          isThrottled = false;
        });
        isThrottled = true;
      }
    };

    window.addEventListener("scroll", throttledScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", throttledScroll);
  }, []);

  const developers = [
    {
      name: "Carlos Verissimo",
      role: "Full Stack Developer",
      image: "/images/team/carlos.png",
      linkedinUrl: "https://www.linkedin.com/in/carlosverissimo3001/",
      githubUrl: "https://github.com/carlosverissimo3001",
    },
    {
      name: "Jénifer Constantino",
      role: "Full Stack Developer",
      image: "/images/team/jenifer.png",
      linkedinUrl: "https://www.linkedin.com/in/jenifer-constantino/",
      githubUrl: "https://github.com/JeniferConstantino",
    },
    {
      name: "José Pessoa",
      role: "Full Stack Developer",
      image: "/images/team/jose.png",
      linkedinUrl: "https://www.linkedin.com/in/jos%C3%A9-pessoa-098837352/",
      githubUrl: "https://github.com/JDP818",
    },
  ];

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="sticky top-0 bg-white/80 backdrop-blur-sm z-50 border-b border-zinc-100 px-4"
        >
          <nav className="max-w-6xl mx-auto flex justify-center gap-8 py-6">
            {[
              { id: "team", label: "Team" },
              { id: "acknowledgments", label: "Acknowledgments" },
              { id: "open-source", label: "Open Source" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative px-3 py-2 transition-colors ${
                  activeSection === item.id
                    ? "text-[#8C2D19]"
                    : "text-zinc-600 hover:text-[#8C2D19]"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C2D19]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>
        </motion.div>

        <div className="max-w-6xl mx-auto p-4 space-y-8">
          <motion.section
            initial="hidden"
            animate="visible"
            variants={titleVariants}
            className="text-center space-y-6"
          >
            {Array.from("About 30EIC").map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block bg-gradient-to-r from-[#8C2D19] to-orange-500 bg-clip-text text-transparent text-3xl md:text-4xl font-bold"
              >
                {letter}
              </motion.span>
            ))}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base md:text-lg text-zinc-600 max-w-3xl mx-auto"
            >
              30EIC is a comprehensive platform designed to connect and empower
              FEUP Informatics Engineering alumni.
            </motion.p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <h2
              id="team"
              className="text-3xl font-semibold text-center text-zinc-800 group flex items-center justify-center gap-2"
            >
              Development Team
              <a
                href="#team"
                className="opacity-0 group-hover:opacity-100 text-[#8C2D19] transition-opacity"
              >
                #
              </a>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {developers.map((dev, index) => (
                <motion.div
                  key={dev.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15 p-8 rounded-3xl border border-[#8C2D19]/20 hover:shadow-xl hover:shadow-[#8C2D19]/20 hover:border-[#8C2D19]/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-32 h-32 relative mx-auto mb-6 overflow-hidden rounded-full ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={dev.image}
                      alt={dev.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-center text-zinc-800 mb-2">
                    {dev.name}
                  </h3>
                  <p className="text-zinc-600 text-center mb-4">{dev.role}</p>
                  <div className="flex justify-center space-x-6">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={dev.linkedinUrl}
                          target="_blank"
                          className="flex items-center text-primary hover:text-primary/80 transition-colors"
                        >
                          <Image
                            src="/logos/linkedin-icon.svg"
                            alt="LinkedIn"
                            width={24}
                            height={24}
                            className="hover:scale-125 transition-transform duration-300"
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-zinc-800 text-white border-none"
                      >
                        <p>View {dev.name}&apos;s LinkedIn Profile</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={dev.githubUrl}
                          target="_blank"
                          className="flex items-center text-primary hover:text-primary/80 transition-colors"
                        >
                          <Image
                            src="/logos/github-mark.svg"
                            alt="GitHub"
                            width={24}
                            height={24}
                            className="hover:scale-125 transition-transform duration-300"
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-zinc-800 text-white border-none"
                      >
                        <p>View {dev.name}&apos;s GitHub Profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            <h2
              id="acknowledgments"
              className="text-3xl font-semibold text-center text-zinc-800 group flex items-center justify-center gap-2"
            >
              Acknowledgments
              <a
                href="#acknowledgments"
                className="opacity-0 group-hover:opacity-100 text-[#8C2D19] transition-opacity"
              >
                #
              </a>
            </h2>
            <div className="grid grid-cols-1 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="group bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15 rounded-3xl p-8 border border-[#8C2D19]/20 hover:shadow-xl hover:shadow-[#8C2D19]/20 hover:border-[#8C2D19]/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-semibold text-zinc-800">
                    Alumni Data
                  </h3>
                  <Image
                    src="/logos/linkedin-icon.svg"
                    alt="LinkedIn"
                    width={28}
                    height={28}
                    className="opacity-80"
                  />
                </div>
                <p className="text-zinc-600 text-md">
                  30EIC&apos;s alumni network visualization is made possible
                  through LinkedIn data integration, enabling us to map career
                  trajectories and professional connections of FEUP Informatics
                  Engineering graduates.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="group bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15 rounded-3xl p-8 border border-[#8C2D19]/20 hover:shadow-xl hover:shadow-[#8C2D19]/20 hover:border-[#8C2D19]/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-semibold text-zinc-800">
                    ESCO Classification
                  </h3>
                  <Image
                    src="/logos/ec-esco.svg"
                    alt="European Commission"
                    width={84}
                    height={28}
                    className="opacity-80 invert"
                  />
                </div>
                <p className="text-zinc-600 text-md">
                  This service uses the ESCO (European Skills Classification of
                  Occupations) classification of the European Commission.{" "}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="https://ec.europa.eu/esco/portal/esco/home"
                        target="_blank"
                        className="text-[#8C2D19] hover:text-orange-500 inline-flex items-center gap-1 group-hover:underline"
                      >
                        ESCO{" "}
                        <ExternalLink
                          size={16}
                          className="transition-transform"
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-zinc-800 text-white border-none"
                    >
                      <p>Visit ESCO Portal</p>
                    </TooltipContent>
                  </Tooltip>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15 rounded-3xl p-8 border border-[#8C2D19]/20 hover:shadow-xl hover:shadow-[#8C2D19]/20 hover:border-[#8C2D19]/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-semibold text-zinc-800">
                    Salary Data
                  </h3>
                  <Image
                    src="/logos/levels-fyi-logo.png"
                    alt="Levels.fyi"
                    width={28}
                    height={28}
                    className="opacity-80"
                  />
                </div>
                <p className="text-zinc-600 text-md">
                  Salary insights are powered by data from{" "}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="https://www.levels.fyi"
                        target="_blank"
                        className="text-[#8C2D19] hover:text-orange-500 inline-flex items-center gap-1 group-hover:underline"
                      >
                        levels.fyi{" "}
                        <ExternalLink
                          size={16}
                          className="transition-transform"
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-zinc-800 text-white border-none"
                    >
                      <p>View Tech Industry Salary Data</p>
                    </TooltipContent>
                  </Tooltip>
                  , providing comprehensive compensation data across the tech
                  industry.
                </p>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center space-y-6"
          >
            <h2
              id="open-source"
              className="text-3xl font-semibold text-zinc-800 group flex items-center justify-center gap-2"
            >
              Open Source
              <a
                href="#open-source"
                className="opacity-0 group-hover:opacity-100 text-[#8C2D19] transition-opacity"
              >
                #
              </a>
            </h2>
            <p className="text-zinc-600">
              30EIC is an open-source project. Check out our code and contribute
              on GitHub.
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="https://github.com/carlosverissimo3001/alumni-feup"
                  target="_blank"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#8C2D19] to-orange-500 text-white px-8 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#8C2D19]/20 font-semibold text-lg group"
                >
                  <Github
                    size={28}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  <span>View on GitHub</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-zinc-800 text-white border-none"
              >
                <p>Explore our Open Source Code</p>
              </TooltipContent>
            </Tooltip>
          </motion.section>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default AboutPage;
