import React, { useState, useRef } from 'react';

export default function Chat({ contact, onBack }) {
  const [messages, setMessages] = useState([
    { from: 'me', text: 'Hola ' + contact.name + '!' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'me', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: 'contact', text: 'To be implemented' }]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <button onClick={onBack} className="back-btn">←</button>
        <img src={contact.avatar} alt={contact.name} className="avatar" />
        <span>{contact.name}</span>
      </header>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.from === 'me' ? 'msg me' : 'msg contact'}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <footer className="chat-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Enviar</button>
      </footer>
    </div>
  );
}
