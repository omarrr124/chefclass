import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function Chef() {
  const ref = useRef(null)
  const { t } = useLanguage()
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const yText = useTransform(scrollYProgress, [0, 1], [80, 0])
  const yImage = useTransform(scrollYProgress, [0, 1], [120, 0])
  const yBg = useTransform(scrollYProgress, [0, 1], [-50, 50])

  return (
    <div ref={ref} className="px-6 md:px-8 max-w-[1100px] relative mx-auto flex flex-col justify-center h-full pt-16 md:pt-0">
      <motion.h1 style={{ opacity, y: yText }} className="page-title text-center text-4xl md:text-5xl mb-12">
        {t('chef.title')}
      </motion.h1>
      
      <div className="flex gap-12 md:gap-16 items-center flex-wrap-reverse justify-center">
        <motion.div className="flex-1 min-w-[300px] max-w-[550px]" style={{ opacity, y: yText }}>
          <div className="glass-card p-6 md:p-10 relative z-10 border-l-4 border-[var(--primary)]">
            <h2 className="heading" style={{ fontSize: '2.8rem', fontWeight: '600', color: 'rgb(212, 182, 60)', marginBottom: '0.2rem', lineHeight: '1.2' }}>{t('chef.name')}</h2>
            <div style={{ fontSize: '1rem', fontStyle: 'italic', letterSpacing: '3px', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '2px solid rgba(212, 175, 55, 0.1)', display: 'inline-block', paddingBottom: '0.3rem' }}>
              {t('chef.role')}
            </div>
            
            <div style={{ fontSize: '1.05rem', color: 'var(--text)', opacity: 0.85, lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                <strong style={{ color: 'var(--primary)', fontSize: '1.15rem', fontWeight: '600' }}>{t('chef.bio1Start')}</strong> {t('chef.bio1Rest')}
              </p>
              <p>
                {t('chef.bio2')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div style={{ flex: '0 0 auto', position: 'relative', display: 'flex', justifyContent: 'center', opacity, y: yImage }}>
          <motion.div style={{ y: yBg, position: 'absolute', width: '300px', height: '400px', backgroundColor: 'var(--secondary)', opacity: 0.25, borderRadius: '200px', transform: 'rotate(-15deg)', zIndex: 0, filter: 'blur(30px)' }}></motion.div>
          <div style={{ position: 'absolute', width: '150px', height: '150px', backgroundColor: 'var(--cta)', opacity: 0.3, borderRadius: '50%', top: '-10px', right: '-10px', zIndex: 0, filter: 'blur(40px)' }}></div>
          
          <motion.div 
            style={{ position: 'relative', zIndex: 1, padding: '1rem', backgroundColor: 'var(--panel-bg)', backdropFilter: 'blur(10px)', borderRadius: '200px 200px 15px 15px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow)' }}
            whileHover={{ scale: 1.05, rotateZ: 2, rotateX: 5, rotateY: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img 
              src="/muhammed.jpg" 
              alt="Muhammed El-Hmandi" 
              style={{ width: '260px', height: '360px', objectFit: 'cover', borderRadius: '200px 200px 8px 8px' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
