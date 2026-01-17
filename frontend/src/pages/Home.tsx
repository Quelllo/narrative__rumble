import { useState, useEffect } from 'react';
import BetModal from '../components/BetModal';

interface Theme {
  id: string;
  leftNarrative: string;
  rightNarrative: string;
}

function Home() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/themes')
      .then((res) => res.json())
      .then((data) => {
        setThemes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch themes:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Narrative Rumble</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setSelectedTheme(theme)}
            style={{
              padding: '1.5rem',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{theme.leftNarrative}</div>
              <div style={{ fontSize: '1.5rem' }}>VS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{theme.rightNarrative}</div>
            </div>
          </div>
        ))}
      </div>
      {selectedTheme && (
        <BetModal
          theme={selectedTheme}
          onClose={() => setSelectedTheme(null)}
          onBetPlaced={() => setSelectedTheme(null)}
        />
      )}
    </div>
  );
}

export default Home;
