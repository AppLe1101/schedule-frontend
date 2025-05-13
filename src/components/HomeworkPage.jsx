// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React from "react";
import HomeworkCalendar from "./HomeworkCalendar";
import HomeworkEditorPage from "./HomeworkEditorPanel";

const HomeworkPage = ({ token, apiUrl, user }) => {
  if (!user || !token) return null;

  if (user.role === "student") {
    if (!user.groupId) {
      return <p>Вы не состоите в группе</p>;
    }
    const groupId = user.groupId[0];
    return (
      <HomeworkCalendar
        token={token}
        user={user}
        apiUrl={apiUrl}
        groupId={groupId}
      />
    );
  }

  if (user.role === "teacher" || user.role === "director") {
    return <HomeworkEditorPage token={token} user={user} apiUrl={apiUrl} />;
  }

  return <p>Нет доступа к домашним заданиям</p>;
};

export default HomeworkPage;
