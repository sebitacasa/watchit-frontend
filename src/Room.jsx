import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Footer from './Footer';
import { useDispatch } from "react-redux";
import SearchResults from './videosResult';
import { Search, MonitorPlay, MessageSquare, Users, Tv } from 'lucide-react'; // Iconos

function Room() {
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const [user, setUser] = useState('');
  const playerRef = useRef(null);
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSynced, setIsSynced] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false); // Para móviles

  // ... (TODA LA LÓGICA DE SOCKETS SE MANTIENE IGUAL - CÓPIALA AQUÍ) ...
  // He ocultado la lógica repetida para enfocarme en el render, 
  // pero ASEGÚRATE de mantener tus funciones handleSearch, extractVideoId, 
  // handleVideoEvent y todos los useEffects tal cual estaban.
  
  const handleSearch = (e) => {
    e.preventDefault();
    const isYouTubeLink = searchTerm.includes('youtube.com') || searchTerm.includes('youtu.be');

    if (isYouTubeLink) {
      const idFromUrl = extractVideoId(searchTerm);
      if (idFromUrl && idFromUrl.length === 11) {
        setVideoId(idFromUrl);
        setIsSynced(true); 
        socket.emit('change-video', { roomId, videoId: idFromUrl });
      }
    }
    // Aquí iría tu dispatch de búsqueda normal
  };

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoEvent = ({ type, currentTime }) => {
    const player = playerRef.current;
    if (!player) return;
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
      default: break;
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
        setIsSynced(true); 
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
        setIsSynced(false);
        socket.emit('ask-sync', roomId);
      }
    };

    const handleGetTime = (requesterId) => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function') {
        const time = player.getCurrentTime();
        const state = player.getPlayerState();
        socket.emit('sync-response', { roomId, requesterId, time, state });
      }
    };

    const handleSetTime = ({ time, state }) => {
      const player = playerRef.current;
      if (player) {
        console.log(`Sincronizando a ${time}s`);
        player.seekTo(time, true);
        if (state === 1) player.playVideo();
        else player.pauseVideo();
        setIsSynced(true);
      }
    };

    socket.on('change-video', handleChangeVideo);
    socket.on('video-event', handleVideoEvent);
    socket.on('connect', handleInitUser);
    socket.on('get-time', handleGetTime);
    socket.on('set-time', handleSetTime);

    if (socket.connected) handleInitUser();

    return () => {
      socket.off('change-video', handleChangeVideo);
      socket.off('video-event', handleVideoEvent);
      socket.off('connect', handleInitUser);
      socket.off('get-time', handleGetTime);
      socket.off('set-time', handleSetTime);
    };
  }, [roomId]);

  // --- FIN LÓGICA EXISTENTE ---

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-gray-100 overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. Header Moderno */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5 z-20 shadow-lg">
        <div className="flex items-center gap-2 text-purple-500">
          <MonitorPlay size={28} />
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">WatchIt</h1>
        </div>

        {/* Barra de Búsqueda Centrada y Estilizada */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Pegar link de YouTube o buscar..."
              className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-transparent focus:border-purple-500/50 rounded-full text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner focus:bg-[#1f1f1f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <Users size={16} className="text-green-400" />
            <span className="text-xs font-medium text-gray-300">Room: {roomId}</span>
          </div>
          {/* Botón Chat Móvil */}
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition"
            onClick={() => setShowChatMobile(!showChatMobile)}
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </header>

      {/* 2. Layout Principal */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Columna Izquierda: Video + Carrusel */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          
          {/* Contenedor del Video con Efecto Glow */}
          <div className="w-full max-w-6xl mx-auto p-4 lg:p-6 pb-0">
            <div className="relative group w-full aspect-video rounded-xl shadow-2xl bg-black overflow-hidden border border-white/10">
              {/* Glow Effect detrás del video */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              
              <div className="relative w-full h-full z-10">
                <VideoPlayer
                  videoId={videoId}
                  playerRef={playerRef}
                  isSynced={isSynced}
                  onEvent={(type, currentTime) => {
                    if (isSynced) socket.emit('video-event', { roomId, type, currentTime });
                  }}
                  onReady={() => {
                    if (!isSynced) socket.emit('ask-sync', roomId);
                  }}
                />
              </div>
            </div>
            
            {/* Info del Video */}
            <div className="mt-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tv size={20} className="text-purple-400" />
                    Reproduciendo ahora
                </h2>
                <p className="text-sm text-gray-400 mt-1">Sincronizado con la sala</p>
            </div>
          </div>

          {/* 3. Carrusel de Resultados / Recomendaciones */}
          <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 pb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-200 border-l-4 border-purple-500 pl-3">
              Resultados de búsqueda
            </h3>
            
            {/* Contenedor del Carrusel Horizontal */}
            <div className="relative w-full">
               <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-900/50 scrollbar-track-transparent">
                  {/* Pasamos estilos personalizados al componente hijo si es posible, 
                      o asumimos que SearchResults mapea items. 
                      Aquí lo envolvemos para forzar el layout horizontal. */}
                  <div className="flex flex-row gap-4 min-w-full">
                    <SearchResults
                      videoId={videoId}
                      setVideoId={setVideoId}
                      roomId={roomId}
                      // IMPORTANTE: Tu componente SearchResults debe poder renderizar 
                      // tarjetas con un ancho fijo (ej: w-64) para que el carrusel funcione bien.
                      // Si SearchResults devuelve un <ul> vertical, necesitarás modificar SearchResults.js
                      // para que use clases flex/grid o acepte className.
                    />
                  </div>
               </div>
               {/* Sombras laterales para indicar scroll */}
               <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[#0f0f0f] to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Chat */}
        {user && (
          <div className={`
            fixed inset-y-0 right-0 w-80 bg-[#151515] border-l border-white/10 transform transition-transform duration-300 z-30
            lg:relative lg:translate-x-0 lg:flex lg:flex-col
            ${showChatMobile ? 'translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]' : 'translate-x-full'}
          `}>
            {/* Cabecera del Chat */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#1a1a1a]">
              <span className="font-semibold text-gray-200">Chat de Sala</span>
              <button 
                onClick={() => setShowChatMobile(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Componente Chat */}
            <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-[#151515] to-[#0a0a0a]">
               <Chat roomId={roomId} user={user} />
            </div>
          </div>
        )}
      </main>

      {/* Overlay para cerrar chat en móvil */}
      {showChatMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setShowChatMobile(false)}
        ></div>
      )}

      {/* Footer Minimalista */}
      <div className="hidden lg:block border-t border-white/5 bg-[#0f0f0f]">
        <Footer />
      </div>
    </div>
  );
}

export default Room;