"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { LayoutGroup, motion } from "framer-motion"
import { TextScrambleRotate } from "./hero/text-scramble-rotate"
import Floating, { FloatingElement } from "./hero/parallax-floating"
import { ActionButtons } from "../ActionButtons"
import { StarBorder } from "./hero/star-border"
import { 
  ArrowUpRight, 
  BarChart3, 
  Coins, 
  DollarSign, 
  Globe, 
  LineChart, 
  Lock, 
  Repeat, 
  Search, 
  Shield, 
  Sparkles, 
  Zap 
} from "lucide-react"

function HeroSection() {
  return (
    <section className="w-full h-screen overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative">
      {/* Star Border Button - fixed for mobile */}
      <motion.div
        className="absolute top-4 sm:top-[-30px] z-80"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StarBorder className="font-medium">
          <Sparkles className="w-4 h-4 inline mr-1" /> Introducing AXYZ Trading
        </StarBorder>
      </motion.div>

       
        {/* Top left icons */}
        <FloatingElement depth={0.5} className="top-[15%] left-[5%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-3 hover:scale-110 duration-200 cursor-pointer transition-transform"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.3 }}
            whileHover={{ opacity: 1 }}
          >
            <Coins className="w-6 h-6 text-primary" />
          </motion.div>
        </FloatingElement>

        <Floating sensitivity={-0.5} className="h-full">
        {/* Top left icons - removing one block from upper area */}
        <FloatingElement depth={1} className="top-[8%] left-[15%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-4 hover:scale-110 duration-200 cursor-pointer transition-transform rotate-[5deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.5 }}
            whileHover={{ opacity: 1 }}
          >
            <LineChart className="w-8 h-8 text-green-500" />
          </motion.div>
        </FloatingElement>

        <FloatingElement depth={2} className="top-[25%] left-[3%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-2 hover:scale-110 duration-200 cursor-pointer transition-transform -rotate-[8deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            <Zap className="w-5 h-5 text-yellow-500" />
          </motion.div>
        </FloatingElement>

        {/* Bottom left icons */}
        <FloatingElement depth={3} className="bottom-[20%] left-[8%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-5 hover:scale-110 duration-200 cursor-pointer transition-transform rotate-[12deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.9 }}
            whileHover={{ opacity: 1 }}
          >
            <Shield className="w-10 h-10 text-blue-500" />
          </motion.div>
        </FloatingElement>

        <FloatingElement depth={1.5} className="bottom-[35%] left-[18%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-3 hover:scale-110 duration-200 cursor-pointer transition-transform -rotate-[3deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.1 }}
            whileHover={{ opacity: 1 }}
          >
            <Lock className="w-6 h-6 text-purple-500" />
          </motion.div>
        </FloatingElement>

        {/* Top right icons */}
        <FloatingElement depth={2} className="top-[10%] right-[10%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-4 hover:scale-110 duration-200 cursor-pointer transition-transform rotate-[8deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.4 }}
            whileHover={{ opacity: 1 }}
          >
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </motion.div>
        </FloatingElement>

        <FloatingElement depth={1} className="top-[25%] right-[5%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-2 hover:scale-110 duration-200 cursor-pointer transition-transform -rotate-[5deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.6 }}
            whileHover={{ opacity: 1 }}
          >
            <Search className="w-5 h-5 text-cyan-500" />
          </motion.div>
        </FloatingElement>

        {/* Bottom right icons */}
        <FloatingElement depth={3} className="bottom-[15%] right-[12%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-5 hover:scale-110 duration-200 cursor-pointer transition-transform -rotate-[10deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <Globe className="w-10 h-10 text-blue-400" />
          </motion.div>
        </FloatingElement>

        <FloatingElement depth={2.5} className="bottom-[30%] right-[5%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-3 hover:scale-110 duration-200 cursor-pointer transition-transform rotate-[6deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.0 }}
            whileHover={{ opacity: 1 }}
          >
            <Repeat className="w-6 h-6 text-green-400" />
          </motion.div>
        </FloatingElement>

        {/* Center-ish icons */}
        <FloatingElement depth={1.2} className="top-[40%] left-[30%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-2 hover:scale-110 duration-200 cursor-pointer transition-transform rotate-[15deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.2 }}
            whileHover={{ opacity: 1 }}
          >
            <DollarSign className="w-5 h-5 text-green-600" />
          </motion.div>
        </FloatingElement>

        <FloatingElement depth={1.8} className="bottom-[45%] right-[30%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-2 hover:scale-110 duration-200 cursor-pointer transition-transform -rotate-[12deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.3 }}
            whileHover={{ opacity: 1 }}
          >
            <ArrowUpRight className="w-5 h-5 text-red-500" />
          </motion.div>
        </FloatingElement>

        <FloatingElement depth={0.8} className="top-[60%] left-[40%]">
          <motion.div
            className="flex items-center justify-center bg-background/20 backdrop-blur-sm border border-border/30 shadow-xl rounded-xl p-3 hover:scale-110 duration-200 cursor-pointer transition-transform rotate-[4deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.4 }}
            whileHover={{ opacity: 1 }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </FloatingElement>
      </Floating>

      <div className="flex flex-col justify-center items-center w-[250px] sm:w-[300px] md:w-[500px] lg:w-[700px] z-50 pointer-events-auto mt-[-240px]">
        <motion.h1
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight font-calendas tracking-tight mt-8"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
        >
          <span className="mb-1 md:mb-1">Trade with </span>
          <LayoutGroup>
            <motion.span 
              layout 
              className="flex whitespace-pre items-center overflow-visible h-auto min-h-[1.2em] pb-1.2 mb-1.2"
              style={{ position: 'relative', zIndex: 100 }}
            >
              <motion.span
                layout
                className="flex whitespace-pre"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                AXYZ{" "}
              </motion.span>
              <TextScrambleRotate
                texts={[
                  "Securely🔐",
                  "Confidently😏", 
                  "Instantly🚀",
                  "Efficiently",
                  "Seamlessly",
                  "Intelligently",
                  "Powerfully",
                  "Globally🌐",
                  "Reliably🫆",
                ]}
                className="inline-flex text-primary"
                rotationInterval={3000}
                scrambleDuration={0.6}
                scrambleSpeed={0.03}
              />
            </motion.span>
          </LayoutGroup>
        </motion.h1>
        <motion.p
          className="text-sm sm:text-lg md:text-xl lg:text-2xl text-center font-overusedGrotesk pt-4 sm:pt-8 md:pt-10 lg:pt-12"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.5 }}
        >
          The next-generation trading platform built on Solana. Fast, secure, and designed for serious Copy traders.
        </motion.p>

        <div className="flex flex-row justify-center items-center mt-10 sm:mt-16 md:mt-20 lg:mt-20 text-xs">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              delay: 0.7,
              scale: { duration: 0.2 },
            }}
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", damping: 30, stiffness: 400 },
            }}
          >
            <ActionButtons />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export { HeroSection }