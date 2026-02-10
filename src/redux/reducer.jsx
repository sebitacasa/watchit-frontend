const initialState = {
  videos: [], // Aquí se guardarán los resultados
  // ...otros estados
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case "GET_VIDEO_BY_NAME":
      return {
        ...state,
        videos: action.payload, // Actualizamos la lista
      };
    default:
      return state;
  }
}

export default rootReducer;