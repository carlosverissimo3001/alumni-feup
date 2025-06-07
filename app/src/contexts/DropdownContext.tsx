import { createContext, useContext, useState } from "react";

const DropdownContext = createContext<{
  isAnyOpen: boolean;
  setIsAnyOpen: (open: boolean) => void;
}>({
  isAnyOpen: false,
  setIsAnyOpen: () => {},
});

export const useDropdownContext = () => useContext(DropdownContext);

export const DropdownProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAnyOpen, setIsAnyOpen] = useState(false);
  return (
    <DropdownContext.Provider value={{ isAnyOpen, setIsAnyOpen }}>
      {children}
    </DropdownContext.Provider>
  );
};
