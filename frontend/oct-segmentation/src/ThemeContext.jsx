import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Kiểm tra localStorage hoặc lấy mặc định là 'dark'
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Xóa class cũ và thêm class mới vào thẻ <html>
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Lưu vào localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);