console.log(process.env.NODE_PATH);

const {Server} = require('http'); // {Server, createServer, Agent}
const cntHandler = require('count-handler')

let i = 0;

const server = new Server();

/*server.on('request', (req, res) => {
  i++;
  res.end(i.toString()); // (!!! toString)
});*/

server.on('request', cntHandler)

server.listen(8000);

// NODE_PATH=.
