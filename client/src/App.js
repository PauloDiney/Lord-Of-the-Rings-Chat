import React, { useState, useEffect } from 'react';
import './App.css';
import Chat from './Chat';

const temas = [
  { id: 'filmes', nome: 'Filmes', icone: '🎬' },
  { id: 'livros', nome: 'Livros', icone: '📚' },
  { id: 'personagens', nome: 'Personagens', icone: '🧙‍♂️' },
  { id: 'chat', nome: 'Chat ao Vivo', icone: '💬' }
];

function App() {
  const [temaSelecionado, setTemaSelecionado] = useState('filmes');
  const [topicos, setTopicos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [nomeAutor, setNomeAutor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [topicoExpandido, setTopicoExpandido] = useState(null);
  const [resposta, setResposta] = useState('');
  const [nomeRespondente, setNomeRespondente] = useState('');

  useEffect(() => {
    if (temaSelecionado !== 'chat') {
      carregarTopicos();
    }
  }, [temaSelecionado]);

  const carregarTopicos = async () => {
    setCarregando(true);
    try {
      const response = await fetch(`http://localhost:4001/forum/${temaSelecionado}`);
      const data = await response.json();
      setTopicos(data);
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error);
    }
    setCarregando(false);
  };

  const criarTopico = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim() || !nomeAutor.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:4001/forum/${temaSelecionado}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: titulo.trim(), conteudo: conteudo.trim(), autor: nomeAutor.trim() })
      });
      
      if (response.ok) {
        const novoTopico = await response.json();
        setTopicos([novoTopico, ...topicos]);
        setTitulo('');
        setConteudo('');
        setNomeAutor('');
      }
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
    }
  };

  const adicionarResposta = async (topicoId) => {
    if (!resposta.trim() || !nomeRespondente.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:4001/forum/${temaSelecionado}/${topicoId}/resposta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resposta: resposta.trim(), autor: nomeRespondente.trim() })
      });
      
      if (response.ok) {
        const topicoAtualizado = await response.json();
        setTopicos(topicos.map(t => t.id === topicoId ? topicoAtualizado : t));
        setResposta('');
        setNomeRespondente('');
      }
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error);
    }
  };

  const toggleTopico = (topicoId) => {
    setTopicoExpandido(topicoExpandido === topicoId ? null : topicoId);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            <span className="ring">💍</span>
            Fórum da Terra Média
            <span className="ring">💍</span>
          </h1>
          <p className="subtitle">Um lugar para os amantes de Tolkien se reunirem</p>
        </div>
      </header>

      <nav className="nav">
        {temas.map(tema => (
          <button
            key={tema.id}
            onClick={() => setTemaSelecionado(tema.id)}
            className={`nav-button ${temaSelecionado === tema.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{tema.icone}</span>
            {tema.nome}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="container">
          {temaSelecionado === 'chat' ? (
            <Chat />
          ) : (
            <>
              <section className="create-topic">
                <h2>Iniciar Nova Discussão</h2>
                <form onSubmit={criarTopico} className="topic-form">
                  <input
                    type="text"
                    placeholder="Seu nome..."
                    value={nomeAutor}
                    onChange={e => setNomeAutor(e.target.value)}
                    className="input-author"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Título do tópico..."
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    className="input-title"
                    required
                  />
                  <textarea
                    placeholder="Conte-nos sobre o que você gostaria de discutir..."
                    value={conteudo}
                    onChange={e => setConteudo(e.target.value)}
                    className="input-content"
                    rows="4"
                    required
                  />
                  <button type="submit" className="submit-btn">
                    ✨ Publicar Discussão
                  </button>
                </form>
              </section>

              <section className="topics">
                <h2>
                  Discussões sobre {temas.find(t => t.id === temaSelecionado)?.nome}
                  {carregando && <span className="loading">⏳</span>}
                </h2>
                
                {topicos.length === 0 && !carregando ? (
                  <div className="empty-state">
                    <p>🌟 Seja o primeiro a iniciar uma discussão!</p>
                  </div>
                ) : (
                  <div className="topics-list">
                    {topicos.map(topico => (
                      <div key={topico.id} className="topic-card">
                        <div className="topic-header" onClick={() => toggleTopico(topico.id)}>
                          <div className="topic-info">
                            <h3 className="topic-title">{topico.titulo}</h3>
                            <div className="topic-author">
                              👤 Por: <strong>{topico.autor}</strong> em {topico.dataPublicacao}
                            </div>
                          </div>
                          <div className="topic-meta">
                            <span className="replies-count">
                              💬 {topico.respostas.length} resposta{topico.respostas.length !== 1 ? 's' : ''}
                            </span>
                            <span className="expand-icon">
                              {topicoExpandido === topico.id ? '📖' : '📄'}
                            </span>
                          </div>
                        </div>
                        
                        {topicoExpandido === topico.id && (
                          <div className="topic-content">
                            <p className="topic-text">{topico.conteudo}</p>
                            
                            {topico.respostas.length > 0 && (
                              <div className="replies">
                                <h4>💭 Respostas:</h4>
                                {topico.respostas.map(resposta => (
                                  <div key={resposta.id} className="reply">
                                    <div className="reply-author">
                                      👤 <strong>{resposta.autor}</strong> - {resposta.dataResposta}
                                    </div>
                                    <p>{resposta.resposta}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="reply-form">
                              <input
                                type="text"
                                placeholder="Seu nome..."
                                value={nomeRespondente}
                                onChange={e => setNomeRespondente(e.target.value)}
                                className="reply-author-input"
                                required
                              />
                              <textarea
                                placeholder="Adicionar sua resposta..."
                                value={resposta}
                                onChange={e => setResposta(e.target.value)}
                                className="reply-input"
                                rows="3"
                              />
                              <button
                                onClick={() => adicionarResposta(topico.id)}
                                className="reply-btn"
                                disabled={!resposta.trim() || !nomeRespondente.trim()}
                              >
                                💫 Responder
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>🌟 "Nem todos os que vagueiam estão perdidos" - J.R.R. Tolkien 🌟</p>
      </footer>
    </div>
  );
}

export default App;
