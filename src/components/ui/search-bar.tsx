"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Search, CircleDot, History, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
)

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  currentQuery?: string
}

const SearchBar = ({ placeholder = "Search...", onSearch, currentQuery = "" }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState(currentQuery)
  const [isAnimating, setIsAnimating] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isClicked, setIsClicked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setSearchQuery(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    const saved = localStorage.getItem('recipe_search_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      setSuggestions(history.filter(h => h.toLowerCase().includes(searchQuery.toLowerCase())))
    } else {
      setSuggestions(history)
    }
  }, [searchQuery, history])

  const saveToHistory = (query: string) => {
    if (!query.trim()) return
    const updated = [query, ...history.filter(q => q !== query)].slice(0, 5)
    setHistory(updated)
    localStorage.setItem('recipe_search_history', JSON.stringify(updated))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('recipe_search_history')
  }

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")
    const isChromeOniOS = ua.includes("crios")
    return isSafari || isChromeOniOS
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Bubble up immediately
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery)
      saveToHistory(searchQuery)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 800)
  }

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  }

  const suggestionVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: i * 0.05 },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 15, delay: i * 0.07 },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: i * 0.03 },
    }),
  }

  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0 }}
      animate={{
        x: [0, (Math.random() - 0.5) * 40],
        y: [0, (Math.random() - 0.5) * 40],
        scale: [0, Math.random() * 0.8 + 0.4],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: Math.random() * 1.5 + 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
      className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: "blur(2px)",
      }}
    />
  ))

  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => (
        <motion.div
          key={`click-${i}`}
          initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
          animate={{
            x: mousePosition.x + (Math.random() - 0.5) * 160,
            y: mousePosition.y + (Math.random() - 0.5) * 160,
            scale: Math.random() * 0.8 + 0.2,
            opacity: [1, 0],
          }}
          transition={{ duration: Math.random() * 0.8 + 0.5, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(255, ${Math.floor(Math.random() * 100) + 155}, 0, 0.8)`,
            boxShadow: "0 0 8px rgba(255, 215, 0, 0.8)",
          }}
        />
      ))
    : null

  return (
    <div className="relative z-10 w-fit">
      <GooeyFilter />
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center w-full mx-auto"
        initial={{ width: "240px" }}
        animate={{ width: isFocused ? "340px" : "240px", scale: isFocused ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md",
            isFocused ? "border-transparent shadow-xl" : ""
          )}
          style={{
            background: isFocused ? "var(--panel-solid)" : "var(--panel-bg)",
            borderColor: isFocused ? "transparent" : "var(--glass-border)"
          }}
          animate={{
            boxShadow: isClicked
              ? "0 0 40px rgba(212, 175, 55, 0.5), 0 0 15px rgba(245, 158, 11, 0.7) inset"
              : isFocused
              ? "0 15px 35px rgba(0, 0, 0, 0.5)"
              : "0 0 0 rgba(0, 0, 0, 0)",
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.15,
                background: [
                  "linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%)",
                  "linear-gradient(90deg, #F3E5AB 0%, #D4AF37 100%)",
                  "linear-gradient(90deg, #F59E0B 0%, #D97706 100%)",
                  "linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%)",
                ],
              }}
              transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
          >
            {particles}
          </div>

          {isClicked && (
            <>
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-amber-400/10"
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-white dark:bg-white/20"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </>
          )}

          {clickParticles}

          <motion.div className="pl-4 py-3" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                isAnimating ? "text-amber-400" : isFocused ? "text-amber-500" : ""
              )}
              style={{ color: isAnimating ? undefined : isFocused ? undefined : 'var(--text-muted)' }}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className={cn(
              "w-full py-3 bg-transparent outline-none font-medium text-base relative z-10",
              isFocused ? "tracking-wide" : ""
            )}
            style={{ fontFamily: 'inherit', color: 'var(--text)' }}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{
                  scale: 1.05,
                  background: "linear-gradient(45deg, #D4AF37 0%, #D97706 100%)",
                  boxShadow: "0 10px 25px -5px rgba(212, 175, 55, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 mr-2 text-sm font-medium rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black backdrop-blur-sm transition-all shadow-lg"
              >
                Search
              </motion.button>
            )}
          </AnimatePresence>

          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.1, 0.2, 0.1, 0],
                background: "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.4) 0%, transparent 70%)",
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          )}
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 w-full mt-2 overflow-hidden backdrop-blur-md rounded-lg shadow-xl border"
            style={{
              background: 'var(--panel-solid)',
              borderColor: 'var(--glass-border)',
              maxHeight: "300px",
              overflowY: "auto",
              filter: isUnsupportedBrowser ? "none" : "drop-shadow(0 15px 15px rgba(0,0,0,0.2))",
            }}
          >
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  custom={index}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setSearchQuery(suggestion)
                    if (onSearch) onSearch(suggestion)
                    saveToHistory(suggestion)
                    setIsFocused(false)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md hover:bg-amber-500/20 group transition-colors"
                >
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.06 }}>
                    <History size={14} className="text-amber-500/60 group-hover:text-amber-500" />
                  </motion.div>
                  <motion.span
                    className="font-medium flex-1 text-sm transition-colors"
                    style={{ color: 'var(--text)' }}
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    {suggestion}
                  </motion.span>
                  <div 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const updated = history.filter(h => h !== suggestion)
                      setHistory(updated)
                      localStorage.setItem('recipe_search_history', JSON.stringify(updated))
                    }}
                  >
                    <X size={14} className="text-gray-500 hover:text-red-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
              {suggestions.length > 0 && !searchQuery.trim() && (
                <div 
                  onMouseDown={(e) => { e.preventDefault(); clearHistory(); }}
                  className="text-center text-xs text-amber-500/50 hover:text-amber-400 cursor-pointer mt-3 mb-1 pb-1 uppercase tracking-wider font-semibold transition-colors"
                >
                  Clear search history
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SearchBar }
