const express = require("express");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const qrcode = require("qrcode");
const app = express();
const port = 3001;

const tempDir = path.join(__dirname, "temp");

let isBotInitialized = false;

const client = new Client({
//   authStrategy: new LocalAuth(),
});

let qrCode = "";

client.on("ready", () => {
  console.log("Bot está pronto!");
  isBotInitialized = true;
});

client.on("qr", (qr) => {
  console.log("QR Code recebido, gerando imagem...");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.log("Erro ao gerar QR Code", err);
    } else {
      console.log("QR Code gerado com sucesso!");
      qrCode = url;
    }
  });
});

app.post("/start-bot", async (req, res) => {
  if (isBotInitialized) {
    return res.status(400).json({ message: "Bot já foi iniciado." });
  }

  try {
    await client.initialize();
    res.json({ message: "Bot iniciado com sucesso!" });
  } catch (error) {
    console.error("Erro ao iniciar o bot:", error);
    res.status(500).json({ message: "Erro ao iniciar o bot." });
  }
});

app.get("/qr", (req, res) => {
  if (qrCode) {
    res.json({ qrCode });
  } else {
    res.status(400).json({ message: "QR Code ainda não gerado." });
  }
});

app.post("/message", express.json(), async (req, res) => {
  const { body, to } = req.body;

  if (!body || !to) {
    return res.status(400).json({ message: 'Body e "to" são necessários.' });
  }

  try {
    await client.sendMessage(to, body);
    res.json({ message: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    res.status(500).json({ message: "Erro ao enviar mensagem." });
  }
});

client.on("message", async (msg) => {
  const chat = await msg.getChat();

  if (msg.body.toLowerCase() === "!help") {
    chat.sendMessage(
      `🤖 *Bot de Figurinhas* 🤖\n\n` +
        `📌 *Como usar:*\n` +
        `- Envie uma *imagem* e o bot criará uma figurinha para você.\n` +
        `- Use o comando *!help* para ver essa mensagem novamente.`
    );
    return;
  }

  if (msg.hasMedia) {
    const media = await msg.downloadMedia();

    if (!media || !media.mimetype.includes("image")) {
      chat.sendMessage(
        "❌ Apenas imagens são suportadas para criar figurinhas."
      );
      return;
    }

    try {
      await fs.ensureDir(tempDir);

      const inputPath = path.join(tempDir, "input.png");
      const outputPath = path.join(tempDir, "output.webp");

      await fs.writeFile(inputPath, media.data, "base64");

      await sharp(inputPath)
        .resize(512, 512, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 100 })
        .toFile(outputPath);

      const sticker = MessageMedia.fromFilePath(outputPath);

      await client.sendMessage(msg.from, sticker, { sendMediaAsSticker: true });

      await fs.unlink(outputPath);
      await fs.unlink(inputPath);
    } catch (err) {
      console.error("Erro ao criar a figurinha:", err);
      chat.sendMessage("❌ Ocorreu um erro ao criar a figurinha.");
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor Backend rodando na porta ${port}`);
});
