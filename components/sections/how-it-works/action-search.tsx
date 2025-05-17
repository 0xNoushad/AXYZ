"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Send,
    BarChart2,
    ArrowRightLeft,
    Wallet,
    LineChart,
    Coins,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    description?: string;
    short?: string;
    end?: string;
    color?: string;
}

interface SearchResult {
    actions: Action[];
}

const allActions = [
    {
        id: "1",
        label: "Portfolio",
        icon: <BarChart2 className="h-4 w-4 text-purple-500" />,
        description: "Track Assets",
        short: "⌘P",
        end: "Dashboard",
        color: "purple",
    },
    {
        id: "2",
        label: "Swap",
        icon: <ArrowRightLeft className="h-4 w-4 text-green-500" />,
        description: "Fast & Secure",
        short: "⌘S",
        end: "Trade",
        color: "green",
    },
    {
        id: "3",
        label: "Agent",
        icon: <Search className="h-4 w-4 text-blue-500" />,
        description: "AI Assistant",
        short: "⌘A",
        end: "Help",
        color: "blue",
    },
    {
        id: "4",
        label: "Generate",
        icon: <Coins className="h-4 w-4 text-amber-500" />,
        description: "Trading Ideas",
        short: "⌘G",
        end: "Create",
        color: "amber",
    },
    {
        id: "5",
        label: "Wallet",
        icon: <Wallet className="h-4 w-4 text-rose-500" />,
        description: "Connect",
        short: "⌘W",
        end: "Account",
        color: "rose",
    },
];

function ActionSearchBar({ actions = allActions }: { actions?: Action[] }) {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        if (!isFocused) {
            setResult(null);
            return;
        }

        if (!debouncedQuery) {
            setResult({ actions: allActions });
            return;
        }

        const normalizedQuery = debouncedQuery.toLowerCase().trim();
        const filteredActions = allActions.filter((action) => {
            const searchableText = action.label.toLowerCase();
            return searchableText.includes(normalizedQuery);
        });

        setResult({ actions: filteredActions });
    }, [debouncedQuery, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsTyping(true);
    };

    const container = {
        hidden: { opacity: 0, height: 0 },
        show: {
            opacity: 1,
            height: "auto",
            transition: {
                height: {
                    duration: 0.4,
                },
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                height: {
                    duration: 0.3,
                },
                opacity: {
                    duration: 0.2,
                },
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2,
            },
        },
    };

    // Reset selectedAction when focusing the input
    const handleFocus = () => {
        setSelectedAction(null);
        setIsFocused(true);
    };

    const getColorClass = (color: string = "gray") => {
        const colorMap: Record<string, string> = {
            purple: "text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20",
            green: "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20",
            blue: "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
            amber: "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
            rose: "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20",
            gray: "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20",
        };
        
        return colorMap[color] || colorMap.gray;
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="relative flex flex-col justify-start items-center min-h-[300px]">
                <div className="w-full max-w-sm sticky top-0 bg-background z-10 pt-4 pb-1">
                    <label
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block"
                        htmlFor="search"
                    >
                        AXYZ Trading
                    </label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search trading options..."
                            value={query}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={() =>
                                setTimeout(() => setIsFocused(false), 200)
                            }
                            className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0 focus-visible:ring-green-500"
                        />
                        <motion.div 
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                            whileHover={{ scale: 1.2, rotate: 15 }}
                        >
                            <AnimatePresence mode="popLayout">
                                {query.length > 0 ? (
                                    <motion.div
                                        key="send"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Send className="w-4 h-4 text-green-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="search"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Search className="w-4 h-4 text-green-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                <div className="w-full max-w-sm">
                    <AnimatePresence>
                        {isFocused && result && !selectedAction && (
                            <motion.div
                                className="w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1"
                                variants={container}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <motion.ul>
                                    {result.actions.map((action) => (
                                        <motion.li
                                            key={action.id}
                                            className={`px-3 py-2 flex items-center justify-between cursor-pointer rounded-md ${action.color ? getColorClass(action.color) : ""}`}
                                            variants={item}
                                            layout
                                            whileHover={{ x: 3 }}
                                            onClick={() =>
                                                setSelectedAction(action)
                                            }
                                        >
                                            <div className="flex items-center gap-2 justify-between">
                                                <div className="flex items-center gap-2">
                                                    <motion.span
                                                        whileHover={{ 
                                                            scale: 1.3, 
                                                            rotate: 10,
                                                            transition: { duration: 0.2 } 
                                                        }}
                                                    >
                                                        {action.icon}
                                                    </motion.span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {action.label}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {action.description}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    {action.short}
                                                </span>
                                                <span className={`text-xs font-medium ${action.color ? `text-${action.color}-500` : "text-gray-500"}`}>
                                                    {action.end}
                                                </span>
                                            </div>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                                <div className="mt-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Press ⌘K to open trading menu</span>
                                        <span>ESC to cancel</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export { ActionSearchBar };
// Action interface is already exported in the initial declaration
