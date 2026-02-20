import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/* ── Google Fonts (same as landing page) ── */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&family=Share+Tech+Mono&display=swap';
function injectFonts() {
  if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_HREF;
    document.head.appendChild(l);
  }
}

/* ── Keyframes (injected once) ── */
const KEYFRAMES = `
  @keyframes gridShift { 0%{background-position:0 0} 100%{background-position:40px 40px} }
  @keyframes hscan { 0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pillBlink { 0%,100%{opacity:.55} 50%{opacity:1} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .eq-input {
    width: 100%;
    background: rgba(0,10,5,.6);
    border: 1px solid rgba(0,255,180,.2);
    color: #fff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    padding: 11px 14px;
    outline: none;
    border-radius: 2px;
    transition: border-color .2s;
    box-sizing: border-box;
  }
  .eq-input::placeholder { color: rgba(255,255,255,.3); }
  .eq-input:focus { border-color: rgba(0,255,180,.6); box-shadow: 0 0 0 2px rgba(0,255,180,.08); }
  .eq-input.error { border-color: rgba(255,80,80,.6); }
  .eq-btn-primary {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg,#00ffb4 0%,#00d4ff 100%);
    color: #000;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
    transition: opacity .2s, transform .1s;
  }
  .eq-btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .eq-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  .eq-btn-google {
    width: 100%;
    padding: 11px 14px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.8);
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    letter-spacing: 1px;
    cursor: pointer;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background .2s, border-color .2s;
  }
  .eq-btn-google:hover:not(:disabled) { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.3); }
  .eq-btn-google:disabled { opacity: .5; cursor: not-allowed; }
  .eq-tab {
    flex: 1;
    padding: 10px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(255,255,255,.4);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: color .2s, border-color .2s;
  }
  .eq-tab.active { color: #00ffb4; border-bottom-color: #00ffb4; }
  .eq-tab:hover:not(.active) { color: rgba(255,255,255,.7); }
`;

