import { useSelector } from 'react-redux';
import socket from './socket';

const SearchResults = ({ videoId, setVideoId, roomId }) => {
  const videos = useSelector(state => state.videos);
  console.log("Videos en SearchResults:", videos);
 

  return (
    <div className="space-y-4">
      {videos?.map(video => (
        <div key={video.videoId} className="flex items-start gap-4 bg-neutral-800 p-4 rounded-lg">
          <img src={video.thumbnail} alt={video.title} className="w-40 rounded-md" />
          <div>
            <h3 className="text-lg font-semibold">{video.title}</h3>
            <p className="text-sm text-neutral-400">{video.channelTitle}</p>
            {/* Podés agregar botón para reproducir */}
            <button
        onClick={() => {
                setVideoId(video.videoId); // ✅ actualiza el reproductor
                socket.emit('change-video', { roomId, videoId: video.videoId }); // ✅ usa la room real
              }}
            //   onClick={() => socket.emit('change-video', { roomId, videoId: video.videoId })}
              className="mt-2 px-4 py-1 bg-yellow-500 text-black rounded"
            >
              Reproducir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults