'use client';

import { useEffect, useState } from 'react';

export default function TestConnection() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    fetch('https://cors-anywhere.herokuapp.com/https://nps-backend-production.up.railway.app/api/health', {
      headers: {
        'Origin': 'https://vercel.app'
      }
    })
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('Failed to connect'));
  }, []);

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '2rem' }}>
      Backend Status: {status}
    </main>
  );
}
