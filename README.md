# Minecraft: Bedrock Edition World Records

## About

Minecraft: Bedrock Edition World Records (mcbewrs) is a world record history site for [Minecraft: Bedrock Edition speedrunning](https://www.speedrun.com/mcbe) heavily inspired by Cole Gilberts [mkwrs](https://www.mkwrs.com/) and [fzerowrs](https://www.fzerowrs.com).

## Usage

### Development mode

To start the website you must first install all dependencies, add a database, config and user database, then you can just start the server.
Consult [the documentation](docs/db/) for how to configure databases.
`data/config.json` is just

```json
{
	"db_secret": "foo",
	"token_secret": "bar",
	"port": 5000
}
```

After all that you can start the server

```sh
npm install
npm start
```

### Self hosting (not recommended)

(First read [development mode](#development-mode), specifically about configuring databases and config files.)
If you wish to host your own instance it's best to optimise a couple of stuff.

1. Set up NGINX to serve static files. For example:

    ```nginx
    server {
        # Listen to IPv4 and IPv6
        listen 80;
        listen [::]:80;

        #server_name wrs.mcbe.wtf;
        # Change the port to whatever you have in data/config.json
        location /cdn/ {
        root /path/to/mcbewrs/public;
        }

        location / {
            proxy_pass http://localhost:PORT;
        }
    }
    ```

2. `npm run start-production` for self hosting and not developer mode

## Developers

### Formatting

After saving your code please run `npm run format` to format the code as per the configuration in `.clang-format`

### File structure

-   `docs/`
    -   This is where all the documentation goes.
-   `src/data/`
    -   This is where the important data goes, such as the databases, and the `config.json`.
    -   By default, this directory does not exist. You can set it up by running `src/utils/setup_data.sh`.
-   `src/public/`
    -   **DO NOT** put any sensitive information in the `src/public/` folder as that folder is visable to everyone accessing the server.
    -   This is where things like stylesheets and assets go.
-   `src/routes/`
    -   This is where the server side code goes for each page. These must be defined in `src/app.js` to be accessible from the browser.
-   `src/utils/`
    -   This is where the utilities go, such as cron jobs, or javascript functions that are used in other files.
-   `src/views/`
    -   This is where the pug template files go, like the player profiles and navigation bar.
