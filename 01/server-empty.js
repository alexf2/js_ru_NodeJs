const {Server} = require('http'); // {Server: }, destructuring

// same as http.createServer((req, res) => ...)
const server = new Server((req, res) => {
  // empty
});

server.listen(8000);
