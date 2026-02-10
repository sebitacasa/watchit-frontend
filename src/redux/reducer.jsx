import { SEARCHVIDEOS } from "./actions";

const initialState = {
  videos: [], // <--- IMPORTANTE: Tiene que llamarse 'videos' y ser un array
  // ... otros estados
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SEARCHVIDEOS:
      return {
        ...state,
        videos: action.payload, // Guardamos la lista limpia aquí
      };
    default:
      return state;
  }
}

export default rootReducer;