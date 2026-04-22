import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function Home() {
  const ref = useRef(null)
  const { t } = useLanguage()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  // varying scroll speeds for parallax effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 60])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -160])
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 120])
  
  const transforms = [y1, y2, y3, y4]

  return (
    <div ref={ref} className="flex flex-col xl:flex-row min-h-screen w-full relative">
      <div className="flex-1 p-6 pb-2 md:p-24 flex flex-col justify-center relative z-10 pt-16 md:pt-24 xl:max-w-[50%]">

        <motion.h1 
          className="heading" 
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'rgb(212, 182, 60)', lineHeight: '1.1', letterSpacing: '-1px', marginBottom: '1.2rem'}}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {t('home.title1')}<br/><span style={{ fontStyle: 'italic', fontWeight: 400 }}>{t('home.title2')}</span>
        </motion.h1>
        <motion.p 
          style={{ color: 'var(--text)', opacity: 0.8, fontSize: 'clamp(0.9rem, 2vw, 1.15rem)', marginBottom: '2rem', maxWidth: '450px', lineHeight: '1.6' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {t('home.subtitle')}
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-16 xl:mb-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <a href="#recipes" className="btn btn-primary shadow-lg shadow-amber-500/20 w-full sm:w-auto">{t('home.startBaking')} &rarr;</a>
          <a href="#chef" className="btn btn-glass w-full sm:w-auto">{t('home.meetChef')}</a>
        </motion.div>
        
      </div>
      
      {/* Soft gradient orb in background */}
      <div className="absolute right-0 top-[10%] md:right-[10%] md:top-[20%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] z-0 opacity-50 md:opacity-100" style={{ background: 'radial-gradient(circle, rgba(0, 0, 0, 0.6) 0%, rgba(15, 20, 25, 0) 70%)', filter: 'blur(40px)' }}></div>

      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      <div className="flex-1 w-full pl-6 pr-6 md:p-20 xl:p-20 xl:pl-0 mt-2 md:mt-0 flex md:grid flex-row md:grid-cols-2 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scroll z-10 perspective-[1000px] mb-8 md:mb-0 pb-4 md:pb-0 items-center">
        {['/bakery-1.jpg', '/bakery-2.jpg', '/bakery-3.jpg', '/bakery-4.jpg'].map((src, i) => (
          <motion.div 
            key={i} 
            className="glass-card flex-none w-[65vw] sm:w-[260px] md:w-auto snap-center aspect-[4/5] md:aspect-auto" 
            style={{ 
              overflow: 'hidden', 
              height: window.innerWidth > 768 ? (i % 2 === 0 ? '300px' : '340px') : 'auto', 
              marginTop: window.innerWidth > 768 ? (i % 2 === 0 ? '40px' : '0px') : '0px',
              y: transforms[i]
            }}
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 * i, type: "spring", stiffness: 50 }}
            whileHover={{ 
              scale: 1.05, 
              rotateX: i % 2 === 0 ? 5 : -5, 
              rotateY: i % 2 === 0 ? -5 : 5, 
              boxShadow: '0 25px 50px -12px rgba(212, 175, 55, 0.25)',
              zIndex: 10
            }}
          >
            <motion.img 
              src={src} 
              alt={`Bakery Item ${i + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }} 
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
