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

client.on("message", async (message) => {
  if (
    message.body === "" ||
    message.body === undefined ||
    message.body === null
  ) {
    return; // Não faz nada se a mensagem estiver vazia ou indefinida
    return;
  }

  if (!message.body.startsWith("!") && !message.body.startsWith("/")) {
    const initialMessage = `
Olá! 👋
Eu sou um bot feito pelo luis felipe, e posso te ajudar com alguns comandos!
Caso você queira apenas conversar comigo, basta digitar qualquer coisa que eu vou tentar te ajudar!
Se precisar de algo mais específico, fale diretamente comigo, que eu responderei o melhor possível.
Envie *!help* ou */help* para ver todos os comandos disponíveis.
        `;
    client.sendMessage(message.from, initialMessage);
  }

  if (message.body === "!help" || message.body === "/help") {
    const helpMessage = `
*Comandos disponíveis:*
1.  *!ping*  - Responde com "pong". 
2.  */f [imagem]*  - Envia uma figurinha a partir de uma imagem. 
3.  *!help ou /help*  - Mostra esta lista de comandos.
Envie um desses comandos para interagir com o bot.
        `;
    client.sendMessage(message.from, helpMessage);
    return;
  }

  if (message.body === "!ping") {
    setTimeout(() => {
      client.sendMessage(message.from, "pong");
    }, 5000);
  }

  if (message.body === "/f" && message.hasMedia) {
    const media = await message.downloadMedia();

    if (media.mimetype.startsWith("image/")) {
      await fs.ensureDir(tempDir);

      const inputPath = path.join(
        tempDir,
        `input.${media.mimetype.split("/")[1]}`
      );
      const outputPath = path.join(tempDir, "output.webp");

      await fs.writeFile(inputPath, media.data, "base64");

      try {
        await sharp(inputPath)
          .resize(512, 512, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: 100 })
          .toFile(outputPath);

        const sticker = MessageMedia.fromFilePath(outputPath);

        setTimeout(async () => {
          await client.sendMessage(message.from, sticker, {
            sendMediaAsSticker: true,
          });

          setTimeout(async () => {
            try {
              await fs.unlink(outputPath);
              console.log(`Arquivo removido: ${outputPath}`);
            } catch (err) {
              console.error(`Erro ao remover ${outputPath}:`, err);
            }

            try {
              await fs.access(inputPath);
              await fs.rename(inputPath, `${inputPath}.tmp`);
              await fs.unlink(inputPath);
              await fs.unlink(`${inputPath}.tmp`);
              console.log(`Arquivo removido: ${inputPath}`);
            } catch (err) {
              console.error(`Erro ao remover ou renomear ${inputPath}:`, err);
            }
          }, 2000);
        }, 5000);
      } catch (err) {
        console.error("Erro ao criar a figurinha:", err);
        message.reply("Erro ao criar a figurinha. Tente novamente.");
      }
    } else {
      message.reply('Por favor, envie uma imagem junto com o comando "/f".');
    }
  }
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

app.listen(port, () => {
  console.log(`Servidor Backend rodando na porta ${port}`);
});
