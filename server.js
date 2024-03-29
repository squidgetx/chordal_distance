const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

let run = (port) => {
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
