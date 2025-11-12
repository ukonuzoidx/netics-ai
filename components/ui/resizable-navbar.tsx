// "use client";
// import { cn } from "@/lib/utils";
// import { IconMenu2, IconX } from "@tabler/icons-react";
// import Image from "next/image";
// import {
//   motion,
//   AnimatePresence,
//   useScroll,
//   useMotionValueEvent,
// } from "motion/react";

// import React, { useRef, useState } from "react";

// interface NavbarProps {
//   children: React.ReactNode;
//   className?: string;
// }

// interface NavBodyProps {
//   children: React.ReactNode;
//   className?: string;
//   visible?: boolean;
// }

// interface NavItemsProps {
//   items: {
//     name: string;
//     link: string;
//   }[];
//   className?: string;
//   onItemClick?: () => void;
// }

// interface MobileNavProps {
//   children: React.ReactNode;
//   className?: string;
//   visible?: boolean;
// }

// interface MobileNavHeaderProps {
//   children: React.ReactNode;
//   className?: string;
// }

// interface MobileNavMenuProps {
//   children: React.ReactNode;
//   className?: string;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const Navbar = ({ children, className }: NavbarProps) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const { scrollY } = useScroll({
//     target: ref,
//     offset: ["start start", "end start"],
//   });
//   const [visible, setVisible] = useState<boolean>(false);

//   useMotionValueEvent(scrollY, "change", (latest) => {
//     if (latest > 100) {
//       setVisible(true);
//     } else {
//       setVisible(false);
//     }
//   });

//   return (
//     <motion.div
//       ref={ref}
//       // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
//       className={cn("sticky inset-x-0 top-20 z-40 w-full", className)}
//     >
//       {React.Children.map(children, (child) =>
//         React.isValidElement(child)
//           ? React.cloneElement(
//               child as React.ReactElement<{ visible?: boolean }>,
//               { visible }
//             )
//           : child
//       )}
//     </motion.div>
//   );
// };

// export const NavBody = ({ children, className, visible }: NavBodyProps) => {
//   return (
//     <motion.div
//       initial={{
//         backdropFilter: "blur(20px) saturate(180%)",
//         y: 20,
//       }}
//       animate={{
//         backdropFilter: "blur(20px) saturate(180%)",
//         y: 20,
//       }}
//       transition={{
//         type: "spring",
//         stiffness: 200,
//         damping: 50,
//       }}
//       className={cn(
//         "relative z-[60] mx-auto hidden w-full max-w-[1000px] flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex",
//         "bg-white/70 dark:bg-black/40",
//         "backdrop-blur-2xl backdrop-saturate-150",
//         "border border-white/20 dark:border-white/10",
//         "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
//         "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/40 before:to-white/10 before:opacity-50 dark:before:from-white/10 dark:before:to-white/5",
//         className
//       )}
//     >
//       {children}
//     </motion.div>
//   );
// };

// export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
//   const [hovered, setHovered] = useState<number | null>(null);

//   return (
//     <motion.div
//       onMouseLeave={() => setHovered(null)}
//       className={cn(
//         "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
//         className
//       )}
//     >
//       {items.map((item, idx) => (
//         <a
//           onMouseEnter={() => setHovered(idx)}
//           onClick={onItemClick}
//           className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
//           key={`link-${idx}`}
//           href={item.link}
//         >
//           {hovered === idx && (
//             <motion.div
//               layoutId="hovered"
//               className="absolute inset-0 h-full w-full rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-white/30 dark:border-white/20 shadow-[0_4px_16px_0_rgba(31,38,135,0.2)]"
//             />
//           )}
//           <span className="relative z-20">{item.name}</span>
//         </a>
//       ))}
//     </motion.div>
//   );
// };

// export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
//   return (
//     <motion.div
//       initial={{
//         backdropFilter: "blur(20px) saturate(180%)",
//         paddingRight: "12px",
//         paddingLeft: "12px",
//         borderRadius: "2rem",
//         y: 20,
//       }}
//       animate={{
//         backdropFilter: "blur(20px) saturate(180%)",
//         paddingRight: "12px",
//         paddingLeft: "12px",
//         borderRadius: "2rem",
//         y: 20,
//       }}
//       transition={{
//         type: "spring",
//         stiffness: 200,
//         damping: 50,
//       }}
//       className={cn(
//         "relative z-50 mx-auto flex w-full max-w-[95vw] flex-col items-center justify-between px-3 py-2 lg:hidden",
//         "bg-white/70 dark:bg-black/40",
//         "backdrop-blur-2xl backdrop-saturate-150",
//         "border border-white/20 dark:border-white/10",
//         "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
//         "before:absolute before:inset-0 before:rounded-[2rem] before:bg-gradient-to-br before:from-white/40 before:to-white/10 before:opacity-50 dark:before:from-white/10 dark:before:to-white/5",
//         className
//       )}
//     >
//       {children}
//     </motion.div>
//   );
// };

