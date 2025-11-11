"use client";
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import { Mic, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import neticsAIIm from "../public/netics_ai.png";
import neticsAIM from "../public/netics_ai_main_logo.png";
// import neticsAIsm from "../public/NeticsAISmall.png";
import groupTaskSvg from "../public/group_task.svg";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { TextGradientEffect } from "@/components/ui/text-gradient-effect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const createChat = useMutation(api.chats.createChat);
  const router = useRouter();

  const navItems = [
    { name: "Chat", link: "#chat" },
    { name: "Features", link: "#features" },
    { name: "About", link: "#about" },
  ];

  const handleInputSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter" || !inputValue.trim() || isLoading) return;

    setIsLoading(true);

    try {
      if (!isSignedIn) {
        // Store the input in localStorage to use after sign in
        localStorage.setItem("pendingChatMessage", inputValue);
        // Store flag to know user came from landing page input
        localStorage.setItem("fromLandingPageInput", "true");
        // Trigger sign in - the user will be redirected back after
        const signInButton = document.querySelector(
          "[data-clerk-sign-in]"
        ) as HTMLButtonElement;
        signInButton?.click();

        // Reset loading after a short delay (user might cancel)
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        return;
      }

      // User is signed in, create chat with their message
      const chatId = await createChat({ title: inputValue.slice(0, 50) });

      // Store the message to send once in chat
      localStorage.setItem("pendingChatMessage", inputValue);
      localStorage.setItem("fromLandingPageInput", "true");

      // Navigate to the new chat
      router.push(`/dashboard/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen relative overflow-hidden">
      {/* Gradient Background - Layer 2 (middle) */}
      <div className="text-gray-200 dark:text-gray-900">
        <BackgroundRippleEffect rows={10} cols={20} cellSize={80} />
      </div>

      <div className="fixed inset-0 z-0">
        <BackgroundBeamsWithCollision className="min-h-screen">
          <></>
        </BackgroundBeamsWithCollision>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-200 to-indigo-200 opacity-50 dark:opacity-0" />
      {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-200 to-indigo-200 dark:from-slate-300/20 dark:via-blue-300/20 dark:to-indigo-400/20 opacity-50" /> */}

      {/* <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
        <Image
          className="absolute blur-lg opacity-40 w-full top-40 h-[100%] object-center animate-beat"
          alt="Gradient Background"
          src={mainFrameSvg}
        />
      </div> */}

      {/* Resizable Navbar */}
      <Navbar className="fixed top-0">
        {/* Desktop Navigation */}
        <NavBody>
          {/* Logo */}
          <a
            href="#"
            className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1"
          >
            <Image
              src={neticsAIM}
              alt="Netics AI"
              className="w-full h-16 dark:[filter:brightness(0)_invert(1)]"
              // className="w-full h-16 "
            />
          </a>

          {/* Nav Items */}
          <NavItems items={navItems} />

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <SignedIn>
              <Link href="/dashboard">
                <NavbarButton variant="primary">Dashboard</NavbarButton>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton
                mode="modal"
                fallbackRedirectUrl={"/dashboard"}
                forceRedirectUrl={"/dashboard"}
              >
                <NavbarButton variant="primary" data-clerk-sign-in>
                  Sign Up
                </NavbarButton>
              </SignInButton>
            </SignedOut>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            {/* Mobile Logo */}
            <a href="#" className="flex items-center space-x-2 px-2 py-1">
              <Image
                src={neticsAIM}
                alt="Netics AI"
                className="w-full h-10 dark:[filter:brightness(0)_invert(1)]"
              />
            </a>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => {
                console.log("Toggle clicked! Current state:", isMobileMenuOpen);
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <SignedIn>
                <Link href="/dashboard">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Dashboard
                  </NavbarButton>
                </Link>
              </SignedIn>

              <SignedOut>
                <SignInButton
                  mode="modal"
                  fallbackRedirectUrl={"/dashboard"}
                  forceRedirectUrl={"/dashboard"}
                >
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Sign Up
                  </NavbarButton>
                </SignInButton>
              </SignedOut>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Main content */}
      <section className="relative z-30 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-20 sm:mt-32 md:mt-40 pb-8 sm:pb-12 md:pb-16">
        <div className="h-[12rem] sm:h-[16rem] md:h-[15rem] flex items-center justify-center w-full max-w-5xl">
          <TextGradientEffect text="NETICS AI" />
        </div>
        {/* Hero text */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white leading-tight max-w-xs sm:max-w-md md:max-w-3xl mx-auto px-4">
            Your Revolutionary All-in-one AI Assistant that eliminates
            app-switching forever
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-400 dark:text-neutral-100 max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4">
            Schedule meetings, track expenses, control smart homes, book
            transport
            <br className="hidden sm:block" /> and more—all with simple
            commands.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full max-w-mmd pt-16 sm:max-w-md md:max-w-2xl lg:max-w-3xl mb-16 sm:mb-24 md:mb-32 px-4 sm:px-0">
          {/* SEARCH BAR ABOVE */}
          <div className="relative group -mt-10 z-10">
            {/* group task */}
            <div className="flex justify-center relative z-0 -mb-10 sm:-mb-12">
              <Image src={groupTaskSvg} alt="Group Task" />
            </div>
            {/* SEARCH BAR GLASS EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-orange-500/40 rounded-full blur-xl sm:blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl flex items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 gap-2 sm:gap-3">
              <div className="rounded-full flex items-center justify-center flex-shrink-0">
                <Image
                  src={neticsAIIm}
                  alt="Netics AI"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full"
                />
              </div>
              <input
                type="text"
                placeholder="What do you want to do on Netics?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputSubmit}
                disabled={isLoading}
                className="flex-1 px-2 sm:px-3 md:px-4 text-neutral-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 bg-transparent outline-none text-sm sm:text-base md:text-lg min-w-0 disabled:opacity-50"
              />
              <button className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-neutral-900 dark:text-white" />
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-neutral-900 dark:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer text */}
        {/* <div className="text-center text-sm text-gray-400 space-x-2 font-medium">
          <span>Powered by Claude AI & LangChain</span>
          <span>•</span>
          <span>Evolving into your physical humanoid assistant</span>
        </div> */}
      </section>
    </main>
  );
}
