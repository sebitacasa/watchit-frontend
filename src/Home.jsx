// src/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!username.trim() || !roomId.trim()) return;
    localStorage.setItem('watchit-username', username);
    navigate(`/room/${roomId}`);
  };

  return (
    // Agregamos justify-center para centrar verticalmente
    <div className="flex flex-col min-h-screen justify-center items-center bg-neutral-900 text-white pt-safe pb-safe p-4">
      
      {/* Tarjeta con borde sutil y fondo un poco más claro */}
      <div className="w-full max-w-md p-8 bg-neutral-900/50 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">
        
        <div className="text-center mb-8">
          <span className="text-4xl mb-2 block">🍿</span>
          {/* Título con gradiente */}
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            WatchItTogether
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">
            Watch YouTube videos with friends in real-time.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1 uppercase tracking-wider">Username</label>
            <input
              type="text"
              placeholder="Ex: SebitaDev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1 uppercase tracking-wider">Room ID</label>
            <input
              type="text"
              placeholder="Ex: 1234"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Join Room 🚀
          </button>
        </div>

      </div>
      
      {/* Footer pequeño */}
      <p className="mt-8 text-neutral-600 text-xs">
        Built for the portfolio by <span className="text-neutral-400">You</span>
      </p>
    </div>
  );
}

export default Home;