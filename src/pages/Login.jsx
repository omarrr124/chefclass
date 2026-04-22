import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(t('login.invalid') || error.message)
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-8 min-h-[60vh]">
      <div className="glass-card w-full max-w-[400px] flex flex-col gap-6 md:gap-8 p-6 sm:p-8 md:p-12">
        <h1 className="heading text-center text-3xl md:text-[2.5rem]" style={{ color: 'var(--primary)' }}>{t('login.title')}</h1>
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold" style={{ color: 'var(--primary)' }}>{t('login.email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              style={{ borderColor: 'var(--glass-border)', background: 'var(--input-bg)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold" style={{ color: 'var(--primary)' }}>{t('login.password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              style={{ borderColor: 'var(--glass-border)', background: 'var(--input-bg)', color: 'var(--text)' }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2" 
            disabled={loading}
            style={{ border: 'none' }}
          >
            {loading ? '...' : t('login.enter')}
          </button>
        </form>
        
        <div className="text-center">
          <button onClick={() => navigate('/')} className="bg-transparent border-none cursor-pointer text-sm underline hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>
            &larr; {t('login.back')}
          </button>
        </div>
      </div>
    </div>
  )
}
