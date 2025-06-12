export const SEARCHVIDEOS = "SEARCHVIDEOS"
import axios from "axios"

export function getVideoByName(searchQuery){
    return async (dispatch) => {
        
          const res = await axios.get('https://watchit-backend-2hhk.onrender.com/youtube-search', {
        params: { searchQuery }
      });

       console.log("Resultado de búsqueda:", res.data); // 👈 Acá va el log


        return dispatch({
            type: SEARCHVIDEOS,
            payload: res.data
            
        }
    )
    }
}