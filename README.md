# Poke Discord Bot

The Poke Discord Bot is a versatile Discord bot designed to provide various functionalities related to URL shortening and Pokémon information. Built using Node.js and Discord.js, this bot offers a range of features to enhance Discord server interactions.

## Features

1.  **URL Shortening**: Users can shorten URLs using the `!shorten` command. The bot generates a shortened URL and provides it as a response, facilitating easy sharing of links.
2.  **URL Analytics**: Users can retrieve analytics for a shortened URL using the `!analytics` command. The bot provides information such as total clicks and historical data associated with the specified URL.
3.  **Pokémon Information**: By using the `!poke` command followed by a Pokémon ID, users can retrieve information about the Pokémon. The bot fetches data from the Pokédex API and responds with details like the Pokémon's name.

## Usage

To interact with the URL Poke Discord Bot, users can simply type commands in the Discord chat. Here are some example commands:

- `!shorten <URL>`: Shortens the provided URL and returns the shortened link.
- `!analytics <URL>`: Retrieves analytics for the specified shortened URL, including total clicks and historical data.
- `!poke <Pokémon ID>`: Fetches information about the Pokémon associated with the provided ID and responds with details.

## How to Run

To deploy and run the URL Poke Discord Bot:

1. Clone the repository to your local machine.
2. Install the required dependencies using pnpm
3. Set up environment variables such as Discord token and server URL.
4. Run the bot application using Node.js.
5. Ensure the bot is added to your Discord server and has appropriate permissions.

## Technologies Used

- Node.js
- Discord.js
- Express.js
- MongoDB (for database)
- Pokedex Promise v2 API

_Shorten URLs, Catch Pokémon - All in one Discord Bot!_
