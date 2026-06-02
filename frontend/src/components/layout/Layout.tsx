import { type ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  dark?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.22,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export default function Layout({ children, dark = false }: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${dark ? "bg-ink" : "bg-parchment"}`}>
      <Navbar />
      <motion.main
        className="flex-1"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
