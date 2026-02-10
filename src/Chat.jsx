import { useEffect, useState, useRef } from 'react';
import socket from './socket';
import { Send, MessageSquare } from 'lucide-react';

function Chat({ roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('chat-message', handleMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!user || !roomId || input.trim() === '') return;

    const messageData = { roomId, user, message: input, timestamp: new Date() };
    socket.emit('chat-message', messageData);
    // Optimistic UI: podrías agregarlo localmente aquí si el server no hace echo al sender
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#151515]">
      
      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
            <MessageSquare size={48} className="mb-2" />
            <p className="text-sm">Sé el primero en hablar</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.user === user;
          
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              
              {/* Nombre del usuario (solo si no soy yo) */}
              {!isMe && (
                <span className="text-[10px] text-gray-400 mb-1 ml-1">
                  {msg.user}
                </span>
              )}

              {/* Burbuja del mensaje */}
              <div 
                className={`
                  max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                  ${isMe 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-[#2a2a2a] text-gray-200 rounded-bl-none border border-white/5'
                  }
                `}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#1a1a1a] border-t border-white/5">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="w-full pl-4 pr-12 py-3 bg-[#0f0f0f] text-gray-200 placeholder-gray-500 text-sm rounded-full border border-white/5 focus:border-purple-500/50 outline-none transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;