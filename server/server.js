const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Socket.io para chat em tempo real
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Estrutura de dados em memória para tópicos dos fóruns
const forums = {
  filmes: [],
  livros: [],
  personagens: []
};

// Listar tópicos de um fórum
app.get('/forum/:tema', (req, res) => {
  const { tema } = req.params;
  if (!forums[tema]) {
    return res.status(404).json({ error: 'Fórum não encontrado' });
  }
  res.json(forums[tema]);
});

// Criar novo tópico em um fórum
app.post('/forum/:tema', (req, res) => {
  const { tema } = req.params;
  const { titulo, conteudo, autor } = req.body;
  if (!forums[tema]) {
    return res.status(404).json({ error: 'Fórum não encontrado' });
  }
  if (!titulo || !conteudo || !autor) {
    return res.status(400).json({ error: 'Título, conteúdo e nome do autor são obrigatórios' });
  }
  const novoTopico = {
    id: Date.now(),
    titulo,
    conteudo,
    autor,
    dataPublicacao: new Date().toLocaleString('pt-BR'),
    respostas: []
  };
  forums[tema].push(novoTopico);
  res.status(201).json(novoTopico);
});

// Adicionar resposta a um tópico
app.post('/forum/:tema/:id/resposta', (req, res) => {
  const { tema, id } = req.params;
  const { resposta, autor } = req.body;
  if (!forums[tema]) {
    return res.status(404).json({ error: 'Fórum não encontrado' });
  }
  const topico = forums[tema].find(t => t.id == id);
  if (!topico) {
    return res.status(404).json({ error: 'Tópico não encontrado' });
  }
  if (!resposta || !autor) {
    return res.status(400).json({ error: 'Resposta e nome do autor são obrigatórios' });
  }
  topico.respostas.push({
    id: Date.now(),
    resposta,
    autor,
    dataResposta: new Date().toLocaleString('pt-BR')
  });
  res.status(201).json(topico);
});

io.on("connection", (socket) => {
    console.log("Novo usuario conectado" + socket.id);

    socket.on("sendMessage", (data) => {
        console.log(`[${data.username}]: ${data.message}`);
        io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado" + socket.id);
    });
});

server.listen(4001, () => {
    console.log("Servidor rodando na porta 4001");
});