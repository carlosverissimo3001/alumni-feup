"use client"

import { useState } from "react";
import { Construction, BarChart3, Users, GraduationCap, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const stats = [
  {
    name: "Total Alumni",
    value: "---",
    icon: Users,
    description: "Coming soon"
  },
  {
    name: "Countries",
    value: "---",
    icon: Globe2,
    description: "Coming soon"
  },
  {
    name: "Graduation Years",
    value: "---",
    icon: GraduationCap,
    description: "Coming soon"
  },
  {
    name: "Companies",
    value: "---",
    icon: BarChart3,
    description: "Coming soon"
  }
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <Construction className="h-8 w-8 text-yellow-500 animate-bounce" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard Under Construction
          </h1>
          <p className="text-gray-500">We're building something amazing for you!</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <stat.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300"
      >
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Coming Soon Features</h2>
          <ul className="text-gray-600 space-y-2">
            <li>📊 Detailed Alumni Statistics</li>
            <li>🌍 Global Distribution Map</li>
            <li>🎓 Graduation Year Trends</li>
            <li>💼 Industry Sector Analysis</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}