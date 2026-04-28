import React from "react";
import { motion } from "framer-motion";

const Headtext = ({ text, className }) => {
  return (
    <h2
      className={`text-2xl md:text-3xl font-cormorant font-semibold tracking-tight text-brand-brown ${className}`}
    >
      <span className="relative inline-block">
        {text}
        <motion.span
          className="absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-brand-gold w-0"
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
        />
      </span>
    </h2>
  );
};

export default Headtext;
