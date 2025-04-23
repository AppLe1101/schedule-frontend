import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles/Footer.css";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-left">
        <p>© 2025 LearningPortal. Все права защищены.</p>
      </div>
      <div className="footer-right">
        <Link to={"/policy"}>Политика</Link>
        <Link
          to={"https://antiplagiat.ru"}
          target="_blank"
          rel="noopener noreferrer"
        >
          АнтиПлагиат
        </Link>
        <p>© Сloud, Ink.</p>
      </div>
    </div>
  );
};

export default Footer;
