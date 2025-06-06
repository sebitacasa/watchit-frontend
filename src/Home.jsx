// src/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!username.trim() || !roomId.trim()) return;

    // Guardar en localStorage o pasar por query params si lo deseas
    localStorage.setItem('watchit-username', username);
    navigate(`/room/${roomId}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h1>🎬 Bienvenido a WatchItTogether</h1>
      <h1 className="text-3xl font-bold text-blue-400">Tailwind funciona 💥</h1>
      <input
        type="text"
        placeholder="Tu nombre"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: '100%', margin: '1rem 0', padding: '0.5rem' }}
      />
      <input
        type="text"
        placeholder="ID de sala"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <button onClick={handleJoin} style={{ width: '100%', padding: '0.75rem' }}>
        Entrar
      </button>
    </div>
  );
}

export default Home;
