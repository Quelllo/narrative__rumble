import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import MyBets from './pages/MyBets';

function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: '1rem', textDecoration: 'none', color: '#333' }}>
          Home
        </Link>
        <Link to="/my-bets" style={{ textDecoration: 'none', color: '#333' }}>
          My Bets
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-bets" element={<MyBets />} />
      </Routes>
    </div>
  );
}

export default App;
