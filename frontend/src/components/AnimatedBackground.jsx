import { motion } from 'framer-motion';

const AnimatedBackground = ({ className = '', fixed = false }) => {
  const positionClass = fixed ? 'fixed' : 'absolute';

  return (
    <div
      aria-hidden="true"
      data-animated-background="true"
      className={`${positionClass} inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] dark:bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:32px_32px] opacity-60 dark:opacity-[0.05]" />

      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[350px] md:w-[500px] h-[350px] md:h-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 dark:from-primary/25 dark:to-purple-900/20 blur-[100px] md:blur-[130px] top-[-15%] right-[-10%] mix-blend-multiply dark:mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 40, -60, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[300px] md:w-[450px] h-[300px] md:h-[450px] rounded-full bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 dark:from-accent/25 dark:to-blue-900/20 blur-[90px] md:blur-[110px] bottom-[-10%] left-[-10%] mix-blend-multiply dark:mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [0, 30, -50, 0],
          y: [0, 60, -30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-gradient-to-br from-pink-400/15 to-rose-500/15 dark:from-pink-500/15 dark:to-rose-800/10 blur-[80px] md:blur-[100px] top-[25%] left-[10%] mix-blend-multiply dark:mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [0, -40, 50, 0],
          y: [0, -30, 50, 0],
          scale: [1, 1.15, 0.85, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[200px] md:w-[350px] h-[200px] md:h-[350px] rounded-full bg-gradient-to-tr from-amber-400/15 to-yellow-500/10 dark:from-amber-500/10 dark:to-yellow-800/5 blur-[70px] md:blur-[90px] bottom-[20%] right-[10%] mix-blend-multiply dark:mix-blend-screen"
      />
    </div>
  );
};

export default AnimatedBackground;
