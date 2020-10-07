# Minecraft: Bedrock Edition World Records

## About

Minecraft: Bedrock Edition World Records (mcbewrs) is a world record history site for [Minecraft: Bedrock Edition speedrunning](https://www.speedrun.com/mcbe) heavily inspired by Cole Gilberts [mkwrs](https://www.mkwrs.com/) and [fzerowrs](https://www.fzerowrs.com).

## Usage

To start the website you must first install all dependencies, then you can just start the server

```sh
npm install
npm start
```

On Linux systems port 80 might be restricted to normal users, and as such you should run it as root.

## Developers

### Formatting

After saving your code please run `npm run format` to format the code as per the configuration in `package.json`

### File structure

**DO NOT** put any sensitive information in the `public/` folder as that folder is visable to everyone accessing the server.

- `views/`
  - This is where `.pug` files go, like the layout and navigation bar.
- `routes/`
  - This is where the server side code goes for each page. These must be defined in `app.js` to be accessible from the browser.
