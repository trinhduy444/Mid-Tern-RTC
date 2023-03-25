const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const port = 3030;



app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const { getRandomValues } = require("crypto");
const opinions = {
  debug: true,
}

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", { roomId: uuidv4() });
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room, userName: "Anonymous" + Math.floor(Math.random() * 1000) });
});


app.post("/:room", (req, res) => {
  const { nameJoin } = req.body;
  const { nameCreate} = req.body;
  if(nameJoin != null){
    res.render("room", { roomId: req.params.room, userName : nameJoin});
  }
  else {
    res.render("room", { roomId: req.params.room, userName : nameCreate});  
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(()=>{
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000)
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

io.on("user-disconnected", (roomId,userId) => {
  io.to(roomId).emit("user-disconnected", userId);
});

server.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