export default function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    injectFonts();

    // Handle OAuth redirect — Supabase puts tokens in the URL hash
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Let Supabase parse the hash and establish the session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/learn', { replace: true });
        }
      });
      return;
    }

    // If already logged in, skip auth page
    if (user) navigate('/learn', { replace: true });
  }, [user, navigate]);

  function reset() {
    setError(''); setMessage('');
    setEmail(''); setPassword(''); setConfirmPassword(''); setFullName('');
  }

  function switchMode(m) { reset(); setMode(m); }

  /* ── Email / Password Auth ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage('');

    if (mode === 'signup') {
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate('/learn', { replace: true });
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (err) throw err;
        setMessage('Account created! Check your email to confirm before logging in.');
        setMode('login');
        setPassword(''); setConfirmPassword(''); setFullName('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setError(''); setGoogleLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/learn` },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  }

  /* ── Password Reset ── */
  async function handleForgotPassword() {
    if (!email) { setError('Enter your email above first.'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Styles ── */
  const S = {
    page: {
      background: '#000', width: '100vw', minHeight: '100vh',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Rajdhani', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    grid: {
      position: 'absolute', inset: 0, zIndex: 0,
      backgroundImage: 'linear-gradient(rgba(0,255,180,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,180,.04) 1px,transparent 1px)',
      backgroundSize: '40px 40px', animation: 'gridShift 20s linear infinite',
    },
    scanline: {
      position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
      background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px)',
    },
    hscan: {
      position: 'absolute', width: '100%', height: 2,
      background: 'linear-gradient(90deg,transparent,rgba(0,255,180,.35),transparent)',
      animation: 'hscan 8s ease-in-out infinite', zIndex: 2, pointerEvents: 'none',
    },
    orb1: { position:'absolute', borderRadius:'50%', filter:'blur(80px)', zIndex:0, width:500, height:500, background:'rgba(0,255,180,.05)', top:-150, left:-150 },
    orb2: { position:'absolute', borderRadius:'50%', filter:'blur(80px)', zIndex:0, width:400, height:400, background:'rgba(0,212,255,.04)', bottom:-100, right:-100 },
    bracket: (pos) => {
      const base = { position:'absolute', width:50, height:50, zIndex:10 };
      const b = {
        tl:{ top:20, left:20, borderTop:'2px solid #00ffb4', borderLeft:'2px solid #00ffb4' },
        tr:{ top:20, right:20, borderTop:'2px solid #00ffb4', borderRight:'2px solid #00ffb4' },
        bl:{ bottom:20, left:20, borderBottom:'2px solid #00ffb4', borderLeft:'2px solid #00ffb4' },
        br:{ bottom:20, right:20, borderBottom:'2px solid #00ffb4', borderRight:'2px solid #00ffb4' },
      };
      return { ...base, ...b[pos] };
    },
    card: {
      position: 'relative', zIndex: 10,
      width: '100%', maxWidth: 420,
      background: 'rgba(0,10,5,.82)',
      border: '1px solid rgba(0,255,180,.2)',
      backdropFilter: 'blur(16px)',
      padding: '36px 36px 32px',
      animation: 'fadeUp .7s ease both',
    },
    logo: {
      fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 22,
      background: 'linear-gradient(135deg,#00ffb4,#00d4ff)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 4, display: 'block', textAlign: 'center',
    },
    tagline: {
      fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
      color: 'rgba(0,255,180,.5)', letterSpacing: 4,
      textTransform: 'uppercase', textAlign: 'center', marginBottom: 28,
    },
    tabBar: {
      display: 'flex', borderBottom: '1px solid rgba(255,255,255,.08)',
      marginBottom: 24,
    },
    label: {
      display: 'block', fontFamily: "'Share Tech Mono', monospace",
      fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,.35)',
      textTransform: 'uppercase', marginBottom: 6,
    },
    field: { marginBottom: 16 },
    divider: {
      display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0',
    },
    divLine: { flex: 1, height: 1, background: 'rgba(255,255,255,.08)' },
    divText: { fontFamily:"'Share Tech Mono',monospace", fontSize: 10, color:'rgba(255,255,255,.25)', letterSpacing:2 },
    errorBox: {
      background: 'rgba(255,60,60,.08)', border:'1px solid rgba(255,60,60,.25)',
      color: '#ff8080', fontFamily:"'Rajdhani',sans-serif", fontSize:13,
      padding:'10px 14px', marginBottom:16, borderRadius:2, lineHeight:1.5,
    },
    messageBox: {
      background: 'rgba(0,255,180,.06)', border:'1px solid rgba(0,255,180,.25)',
      color:'#00ffb4', fontFamily:"'Rajdhani',sans-serif", fontSize:13,
      padding:'10px 14px', marginBottom:16, borderRadius:2, lineHeight:1.5,
    },
    forgotBtn: {
      background:'none', border:'none', color:'rgba(0,255,180,.5)',
      fontFamily:"'Share Tech Mono',monospace", fontSize:10, letterSpacing:2,
      cursor:'pointer', textDecoration:'underline', padding:0,
      display:'block', textAlign:'right', marginTop:6,
    },
    spinner: {
      width:14, height:14, border:'2px solid rgba(0,0,0,.3)',
      borderTop:'2px solid #000', borderRadius:'50%',
      animation:'spin .7s linear infinite', display:'inline-block', marginRight:8,
    },
    backBtn: {
      position:'absolute', top:20, left:20, zIndex:20,
      background:'none', border:'1px solid rgba(0,255,180,.2)',
      color:'rgba(0,255,180,.6)', fontFamily:"'Share Tech Mono',monospace",
      fontSize:10, letterSpacing:2, padding:'6px 14px', cursor:'pointer',
      borderRadius:2, transition:'all .2s',
    },
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={S.page}>
        <div style={S.grid} />
        <div style={S.scanline} />
        <div style={S.hscan} />
        <div style={S.orb1} /><div style={S.orb2} />
        <div style={S.bracket('tl')} /><div style={S.bracket('tr')} />
        <div style={S.bracket('bl')} /><div style={S.bracket('br')} />

        {/* Back to home */}
        <button style={S.backBtn} onClick={() => navigate('/')}>← HOME</button>

        {/* Auth card */}
        <div style={S.card}>
          {/* Logo */}
          <span style={S.logo}>EternalQuants</span>
          <div style={S.tagline}>// Quant Finance · Algo Edition</div>

          {/* Tabs */}
          <div style={S.tabBar}>
            <button
              className={`eq-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => switchMode('login')}
            >Sign In</button>
            <button
              className={`eq-tab${mode === 'signup' ? ' active' : ''}`}
              onClick={() => switchMode('signup')}
            >Sign Up</button>
          </div>

          {/* Error / message banners */}
          {error   && <div style={S.errorBox}>⚠ {error}</div>}
          {message && <div style={S.messageBox}>✓ {message}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <div style={S.field}>
                <label style={S.label}>Full Name</label>
                <input
                  className="eq-input"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div style={S.field}>
              <label style={S.label}>Email</label>
              <input
                className={`eq-input${error && !email ? ' error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={S.field}>
              <label style={S.label}>Password</label>
              <input
                className="eq-input"
                type="password"
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {mode === 'login' && (
                <button type="button" style={S.forgotBtn} onClick={handleForgotPassword}>
                  Forgot password?
                </button>
              )}
            </div>

            {mode === 'signup' && (
              <div style={S.field}>
                <label style={S.label}>Confirm Password</label>
                <input
                  className={`eq-input${error && password !== confirmPassword ? ' error' : ''}`}
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              className="eq-btn-primary"
              disabled={loading || googleLoading}
              style={{ marginTop: 4 }}
            >
              {loading
                ? <><span style={S.spinner} />{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</>
                : mode === 'login' ? 'Sign In →' : 'Create Account →'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={S.divider}>
            <div style={S.divLine} />
            <span style={S.divText}>OR</span>
            <div style={S.divLine} />
          </div>

          {/* Google OAuth */}
          <button
            className="eq-btn-google"
            onClick={handleGoogle}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <><span style={{ ...S.spinner, borderTopColor: 'rgba(255,255,255,.7)' }} />Redirecting...</>
            ) : (
              <>
                {/* Google "G" icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Switch mode hint */}
          <p style={{ textAlign:'center', marginTop:20, fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:'rgba(255,255,255,.35)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              style={{ background:'none', border:'none', color:'#00ffb4', cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontSize:13, textDecoration:'underline' }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
