const express = require("express");
const port = 3000;
const { Server } = require("socket.io");
const http = require("http");

let run = () => {
  const app = express();
  app.use(express.static("public"));
  const server = http.createServer(app);
  const io = new Server(server);
  server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
  return io;
};

module.exports = {
  run: run,
};
