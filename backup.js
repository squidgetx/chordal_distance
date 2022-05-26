const BACKUP_PORT = 3001;

const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const { restart_all } = require("./restart");

let run = (port) => {
  const app = express();
  //app.use(express.static("public"));
  app.get("/", (req, res) => {
    res.send("Server restarted");
    restart_all();
  });
  const server = http.createServer(app);
  const io = new Server(server);
  server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
  return io;
};

let io_backup = run(BACKUP_PORT);
