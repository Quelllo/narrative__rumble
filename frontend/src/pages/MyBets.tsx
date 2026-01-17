import { useState, useEffect } from 'react';

interface Bet {
  id: string;
  themeId: string;
  side: 'left' | 'right';
  stake: number;
  status: 'pending' | 'open' | 'closed';
  createdAt: string;
}

function MyBets() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bets')
      .then((res) => res.json())
      .then((data) => {
        setBets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch bets:', err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'open':
        return '#28a745';
      case 'closed':
        return '#6c757d';
      default:
        return '#333';
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Bets</h1>
      {bets.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No bets yet. Go to the home page to place your first bet!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bets.map((bet) => (
            <div
              key={bet.id}
              style={{
                padding: '1.5rem',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Theme: {bet.themeId}</div>
                <div
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: getStatusColor(bet.status),
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {bet.status}
                </div>
              </div>
              <div style={{ color: '#666', marginBottom: '0.5rem' }}>
                Side: <strong>{bet.side}</strong> | Stake: <strong>{bet.stake}</strong>
              </div>
              <div style={{ color: '#999', fontSize: '0.875rem' }}>
                Created: {new Date(bet.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBets;
