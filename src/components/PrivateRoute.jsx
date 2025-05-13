// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};
export default PrivateRoute;
