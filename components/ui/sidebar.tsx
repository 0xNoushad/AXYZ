"use client";

import { cn } from "@/lib/utils"; // Assuming this path is correct
// import { ScrollArea } from "@/components/ui/scroll-area"; // Not used in the provided snippet directly for feedback
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"; // Assuming this path is correct
import {
  Blocks,
  ChevronsUpDown,
  Plus,
  UserCog,
  Home,
  Search,
  Wand2,
  Code,
  // FileCode, // Not used
  // LayoutDashboard, // Not used
  MessageSquare, // Used for Feedback icon
  Wallet
} from "lucide-react";
import { FeedbackComponent } from "@/components/ui/feedback-component"; // Adjusted path if necessary
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button"; // Assuming this path is correct
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Assuming this path is correct
// import { Separator } from "@/components/ui/separator"; // Not used
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming this path is correct
import { ConnectionModal } from "@/components/WalletConnector"; // Assuming this path is correct
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletConnection } from "@/hooks/useWalletConnection"; // Assuming this path is correct
import { signOut } from "next-auth/react";

// Animation variants (assuming these are defined correctly and work as intended)
const sidebarVariants = {
  open: { width: "14rem" },
  closed: { width: "3.05rem" },
};
const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 }, // Should this be opacity 0 when closed for content?
};
const textVariants = {
  open: { x: 0, opacity: 1, transition: { x: { stiffness: 1000, velocity: -100 } } },
  closed: { x: -20, opacity: 0, transition: { x: { stiffness: 100 } } },
};
const transitionProps = { type: "spring", stiffness: 300, damping: 30, duration: 0.2 };
const staggerVariants = {
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
  closed: { transition: { staggerChildren: 0.01, staggerDirection: -1 } },
};
  
