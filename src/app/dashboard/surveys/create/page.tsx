'use client';

import { useState } from 'react';

export default function CreateSurveyPage() {
  const [email, setEmail] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, score, feedback }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
    } else {
      setMessage('Failed to submit');
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Create Survey</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="number" placeholder="Score" value={score} onChange={(e) => setScore(Number(e.target.value))} min="0" max="10" required />
        <textarea placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
        <button type="submit">Submit Survey</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
