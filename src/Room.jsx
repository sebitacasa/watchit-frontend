import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Footer from './Footer';
import { useDispatch } from "react-redux";
import { getVideoByName } from './redux/actions'; 
import SearchResults from './videosResult';
import { Search, MonitorPlay, MessageSquare, Users, Tv } from 'lucide-react';

function Room() {
  const dispatch = useDispatch();
  const { roomId } = useParams();
  
  // Estados de Usuario y Sala
  const [user, setUser] = useState('');
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ'); // Rick Roll por defecto ;)
  const [videoTitle, setVideoTitle] = useState('Cargando video...');
  const [channelTitle, setChannelTitle] = useState('');
  
  // Estados de Interfaz
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatMobile, setShowChatMobile] = useState(false);
  
  // Estado Crítico de Sincronización
  const [isSynced, setIsSynced] = useState(false);
  
  const playerRef = useRef(null);
  const currentVideoIdRef = useRef('');

  // --- LÓGICA DE BÚSQUEDA ---
  const handleSearch = (e) => {
    e.preventDefault();
    const isYouTubeLink = searchTerm.includes('youtube.com') || searchTerm.includes('youtu.be');

    if (isYouTubeLink) {
      const idFromUrl = extractVideoId(searchTerm);
      if (idFromUrl && idFromUrl.length === 11) {
        setVideoId(idFromUrl);
        setIsSynced(true); 
        socket.emit('change-video', { roomId, videoId: idFromUrl });
        setSearchTerm(''); 
      }
    } else {
      if (searchTerm.trim()) {
        dispatch(getVideoByName(searchTerm));
      }
    }
  };

  // EFECTO DEBOUNCE: Búsqueda en tiempo real mientras escribes
  useEffect(() => {
    // Si está vacío o es un link, no buscamos en la API automáticamente
    if (!searchTerm.trim() || searchTerm.includes('youtube.com')) return;

    // Esperamos 600ms después de que dejes de escribir
    const delaySearch = setTimeout(() => {
      console.log("🔍 Auto-searching:", searchTerm);
      dispatch(getVideoByName(searchTerm));
    }, 600);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, dispatch]);

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // --- LÓGICA DE SOCKETS Y VIDEO ---
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

  const handlePlayerReady = (event) => {
    const player = event.target;
    // Recuperamos título y autor
    if (player.getVideoData) {
      const data = player.getVideoData();
      setVideoTitle(data.title);
      setChannelTitle(data.author);
    }
    if (!isSynced) socket.emit('ask-sync', roomId);
  };

  const handleStateChange = (event) => {
    const player = event.target;
    if (player.getVideoData) {
        const data = player.getVideoData();
        setVideoTitle(data.title);
        setChannelTitle(data.author);
    }
  }

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
        storedUser = 'Guest ' + socket.id.slice(-4);
        localStorage.setItem('watchit-username', storedUser);
      }
      if (storedUser) {
        setUser(storedUser);
        socket.emit('join-room', roomId);
        setIsSynced(false);
        socket.emit('ask-sync', roomId);
      }
    };

    // --- HANDSHAKE LOGIC ---
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
        console.log(`⏱ Syncing to ${time}s`);
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


  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-gray-100 overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      
      {/* --- HEADER --- */}
      <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5 z-20 shadow-lg">
        <div className="flex items-center gap-2 text-purple-500 cursor-pointer" onClick={() => window.location.href = '/'}>
          <MonitorPlay size={28} />
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">WatchIt</h1>
        </div>

        {/* Buscador */}
        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Paste YouTube link or search..."
              className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-transparent focus:border-purple-500/50 rounded-full text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner focus:bg-[#1f1f1f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <Users size={16} className="text-green-400" />
            <span className="text-xs font-medium text-gray-300">ID: {roomId}</span>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition text-gray-300"
            onClick={() => setShowChatMobile(!showChatMobile)}
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* COLUMNA IZQUIERDA (Video + Resultados) */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          
          {/* Contenedor Video */}
          <div className="w-full max-w-6xl mx-auto p-4 lg:p-6 pb-0">
            {/* Aspect Ratio Container */}
            <div className="relative group w-full aspect-video rounded-xl shadow-2xl bg-black overflow-hidden border border-white/10">
               {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              
              <div className="relative w-full h-full z-10">
                <VideoPlayer
                  videoId={videoId}
                  playerRef={playerRef}
                  isSynced={isSynced}
                  onEvent={(type, currentTime) => {
                    if (isSynced) socket.emit('video-event', { roomId, type, currentTime });
                  }}
                  onReady={handlePlayerReady}
                  onStateChange={handleStateChange} 
                />
              </div>
            </div>
            
            {/* Info Video (Título y Estado) */}
            <div className="mt-5 mb-8 px-1">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-start gap-3 leading-tight">
                    <Tv size={24} className="text-purple-500 mt-1 flex-shrink-0" />
                    {videoTitle}
                </h2>
                <div className="flex items-center gap-4 mt-2 ml-9">
                    <span className="text-sm font-medium text-gray-400">{channelTitle}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${isSynced ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {isSynced ? 'Synced' : 'Syncing...'}
                    </span>
                </div>
            </div>
          </div>

          {/* Carrusel de Resultados */}
          <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 pb-12">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-gray-200 border-l-4 border-purple-500 pl-3">
                  Search Results
                </h3>
            </div>
           
            {/* Scroll Horizontal Container */}
            <div className="relative w-full group/scroll">
                <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-900/30 scrollbar-track-transparent hover:scrollbar-thumb-purple-600/50 transition-colors">
                   <SearchResults
                      videoId={videoId}
                      setVideoId={setVideoId}
                      roomId={roomId}
                    />
                </div>
                {/* Fade derecho */}
                <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-[#0f0f0f] to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Chat) */}
        {user && (
          <div className={`
            fixed inset-y-0 right-0 w-80 bg-[#151515] border-l border-white/10 transform transition-transform duration-300 z-30 shadow-2xl
            lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:shadow-none
            ${showChatMobile ? 'translate-x-0' : 'translate-x-full'}
          `}>
            {/* Header Chat */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#1a1a1a]">
              <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="font-semibold text-gray-200 text-sm">Live Chat</span>
              </div>
              <button 
                onClick={() => setShowChatMobile(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-[#121212]">
               <Chat roomId={roomId} user={user} />
            </div>
          </div>
        )}
      </main>

      {showChatMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setShowChatMobile(false)}
        ></div>
      )}

      <div className="hidden lg:block border-t border-white/5 bg-[#0f0f0f]">
        <Footer />
      </div>

    </div> 
  );
}

export default Room;