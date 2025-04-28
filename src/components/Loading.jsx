import React, { useState, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import "./styles/Loading.css";
import loadingAnimation from "./animations/loadind-animation-blue.json";
import { motion } from "framer-motion";

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

const Loading = () => {
  const [loopKey, setLoopKey] = useState(0);
  const loadingText = "Загрузка...".split("");

  useEffect(() => {
    const interval = setInterval(() => {
      setLoopKey((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-loader-container">
      <motion.div
        key={loopKey}
        className="glass-text-loading"
        initial="hidden"
        animate="visible"
      >
        {loadingText.map((char, index) => (
          <motion.span
            key={index}
            custom={index}
            variants={textVariants}
            className="loading-char"
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default Loading;
