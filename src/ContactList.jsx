import React, { useState } from 'react';

const contacts = [
  { id: 1, name: 'Ana Gómez', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Luis Pérez', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Sofía Torres', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' }
];

export default function ContactList({ onSelect }) {
  return (
    <div className="contact-list">
      <h2>Contactos</h2>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id} onClick={() => onSelect(contact)} className="contact-item">
            <img src={contact.avatar} alt={contact.name} className="avatar" />
            <span>{contact.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
