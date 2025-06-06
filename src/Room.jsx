import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Footer from './Footer';

function Room() {
  const { roomId } = useParams();
  const [user, setUser] = useState('');
  const playerRef = useRef(null);
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [searchTerm, setSearchTerm] = useState('');

  const extractVideoId = (url) => {
     const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
     const match = url.match(regex);
     return match ? match[1] : null;
   };
  const handleSearch = () => {
   const idFromUrl = extractVideoId(searchTerm);
  if (idFromUrl && idFromUrl.length === 11) {
    setVideoId(idFromUrl);
    socket.emit('change-video', { roomId, videoId: idFromUrl });
  }
  }
  // Manejar eventos de video sincronizado
  const handleVideoEvent = ({ type, currentTime }) => {
  const player = playerRef.current;
  if (!player) return;

  const current = player.getCurrentTime();
  const diff = Math.abs(current - currentTime);

  switch (type) {
    case 'play':
      if (diff > 1) player.seekTo(currentTime, true);
      player.playVideo(); // ✅ SIEMPRE reproducir
      break;
    case 'pause':
      if (diff > 1) player.seekTo(currentTime, true);
      player.pauseVideo();
      break;
    case 'seek':
      if (diff > 0.5) player.seekTo(currentTime, true);
      break;
  }
};

  // Inicialización: usuario + sockets
const currentVideoIdRef = useRef('');

useEffect(() => {
  // Actualizar referencia cada vez que cambia el video
  currentVideoIdRef.current = videoId;
}, [videoId]);

useEffect(() => {
  const handleChangeVideo = ({ videoId }) => {
    if (videoId && videoId !== currentVideoIdRef.current) {
      setVideoId(videoId);
    }
  };

  const handleInitUser = () => {
    let storedUser = localStorage.getItem('watchit-username');

    if (!storedUser && socket.id) {
      storedUser = 'Usuario ' + socket.id.slice(-4);
      localStorage.setItem('watchit-username', storedUser);
    }

    if (storedUser) {
      setUser(storedUser);
      socket.emit('join-room', roomId);
    }
  };

  // Suscripciones de socket
  socket.on('change-video', handleChangeVideo);
  socket.on('video-event', handleVideoEvent);
  socket.on('connect', handleInitUser);

  // Inicialización inmediata si ya está conectado
  if (socket.connected) {
    handleInitUser();
  }

  return () => {
    socket.off('change-video', handleChangeVideo);
    socket.off('video-event', handleVideoEvent);
    socket.off('connect', handleInitUser);
  };
}, [roomId]);


  return (
 <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
      <div className="flex flex-1 lg:flex-row flex-col">
        {/* Panel izquierdo */}
        <div className="flex-1 flex flex-col p-4">
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Pega el link de YouTube..."
              className="flex-1 px-3 py-2 rounded bg-neutral-700 text-white placeholder-gray-400 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition"
            >
              Buscar
            </button>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Sala: {roomId}</h2>
          <div className="flex-grow flex items-center justify-center min-h-[300px]">
            <VideoPlayer
              videoId={videoId}
              playerRef={playerRef}
              onEvent={(type, currentTime) => {
                socket.emit('video-event', { roomId, type, currentTime });
              }}
            />
          </div>
        </div>

        {/* Panel derecho (Chat) */}
        {user && (
          <div className="lg:w-[350px] w-full bg-neutral-800 p-4 border-l border-white/10 shadow-inner">
            <Chat roomId={roomId} user={user} />
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Room;
