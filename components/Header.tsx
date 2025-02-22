"use client";

import { Activity } from "lucide-react";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <>
      <div className="flex items-center justify-center gap-3 mb-10 sm:mb-16">
        <Activity className="h-8 w-8 text-white/90" />
        <span className="text-xl font-semibold text-gradient">Progress</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight mb-2 lg:mb-4 leading-tight lg:leading-[1.15] text-gradient">
          What did you get done today?
        </h1>
        <p className="text-lg sm:text-xl font-medium text-gradient max-w-2xl mx-auto">
          Track your accomplishments and share updates with your team
        </p>
      </motion.div>
    </>
  );
};

export default Header;
