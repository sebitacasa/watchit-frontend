import { useEffect, useState, useRef } from 'react';
import socket from './socket';

function Chat({ roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('chat-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, []);

  useEffect(() => {
    // scroll automático al último mensaje
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 

  const sendMessage = () => {
    if (!user || !roomId || input.trim() === '') return;

    const messageData = { roomId, user, message: input };
    socket.emit('chat-message', messageData);
    //setMessages((prev) => [...prev, messageData]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-semibold mb-3">Chat</h3>

      <div className="flex-1 overflow-y-auto bg-neutral-700 rounded p-3 space-y-2 mb-3 max-h-full">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm leading-snug">
            <span className="font-semibold text-blue-400">{msg.user}:</span>{' '}
            <span className="text-gray-100">{msg.message}</span>
          </p>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 rounded bg-neutral-600 text-white placeholder-gray-400 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default Chat;
