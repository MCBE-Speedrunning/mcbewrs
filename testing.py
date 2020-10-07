import aiohttp
import asyncio


async def add(session: aiohttp.client.ClientSession, run: dict = {}) -> dict:
    if not run:
        async with session.post(
            "https://127.0.0.1/api/run/add",
            data={"name": "skye", "time": 69, "link": "https://github.com/skycloudd"},
            verify_ssl=False,
        ) as r:
            return await r.json()
    else:
        async with session.post("https://127.0.0.1/api/run/add", data=run, verify_ssl=False) as r:
            return await r.json()


async def edit(session: aiohttp.client.ClientSession, runID: str, run: dict = {}) -> dict:
    if not run:
        async with session.patch(
            f"https://127.0.0.1/api/run/{runID}",
            data={"name": "PepeWasHere"},
            verify_ssl=False,
        ) as r:
            return await r.json()


async def main():
    async with aiohttp.ClientSession() as session:
        r = await edit(session, "ueyPL")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
