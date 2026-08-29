const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8"
  });

  res.end(
    JSON.stringify({
      app: "Wawera",
      status: "online",
      message: "Backend iniciado com sucesso."
    })
  );
});

server.listen(PORT, () => {
  console.log(`Wawera backend running on port ${PORT}`);
});
