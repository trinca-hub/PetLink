import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type SideMenuContextValue = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const SideMenuContext = createContext<SideMenuContextValue | undefined>(undefined);

export function SideMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, openMenu, closeMenu, toggleMenu }),
    [isOpen, openMenu, closeMenu, toggleMenu]
  );

  return <SideMenuContext.Provider value={value}>{children}</SideMenuContext.Provider>;
}

export function useSideMenu() {
  const ctx = useContext(SideMenuContext);
  if (!ctx) {
    throw new Error("useSideMenu must be used within SideMenuProvider");
  }
  return ctx;
}
