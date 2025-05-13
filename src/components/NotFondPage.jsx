// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import NotFoundAnimation from "./animations/404-animation.json";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFoundPage = () => {
  return (
    <motion.div
      className="not-found-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <Player autoplay loop src={NotFoundAnimation} style={{ width: "50%" }} />
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">Ой! Такой страницы нет.</p>
      <Link to="/" className="not-found-link">
        Вернуться на главную
      </Link>
    </motion.div>
  );
};

export default NotFoundPage;
