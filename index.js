const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const client = new Client({
    authStrategy: new LocalAuth()
});

const qrcode = require('qrcode-terminal');
const tempDir = path.join(__dirname, '../temp');

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Mensagem inicial de boas-vindas
client.on('message', async (message) => {
    // Se a mensagem for a primeira ou qualquer mensagem não reconhecida, envia a mensagem inicial
    if (message.body === '' || message.body === undefined || message.body === null) {
        return; // Não faz nada se a mensagem estiver vazia ou indefinida
    }

    // Mensagem de boas-vindas caso o usuário não tenha enviado comandos conhecidos
    if (!message.body.startsWith('!') && !message.body.startsWith('/')) {
        const initialMessage = `
Olá! 👋

Eu sou um bot feito pelo luis felipe, e posso te ajudar com alguns comandos!

Caso você queira apenas conversar comigo, basta digitar qualquer coisa que eu vou tentar te ajudar!

Se precisar de algo mais específico, fale diretamente comigo, que eu responderei o melhor possível.

Envie *!help* ou */help* para ver todos os comandos disponíveis.
        `;
        client.sendMessage(message.from, initialMessage);
    }

    // Comando help
    if (message.body === '!help' || message.body === '/help') {
        const helpMessage = `
*Comandos disponíveis:*

1.  *!ping*  - Responde com "pong". 
2.  */f [imagem]*  - Envia uma figurinha a partir de uma imagem. 
3.  *!help ou /help*  - Mostra esta lista de comandos.

Envie um desses comandos para interagir com o bot.
        `;
        client.sendMessage(message.from, helpMessage);
        return; // Impede a execução do resto do código para essa mensagem
    }

    // Comando !ping
    if (message.body === '!ping') {
        setTimeout(() => {
            client.sendMessage(message.from, 'pong');
        }, 5000);
    }

    // Comando /f para enviar uma figurinha
    if (message.body === '/f' && message.hasMedia) {
        const media = await message.downloadMedia();

        if (media.mimetype.startsWith('image/')) {
            await fs.ensureDir(tempDir);

            const inputPath = path.join(tempDir, `input.${media.mimetype.split('/')[1]}`);
            const outputPath = path.join(tempDir, 'output.webp');

            await fs.writeFile(inputPath, media.data, 'base64');

            try {
                await sharp(inputPath)
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .webp({ quality: 100 })
                    .toFile(outputPath);

                const sticker = MessageMedia.fromFilePath(outputPath);

                setTimeout(async () => {
                    await client.sendMessage(message.from, sticker, { sendMediaAsSticker: true });

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
                console.error('Erro ao criar a figurinha:', err);
                message.reply('Erro ao criar a figurinha. Tente novamente.');
            }
        } else {
            message.reply('Por favor, envie uma imagem junto com o comando "/f".');
        }
    }
});

client.initialize();