export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false); // State for feedback popup

  const pathname = usePathname();
  const router = useRouter();
  const { connected } = useWallet();
  const { disconnectWallet } = useWalletConnection();
  
  // Handle wallet disconnect
  const handleDisconnect = async () => {
    const success = await disconnectWallet();
    if (success) {
      await signOut({ redirect: false });
      console.log("Wallet disconnected, redirecting to landing page...");
      router.push("/");
    }
  };
  
  useEffect(() => {
    const savedPinned = localStorage.getItem('sidebarPinned') === 'true';
    if (savedPinned) {
      setIsPinned(savedPinned);
      setIsCollapsed(false);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('sidebarPinned', isPinned.toString());
  }, [isPinned]);
  
  const handleMouseEnter = (): void => {
    if (!isPinned) setIsCollapsed(false);
  };
  
  const handleMouseLeave = (): void => {
    if (!isPinned) {
      setIsCollapsed(true);
      setIsFeedbackPopupOpen(false); // Close feedback popup if sidebar collapses and is not pinned
    }
  };
  
  // const handleNavClick = (href: string) => { // This function was defined but not used in the provided snippet links
  //   router.push(href);
  //   if (!isPinned) setIsCollapsed(true);
  // };
  
  return (
    <motion.div
      className="sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-zinc-800/30"
      data-sidebar="true"
      initial={false}
      animate={isCollapsed && !isPinned ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-colors duration-300" // Added transition-colors
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b border-zinc-200 dark:border-zinc-800/30 p-2"> {/* Adjusted border color for light/dark */}
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2 hover:bg-muted focus:ring-0" // Added focus style
                    >
                      <Avatar className="rounded size-4">
                        <AvatarImage src="/icons/logo.svg" alt="AXYZ Logo" />
                        <AvatarFallback>AXYZ</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={textVariants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium text-primary dark:text-gray-200"> {/* Adjusted text color */}
                              AXYZ
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background border-primary/20 shadow-lg"> {/* Styled dropdown */}
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
                      <Link href="/settings/members" className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" /> Your Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
                      <Link href="/settings/integrations" className="flex items-center gap-2">
                        <Blocks className="h-4 w-4" /> Agent (upcoming)
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
                      <Link href="/select-org" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Create a wallet
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-1 p-2"> {/* Reduced gap from 4 to 1 for nav items */}
                {/* Primary Navigation */}
                <Link
                  href="/home"
                  className={cn(
                    "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition-colors hover:bg-muted hover:text-primary",
                    pathname === "/home" && "bg-muted text-blue-600 dark:text-blue-400",
                  )}
                  onClick={() => { if (!isPinned) setIsCollapsed(true); setIsFeedbackPopupOpen(false);}} // Close popup on nav
                >
                  <Home className="h-4 w-4" />
                  <motion.li variants={textVariants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">Home</p>
                    )}
                  </motion.li>
                </Link>
                <Link
                  href="/search"
                  className={cn(
                    "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition-colors hover:bg-muted hover:text-primary",
                    pathname === "/search" && "bg-muted text-blue-600 dark:text-blue-400",
                  )}
                   onClick={() => { if (!isPinned) setIsCollapsed(true); setIsFeedbackPopupOpen(false);}}
                >
                  <Search className="h-4 w-4" />
                  <motion.li variants={textVariants}>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <p className="ml-2 text-sm font-medium">Search</p>
                      </div>
                    )}
                  </motion.li>
                </Link>
                {/* Add other links similarly, ensuring onClick closes popup if sidebar is not pinned */}
                 <Link
                  href="/generate"
                  className={cn(
                    "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition-colors hover:bg-muted hover:text-primary",
                    pathname === "/generate" && "bg-muted text-blue-600 dark:text-blue-400",
                  )}
                  onClick={() => { if (!isPinned) setIsCollapsed(true); setIsFeedbackPopupOpen(false);}}
                >
                  <Wand2 className="h-4 w-4" />
                  <motion.li variants={textVariants}>
                    {!isCollapsed && (
                      <div className="ml-2 flex items-center gap-2">
                        <p className="text-sm font-medium">Generate</p>
                        <Badge
                          className="flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-100 px-1.5 text-blue-700 dark:bg-blue-700 dark:text-blue-200"
                          variant="default"
                        >
                          New
                        </Badge>
                      </div>
                    )}
                  </motion.li>
                </Link>
                <Link
                  href="/agent-upcoming"
                  className={cn(
                    "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition-colors hover:bg-muted hover:text-primary",
                    pathname === "/agent-upcoming" && "bg-muted text-blue-600 dark:text-blue-400",
                  )}
                  onClick={() => { if (!isPinned) setIsCollapsed(true); setIsFeedbackPopupOpen(false);}}
                >
                  <Code className="h-4 w-4" />
                  <motion.li variants={textVariants}>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <p className="ml-2 text-sm font-medium">Agent</p>
                        <Badge
                          className="flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-100 px-1.5 text-blue-700 dark:bg-blue-700 dark:text-blue-200"
                          variant="default"
                        >
                          Upcoming
                        </Badge>
                      </div>
                    )}
                  </motion.li>
                </Link>
              </div>

              {/* Bottom section of sidebar */}
              <div className="flex flex-col p-2 gap-1 mt-auto"> {/* Use mt-auto to push to bottom */}
                {/* Feedback Component Trigger and Popup */}
                <div className="relative w-full"> {/* Container for positioning the feedback popup */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-full h-8 items-center justify-start px-2 py-1.5 rounded-md hover:bg-muted hover:text-primary"
                    onClick={() => setIsFeedbackPopupOpen(prev => !prev)} // Toggle feedback popup
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <motion.li variants={textVariants} className="flex-1"> {/* Ensure text takes space */}
                      {!isCollapsed && (
                        <p className="ml-2 text-sm font-medium">Feedback</p>
                      )}
                    </motion.li>
                  </Button>
                  {/* FeedbackComponent is now directly controlled and positioned */}
                  <FeedbackComponent
                    isOpen={isFeedbackPopupOpen}
                    onClose={() => setIsFeedbackPopupOpen(false)}
                  />
                </div>
                
                {/* Wallet disconnect button - only shows when connected */}
                {connected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-full h-8 items-center justify-start px-2 py-1.5 rounded-md hover:bg-muted hover:text-red-500 dark:hover:text-red-400 mt-1"
                    onClick={handleDisconnect}
                  >
                    <Wallet className="h-4 w-4 shrink-0" />
                    <motion.li variants={textVariants} className="flex-1">
                      {!isCollapsed && (
                        <p className="ml-2 text-sm font-medium">Disconnect Wallet</p>
                      )}
                    </motion.li>
                  </Button>
                )}
                
                {/* Wallet connection trigger (if needed when not connected) */}
                {/* This part seems to be for a modal, ensure ConnectionModal handles its own visibility or is triggered appropriately */}
                {!connected && (
                     <Button
                        variant="ghost"
                        size="sm"
                        className="flex w-full h-8 items-center justify-start px-2 py-1.5 rounded-md hover:bg-muted hover:text-primary wallet-connect-trigger-btn" // Added a class if needed for ConnectionModal
                        // onClick={() => { /* Logic to open ConnectionModal */ }}
                     >
                         <Wallet className="h-4 w-4 shrink-0" />
                         <motion.li variants={textVariants} className="flex-1">
                             {!isCollapsed && (
                                 <p className="ml-2 text-sm font-medium">Connect Wallet</p>
                             )}
                         </motion.li>
                     </Button>
                )}
                 {/* The ConnectionModal might need its own trigger logic if it's not a self-opening modal */}
                 <div className="hidden"> {/* Or however ConnectionModal is supposed to be integrated */}
                    <ConnectionModal />
                 </div>

              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
