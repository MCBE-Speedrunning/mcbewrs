# Minecraft: Bedrock Edition World Records

## About

Minecraft: Bedrock Edition World Records (mcbewrs) is a world record history site for [Minecraft: Bedrock Edition speedrunning](https://www.speedrun.com/mcbe) heavily inspired by Cole Gilberts [mkwrs](https://www.mkwrs.com/) and [fzerowrs](https://www.fzerowrs.com).

## Usage

To start the website you must first install all dependencies, then you can just start the server.

```sh
sudo npm install
sudo npm start
```

On Linux systems port 80 might be restricted to normal users, and as such you should run it as root.

## Developers

### Formatting

After saving your code please run `npm run format` to format the code as per the configuration in `package.json`

### File structure

- `data/`
  - This is where the important data goes, such as the databases, and the `config.json`
- `docs/`
  - This is where all the documentation goes.
- `public`
  - **DO NOT** put any sensitive information in the `public/` folder as that folder is visable to everyone accessing the server.
  - This is where things like stylesheets and assets go.
- `routes/`
  - This is where the server side code goes for each page. These must be defined in `app.js` to be accessible from the browser.
- `utils/`
  - This is where the utilities go, such as cron jobs, or javascript functions that are used in other files.
- `views/`
  - This is where the pug template files go, like the player profiles and navigation bar.