// export const MobileNavHeader = ({
//   children,
//   className,
// }: MobileNavHeaderProps) => {
//   return (
//     <div
//       className={cn(
//         "flex w-full flex-row items-center justify-between",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// export const MobileNavMenu = ({
//   children,
//   className,
//   isOpen,
// }: MobileNavMenuProps) => {
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className={cn(
//             "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950",
//             className
//           )}
//         >
//           {children}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export const MobileNavToggle = ({
//   isOpen,
//   onClick,
// }: {
//   isOpen: boolean;
//   onClick: () => void;
// }) => {
//   return isOpen ? (
//     <IconX className="text-black dark:text-white" onClick={onClick} />
//   ) : (
//     <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
//   );
// };

// export const NavbarLogo = () => {
//   return (
//     <a
//       href="#"
//       className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
//     >
//       <Image
//         src="https://assets.aceternity.com/logo-dark.png"
//         alt="logo"
//         width={30}
//         height={30}
//       />
//       <span className="font-medium text-black dark:text-white">Startup</span>
//     </a>
//   );
// };

// export const NavbarButton = ({
//   href,
//   as: Tag = "a",
//   children,
//   className,
//   variant = "primary",
//   ...props
// }: {
//   href?: string;
//   as?: React.ElementType;
//   children: React.ReactNode;
//   className?: string;
//   variant?: "primary" | "secondary" | "dark" | "gradient";
// } & (
//   | React.ComponentPropsWithoutRef<"a">
//   | React.ComponentPropsWithoutRef<"button">
// )) => {
//   const baseStyles =
//     "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

//   const variantStyles = {
//     primary:
//       "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
//     secondary: "bg-transparent shadow-none dark:text-white",
//     dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
//     gradient:
//       "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
//   };

//   return (
//     <Tag
//       href={href || undefined}
//       className={cn(baseStyles, variantStyles[variant], className)}
//       {...props}
//     >
//       {children}
//     </Tag>
//   );
// };

"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
    container: {
      current: typeof window !== "undefined" ? document.body : null,
    } as React.RefObject<HTMLElement>,
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn(
        "sticky top-0 w-full pointer-events-auto",
        className
      )}
      // style={{ isolation: "isolate" }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className }: NavBodyProps) => {
  return (
    // <motion.div
    //   initial={{
    //     backdropFilter: "blur(20px) saturate(180%)",
    //     y: 20,
    //   }}
    //   animate={{
    //     backdropFilter: "blur(20px) saturate(180%)",
    //     y: 20,
    //   }}
    //   transition={{
    //     type: "spring",
    //     stiffness: 200,
    //     damping: 50,
    //   }}
    //   className={cn(
    //     "relative z-[60] mx-auto hidden w-full max-w-[1000px] flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex",
    //     "bg-white/70 dark:bg-black/40",
    //     "backdrop-blur-2xl backdrop-saturate-150",
    //     "border border-white/20 dark:border-white/10",
    //     "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
    //     "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/40 before:to-white/10 before:opacity-50 before:pointer-events-none dark:before:from-white/10 dark:before:to-white/5",
    //     className
    //   )}
    // >
    //   {children}
    // </motion.div>

    <motion.div
      className={cn(
        "relative mx-auto hidden w-full max-w-[1000px] flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex",
        // "bg-white/5 dark:bg-white/5",
        "bg-black/5 backdrop-blur-xl backdrop-saturate-200 border border-white/20 shadow-2xl",
        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/40 before:to-white/10 before:opacity-40 dark:before:from-white/10 dark:before:to-white/5",

        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={(e) => {
            setHovered(idx);
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePosition({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
          onMouseMove={(e) => {
            if (hovered === idx) {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
          }}
          onClick={onItemClick}
          className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <>
              {/* Glass effect layer */}
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-[#D8E4E9]/40 dark:bg-[#D8E4E9]/10 backdrop-blur-xl backdrop-saturate-200 border border-white/30 dark:border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]"
              />

              {/* Liquid blob effect */}
              <motion.div
                className="absolute rounded-full blur-xl pointer-events-none "
                animate={{
                  x: mousePosition.x - 75,
                  y: mousePosition.y - 75,
                }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 200,
                  mass: 0.5,
                }}
                style={{
                  width: "150px",
                  height: "150px",
                }}
              />
            </>
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className }: MobileNavProps) => {
  return (
    <motion.div
      initial={{
        backdropFilter: "blur(20px) saturate(180%)",
        paddingRight: "12px",
        paddingLeft: "12px",
        borderRadius: "2rem",
        y: 20,
      }}
      animate={{
        backdropFilter: "blur(20px) saturate(180%)",
        paddingRight: "12px",
        paddingLeft: "12px",
        borderRadius: "2rem",
        y: 20,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[95vw] flex-col items-center justify-between px-3 py-2 lg:hidden",
        "bg-white/10 dark:bg-white/5",
        "backdrop-blur-md backdrop-saturate-200 border border-white/20",
        "border border-white/20 dark:border-white/10",
        // "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
        "shadow-2xl",
        "before:absolute before:inset-0 before:rounded-[2rem] before:bg-gradient-to-br before:from-white/40 before:to-white/10 before:opacity-50 before:pointer-events-none dark:before:from-white/10 dark:before:to-white/5",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "relative z-[110] flex w-full flex-row items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] flex w-full flex-col items-start justify-start gap-4 rounded-2xl px-4 py-8",
        "bg-white/70 dark:bg-black/40",
        "backdrop-blur-2xl backdrop-saturate-150",
        "border border-white/20 dark:border-white/10",
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
        "animate-in fade-in slide-in-from-top-2 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-[110] p-2 text-black dark:text-white cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="https://assets.aceternity.com/logo-dark.png"
        alt="logo"
        width={30}
        height={30}
      />
      <span className="font-medium text-black dark:text-white">Startup</span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
