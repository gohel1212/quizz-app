'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    const data = sessionStorage.getItem('quizResult');
    if (!data) { router.replace('/'); return; }
    setResult(JSON.parse(data));
  }, []);

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/certificate?leadId=${result.leadId}`);
      if (!res.ok) throw new Error('Certificate request failed');
      const svgText = await res.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = svgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      URL.revokeObjectURL(svgUrl);

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${result.name.replace(/\s+/g, '-')}.pdf`);
    } catch {
      alert('Failed to download certificate. Please try again.');
    }
    setDownloading(false);
  };

  if (!result) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(248,111,3,0.2)', borderTopColor: 'var(--brand-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const passed = result.passed;
  const scorePercent = Math.round((result.score / result.total) * 100);

  return (
    <main className="app-bg" style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Score circle */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: passed ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            boxShadow: passed ? '0 16px 40px rgba(34,197,94,0.35)' : '0 16px 40px rgba(239,68,68,0.3)',
          }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'white', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {result.score}
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>/ {result.total}</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
            fontWeight: '700',
            color: passed ? '#16a34a' : '#dc2626',
            marginBottom: '8px',
          }}>
            {passed ? '🎉 Congratulations!' : '😔 Not Quite Yet'}
          </h1>

          <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>
            {passed
              ? `You scored ${result.score}/${result.total} and passed the StackCode Career Quiz!`
              : `You scored ${result.score}/${result.total}. You needed ${result.passScore} to pass.`
            }
          </p>
        </div>

        {/* Result card */}
        <div className="animate-fade-up stagger-1" style={{
          background: 'white', borderRadius: '24px', padding: '28px',
          border: `1.5px solid ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`,
          boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
          marginBottom: '20px',
        }}>
          {/* Score bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>Your Score</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: passed ? '#16a34a' : '#dc2626' }}>
                {scorePercent}%
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                width: `${scorePercent}%`, height: '100%', borderRadius: '99px',
                background: passed ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                transition: 'width 1s ease',
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Correct', value: result.score, color: '#16a34a' },
              { label: 'Incorrect', value: result.total - result.score, color: '#dc2626' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color, fontFamily: 'var(--font-display)' }}>{value}</div>
                <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Status message */}
          <div style={{
            borderRadius: '14px', padding: '20px',
            background: passed ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.04)',
            border: `1.5px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
          }}>
            {passed ? (
              <>
                <h3 style={{ fontWeight: '600', color: '#15803d', marginBottom: '6px', fontSize: '15px' }}>
                  🎓 You've earned your certificate!
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>
                  Download your participation certificate below.
                </p>
              </>
            ) : (
              <>
                <h3 style={{ fontWeight: '600', color: '#991b1b', marginBottom: '6px', fontSize: '15px' }}>
                  📚 Keep Learning!
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>
                  You attempted this quiz and received your participation certificate. Keep learning and growing your career knowledge!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="animate-fade-up stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            className="btn-primary"
            onClick={downloadCertificate}
            disabled={downloading}
          >
            {downloading ? 'Generating Certificate...' : '📜 Download Certificate'}
          </button>

        </div>

        {/* Share nudge */}
        <div className="animate-fade-up stagger-3" style={{
          textAlign: 'center', marginTop: '32px', padding: '20px',
          background: 'rgba(0,0,0,0.03)', borderRadius: '16px',
        }}>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.55)', lineHeight: 1.6 }}>
            Share your achievement on LinkedIn and inspire others to test their career readiness! 🚀
          </p>
        </div>
      </div>
    </main>
  );
}
