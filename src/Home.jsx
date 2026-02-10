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
    // Fondo oscuro exacto al de la sala (#0f0f0f)
    <div className="flex flex-col min-h-screen justify-center items-center bg-[#0f0f0f] text-gray-100 pt-safe pb-safe p-4 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Tarjeta con fondo #1a1a1a para consistencia */}
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] border border-white/5 rounded-2xl shadow-2xl backdrop-blur-sm">
        
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block animate-bounce">🍿</span>
          
          {/* Título con gradiente Violeta */}
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            WatchItTogether
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Watch YouTube videos with friends in real-time.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">
              USERNAME
            </label>
            <input
              type="text"
              placeholder="Ex: SebitaDev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">
              ROOM ID
            </label>
            <input
              type="text"
              placeholder="Ex: 1234"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Join Room 🚀
          </button>
        </div>

      </div>
      
      <p className="mt-8 text-gray-600 text-xs">
        Built for the portfolio by <span className="text-gray-400">You</span>
      </p>
    </div>
  );
}

export default Home;