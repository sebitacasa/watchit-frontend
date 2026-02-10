import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Footer from './Footer';
import { useDispatch, useSelector } from "react-redux";
import { getVideoByName } from './redux/actions'; 
import SearchResults from './videosResult';
import { Search, MonitorPlay, MessageSquare, Users, Tv, Play, Smartphone } from 'lucide-react';

function Room() {
  const dispatch = useDispatch();
  const { roomId } = useParams();
  
  const videos = useSelector(state => state.videos);

  // User and Room States
  const [user, setUser] = useState('');
  const [videoId, setVideoId] = useState(''); 
  const [videoTitle, setVideoTitle] = useState('Room Ready'); 
  const [channelTitle, setChannelTitle] = useState('Waiting for video...'); 
  
  // Interface States
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  
  // Mobile Interaction State (Nuevo: Para saber si el usuario ya tocó la pantalla)
  const [hasInteracted, setHasInteracted] = useState(false);

  const playerRef = useRef(null);
  const currentVideoIdRef = useRef(videoId);
  const resultsRef = useRef(null); 

  // --- 🔒 SISTEMA ANTI-BUCLES ---
  const blockEventsRef = useRef(false);   // Bloquea eventos temporales (seek, carga)
  const isPlayingRef = useRef(false);     // Rastrea si REALMENTE se estaba reproduciendo

  const blockEmissions = (duration = 2000) => {
    blockEventsRef.current = true;
    setTimeout(() => {
      blockEventsRef.current = false;
    }, duration);
  };

  // --- SEARCH LOGIC ---
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

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.includes('youtube.com')) return;
    const delaySearch = setTimeout(() => {
      dispatch(getVideoByName(searchTerm));
    }, 600);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (videos && videos.length > 0 && searchTerm.trim() !== '') {
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  }, [videos]);

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // --- LÓGICA DE EVENTOS DEL VIDEO (CORREGIDA PARA MÓVIL) ---
  const handleVideoEvent = ({ type, currentTime }) => {
    const player = playerRef.current;
    if (!player) return;

    // Si no ha interactuado, marcamos que ya lo hizo al tocar controles
    if (!hasInteracted) setHasInteracted(true);

    setIsSynced(true);
    const current = player.getCurrentTime();
    const diff = Math.abs(current - currentTime);

    // 🛡️ LÓGICA ANTI-ECO MÓVIL
    if (blockEventsRef.current) {
        console.log(`🛡️ Blocked ${type} (System Update)`);
        
        // Si el sistema fuerza Play, actualizamos nuestro ref interno
        if (type === 'play') isPlayingRef.current = true;
        return; 
    }

    if (type === 'play') {
        // Marcamos que estamos reproduciendo legítimamente
        isPlayingRef.current = true; 
        if (diff > 1) player.seekTo(currentTime, true);
        player.playVideo();
    
    } else if (type === 'pause') {
        // 🚨 AQUÍ ESTÁ EL TRUCO:
        // Si recibimos "PAUSE" pero isPlayingRef era false, significa que
        // el video nunca arrancó de verdad (bloqueo de móvil o buffering).
        // EN ESE CASO, IGNORAMOS EL PAUSE.
        if (isPlayingRef.current === false) {
            console.log("🚫 Ignorando Pause Falso (Bloqueo de Autoplay o Buffering)");
            return; 
        }

        isPlayingRef.current = false; // Ahora sí marcamos pausado
        if (diff > 1) player.seekTo(currentTime, true);
        player.pauseVideo();
    }
  };

  const handlePlayerReady = (event) => {
    const player = event.target;
    if (player.getVideoData) {
      const data = player.getVideoData();
      setVideoTitle(data.title);
      setChannelTitle(data.author);
    }
    blockEmissions(2000);
    if (!isSynced) socket.emit('ask-sync', roomId);
  };

  const handleStateChange = (event) => {
    // Detectamos si el usuario toca el video para habilitar audio/sync
    if (event.data === 1 || event.data === 3) { // 1=Playing, 3=Buffering
        setHasInteracted(true);
    }
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

  // --- SOCKETS MAIN EFFECT ---
  useEffect(() => {
    const handleChangeVideo = ({ videoId }) => {
      if (videoId && videoId !== currentVideoIdRef.current) {
        blockEmissions(2500); // Bloqueo largo al cambiar video
        isPlayingRef.current = false; // Reseteamos estado
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

    const handleGetTime = (requesterId) => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function' && currentVideoIdRef.current) {
        const time = player.getCurrentTime();
        const state = player.getPlayerState(); 
        const currentVideo = currentVideoIdRef.current;

        console.log(`📤 Sending sync to ${requesterId}`);
        socket.emit('sync-response', { 
          roomId, 
          requesterId, 
          time, 
          state,
          videoId: currentVideo
        });
      }
    };

    const handleSetTime = ({ time, state, videoId: incomingVideoId }) => {
      console.log(`📥 Received sync`);
      
      // Bloqueamos emisiones para evitar que mi player le conteste al servidor
      blockEmissions(3000); // 3 segundos para dar tiempo al móvil

      if (incomingVideoId && incomingVideoId !== currentVideoIdRef.current) {
         setVideoId(incomingVideoId);
         isPlayingRef.current = false;
      }

      const player = playerRef.current;
      if (player) {
        player.seekTo(time, true);
        
        if (state === 1) {
            // Intentamos reproducir
            player.playVideo();
            isPlayingRef.current = true;
        } else {
            player.pauseVideo();
            isPlayingRef.current = false;
        }
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

  // Función para forzar la interacción en móvil
  const handleMobileUnlock = () => {
     setHasInteracted(true);
     const player = playerRef.current;
     if(player) {
         player.playVideo();
         // Enviamos play para forzar sync
         socket.emit('video-event', { roomId, type: 'play', currentTime: player.getCurrentTime() });
     }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-gray-100 overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      
      {/* --- HEADER --- */}
      <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5 z-20 shadow-lg">
        <div className="flex items-center gap-2 text-purple-500 cursor-pointer" onClick={() => window.location.href = '/'}>
          <MonitorPlay size={28} />
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">WatchIt</h1>
        </div>

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
        
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          
          {/* Video Container */}
          <div className="w-full max-w-6xl mx-auto p-4 lg:p-6 pb-0">
            <div className="relative group w-full aspect-video rounded-xl shadow-2xl bg-black overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-[#0a0a0a] z-0"></div>
              <div className="relative w-full h-full z-10">
                {videoId ? (
                    <>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000 pointer-events-none"></div>
                        <VideoPlayer
                            videoId={videoId}
                            playerRef={playerRef}
                            isSynced={isSynced}
                            onEvent={(type, currentTime) => {
                                // 🔒 LÓGICA DE ENVÍO FINAL
                                // 1. Si está bloqueado por sistema, NO enviar.
                                if (blockEventsRef.current) return;

                                // 2. Si es PAUSE, verificar si realmente estábamos reproduciendo antes.
                                // Esto evita que el bloqueo de móvil dispare un pause.
                                if (type === 'pause' && !isPlayingRef.current) {
                                    console.log("🚫 Prevented false pause emission");
                                    return;
                                }

                                // 3. Actualizar estado local y enviar
                                if (type === 'play') isPlayingRef.current = true;
                                if (type === 'pause') isPlayingRef.current = false;

                                if (isSynced) {
                                    socket.emit('video-event', { roomId, type, currentTime });
                                }
                            }}
                            onReady={handlePlayerReady}
                            onStateChange={handleStateChange} 
                        />
                        
                        {/* Overlay para Móviles (Solo aparece si hay video y no han interactuado) */}
                        {!hasInteracted && (
                             <div 
                                onClick={handleMobileUnlock}
                                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 cursor-pointer backdrop-blur-sm transition-opacity hover:bg-black/70"
                             >
                                <div className="p-4 bg-purple-600 rounded-full animate-pulse shadow-lg shadow-purple-500/50">
                                    <Smartphone size={32} className="text-white" />
                                </div>
                                <h3 className="mt-4 text-white font-bold text-lg">Tap to Sync</h3>
                                <p className="text-gray-300 text-sm">Click to enable sound & video</p>
                             </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full text-gray-500 bg-[#0a0a0a]">
                        <div className="p-6 bg-white/5 rounded-full mb-6 animate-pulse ring-1 ring-white/10">
                             <Play size={48} className="text-purple-500 ml-1" fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-200 tracking-tight">The room is ready</h3>
                        <p className="text-sm mt-3 text-gray-400 max-w-xs text-center leading-relaxed">
                            Use the search bar above to find a video or paste a YouTube link.
                        </p>
                    </div>
                )}
              </div>
            </div>
            
            {/* Info Video */}
            <div className="mt-5 mb-8 px-1">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-start gap-3 leading-tight">
                    <Tv size={24} className={`mt-1 flex-shrink-0 ${videoId ? 'text-purple-500' : 'text-gray-600'}`} />
                    {videoId ? videoTitle : 'No video selected'}
                </h2>
                {videoId && (
                    <div className="flex items-center gap-4 mt-2 ml-9">
                        <span className="text-sm font-medium text-gray-400">{channelTitle}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${isSynced ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                            {isSynced ? 'Synced' : 'Syncing...'}
                        </span>
                    </div>
                )}
            </div>
          </div>

          <div ref={resultsRef} className="w-full max-w-6xl mx-auto px-4 lg:px-6 pb-12 scroll-mt-24">
            {videos && videos.length > 0 && (
                <div className="flex items-center justify-between mb-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-gray-200 border-l-4 border-purple-500 pl-3">
                    Search Results
                    </h3>
                </div>
            )}
           
            <div className="relative w-full group/scroll">
                <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-900/30 scrollbar-track-transparent hover:scrollbar-thumb-purple-600/50 transition-colors">
                   <SearchResults
                      videoId={videoId}
                      setVideoId={setVideoId}
                      roomId={roomId}
                    />
                </div>
                <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-[#0f0f0f] to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        {user && (
          <div className={`
            fixed inset-y-0 right-0 w-80 bg-[#151515] border-l border-white/10 transform transition-transform duration-300 z-30 shadow-2xl
            lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:shadow-none
            ${showChatMobile ? 'translate-x-0' : 'translate-x-full'}
          `}>
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