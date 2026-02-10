export const SEARCHVIDEOS = "SEARCHVIDEOS"
import axios from "axios"

import axios from 'axios';

// Tu API KEY de Google Console (Habilita YouTube Data API v3)
const API_KEY = 'TU_API_KEY_AQUI'; 

export function getVideoByName(name) {
  return async function (dispatch) {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          q: name,
          type: 'video',
          key: API_KEY,
          maxResults: 10
        }
      });

      // Mapeamos solo lo que nos interesa para limpiar la data
      const videos = response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle
      }));

      return dispatch({
        type: "GET_VIDEO_BY_NAME",
        payload: videos,
      });
    } catch (error) {
      console.error("Error buscando videos:", error);
    }
  };
}