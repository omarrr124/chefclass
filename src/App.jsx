import { Utensils, Sun, Moon, LogOut, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { LanguageProvider, useLanguage } from './context/LanguageContext'

import Home from './pages/Home'
import CursorTrail from './CursorTrail'
import Chef from './pages/Chef'
import Recipes from './pages/Recipes'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'

const ProtectedRoute = ({ children, session }) => {
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return children
}

const PublicLayout = ({ children, isLightMode, setIsLightMode, isAdmin }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      <CursorTrail />
      <nav className="glass w-full md:w-[280px] md:h-screen md:fixed md:top-0 relative z-50 flex flex-col p-6 md:p-12">
        <div className="heading" style={{ 
          fontSize: '1.8rem', 
          fontWeight: '700', 
          color: 'var(--primary)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <Utensils size={28} /> {isAdmin ? t('nav.adminPanel') : 'ChefClass'}
        </div>
        <div className="flex flex-row md:flex-col gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0">
          <a href="/#home" className="nav-link whitespace-nowrap">{t('nav.home')}</a>
          <a href="/#chef" className="nav-link whitespace-nowrap">{t('nav.chef')}</a>
          <a href="/#recipes" className="nav-link whitespace-nowrap">{t('nav.pastries')}</a>
          {isAdmin && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
                <Utensils size={18} /> {t('nav.manageRecipes')}
              </button>
              <button onClick={handleLogout} style={{ background: 'none', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ef4444', textAlign: 'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <LogOut size={18} /> {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-auto mb-2 md:mb-8 md:pl-4 flex flex-col gap-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text)', opacity: 0.8, fontSize: '0.9rem', fontWeight: 600 }}>
            <span style={{ fontSize: '0.9rem' }}>{t('nav.theme')}</span>
            <input 
              type="checkbox" 
              id="darkmode-toggle" 
              checked={isLightMode} 
              onChange={() => setIsLightMode(!isLightMode)} 
            />
            <label htmlFor="darkmode-toggle" className="darkmode-label">
              <svg version="1.1" className="sun" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 496 496" xmlSpace="preserve">
                  <rect x="152.994" y="58.921" transform="matrix(0.3827 0.9239 -0.9239 0.3827 168.6176 -118.5145)" width="40.001" height="16" />
                  <rect x="46.9" y="164.979" transform="matrix(0.9239 0.3827 -0.3827 0.9239 71.29 -12.4346)" width="40.001" height="16" />
                  <rect x="46.947" y="315.048" transform="matrix(0.9239 -0.3827 0.3827 0.9239 -118.531 50.2116)" width="40.001" height="16" />
                  <rect x="164.966" y="409.112" transform="matrix(-0.9238 -0.3828 0.3828 -0.9238 168.4872 891.7491)" width="16" height="39.999" />
                  <rect x="303.031" y="421.036" transform="matrix(-0.3827 -0.9239 0.9239 -0.3827 50.2758 891.6655)" width="40.001" height="16" />
                  <rect x="409.088" y="315.018" transform="matrix(-0.9239 -0.3827 0.3827 -0.9239 701.898 785.6559)" width="40.001" height="16" />
                  <rect x="409.054" y="165.011" transform="matrix(-0.9239 0.3827 -0.3827 -0.9239 891.6585 168.6574)" width="40.001" height="16" />
                  <rect x="315.001" y="46.895" transform="matrix(0.9238 0.3828 -0.3828 0.9238 50.212 -118.5529)" width="16" height="39.999" />
                  <path d="M248,88c-88.224,0-160,71.776-160,160s71.776,160,160,160s160-71.776,160-160S336.224,88,248,88z M248,392 c-79.4,0-144-64.6-144-144s64.6-144,144-144s144,64.6,144,144S327.4,392,248,392z" />
                  <rect x="240" width="16" height="72" />
                  <rect x="62.097" y="90.096" transform="matrix(0.7071 0.7071 -0.7071 0.7071 98.0963 -40.6334)" width="71.999" height="16" />
                  <rect y="240" width="72" height="16" />
                  <rect x="90.091" y="361.915" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 -113.9157 748.643)" width="16" height="71.999" />
                  <rect x="240" y="424" width="16" height="72" />
                  <rect x="361.881" y="389.915" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 397.8562 960.6281)" width="71.999" height="16" />
                  <rect x="424" y="240" width="72" height="16" />
                  <rect x="389.911" y="62.091" transform="matrix(0.7071 0.7071 -0.7071 0.7071 185.9067 -252.6357)" width="16" height="71.999" />
              </svg>
              <svg version="1.1" className="moon" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 49.739 49.739" xmlSpace="preserve">
                  <path d="M25.068,48.889c-9.173,0-18.017-5.06-22.396-13.804C-3.373,23.008,1.164,8.467,13.003,1.979l2.061-1.129l-0.615,2.268 c-1.479,5.459-0.899,11.25,1.633,16.306c2.75,5.493,7.476,9.587,13.305,11.526c5.831,1.939,12.065,1.492,17.559-1.258v0 c0.25-0.125,0.492-0.258,0.734-0.391l2.061-1.13l-0.585,2.252c-1.863,6.873-6.577,12.639-12.933,15.822 C32.639,48.039,28.825,48.888,25.068,48.889z M12.002,4.936c-9.413,6.428-12.756,18.837-7.54,29.253 c5.678,11.34,19.522,15.945,30.864,10.268c5.154-2.582,9.136-7.012,11.181-12.357c-5.632,2.427-11.882,2.702-17.752,0.748 c-6.337-2.108-11.473-6.557-14.463-12.528C11.899,15.541,11.11,10.16,12.002,4.936z" />
              </svg>
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text)', opacity: 0.8, fontSize: '0.9rem', fontWeight: 600 }}>
            <Globe size={18} />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ background: 'var(--panel-bg)', color: 'var(--text)', border: '1px solid var(--glass-border)', padding: '0.2rem 0.5rem', borderRadius: '4px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
        <style>{`
          .nav-link {
            text-decoration: none;
            color: var(--text);
            font-weight: 500;
            font-size: 1.1rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0.7;
          }
          .nav-link:hover, .nav-link.active {
            opacity: 1;
            background: rgba(212, 175, 55, 0.1);
            color: var(--primary);
            transform: translateX(5px);
          }
        `}</style>
      </nav>
      <main className="flex-1 relative md:ml-[280px] flex flex-col">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
        <footer className="p-8 md:px-20 md:py-16 flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--panel-bg)] backdrop-blur-md border-t border-[rgba(212,175,55,0.1)] mt-auto">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Utensils size={20} /> {t('nav.home')}
            </div>
            <div style={{ color: 'var(--text)', opacity: 0.7, fontSize: '0.9rem' }}>
              &copy; {new Date().getFullYear()} ChefClass Patisserie. All rights reserved.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--primary)', opacity: 0.8 }}>
              <a href="https://www.instagram.com/med.hmanditch?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', fontWeight: '600', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity=1} onMouseLeave={e => e.target.style.opacity=0.8}>Instagram</a>
              <span style={{ opacity: 0.3 }}>|</span>
              <a href="https://www.facebook.com/share/1HtdedCWhm/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', fontWeight: '600', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity=1} onMouseLeave={e => e.target.style.opacity=0.8}>Facebook</a>
              <span style={{ opacity: 0.3 }}>|</span>
              <a href="https://wa.me/21690038740" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', fontWeight: '600', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity=1} onMouseLeave={e => e.target.style.opacity=0.8}>WhatsApp</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [isLightMode, setIsLightMode] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'light'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('theme-light')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.remove('theme-light')
      localStorage.setItem('theme', 'dark')
    }
  }, [isLightMode])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const MainContent = (
    <>
      <div id="home" className="min-h-screen flex flex-col">
        <Home />
      </div>
      <div id="chef" className="min-h-screen flex flex-col justify-center">
        <Chef />
      </div>
      <div id="recipes" className="min-h-screen flex flex-col">
        <Recipes />
      </div>
    </>
  )

  return (
    <LanguageProvider>
      <Routes>
          <Route path="/" element={<PublicLayout isLightMode={isLightMode} setIsLightMode={setIsLightMode}>{MainContent}</PublicLayout>} />
          <Route path="/login" element={<PublicLayout isLightMode={isLightMode} setIsLightMode={setIsLightMode}><Login /></PublicLayout>} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute session={session}>
                <PublicLayout isLightMode={isLightMode} setIsLightMode={setIsLightMode} isAdmin={true}>
                  <AdminDashboard />
                </PublicLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </LanguageProvider>
  )
}

export default App
