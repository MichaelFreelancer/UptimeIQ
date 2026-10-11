
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);

app.use(cors());

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

const monitoredApis = [
  { id: 1, name: "Payments API", endpoint: "/api/payments" },
  { id: 2, name: "Users API", endpoint: "/api/users" },
  { id: 3, name: "Orders API", endpoint: "/api/orders" },
];


function generateMetric(api) {
  const responseTime = Math.floor(Math.random() * 450) + 80;
  const isDown = Math.random() < 0.08;

  return {
    ...api,
    status: isDown
      ? "Down"
      : responseTime > 350
        ? "Slow"
        : "Healthy",
    responseTime: isDown ? null : responseTime,
    errorCount: isDown
      ? Math.floor(Math.random() * 5) + 1
      : 0,
    timestamp: new Date().toISOString(),
  };
}


app.get("/", (req, res) => {
  res.json({
    name: "UptimeIQ API",
    status: "running",
  });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


setInterval(() => {
  const metrics = monitoredApis.map((api) => generateMetric(api));

  io.emit("metrics-update", metrics);

  console.log("Sent simulated metrics:", new Date().toLocaleTimeString());
}, 2000);


httpServer.listen(PORT, () => {
  console.log(`UptimeIQ server running at http://localhost:${PORT}`);
});
