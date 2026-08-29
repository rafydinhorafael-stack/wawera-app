const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }


  if (req.url === "/") {

    res.writeHead(200);

    res.end(
      JSON.stringify({
        app: "Wawera",
        status: "online",
        message: "Backend da Wawera está funcionando!"
      })
    );

    return;
  }


  if (req.url === "/api/health") {

    res.writeHead(200);

    res.end(
      JSON.stringify({
        status: "ok",
        service: "wawera-api",
        version: "1.0.0"
      })
    );

    return;
  }


  res.writeHead(404);

  res.end(
    JSON.stringify({
      error: "Rota não encontrada"
    })
  );
});


server.listen(PORT, () => {

  console.log(
    `Wawera backend running on port ${PORT}`
  );

});
