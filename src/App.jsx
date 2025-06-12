import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Room from './Room';
import Home from './Home';
import {Provider} from "react-redux"
import store from "./redux/store"

export default function App() {
  return (
    <Provider store={store}>
<BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/room/sala1" />} /> Redirigir al entrar */}
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/" element={<Home/>} />
        
      </Routes>
    </BrowserRouter>
    </Provider>
    
  );
}