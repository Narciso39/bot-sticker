const { spawn } = require("child_process");
const path = require("path");

let backendProcess = null;

function startBackend() {
  if (backendProcess) {
    console.log("O backend já está rodando.");
    return;
  }

  const backendPath =
    "C:\\Users\\Felipe\\Desktop\\www\\bot-sticker\\backend\\src";

  console.log(`Iniciando o backend em: ${backendPath}`);

  backendProcess = spawn("node", [backendPath], { stdio: "inherit" });

  backendProcess.on("close", (code) => {
    console.log(`Backend encerrado com código ${code}`);
    backendProcess = null;
  });

  backendProcess.on("error", (error) => {
    console.error(`Erro ao iniciar o backend: ${error.message}`);
  });
}

const startBot = async () => {
  const response = await fetch("http://localhost:3001/start-bot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    return true;
  }
};

document.getElementById("startBackendBtn").addEventListener("click", () => {
  console.log('Botão "Iniciar Backend" clicado.');
  startBackend();
});

const fetchQRCode = async () => {
  try {
    const response = await fetch("http://localhost:3001/qr");
    if (response.ok) {
      const data = await response.json();
      console.log("Dados recebidos do backend:", data);

      const qrCodeUrl = data.qrCode;
      let qrImage = document.getElementById("qrCode");

      if (qrImage) {
        qrImage.src = qrCodeUrl;
        console.log("QR Code atualizado com sucesso!");
      } else {
        console.error("Elemento da imagem do QR Code não encontrado!");
      }
    } else {
      console.error("Falha ao buscar QR Code:", response.status);
    }
  } catch (error) {
    console.error("Erro ao buscar o QR Code:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM totalmente carregado!");
  startBot();
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM totalmente carregado!");
  fetchQRCode();
});
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
