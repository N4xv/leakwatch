const axios = require("axios");
const PATTERNS = require("./patterns");

const GITHUB_API = "https://api.github.com";
//implantación del token de GitHub en el módulo principal
const getHeaders = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
});

async function scanRepo(owner, repo) {
  const findings = []; // verificación del dueño del proyecto y validación de datos para verificar la ruta del repositorio 

  try {
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      { headers: getHeaders() } //extracción y posterior uso de la Api de GitHub para añadir las utilidades 
    );

    const files = data.tree.filter((f) => f.type === "blob");

    for (const file of files) {
      try {
        const { data: content } = await axios.get(
          `${GITHUB_API}/repos/${owner}/${repo}/contents/${file.path}`,
          { headers: getHeaders() }
        );

        if (!content.content) continue;

        const decoded = Buffer.from(content.content, "base64").toString("utf-8");

        for (const pattern of PATTERNS) {
          if (pattern.regex.test(decoded)) {
            findings.push({
              file: file.path,
              type: pattern.name,
              repo: `${owner}/${repo}`,
              url: content.html_url,
            });
          }
        }
      } catch (e) {
        continue;
      }
    }
  } catch (err) {
    console.error(`Error escaneando ${owner}/${repo}:`, err.message);
  }

  return findings;
}

module.exports = { scanRepo };