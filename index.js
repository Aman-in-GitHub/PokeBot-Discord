import { Client, GatewayIntentBits } from 'discord.js';
import Pokedex from 'pokedex-promise-v2';
import express from 'express';
import connectToDB from './db.js';
import logger from './logger.js';
import URL from './models/url.model.js';

const app = express();
const PORT = process.env.PORT || 9999;

// Middleware
app.use(express.json());

try {
  await connectToDB();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.log(error);
}

// Home
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Poke Discord Bot'
  });
});

// Refresh
app.get('/api/refresh', async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server refreshed'
  });
});

const refreshServer = async () => {
  try {
    const url = process.env.SERVER_URL;
    const response = await fetch(`${url}/api/refresh`);
    const data = await response.json();
    logger.info('Server refreshed:', data);
  } catch (error) {
    console.error('Error refreshing server:', error);
  }
};

const interval = 12 * 60 * 1000;
setInterval(refreshServer, interval);

// 404
app.get('/404', (req, res) => {
  res.status(404).json({
    success: false,
    message: '404 - Page not found'
  });
});

// Expired
app.get('/404/expired', (req, res) => {
  res.status(404).json({
    success: false,
    message: '404 - Link has expired'
  });
});

// Shorten URL
import urlRouter from './routes/url.route.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

app.use('/url', urlRouter);

// Redirect
app.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  const ip = req.ip || req.socket.remoteAddress;

  try {
    const url = await URL.find({ shortID: id });

    if (url.length === 0) {
      return res.redirect('/404');
    }

    let redirectUrl = url[0].redirect;

    if (url[0].expiry) {
      const expiryDate = new Date(url[0].expiry);
      const currentDate = new Date();

      if (currentDate > expiryDate) {
        await URL.findOneAndUpdate(
          {
            shortID: id
          },
          {
            $set: {
              status: 'expired'
            }
          }
        );

        logger.warn(`ID ${id} has expired for address ${redirectUrl}`);
        return res.redirect('/404/expired');
      }
    }

    if (!redirectUrl) {
      return res.redirect('/404');
    }

    if (!/^https?:\/\//i.test(redirectUrl)) {
      redirectUrl = 'https://' + redirectUrl;
    }

    try {
      await URL.findOneAndUpdate(
        {
          shortID: id
        },
        {
          $push: {
            history: {
              timestamp: new Date(),
              ip: ip
            }
          },
          $inc: {
            totalClicks: 1
          }
        }
      );
    } catch (error) {
      const errorMsg = new Error(error?.message || error);
      error.status = 500;
      return next(errorMsg);
    }

    logger.info(`${ip} has shortened ${id} to ${redirectUrl}`);

    return res.redirect(redirectUrl);
  } catch (error) {
    const errorMsg = new Error(error?.message || error);
    error.status = 404;
    return next(errorMsg);
  }
});

// Final Middlewares
app.use(notFound);
app.use(errorHandler);

const pokedex = new Pokedex();

async function getPokemon(number) {
  try {
    const response = await pokedex.getPokemonByName(number);
    const name = response.forms[0]?.name;
    return name || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const token = process.env.DISCORD_TOKEN;
const regex = /poke\s*(\d+)/i;

try {
  client.login(token);
  console.log('Bot is now running.');
} catch (error) {
  console.log(error);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Pong!');
  } else if (regex.test(message.content)) {
    const match = message.content.match(regex);
    const number = match[1];

    const pokemon = await getPokemon(number);

    message.reply(`Poke ${number}: ${pokemon}`);
  } else if (message.content.includes('!shorten')) {
    const url = message.content.split('!shorten ')[1];

    const res = await fetch(`${process.env.SERVER_URL}/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url
      })
    });

    const data = await res.json();

    const shortUrl = data?.shortUrl;

    if (shortUrl) {
      message.reply(`Shortened URL: ${shortUrl}`);
    } else {
      message.reply('Error: Invalid URL');
    }
  } else if (message.content.includes('!analytics')) {
    const url = message.content.split('!analytics ')[1];

    const res = await fetch(`${process.env.SERVER_URL}/url/analytics/${url}`);

    const data = await res.json();

    const analytics = data?.message;

    if (analytics) {
      message.reply(`Analytics: ${JSON.stringify(analytics)}`);
    } else {
      message.reply('Error: Invalid URL');
    }
  }
});
