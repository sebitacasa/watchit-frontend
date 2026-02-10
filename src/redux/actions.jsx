import axios from "axios";
export const SEARCHVIDEOS = "SEARCHVIDEOS";

export function getVideoByName(name) {
    return async (dispatch) => {
        try {
            console.log("📡 Enviando búsqueda:", name);

            // 1. LLAMADA AL BACKEND
            // Usamos la key 'searchQuery' porque tu backend hace: const { searchQuery } = req.query;
            const res = await axios.get('https://watchit-backend-2hhk.onrender.com/youtube-search', {
                params: {
                    searchQuery: name 
                }
            });

            console.log("✅ Datos recibidos del Backend:", res.data);

            // 2. NO HACE FALTA MAPEAR NADA
            // Tu backend ya hizo el trabajo sucio y devuelve: [{ videoId, title, thumbnail }, ...]
            // Así que pasamos res.data directo.

            return dispatch({
                type: SEARCHVIDEOS,
                payload: res.data 
            });

        } catch (error) {
            console.error("❌ Error buscando videos:", error);
            // Opcional: Podrías despachar una acción de error si quisieras mostrar un mensaje al usuario
        }
    }
}