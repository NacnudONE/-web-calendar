import React from "react";
import { useAuthStore } from "../features/auth";
import { useMediaQuery } from "../shared/lib";
import { LoginPage } from "../pages/LoginPage";
import { CalendarPage } from "../pages/CalendarPage";
import MobileApp from "../mobile/MobileApp";

const App = () => {
  const { user, loading } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: 18,
          color: "#6b7280",
        }}
      >
        Завантаження...
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return isMobile ? <MobileApp /> : <CalendarPage />;
};

export default App;
