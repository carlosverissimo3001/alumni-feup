"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, Lock, Handshake, Mail } from "lucide-react";

const sections = [
  {
    id: 1,
    title: "Information We Collect",
    icon: <BarChart3 className="w-5 h-5" />,
    content: [
      "Basic profile information from LinkedIn (name, email, profile picture)",
      "Information you choose to provide in your profile",
    ],
  },
  {
    id: 2,
    title: "How We Use Your Information",
    icon: <RefreshCw className="w-5 h-5" />,
    content: [
      "Provide and maintain our services",
      "Authenticate your identity",
      "Enable profile management features",
    ],
  },
  {
    id: 3,
    title: "Data Security",
    icon: <Lock className="w-5 h-5" />,
    content: [
      "We implement appropriate security measures to protect your personal information.",
    ],
  },
  {
    id: 4,
    title: "Third-Party Services",
    icon: <Handshake className="w-5 h-5" />,
    content: [
      "We use LinkedIn for authentication. Please refer to LinkedIn's privacy policy for information about how they handle your data.",
    ],
  },
  {
    id: 5,
    title: "Contact",
    icon: <Mail className="w-5 h-5" />,
    content: [
      <>
        For any questions about this privacy policy, please contact {" "}
        <a
          href="mailto:carlos.verissimo3001@gmail.com"
          className="text-[#8C2D19] hover:text-[#A13A23] underline transition-colors"
        >
          carlosverissimo3001@gmail.com
        </a>
      </>,
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#fdf6f4]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-[#8C2D19] mb-10">
          Privacy Policy
        </h1>

        <div className="space-y-10">
          {sections.map((section) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="relative bg-white p-6 rounded-lg border border-[#8C2D19]/10 shadow-md hover:shadow-lg hover:shadow-[#8C2D19]/20 transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <div className="mr-3 p-2 rounded-full bg-[#8C2D19]/10 text-[#8C2D19]">
                  {section.icon}
                </div>
                {section.id}. {section.title}
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {section.content.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        <footer className="mt-16 pt-6 border-t text-center text-sm text-gray-600">
          <p>© 2024-{new Date().getFullYear()} All rights reserved.</p>
          <p className="mt-2">
            This is a university project developed at{" "}
            <Link
              href="https://www.fe.up.pt/"
              target="_blank"
              rel="noopener"
              className="text-[#8C2D19] hover:text-[#A13A23] underline decoration-dotted transition-colors"
            >
              FEUP - Faculty of Engineering of University of Porto
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
