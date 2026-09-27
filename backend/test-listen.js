const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('ok'));
const server = app.listen(3001, () => console.log('Listening on 3001'));
server.on('close', () => console.log('Server closed'));
