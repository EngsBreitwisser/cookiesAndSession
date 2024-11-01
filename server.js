const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, '')));

app.listen(PORT, () => {
  console.log(`Server rodando no endereço: http://localhost:${PORT}`);
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'BrunoZica' && password === 'batatadoce') {
    req.session.user = { username };
    res.send('Login realizado com sucesso');
  } else {
    res.status(401).send('Login/senha inválidos');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Não foi possível realizar o Login');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(403).send(`
    <p>Você não tem permissão para acessar essa página!!!</p>
    <button id="botao_logout">Sair</button>
    <script>
    document.getElementById('botao_logout').addEventListener('click', async () => {
      const response = await fetch('/logout', { method: 'POST' });
      const result = await response.text();

      if (response.ok) {
        window.location.href = '/login';
      }
    });
  </script>
    `);
}

app.get('/home', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});