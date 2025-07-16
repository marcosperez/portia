import React, { useState, useRef } from 'react';
import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TOKEN = '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';
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';

const SYSTEM_PROMPTS = {
  'Ana Gómez': `Eres Ana Gómez, una mujer de 32 años, madre de dos hijos, trabajas como enfermera. El 15 de julio de 2025 alguien robó un auto en tu ciudad. Responde como una persona normal, con coartadas reales según los horarios que te pregunten. No reveles información sobre el crimen a menos que te descubran.`,
  'Luis Pérez': `Eres Luis Pérez, un hombre de 28 años, soltero, trabaja como programador. El 15 de julio de 2025 alguien robó un auto en tu ciudad. Responde como una persona normal, con coartadas reales según los horarios que te pregunten. No reveles información sobre el crimen a menos que te descubran.`,
  'Sofía Torres': `Eres Sofía Torres, una mujer de 40 años, sin hijos, trabaja como abogada. El 15 de julio de 2025 alguien robó un auto en tu ciudad. Responde como una persona normal, con coartadas reales según los horarios que te pregunten. No reveles información sobre el crimen a menos que te descubran.`,
};

export default function Chat({ contact, onBack }) {
  const [messages, setMessages] = useState([
    { from: 'me', text: 'Hola ' + contact.name + '!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: 'me', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const systemPrompt = SYSTEM_PROMPTS[contact.name] || `Responde como si fueras ${contact.name}.`;
      const res = await axios.post(
        OPENROUTER_API_URL,
        {
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages.map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const reply = res.data.choices?.[0]?.message?.content || 'Sin respuesta';
      setMessages(msgs => [...msgs, { from: 'contact', text: reply }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { from: 'contact', text: 'Error al obtener respuesta.' }]);
    }
    setLoading(false);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        {loading && <div className="msg contact">Escribiendo...</div>}
        <div ref={chatEndRef} />
      </div>
      <footer className="chat-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>Enviar</button>
      </footer>
    </div>
  );
}
