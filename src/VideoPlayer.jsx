import YouTube from 'react-youtube';
import { useRef, useEffect } from 'react';

function VideoPlayer({ videoId, onReady, onEvent, playerRef }) {
  const internalPlayerRef = useRef(null);

 const ignoreNextEvent = useRef(false);

const handleReady = (event) => {
  internalPlayerRef.current = event.target;
  if (playerRef) playerRef.current = event.target;
  onReady?.(event); // ⚠️ NO pongas ignoreNextEvent aquí
};

const handlePlay = () => {
  if (ignoreNextEvent.current) {
    ignoreNextEvent.current = false;
    return;
  }
  const time = internalPlayerRef.current?.getCurrentTime();
  onEvent?.('play', time);
};


const handlePause = () => {
  if (ignoreNextEvent.current) {
    ignoreNextEvent.current = false;
    return;
  }

  const time = internalPlayerRef.current?.getCurrentTime();
  onEvent?.('pause', time);
};
  return (
    
    <div className="w-full h-full">
      
      

    <YouTube
      videoId={videoId}
      onReady={handleReady}
      onPlay={handlePlay}
      onPause={handlePause}
      className="w-full h-full"
      iframeClassName="w-full h-full rounded-lg"
      opts={{
        playerVars: {
          autoplay: 0,
        },
      }}
    />
  </div>
  );
}

export default VideoPlayer;
