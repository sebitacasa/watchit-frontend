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
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white pt-safe pb-safe">
  <div className="p-8 max-w-[400px] mx-auto text-center bg-neutral-900">
    
    <h1 className="text-3xl font-bold text-blue-400 mb-6">Welcome to WatchItTogether 🎬</h1>

    <input
      type="text"
      placeholder="Your name"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full mb-4 px-4 py-2 bg-neutral-800 text-white placeholder-gray-400 rounded outline-none"
    />

    <input
      type="text"
      placeholder="Room ID"
      value={roomId}
      onChange={(e) => setRoomId(e.target.value)}
      className="w-full mb-6 px-4 py-2 bg-neutral-800 text-white placeholder-gray-400 rounded outline-none"
    />

    <button
      onClick={handleJoin}
      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition"
    >
      Enter
    </button>
  </div>
</div>

    
  );
}

export default Home;
