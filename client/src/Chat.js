import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:4001');

function Chat() {
  const [mensagens, setMensagens] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [conectado, setConectado] = useState(false);
  const mensagensRef = useRef(null);

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMensagens(prev => [...prev, {
        id: Date.now(),
        username: data.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      }]);
    });

    return () => socket.off('receiveMessage');
  }, []);

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  const conectarChat = (e) => {
    e.preventDefault();
    if (nomeUsuario.trim()) {
      setConectado(true);
    }
  };

  const enviarMensagem = (e) => {
    e.preventDefault();
    if (mensagem.trim() && nomeUsuario.trim()) {
      socket.emit('sendMessage', {
        username: nomeUsuario,
        message: mensagem.trim()
      });
      setMensagem('');
    }
  };

  const sairChat = () => {
    setConectado(false);
    setNomeUsuario('');
    setMensagens([]);
  };

  if (!conectado) {
    return (
      <div className="chat-login">
        <div className="chat-login-card">
          <h3>💬 Entrar no Chat da Terra Média</h3>
          <p>Digite seu nome para entrar no chat em tempo real:</p>
          <form onSubmit={conectarChat} className="chat-login-form">
            <input
              type="text"
              placeholder="Seu nome..."
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              className="chat-name-input"
              required
            />
            <button type="submit" className="chat-join-btn">
              🚪 Entrar no Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Chat da Terra Média</h3>
        <div className="chat-user-info">
          <span>👤 {nomeUsuario}</span>
          <button onClick={sairChat} className="chat-leave-btn">🚪 Sair</button>
        </div>
      </div>
      
      <div className="chat-messages" ref={mensagensRef}>
        {mensagens.length === 0 ? (
          <div className="chat-empty">
            <p>🌟 Seja o primeiro a enviar uma mensagem!</p>
          </div>
        ) : (
          mensagens.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.username === nomeUsuario ? 'own-message' : ''}`}
            >
              <div className="message-header">
                <span className="message-author">👤 {msg.username}</span>
                <span className="message-time">{msg.timestamp}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={enviarMensagem} className="chat-form">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="chat-input"
          required
        />
        <button type="submit" className="chat-send-btn">
          📨 Enviar
        </button>
      </form>
    </div>
  );
}

export default Chat;
