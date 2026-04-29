'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [leadName, setLeadName] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const id = sessionStorage.getItem('leadId');
    const name = sessionStorage.getItem('leadName');
    if (!id) { router.replace('/'); return; }
    setLeadId(id);
    setLeadName(name || '');
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (loading || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitting]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch {
      setError('Failed to load questions. Please refresh.');
      setLoading(false);
    }
  };

  const handleSelect = (opt) => {
    if (submitting) return;
    setSelected(opt);
  };

  const handleNext = () => {
    if (selected === null) return;
    const q = questions[current];
    setAnswers(prev => ({ ...prev, [q.id]: selected }));

    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const id = sessionStorage.getItem('leadId');
    const finalAnswers = selected !== null
      ? { ...answers, [questions[current]?.id]: selected }
      : answers;

    try {
      const res = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id, answers: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed.');
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem('quizResult', JSON.stringify(data));
      router.push('/result');
    } catch {
      setError('Network error during submission.');
      setSubmitting(false);
    }
  }, [submitting, answers, selected, current, questions]);

  const isLastQuestion = current === questions.length - 1;
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (loading) return (
    <div className="app-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(248,111,3,0.2)', borderTopColor: 'var(--brand-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(0,0,0,0.5)' }}>Loading your quiz...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div className="app-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
        <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => router.push('/')}>Go Back</button>
      </div>
    </div>
  );

  if (!questions.length) return null;
  const q = questions[current];

  return (
    <main className="app-bg" style={{ minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>
            Hi, <strong style={{ color: 'var(--brand-dark)' }}>{leadName}</strong> 👋
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: timeLeft < 60 ? '#fef2f2' : 'white',
            border: `1.5px solid ${timeLeft < 60 ? '#fecaca' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '99px', padding: '6px 14px',
            fontSize: '14px', fontWeight: '600',
            color: timeLeft < 60 ? '#dc2626' : 'var(--brand-dark)',
          }}>
            ⏱ {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>
              Question {current + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-orange)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div key={current} className="animate-fade-up" style={{
          background: 'white', borderRadius: '24px', padding: '32px',
          border: '1.5px solid rgba(0,0,0,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(248,111,3,0.1)', color: 'var(--brand-orange)',
            borderRadius: '8px', padding: '4px 10px',
            fontSize: '12px', fontWeight: '600', marginBottom: '16px',
          }}>
            Q{current + 1}
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            fontWeight: '600', lineHeight: 1.5,
            color: 'var(--brand-dark)', marginBottom: '28px',
          }}>
            {q.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div
                key={opt}
                className={`quiz-option ${selected === opt ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '16px 18px', borderRadius: '14px',
                  background: selected === opt ? 'rgba(248,111,3,0.06)' : '#F4F4F4',
                  border: `2px solid ${selected === opt ? 'var(--brand-orange)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', flexShrink: 0,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selected === opt ? 'var(--brand-orange)' : 'white',
                  border: `1.5px solid ${selected === opt ? 'var(--brand-orange)' : 'rgba(0,0,0,0.2)'}`,
                  fontSize: '13px', fontWeight: '700',
                  color: selected === opt ? 'white' : 'rgba(0,0,0,0.6)',
                  transition: 'all 0.18s ease',
                }}>
                  {opt}
                </div>
                <span style={{ fontSize: '15px', lineHeight: 1.5, paddingTop: '3px', color: 'var(--brand-dark)' }}>
                  {q[`option${opt}`]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {current > 0 && (
            <button
              onClick={() => { setCurrent(c => c - 1); setSelected(answers[questions[current - 1]?.id] || null); }}
              style={{
                flex: '0 0 auto', padding: '14px 20px', borderRadius: '12px',
                background: 'white', border: '1.5px solid rgba(0,0,0,0.15)',
                cursor: 'pointer', fontSize: '15px', fontWeight: '500',
                color: 'var(--brand-dark)', transition: 'all 0.2s ease',
              }}
            >
              ← Back
            </button>
          )}

          {isLastQuestion ? (
            <button
              className="btn-primary"
              disabled={selected === null && !answers[q.id] || submitting}
              onClick={handleSubmit}
              style={{ flex: 1 }}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz 🎯'}
            </button>
          ) : (
            <button
              className="btn-primary"
              disabled={selected === null && !answers[q.id]}
              onClick={handleNext}
              style={{ flex: 1 }}
            >
              Next Question →
            </button>
          )}
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '24px', flexWrap: 'wrap' }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i === current ? 'var(--brand-orange)' : answers[questions[i]?.id] ? 'var(--brand-dark)' : 'rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
            }} />
          ))}
        </div>
      </div>
    </main>
  );
}
