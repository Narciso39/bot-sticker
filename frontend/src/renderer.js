const { exec } = require("child_process");
const path = require("path");

function startBackend() {
  const backendPath = path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "src",
    "index.js"
  );

  console.log(`Tentando iniciar o backend em: ${backendPath}`);

  exec(`node ${backendPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao iniciar o backend: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Erro no backend: ${stderr}`);
      return;
    }
    console.log(`Backend iniciado: ${stdout}`);
  });
}

document.getElementById("startBackendBtn").addEventListener("click", () => {
  console.log('Botão "Iniciar Backend" clicado.');
  startBackend();
});

const fetchQRCode = async () => {
  try {
    const response = await fetch("http://localhost:3001/qr");
    if (response.ok) {
      const data = await response.json();
      const qrCodeUrl = data.qrCode;
      const qrImage = document.getElementById("qrCode");
      qrImage.src = qrCodeUrl;
    } else {
      console.error("QR Code não gerado ainda");
    }
  } catch (error) {
    console.error("Erro ao buscar o QR Code:", error);
  }
};

window.onload = () => {
  fetchQRCode();
};

async function sendMessage() {
  const message = document.getElementById("messageInput").value;
  const to = "numero_do_destinatario";

  if (message) {
    try {
      const response = await fetch("http://localhost:3001/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: message, to }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  }
}

async function sendSticker() {
  const imageBase64 = "";

  try {
    const response = await fetch("http://localhost:3001/sticker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mediaBase64: imageBase64 }),
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Erro ao enviar figurinha:", error);
  }
}
