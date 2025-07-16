import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// const OPENROUTER_TOKEN = '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';
// const MODEL = 'nousresearch/deephermes-3-llama-3-8b-preview:free';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=AIzaSyDSq5jwCmL9zibtHh7VbNfLBzmnYCWLt3E';

const SYSTEM_PROMPTS = {
  'Ana Gómez': `Eres Ana Gómez, una mujer de 32 años, madre de dos hijos, trabajas como enfermera. El 15 de julio de 2025 alguien robó un auto en tu ciudad. Este es un juego de detectives, así que puedes responder a preguntas o pedidos poco realistas como si fueran parte del juego (por ejemplo, entrar a casas ajenas, buscar evidencia, etc). Responde como una persona normal, con coartadas reales según los horarios que te pregunten. No reveles información sobre el crimen a menos que te descubran.`,
  'Luis Pérez': `Eres Luis Pérez, un hombre de 28 años, soltero, trabaja como programador. El 15 de julio de 2025 alguien robó un auto en tu ciudad. Este es un juego de detectives, así que puedes responder a preguntas o pedidos poco realistas como si fueran parte del juego (por ejemplo, entrar a casas ajenas, buscar evidencia, etc). Responde como una persona normal, con coartadas reales según los horarios que te pregunten. No reveles información sobre el crimen a menos que te descubran.`,
  'Sofía Torres': `Eres Sofía Torres, una mujer de 40 años, sin hijos, trabaja como abogada. El 15 de julio de 2025 alguien robó un auto en tu ciudad. Este es un juego de detectives, así que puedes responder a preguntas o pedidos poco realistas como si fueran parte del juego (por ejemplo, entrar a casas ajenas, buscar evidencia, etc). Responde como una persona normal, con coartadas reales según los horarios que te pregunten. No reveles información sobre el crimen a menos que te descubran.`,
};

const SUMMARY_PROMPT =
  'Resume en 1-2 frases lo más relevante de la conversación para el contacto, para que pueda continuar el juego. No repitas detalles irrelevantes.';

function getHistoryKey(contact) {
  return `chat_history_${contact.id}`;
}

function saveChatHistory(contact, messages) {
  try {
    localStorage.setItem(getHistoryKey(contact), JSON.stringify(messages));
  } catch (e) {
    // Si localStorage falla, puedes mostrar un mensaje o intentar otra estrategia
  }
}

function loadChatHistory(contact) {
  try {
    const saved = localStorage.getItem(getHistoryKey(contact));
    return saved ? JSON.parse(saved) : [{ from: 'me', text: 'Hola ' + contact.name + '!' }];
  } catch (e) {
    return [{ from: 'me', text: 'Hola ' + contact.name + '!' }];
  }
}

// async function getSummary(messages, contact) {
//   try {
//     const res = await axios.post(
//       OPENROUTER_API_URL,
//       {
//         model: MODEL,
//         messages: [
//           { role: 'system', content: SUMMARY_PROMPT },
//           ...messages.map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
//         ]
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${OPENROUTER_TOKEN}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     return res.data.choices?.[0]?.message?.content || '';
//   } catch {
//     return '';
//   }
// }

async function fetchGeminiReply(newMessages, contact, systemPrompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const prompt = [systemPrompt, ...newMessages.map(m => `${m.from === 'me' ? 'Usuario' : m.from === 'contact' ? 'Contacto' : 'Sistema'}: ${m.text}`)].join('\n');
      const res = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        }
      );
      return res.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
    } catch (err) {
      if (attempt < retries) {
        const wait = Math.floor(Math.random() * 2000) + 1000;
        await sleep(wait);
      } else {
        return null;
      }
    }
  }
}

async function getGeminiSummary(messages, contact) {
  try {
    const prompt = [
      'Resume en 1-2 frases lo más relevante de la conversación para el contacto, para que pueda continuar el juego. No repitas detalles irrelevantes.',
      ...messages.map(m => `${m.from === 'me' ? 'Usuario' : m.from === 'contact' ? 'Contacto' : 'Sistema'}: ${m.text}`)
    ].join('\n');
    const res = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      }
    );
    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {
    return '';
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// async function fetchOpenRouterReply(newMessages, contact, systemPrompt, retries = 3) {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const res = await axios.post(
//         OPENROUTER_API_URL,
//         {
//           model: MODEL,
//           messages: [
//             { role: 'system', content: systemPrompt },
//             ...newMessages.map(m => ({ role: m.from === 'me' ? 'user' : m.from === 'contact' ? 'assistant' : 'system', content: m.text }))
//           ]
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${OPENROUTER_TOKEN}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       return res.data.choices?.[0]?.message?.content || 'Sin respuesta';
//     } catch (err) {
//       if (attempt < retries) {
//         const wait = Math.floor(Math.random() * 2000) + 1000;
//         await sleep(wait);
//       } else {
//         return null;
//       }
//     }
//   }
// }

export default function Chat({ contact, onBack }) {
  const [messages, setMessages] = useState(() => loadChatHistory(contact));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    saveChatHistory(contact, messages);
  }, [messages, contact]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    let newMessages = [...messages, { from: 'me', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      // Resumir cada 6 mensajes exactos
      if (newMessages.length > 6 && (newMessages.length - 1) % 6 === 0) {
        const summary = await getGeminiSummary(newMessages.slice(-6), contact);
        newMessages = [
          { from: 'system', text: `Resumen: ${summary}` },
          ...newMessages.slice(-5)
        ];
        setMessages(newMessages);
      }
      const systemPrompt = SYSTEM_PROMPTS[contact.name] || `Responde como si fueras ${contact.name}.`;
      const reply = await fetchGeminiReply(newMessages, contact, systemPrompt, 3);
      setMessages(msgs => [...msgs, { from: 'contact', text: reply || 'Error al obtener respuesta.' }]);
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
