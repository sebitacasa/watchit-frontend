export const SEARCHVIDEOS = "SEARCHVIDEOS";
import axios from "axios";

export function getVideoByName(searchQuery) {
  return async (dispatch) => {
    try {
      console.log("🚀 Enviando petición al backend:", searchQuery);

      // CORRECCIÓN: Usamos 'searchQuery' si así lo espera tu backend
      const res = await axios.get('https://watchit-backend-2hhk.onrender.com/youtube-search', {
        params: { searchQuery: searchQuery } 
      });

      console.log("✅ Respuesta del Backend:", res.data);

      // Lógica de limpieza (Mantener esto es importante)
      let videosFormatted = [];
      if (res.data.items) {
        videosFormatted = res.data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle
        }));
      } else if (Array.isArray(res.data)) {
        videosFormatted = res.data;
      }

      console.log("📦 Despachando al Redux:", videosFormatted);

      return dispatch({
        type: SEARCHVIDEOS,
        payload: videosFormatted
      });

    } catch (error) {
      console.error("❌ Error FATAL en la acción:", error);
    }
  };
}