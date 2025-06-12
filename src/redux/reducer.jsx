import * as Action from "./actions"; // importa el type correcto

const initialState = {
  videos: []
};

export default function rootReducer(state = initialState, action) {

  switch (action.type) {
    case Action.SEARCHVIDEOS:
      return {
        ...state,
        videos: action.payload
      };
    default:
      return state;
  }
}