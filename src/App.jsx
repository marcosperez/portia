import React, { useState } from 'react';
import './App.css';
import ContactList from './ContactList';
import Chat from './Chat';

function App() {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="app-container">
      {!selectedContact ? (
        <ContactList onSelect={setSelectedContact} />
      ) : (
        <Chat contact={selectedContact} onBack={() => setSelectedContact(null)} />
      )}
    </div>
  );
}

export default App;
