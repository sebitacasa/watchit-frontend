import { useSelector } from 'react-redux';
import socket from './socket';
import { Play } from 'lucide-react'; // Si instalaste los iconos, queda genial

const SearchResults = ({ videoId, setVideoId, roomId }) => {
  const videos = useSelector(state => state.videos);

  // Si no hay videos, no renderizamos nada para no romper el layout
  if (!videos?.length) return null;

  return (
    <>
      {videos.map(video => (
        <div 
          key={video.videoId} 
          // Clases clave para el carrusel:
          // flex-shrink-0: Evita que se aplaste.
          // w-60: Ancho fijo.
          // snap-start: Para que el scroll se sienta "magnético".
          className="group relative flex-shrink-0 w-60 bg-[#1f1f1f] rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 border border-white/5 snap-start"
          
          onClick={() => {
            setVideoId(video.videoId); 
            socket.emit('change-video', { roomId, videoId: video.videoId });
          }}
        >
          {/* Contenedor de Imagen */}
          <div className="relative h-32 w-full">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
            />
            {/* Overlay Oscuro + Icono Play al hacer hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <div className="bg-purple-600 p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <Play size={20} fill="white" className="text-white ml-1" />
              </div>
            </div>
          </div>

          {/* Info del Video */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1 truncate">
              {video.channelTitle}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResults;