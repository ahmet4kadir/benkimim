"""Ben Kimim? — tek başına çalışan WebSocket sunucusu.

Oyun mantığı `benkimim/` paketindedir; aynı paket ahmetkadir.com
deposundaki birleşik oyun sunucusunda (oyun-server/) da kullanılır.
Üretimde istemci wss://wsoyun.ahmetkadir.com adresine bağlanır.

    pip install -r requirements.txt
    python main.py              # ws://localhost:8765
    PORT=8686 python main.py    # farklı port
"""
import asyncio
import json
import os

import websockets

import benkimim


async def handler(websocket):
    try:
        async for raw in websocket:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send(json.dumps({"type": "error", "message": "Geçersiz JSON."}))
                continue

            if data.get("type") == "join":
                await benkimim.handle_join(websocket, data)
            elif benkimim.is_benkimim_ws(websocket):
                await benkimim.handle_message(websocket, data)
            else:
                await websocket.send(json.dumps({"type": "error", "message": "Önce odaya katılmalısın (join)."}))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await benkimim.handle_disconnect(websocket)


def health_check(connection, request):
    """Yük dengeleyici sağlık kontrolü (websockets >= 14 API)."""
    if request.path == "/health":
        return connection.respond(200, "OK\n")
    return None


async def main():
    port = int(os.environ.get("PORT", 8765))
    print(f"🎭 Ben Kimim? sunucusu ws://0.0.0.0:{port}")
    async with websockets.serve(
        handler,
        "",
        port,
        ping_interval=20,
        ping_timeout=20,
        process_request=health_check,
    ):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
