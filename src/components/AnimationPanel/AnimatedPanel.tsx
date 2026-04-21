import { type ReactNode } from "react";

import { motion, AnimatePresence } from "framer-motion";

const AnimatedPanel = ({
  panelKey,
  children,
}: {
  panelKey: string;
  children: ReactNode;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={panelKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export { AnimatedPanel };
export default AnimatedPanel;
