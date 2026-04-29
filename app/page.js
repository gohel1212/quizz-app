'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', college: '', mobile: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!/^[6-9][0-9]{9}$/.test(form.mobile.trim())) {
        setError('Please enter a valid 10-digit Indian mobile number.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mobile: form.mobile.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Store leadId in sessionStorage for quiz page
      sessionStorage.setItem('leadId', data.leadId);
      sessionStorage.setItem('leadName', form.name);
      router.push('/quiz');
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen app-bg">
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header badge */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'white', border: '1.5px solid rgba(248,111,3,0.3)',
            borderRadius: '99px', padding: '6px 16px',
            fontSize: '13px', fontWeight: '500', color: 'var(--brand-orange)',
            marginBottom: '24px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-orange)', display: 'inline-block' }} />
            StackCode · Career Quiz · Free Certificate
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 2.8rem)',
            fontWeight: '700',
            color: 'var(--brand-dark)',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}>
            Are your Career <em style={{ color: 'var(--brand-orange)', fontStyle: 'normal' }}>Ready.</em>
          </h1>

          <p style={{
            fontSize: '16px', color: 'rgba(0,0,0,0.65)',
            lineHeight: 1.7, maxWidth: '400px', margin: '0 auto',
          }}>
            Take the StackCode career quiz and earn a personalized participation certificate.
          </p>
        </div>

        {/* Stats row */}
        <div className="animate-fade-up stagger-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '32px',
        }}>
          {[
            { num: '10', label: 'Questions' },
            { num: '7/10', label: 'To Pass' },
            { num: '5 min', label: 'Duration' },
          ].map(({ num, label }) => (
            <div key={label} style={{
              background: 'white', borderRadius: '14px', padding: '16px 12px',
              textAlign: 'center', border: '1.5px solid rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--brand-dark)', fontFamily: 'var(--font-display)' }}>{num}</div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="animate-fade-up stagger-2" style={{
          background: '#000000', borderRadius: '24px', padding: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.18)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px', fontWeight: '600',
            marginBottom: '6px', color: 'white',
          }}>
            Enter Your Details
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.62)', marginBottom: '24px' }}>
            Your certificate will be generated with the name you provide below.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'white' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'white' }}>
                College / University *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. IIT Ahmedabad"
                value={form.college}
                onChange={e => setForm({ ...form, college: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'white' }}>
                Mobile Number *
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
                required
                pattern="[6-9][0-9]{9}"
                title="Please enter a valid 10-digit Indian mobile number"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'white' }}>
                Email Address *
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rahul@gmail.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '12px 16px',
                fontSize: '14px', color: '#dc2626',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Checking...' : 'Start the Quiz →'}
            </button>
          </form>
        </div>

        {/* Trust signals */}
        <div className="animate-fade-up stagger-3" style={{
          display: 'flex', justifyContent: 'center', gap: '24px',
          marginTop: '24px', flexWrap: 'wrap',
        }}>
          {['🎓 Free Certificate', '🔒 One Attempt Only'].map(t => (
            <span key={t} style={{ fontSize: '13px', color: 'rgba(0,0,0,0.55)' }}>{t}</span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: 'rgba(0,0,0,0.35)' }}>
          By continuing, you agree to be contacted about your results.
        </div>
      </div>
    </main>
  );
}
