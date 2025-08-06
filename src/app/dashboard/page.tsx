'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys`)
      .then((res) => res.json())
      .then((data) => {
        setSurveys(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch surveys', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <main style={{ padding: '2rem' }}>Loading surveys...</main>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      {surveys.length === 0 ? (
        <p>No surveys found.</p>
      ) : (
        <ul>
          {surveys.map((survey: any) => (
            <li key={survey.id}>
              {survey.email} — Score: {survey.score} — {survey.feedback}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
