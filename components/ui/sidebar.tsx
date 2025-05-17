"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"
import {
  Blocks,
  ChevronsUpDown,
  Plus,
  UserCog,
  Home,
  Search,
  Wand2,
  Code,
  FileCode,
  LayoutDashboard,
  MessageSquare,
  Wallet
} from "lucide-react";
import { FeedbackComponent } from "@/components/ui/feedback-component";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConnectionModal } from "@/components/WalletConnector";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { signOut } from "next-auth/react";

// Animation variants
const sidebarVariants = {
  open: {
    width: "14rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const textVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  duration: 0.2,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
  closed: {
    transition: { staggerChildren: 0.01, staggerDirection: -1 },
  },
};
 
export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { connected } = useWallet();
  const { disconnectWallet } = useWalletConnection();
  
  // Handle wallet disconnect
  const handleDisconnect = async () => {
    const success = await disconnectWallet();
    
    if (success) {
      // Clear session
      await signOut({ redirect: false });
      
      // Navigate to landing page
      console.log("Wallet disconnected, redirecting to landing page...");
      router.push("/");
    }
  };
  
  // Use localStorage to persist sidebar state between page navigations
  useEffect(() => {
    // Load saved state on component mount
    const savedPinned = localStorage.getItem('sidebarPinned') === 'true';
    if (savedPinned) {
      setIsPinned(savedPinned);
      setIsCollapsed(false);
    }
  }, []);
  
  // Save pinned state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarPinned', isPinned.toString());
  }, [isPinned]);
  
  // Simplified mouse event handlers
  const handleMouseEnter = (): void => {
    if (!isPinned) {
      setIsCollapsed(false);
    }
  };
  
  const handleMouseLeave = (): void => {
    if (!isPinned) {
      setIsCollapsed(true);
    }
  };
  
  // Handle navigation click - collapse sidebar after navigation
  const handleNavClick = (href: string) => {
    router.push(href);
    if (!isPinned) {
      setIsCollapsed(true);
    }
  };
  
  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-zinc-800/30",
      )}
      data-sidebar="true"
      initial={false}
      animate={isCollapsed && !isPinned ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all`}
        variants={contentVariants}
      >
      
        
        {/* Rest of the sidebar content remains the same */}
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2" 
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
                            <p className="text-sm font-medium">
                              AXYZ
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/settings/members">
                        <UserCog className="h-4 w-4" /> Your Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/settings/integrations">
                        <Blocks className="h-4 w-4" /> Agent (upcoming)
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/select-org"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create a wallet
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <div className={cn("flex w-full flex-col gap-1 p-2")}>
                  {/* Primary Navigation */}
                  <Link
                    href="/home"
                    className={cn(
                      "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                      pathname === "/home" && "bg-muted text-blue-600",
                    )}
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
                      "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                      pathname === "/search" && "bg-muted text-blue-600",
                    )}
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
                  <Link
                    href="/generate"
                    className={cn(
                      "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                      pathname === "/generate" && "bg-muted text-blue-600",
                    )}
                  >
                    <Wand2 className="h-4 w-4" />
                    <motion.li variants={textVariants}>
                      {!isCollapsed && (
                        <div className="ml-2 flex items-center gap-2">
                          <p className="text-sm font-medium">Generate</p>
                          <Badge
                            className={cn(
                              "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-50 px-1.5 text-blue-600 dark:bg-blue-700 dark:text-blue-300",
                            )}
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
                      "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                      pathname === "/agent-upcoming" && "bg-muted text-blue-600",
                    )}
                  >
                    <Code className="h-4 w-4" />
                    <motion.li variants={textVariants}>
                      {!isCollapsed && (
                        <div className="flex items-center gap-2">
                          <p className="ml-2 text-sm font-medium">Agent</p>
                          <Badge
                            className={cn(
                              "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-50 px-1.5 text-blue-600 dark:bg-blue-700 dark:text-blue-300",
                            )}
                            variant="default"
                          >
                            Upcoming
                          </Badge>
                        </div>
                      )}
                    </motion.li>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col p-2 gap-2">
                {/* Feedback Component */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex w-full h-8 items-center justify-start px-2 py-1.5 rounded-md hover:bg-muted hover:text-primary"
                  onClick={() => document.querySelector('.feedback-trigger')?.dispatchEvent(new MouseEvent('click'))}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <motion.li variants={textVariants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">Feedback</p>
                    )}
                  </motion.li>
                </Button>
                
                {/* Hidden trigger for feedback component */}
                <div className="hidden">
                  <FeedbackComponent />
                </div>
                
                {/* Wallet connection */}
          
                
                {/* Wallet disconnect button - only shows when connected */}
                {connected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-full h-8 items-center justify-start px-2 py-1.5 rounded-md hover:bg-muted hover:text-red-500 mt-1"
                    onClick={handleDisconnect}
                  >
                    <Wallet className="h-4 w-4 shrink-0" />
                    <motion.li variants={textVariants}>
                      {!isCollapsed && (
                        <p className="ml-2 text-sm font-medium">Disconnect Wallet</p>
                      )}
                    </motion.li>
                  </Button>
                )}
                
                {/* Hidden trigger for wallet component */}
                <div className="hidden">
                  <button className="wallet-connect-trigger">
                    {!isCollapsed && <ConnectionModal />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}