import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Theme {
  id: string;
  name: string;
  description: string;
  leftLegLabel: string;
  rightLegLabel: string;
  leftBasket: { symbol: string; weight: number; side: 'LONG' | 'SHORT' }[];
  rightBasket: { symbol: string; weight: number; side: 'LONG' | 'SHORT' }[];
}

interface BetModalProps {
  theme: Theme;
  onClose: () => void;
  onBetPlaced: () => void;
}

function BetModal({ theme, onClose, onBetPlaced }: BetModalProps) {
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const [stake, setStake] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!side || !stake) return;

    const stakeNum = parseFloat(stake);
    if (isNaN(stakeNum) || stakeNum <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          side,
          stake: stakeNum,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place bet');
      }

      onBetPlaced();
      navigate('/my-bets');
    } catch (err) {
      console.error('Error placing bet:', err);
      alert(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1rem' }}>Place Your Bet</h2>
        <div style={{ marginBottom: '0.5rem', fontSize: '1.1rem', textAlign: 'center', fontWeight: 'bold' }}>
          {theme.name}
        </div>
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', color: '#666' }}>
          {theme.description}
        </div>
        <div style={{ marginBottom: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>{theme.leftLegLabel}</span> VS{' '}
          <span style={{ fontWeight: 'bold' }}>{theme.rightLegLabel}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Choose Side:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setSide('left')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: side === 'left' ? '#007bff' : '#f0f0f0',
                  color: side === 'left' ? '#fff' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {theme.leftLegLabel}
              </button>
              <button
                type="button"
                onClick={() => setSide('right')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: side === 'right' ? '#007bff' : '#f0f0f0',
                  color: side === 'right' ? '#fff' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {theme.rightLegLabel}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Stake:</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter stake amount"
              min="0"
              step="0.01"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!side || !stake || loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: side && stake ? '#28a745' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: side && stake ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Placing...' : 'Place Bet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BetModal;
