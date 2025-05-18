import React, { useState } from "react";
import axios from "axios";
import "./styles/FAQModal.css";

const onboardingSteps = [
  {
    title: "Профиль пользователя",
    description:
      "Добавь аватар, бейджи и раздел 'О себе'. Это поможет другим узнать тебя.",
    image: "/img/onboarding/profile_faq.png",
  },
  {
    title: "Домашние задания",
    description:
      "Смотри и сдавай домашние задания. С премиумом — проверяй с помощью ИИ!",
    image: "/img/onboarding/homework_faq.png",
  },
  {
    title: "Новости и уведомления",
    description:
      "Читайте важные объявления. Все новые публикации будут отображаться колокольчиком",
    image: "/img/onboarding/news_faq.png",
  },
  {
    title: "Оценки и зачётка",
    description:
      "Следи за своими оценками в журнале и проверяй зачётку по предметам.",
    image: "/img/onboarding/journal_faq.png",
  },
  {
    title: "Поиск и профили",
    description:
      "Находи других пользователей, группы и задания. Просматривай их профили.",
    image: "/img/onboarding/search_faq.png",
  },
];

const FAQModal = ({ onClose, apiUrl, token }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    await axios.patch(
      `${apiUrl}/api/users/mark-onboarding`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    onClose();
  };

  const current = onboardingSteps[step];

  return (
    <div className="modal-overlay">
      <div className="faq-modal">
        <div className="faq-image">
          <img src={current.image} alt="" />
        </div>
        <div className="faq-text">
          <div style={{ color: "#333" }}>{current.title}</div>
          <p>{current.description}</p>
          <div className="faq-buttons">
            <button onClick={handleBack} disabled={step === 0}>
              Назад
            </button>
            <div className="steps">
              {onboardingSteps.map((_, i) => (
                <span key={i} className={i === step ? "active" : ""} />
              ))}
            </div>
            <button onClick={handleNext}>
              {step === onboardingSteps.length - 1 ? "Готово" : "Далее →"}
            </button>
            <button onClick={handleFinish}>✕</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
