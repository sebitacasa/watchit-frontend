import YouTube from 'react-youtube';
import { useRef } from 'react';

// Aceptamos la prop nueva "isSynced"
function VideoPlayer({ videoId, onReady, onEvent, playerRef, isSynced }) {
  const internalPlayerRef = useRef(null);
  const ignoreNextEvent = useRef(false);

  const handleReady = (event) => {
    internalPlayerRef.current = event.target;
    if (playerRef) playerRef.current = event.target;
    onReady?.(event); 
  };

  const handlePlay = () => {
    // BLOQUEO: Si no estoy sincronizado, no le digo nada al servidor
    if (!isSynced) return; 

    if (ignoreNextEvent.current) {
      ignoreNextEvent.current = false;
      return;
    }
    const time = internalPlayerRef.current?.getCurrentTime();
    onEvent?.('play', time);
  };

  const handlePause = () => {
    // BLOQUEO: Si no estoy sincronizado, no le digo nada al servidor
    if (!isSynced) return;

    if (ignoreNextEvent.current) {
      ignoreNextEvent.current = false;
      return;
    }
    const time = internalPlayerRef.current?.getCurrentTime();
    onEvent?.('pause', time);
  };

  // State Change para detectar buffering o seek
  const handleStateChange = (e) => {
      // Si hace seek, también validamos isSynced
      if (!isSynced) return;
      // Aquí podrías manejar lógica de buffering si quisieras
  };

  return (
    <div className="w-full h-full">
      <YouTube
        videoId={videoId}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onStateChange={handleStateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-lg"
        opts={{
          playerVars: {
            autoplay: 1, // Intentamos autoplay, pero el navegador puede bloquearlo
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
        }}
      />
    </div>
  );
}

export default VideoPlayer;