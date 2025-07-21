'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type MessageType = 'success' | 'error' | 'info';

interface Message {
  id: string; 
  text: string;
  type: MessageType;
}

let addMessage: (text: string, type: MessageType) => void;

const MessageModal: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
    addMessage = (text, type) => {
      const newMessage = { id: crypto.randomUUID(), text, type };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setTimeout(() => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== newMessage.id));
      }, 3000);
    };
  }, []);

  if (!isBrowser) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
      {messages.map(message => (
        <div
          key={message.id} 
          className={`
            p-4 rounded-lg shadow-lg text-white font-semibold flex items-center justify-between
            ${message.type === 'success' ? 'bg-green-500' : ''}
            ${message.type === 'error' ? 'bg-red-500' : ''}
            ${message.type === 'info' ? 'bg-blue-500' : ''}
          `}
          role="alert"
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessages(prevMessages => prevMessages.filter(msg => msg.id !== message.id))}
            className="ml-4 text-white hover:text-gray-100 focus:outline-none"
            aria-label="Close message"
          >
            &times;
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export const showMessage = (text: string, type: MessageType = 'info') => {
  if (addMessage) {
    addMessage(text, type);
  } else {
    console.warn('MessageModal not yet initialized. Message:', text);
  }
};

export default MessageModal;
