'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const tabs = ['CRM', 'Leads', 'Questions', 'Settings'];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('Leads');
  const [leads, setLeads] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState({ passScore: 7, demoLink: '', quizTitle: 'StackCode Career Quiz' });
  const [stats, setStats] = useState({ total: 0, passed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [editQ, setEditQ] = useState(null);
  const [qForm, setQForm] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', order: 0 });
  const [filter, setFilter] = useState('all');
  const [saveMsg, setSaveMsg] = useState('');

  // CRM state
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [editCrmLead, setEditCrmLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteMessage, setNewNoteMessage] = useState('');
  const crmStages = ['Prospect', 'Online Counselling', 'Offline Counselling', 'Hot Leads', 'Cold Leads', 'Enrolled', 'Lost'];

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : null;

  useEffect(() => {
    if (!token) { router.replace('/admin'); return; }
    fetchAll();
  }, []);

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    const [lr, qr, sr] = await Promise.all([
      fetch('/api/admin/leads', { headers: authHeaders }),
      fetch('/api/admin/questions', { headers: authHeaders }),
      fetch('/api/admin/settings', { headers: authHeaders }),
    ]);
    if (lr.status === 401) { router.replace('/admin'); return; }
    const [ld, qd, sd] = await Promise.all([lr.json(), qr.json(), sr.json()]);
    setLeads(ld.leads || []);
    setQuestions(qd.questions || []);
    setSettings(sd.settings || settings);
    const passed = (ld.leads || []).filter(l => l.attempt?.passed).length;
    const total = (ld.leads || []).filter(l => l.attempt).length;
    setStats({ total, passed, failed: total - passed });
    setLoading(false);
  };

  const saveQuestion = async () => {
    const method = editQ === 'new' ? 'POST' : 'PUT';
    const url = editQ === 'new' ? '/api/admin/questions' : `/api/admin/questions/${editQ}`;
    await fetch(url, { method, headers: authHeaders, body: JSON.stringify(qForm) });
    setEditQ(null);
    fetchAll();
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchAll();
  };

  const deleteLead = async (id, name) => {
    if (!confirm(`Delete lead for ${name}? This will also remove their quiz attempt and certificate record.`)) return;
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchAll();
  };

  const saveSettings = async () => {
    await fetch('/api/admin/settings', { method: 'PUT', headers: authHeaders, body: JSON.stringify(settings) });
    setSaveMsg('Settings saved!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const updateLeadStage = async (leadId, newStage) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l);
    setLeads(updated); // Optimistic UI update
    await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ stage: newStage }),
    });
    fetchAll();
  };

  const updateLeadCrmDetails = async () => {
    if (!editCrmLead) return;
    const { id, description, lastContact } = editCrmLead;
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ description, lastContact }),
    });
    setEditCrmLead(null);
    fetchAll();
  };

  const submitNote = async (leadId) => {
    if (!newNoteMessage.trim()) return;
    const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ message: newNoteMessage })
    });
    if (res.ok) {
      const { note } = await res.json();
      setEditCrmLead(prev => ({ ...prev, notes: [note, ...(prev.notes || [])] }));
      setNewNoteMessage('');
      fetchAll();
    }
  };

  const exportCSV = () => {
    const rows = [['Name', 'College', 'Mobile', 'Email', 'Score', 'Status', 'Date']];
    leads.forEach(l => rows.push([
      l.name, l.college, l.mobile, l.email,
      l.attempt ? `${l.attempt.score}/${l.attempt.totalQ}` : 'Not attempted',
      l.attempt ? (l.attempt.passed ? 'PASSED' : 'FAILED') : '-',
      new Date(l.createdAt).toLocaleDateString(),
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  };

  const filteredLeads = leads.filter(l => {
    if (filter === 'passed') return l.attempt?.passed;
    if (filter === 'failed') return l.attempt && !l.attempt.passed;
    if (filter === 'attempted') return !!l.attempt;
    return true;
  });

  const crmFilteredLeads = leads.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.mobile?.includes(q));
  });

  const sidebarStyle = {
    background: 'var(--brand-dark)', width: '220px', minHeight: '100vh',
    padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
    position: 'fixed', top: 0, left: 0,
  };

  if (loading) return (
    <div className="dashboard-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(0,0,0,0.4)' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="dashboard-bg" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--brand-orange)', letterSpacing: '0.05em', marginBottom: '4px' }}>STACKCODE</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Career Quiz Admin</div>
        </div>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: tab === t ? 'rgba(248,111,3,0.15)' : 'transparent',
            color: tab === t ? 'var(--brand-orange)' : 'rgba(255,255,255,0.55)',
            fontWeight: tab === t ? '600' : '400', fontSize: '14px', transition: 'all 0.15s',
          }}>
            {t === 'CRM' ? '📊' : t === 'Leads' ? '👥' : t === 'Questions' ? '❓' : '⚙️'} {t}
          </button>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => { sessionStorage.removeItem('adminToken'); router.push('/admin'); }} style={{
            textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.3)', fontSize: '13px', width: '100%',
          }}>
            → Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '32px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Attempts', value: stats.total, color: 'var(--brand-dark)' },
            { label: 'Passed 🎉', value: stats.passed, color: '#16a34a' },
            { label: 'Failed', value: stats.failed, color: '#dc2626' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color, fontFamily: 'var(--font-display)' }}>{value}</div>
              <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CRM TAB */}
        {tab === 'CRM' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 180px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: 0 }}>Lead Pipeline CRM</h2>
              <input
                type="text"
                placeholder="Search leads by name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)',
                  fontSize: '14px', width: '300px', outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, paddingBottom: '16px' }}>
              {crmStages.map(stage => {
                const stageLeads = crmFilteredLeads.filter(l => (l.stage || 'Prospect') === stage);
                return (
                <div
                  key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedLeadId) {
                      updateLeadStage(draggedLeadId, stage);
                      setDraggedLeadId(null);
                    }
                  }}
                  style={{
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '16px',
                    width: '320px',
                    minWidth: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: '600', fontSize: '15px', color: 'var(--brand-dark)' }}>
                    {stage} ({stageLeads.length})
                  </div>
                  <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => setDraggedLeadId(lead.id)}
                        onDragEnd={() => setDraggedLeadId(null)}
                        onClick={() => { setEditCrmLead({ ...lead, lastContact: lead.lastContact ? lead.lastContact.split('T')[0] : '' }); setNewNoteMessage(''); }}
                        style={{
                          background: 'white',
                          padding: '16px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          cursor: 'grab',
                        }}
                      >
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{lead.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)', marginBottom: '8px' }}>{lead.mobile}</div>
                        {lead.college && <div style={{ fontSize: '11px', background: 'rgba(0,0,0,0.04)', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>{lead.college}</div>}
                        
                        {((lead.notes && lead.notes.length > 0) || lead.description || lead.lastContact) && (
                          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px', marginTop: '4px' }}>
                            {lead.notes && lead.notes.length > 0 && <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', marginBottom: '4px' }}>💬 {lead.notes.length} notes</div>}
                            {!lead.notes?.length && lead.description && <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.description}</div>}
                            {lead.lastContact && <div style={{ fontSize: '11px', color: 'var(--brand-orange)', marginTop: '4px', fontWeight: '500' }}>Last Contact: {new Date(lead.lastContact).toLocaleDateString()}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )})}
            </div>

            {/* Edit CRM Lead Modal */}
            {editCrmLead && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '500px', maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{editCrmLead.name}'s Profile</h3>
                    <button onClick={() => setEditCrmLead(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Notes History */}
                    <div>
                      <h4 style={{ fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '8px' }}>Conversation History</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '12px' }}>
                        {!editCrmLead.notes || editCrmLead.notes.length === 0 ? (
                          <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)', textAlign: 'center', margin: 0 }}>No notes yet.</p>
                        ) : (
                          editCrmLead.notes.map(note => (
                            <div key={note.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <strong style={{ fontSize: '13px' }}>{note.author}</strong>
                                <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)' }}>{new Date(note.createdAt).toLocaleString()}</span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.7)', whiteSpace: 'pre-wrap' }}>{note.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Note Form */}
                    <div>
                      <textarea
                        value={newNoteMessage}
                        onChange={(e) => setNewNoteMessage(e.target.value)}
                        placeholder="Type a new note here..."
                        rows={3}
                        style={{ width: '100%', padding: '12px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '14px', resize: 'vertical', marginBottom: '8px' }}
                      />
                      <button onClick={() => submitNote(editCrmLead.id)} style={{ background: 'var(--brand-orange)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                        Post Note
                      </button>
                    </div>

                    {/* Legacy Fields */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Legacy Description</label>
                        <textarea
                          value={editCrmLead.description || ''}
                          onChange={e => setEditCrmLead({ ...editCrmLead, description: e.target.value })}
                          rows={2}
                          style={{ width: '100%', padding: '10px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '13px', resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Last Contact Date</label>
                        <input
                          type="date"
                          value={editCrmLead.lastContact || ''}
                          onChange={e => setEditCrmLead({ ...editCrmLead, lastContact: e.target.value })}
                          style={{ width: '100%', padding: '10px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <button onClick={updateLeadCrmDetails} style={{ flex: 1, background: 'var(--brand-dark)', color: 'white', padding: '12px', borderRadius: '10px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Save Legacy Details</button>
                    <button onClick={() => setEditCrmLead(null)} style={{ background: 'transparent', padding: '12px 20px', borderRadius: '10px', fontWeight: '500', border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' }}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {tab === 'Leads' && (
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', flex: 1, margin: 0 }}>All Leads</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'attempted', 'passed', 'failed'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '6px 14px', borderRadius: '99px', border: '1.5px solid',
                    borderColor: filter === f ? 'var(--brand-orange)' : 'rgba(0,0,0,0.15)',
                    background: filter === f ? 'rgba(248,111,3,0.08)' : 'transparent',
                    color: filter === f ? 'var(--brand-orange)' : 'rgba(0,0,0,0.55)',
                    fontSize: '13px', cursor: 'pointer', fontWeight: filter === f ? '600' : '400', textTransform: 'capitalize',
                  }}>
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={exportCSV} style={{
                padding: '8px 16px', background: 'var(--brand-dark)', color: 'white',
                borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: '500',
              }}>
                ↓ Export CSV
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Name</th><th>College</th><th>Mobile</th><th>Email</th>
                    <th>Score</th><th>Status</th><th>Date</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'rgba(0,0,0,0.4)', padding: '32px' }}>No leads found.</td></tr>
                  ) : filteredLeads.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: '500' }}>{l.name}</td>
                      <td>{l.college}</td>
                      <td>{l.mobile}</td>
                      <td style={{ color: 'var(--brand-orange)' }}>{l.email}</td>
                      <td>{l.attempt ? `${l.attempt.score}/${l.attempt.totalQ}` : <span style={{ color: 'rgba(0,0,0,0.3)' }}>—</span>}</td>
                      <td>
                        {l.attempt
                          ? <span className={l.attempt.passed ? 'badge-pass' : 'badge-fail'}>{l.attempt.passed ? 'PASSED' : 'FAILED'}</span>
                          : <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)' }}>Not attempted</span>
                        }
                      </td>
                      <td style={{ color: 'rgba(0,0,0,0.45)', fontSize: '13px' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => deleteLead(l.id, l.name)} style={{
                          background: 'rgba(220,38,38,0.08)',
                          border: '1px solid rgba(220,38,38,0.18)',
                          color: '#dc2626',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {tab === 'Questions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', margin: 0 }}>Questions ({questions.length})</h2>
              <button onClick={() => { setEditQ('new'); setQForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', order: questions.length + 1 }); }} style={{
                background: 'var(--brand-orange)', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              }}>
                + Add Question
              </button>
            </div>

            {/* Edit/Add modal */}
            {editQ && (
              <div style={{
                background: 'white', borderRadius: '20px', padding: '28px',
                border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}>
                <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>{editQ === 'new' ? 'Add New Question' : 'Edit Question'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    placeholder="Question text"
                    value={qForm.question}
                    onChange={e => setQForm({ ...qForm, question: e.target.value })}
                    rows={2}
                    style={{ padding: '12px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '14px', resize: 'vertical', fontFamily: 'var(--font-body)' }}
                  />
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <input key={opt} type="text" placeholder={`Option ${opt}`}
                      value={qForm[`option${opt}`]}
                      onChange={e => setQForm({ ...qForm, [`option${opt}`]: e.target.value })}
                      style={{ padding: '10px 14px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '14px' }}
                    />
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500' }}>Correct Answer:</label>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="radio" name="correct" value={opt} checked={qForm.correctAnswer === opt} onChange={() => setQForm({ ...qForm, correctAnswer: opt })} />
                        {opt}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={saveQuestion} style={{ flex: 1, background: 'var(--brand-dark)', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                      Save Question
                    </button>
                    <button onClick={() => setEditQ(null)} style={{ background: 'transparent', border: '1.5px solid rgba(0,0,0,0.2)', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q, i) => (
                <div key={q.id} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(248,111,3,0.1)', color: 'var(--brand-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px', color: 'var(--brand-dark)', lineHeight: 1.5 }}>{q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <span key={opt} style={{
                          fontSize: '12px', padding: '3px 8px', borderRadius: '6px',
                          background: q.correctAnswer === opt ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.04)',
                          color: q.correctAnswer === opt ? '#16a34a' : 'rgba(0,0,0,0.6)',
                          fontWeight: q.correctAnswer === opt ? '600' : '400',
                        }}>
                          {opt}: {q[`option${opt}`]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => { setEditQ(q.id); setQForm(q); }} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                    <button onClick={() => deleteQuestion(q.id)} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#dc2626' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'Settings' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid rgba(0,0,0,0.07)', maxWidth: '520px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '24px' }}>Quiz Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Quiz Title</label>
                <input type="text" value={settings.quizTitle} onChange={e => setSettings({ ...settings, quizTitle: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Passing Score (out of 10)
                </label>
                <input type="number" min={1} max={10} value={settings.passScore} onChange={e => setSettings({ ...settings, passScore: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '14px' }} />
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', marginTop: '4px' }}>Students need this score or higher to pass.</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Follow-up Link (internal)
                </label>
                <input type="url" value={settings.demoLink} onChange={e => setSettings({ ...settings, demoLink: e.target.value })}
                  placeholder="https://your-demo-link.com"
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: '10px', fontSize: '14px' }} />
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', marginTop: '4px' }}>Keep your follow-up link here for internal reference.</p>
              </div>
              {saveMsg && <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}>{saveMsg}</div>}
              <button onClick={saveSettings} style={{
                background: 'var(--brand-dark)', color: 'white', border: 'none',
                padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
              }}>
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
