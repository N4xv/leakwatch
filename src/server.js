console.log("Iniciando servidor...");
require("dotenv").config();
const express = require("express");
const { scanRepo } = require("./scanner");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("C:\\Users\\tu_user_aqui\\Leakwatch\\gitsecret-scanner\\public"));
app.post("/scan", async (req, res) => {
  const { owner, repo } = req.body;

  if (!owner || !repo) {
    return res.status(400).json({ error: "owner y repo son requeridos" }); //campo obligatorio, no se debe dejar en null 
  }

  const findings = await scanRepo(owner, repo); //función con el enlazamiento y posterior enrutamiento de puertos en scanner.js
  res.json({ findings, total: findings.length });
});

app.listen(PORT, () => {
  console.log(`LeakWatch corriendo en http://localhost:${PORT}`);
});