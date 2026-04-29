'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      sessionStorage.setItem('adminToken', data.token);
      router.push('/admin/dashboard');
    } catch {
      setError('Network error.'); setLoading(false);
    }
  };

  return (
    <main className="admin-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔐</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'white', marginBottom: '6px' }}>StackCode Admin</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Career Quiz CMS</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text" placeholder="Username"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              required
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 16px', color: 'white', fontSize: '15px', outline: 'none' }}
            />
            <input
              type="password" placeholder="Password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 16px', color: 'white', fontSize: '15px', outline: 'none' }}
            />
            {error && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              background: 'var(--brand-orange)', color: 'white', border: 'none',
              padding: '14px', borderRadius: '10px', fontWeight: '600', fontSize: '15px',
              cursor: 'pointer', marginTop: '4px',
            }}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
