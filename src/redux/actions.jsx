export const SEARCHVIDEOS = "SEARCHVIDEOS";
import axios from "axios";

export function getVideoByName(searchQuery) {
  return async (dispatch) => {
    try {
      // 1. Llamada al Backend
      // NOTA: Asegúrate de que tu backend espere 'searchQuery'. 
      // Si tu backend usa 'q', cambia abajo a: params: { q: searchQuery }
        const res = await axios.get('https://watchit-backend-2hhk.onrender.com/youtube-search', {
        params: { q: searchQuery }
      });

      console.log("Respuesta cruda del Backend:", res.data);

      // 2. DETECTAR Y FORMATEAR DATOS
      // Si el backend te devuelve la respuesta directa de YouTube (con "items"),
      // necesitamos limpiarla aquí para que el componente SearchResults no se rompa.
      let videosFormatted = [];

      if (res.data.items) {
        // Caso A: El backend devuelve la respuesta cruda de YouTube
        videosFormatted = res.data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle
        }));
      } else if (Array.isArray(res.data)) {
        // Caso B: El backend ya devolvió el array limpio
        videosFormatted = res.data;
      } else {
         console.warn("Formato de respuesta desconocido", res.data);
      }

      // 3. Despachar al Reducer la lista limpia
      return dispatch({
        type: SEARCHVIDEOS,
        payload: videosFormatted
      });

    } catch (error) {
      console.error("Error en la action getVideoByName:", error);
    }
  };
}