import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Footer from './Footer';
import { getVideoByName } from './redux/actions'; // Asumiendo que usas Redux
import { useDispatch } from "react-redux";
import SearchResults from './videosResult';

function Room() {
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const [user, setUser] = useState('');
  const playerRef = useRef(null);
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [searchTerm, setSearchTerm] = useState('');
  
  // ESTADO NUEVO: Controla si el usuario ya recibió la hora del servidor
  const [isSynced, setIsSynced] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const isYouTubeLink = searchTerm.includes('youtube.com') || searchTerm.includes('youtu.be');

    if (isYouTubeLink) {
      const idFromUrl = extractVideoId(searchTerm);
      if (idFromUrl && idFromUrl.length === 11) {
        setVideoId(idFromUrl);
        // Al cambiar video, asumimos sync porque nosotros lo iniciamos
        setIsSynced(true); 
        socket.emit('change-video', { roomId, videoId: idFromUrl });
        // dispatch(getVideoByName(idFromUrl)); 
      }
    } else {
      // dispatch(getVideoByName(searchTerm));
    }
  };

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoEvent = ({ type, currentTime }) => {
    const player = playerRef.current;
    if (!player) return;

    // Si recibo un evento del servidor, significa que ya estoy en el flujo
    // Aseguramos que isSynced sea true para poder responder en el futuro
    setIsSynced(true);

    const current = player.getCurrentTime();
    const diff = Math.abs(current - currentTime);

    switch (type) {
      case 'play':
        if (diff > 1) player.seekTo(currentTime, true);
        player.playVideo();
        break;
      case 'pause':
        if (diff > 1) player.seekTo(currentTime, true);
        player.pauseVideo();
        break;
      default:
        break;
    }
  };

  const currentVideoIdRef = useRef('');

  useEffect(() => {
    currentVideoIdRef.current = videoId;
  }, [videoId]);

  useEffect(() => {
    const handleChangeVideo = ({ videoId }) => {
      if (videoId && videoId !== currentVideoIdRef.current) {
        setVideoId(videoId);
        setIsSynced(true); // Nuevo video = reset de sync
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
        
        // IMPORTANTE: Al unirse, pedimos sincronización
        // No asumimos nada, preguntamos al server.
        setIsSynced(false);
        socket.emit('ask-sync', roomId);
      }
    };

    // --- LOGICA DE SINCRONIZACIÓN NUEVA ---

    // 1. Alguien nuevo entró y el servidor ME pide la hora (porque soy veterano)
    const handleGetTime = (requesterId) => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function') {
        const time = player.getCurrentTime();
        const state = player.getPlayerState(); // 1=Playing, 2=Paused
        socket.emit('sync-response', { roomId, requesterId, time, state });
      }
    };

    // 2. Soy nuevo y el servidor ME da la hora
    const handleSetTime = ({ time, state }) => {
      const player = playerRef.current;
      if (player) {
        console.log(`Sincronizando a ${time}s`);
        player.seekTo(time, true);
        if (state === 1) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
        // ¡AHORA SÍ! Ya tengo la hora correcta, puedo empezar a emitir eventos
        setIsSynced(true);
      }
    };

    socket.on('change-video', handleChangeVideo);
    socket.on('video-event', handleVideoEvent);
    socket.on('connect', handleInitUser);
    
    // Nuevos listeners
    socket.on('get-time', handleGetTime);
    socket.on('set-time', handleSetTime);

    if (socket.connected) {
      handleInitUser();
    }

    return () => {
      socket.off('change-video', handleChangeVideo);
      socket.off('video-event', handleVideoEvent);
      socket.off('connect', handleInitUser);
      socket.off('get-time', handleGetTime);
      socket.off('set-time', handleSetTime);
    };
  }, [roomId]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white pt-safe pb-safe">
      <div className="flex flex-1 lg:flex-row flex-col">
        
        {/* Panel izquierdo */}
        <div className="flex-1 flex flex-col p-4">
          
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Search on YouTube..."
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

          <h2 className="text-2xl font-semibold mb-4">Room: {roomId}</h2>

          <div className="flex-grow flex items-center justify-center min-h-[300px]">
            <VideoPlayer
              videoId={videoId}
              playerRef={playerRef}
              isSynced={isSynced} // Pasamos la prop para bloquear eventos
              onEvent={(type, currentTime) => {
                // Doble chequeo de seguridad
                if (isSynced) {
                  socket.emit('video-event', { roomId, type, currentTime });
                }
              }}
              onReady={() => {
                // Cuando el player carga, si no estamos sync, pedimos sync de nuevo por seguridad
                if (!isSynced) socket.emit('ask-sync', roomId);
              }}
            />
          </div>

          <div className="mt-4 max-h-[300px] overflow-y-auto text-white">
            <SearchResults
              videoId={videoId}
              setVideoId={setVideoId}
              roomId={roomId}
            />
          </div>
        </div>

        {/* Panel derecho (Chat) */}
        {user && (
          <div className="lg:w-[350px] w-full bg-neutral-800 p-4 border-l border-white/10 shadow-inner flex flex-col">
            <Chat roomId={roomId} user={user} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Room;