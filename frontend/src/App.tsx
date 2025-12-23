import { useEffect, useState } from "react";
import { ChatWidget } from "./components/ChatWidget";

function App() {
  // Sync dark mode state with body class for global background styling
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("chatDarkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Apply dark class to body for global background gradient
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Centered chat widget with responsive padding */}
      <ChatWidget isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </div>
  );
}

export default App;
