"""Ben Kimim? — WebSocket mesaj işleyicileri.

whoami projesindeki server/main.py'den port edildi; sunucu döngüsü yerine
yalnızca handler'lar kaldı. main.py (arena çekirdeği) "join" mesajında
"game" alanı YOKSA bağlantıyı buraya devreder — eski Ben Kimim? istemcisi
hiçbir değişiklik olmadan çalışmaya devam eder.
"""
from __future__ import annotations

import json

from .game import (
    create_or_join_room,
    remove_player,
    get_player_room,
    Room,
    Player,
)
from .messages import t, normalize_lang, DEFAULT_LANG

# Aktif bağlantılar: websocket -> player_id
connected_players: dict = {}


def is_benkimim_ws(websocket) -> bool:
    return websocket in connected_players


def _lang_of(player_id: str | None) -> str:
    if player_id:
        room = get_player_room(player_id)
        if room and player_id in room.players:
            return room.players[player_id].lang
    return DEFAULT_LANG


async def handle_join(websocket, data: dict) -> Player | None:
    """Oyuncu katılma isteğini işle."""
    player_name = data.get("playerName", "").strip()
    room_code = data.get("roomCode", "").strip().upper() or None
    lang = normalize_lang(data.get("lang"))

    if not player_name:
        await websocket.send(json.dumps({
            "type": "error",
            "message": t(lang, "empty_name")
        }))
        return None

    try:
        player, room, is_new = create_or_join_room(player_name, room_code, websocket, lang=lang)
    except ValueError as e:
        await websocket.send(json.dumps({
            "type": "error",
            "message": str(e)
        }))
        return None

    connected_players[websocket] = player.id

    await player.send({
        "type": "welcome",
        "playerId": player.id,
        "roomCode": room.code,
        "isHost": room.host.id == player.id,
        "poolLang": room.pool_lang,
    })
    await room.send_lobby_update()

    action = "oluşturdu" if is_new else "katıldı"
    print(f"[benkimim] {player.name} ({player.id}) odaya {action}: {room.code}")
    return player


async def handle_message(websocket, data: dict):
    """join sonrası gelen tüm Ben Kimim? mesajlarını yönlendir."""
    player_id = connected_players.get(websocket)
    if not player_id:
        await websocket.send(json.dumps({
            "type": "error",
            "message": "Önce odaya katılmalısın (join)."
        }))
        return

    msg_type = data.get("type")
    if msg_type == "start_game":
        await _handle_start_game(player_id, data)
    elif msg_type == "guess":
        await _handle_guess(player_id, data)
    elif msg_type == "new_round":
        await _handle_new_round(player_id, data)
    elif msg_type == "set_avatar":
        await _handle_set_avatar(player_id, data)
    elif msg_type == "set_lang":
        await _handle_set_lang(player_id, data)
    elif msg_type == "post_message":
        await _handle_post_message(player_id, data)
    elif msg_type == "next_turn":
        await _handle_next_turn(player_id, data)
    else:
        await websocket.send(json.dumps({
            "type": "error",
            "message": t(_lang_of(player_id), "unknown_event_type", kind=msg_type)
        }))


async def _handle_start_game(player_id: str, data: dict):
    """Oyunu başlat (sadece host yapabilir)."""
    room = get_player_room(player_id)
    if not room:
        return

    requester = room.players.get(player_id)
    rlang = requester.lang if requester else DEFAULT_LANG

    if room.host.id != player_id:
        await room.players[player_id].send({
            "type": "error",
            "message": t(rlang, "only_host_can_start")
        })
        return

    category = data.get("category", "populer_ikonlar")
    difficulty = data.get("difficulty", "hepsi")
    custom_words = data.get("customWords") or []
    timer_seconds = int(data.get("timerSeconds") or 0)
    pool_limit = int(data.get("poolLimit") or 0)
    pool_lang = data.get("poolLang") or room.pool_lang

    try:
        room.assign_names(category, difficulty, custom_words, timer_seconds, pool_limit,
                          pool_lang=pool_lang, requester_lang=rlang)
    except ValueError as e:
        await room.players[player_id].send({
            "type": "error",
            "message": str(e)
        })
        return

    await room.send_game_state()
    room.start_timer_task()

    print(f"[benkimim] Oda {room.code} oyunu başlattı ({len(room.players)} oyuncu, dil={room.pool_lang}, kategori={category}, zorluk={difficulty}, havuz={pool_limit or 'tam'}, süre={timer_seconds}s)")


async def _handle_guess(player_id: str, data: dict):
    """Tahmin isteğini işle."""
    room = get_player_room(player_id)
    if not room:
        return

    player = room.players.get(player_id)
    if not player:
        return

    if room.state != Room.PLAYING:
        await player.send({
            "type": "guess_result",
            "correct": False,
            "message": t(player.lang, "game_not_active"),
        })
        return

    # Sadece sıradaki oyuncu tahmin yapabilir
    if room.current_turn_id != player_id:
        await player.send({
            "type": "guess_result",
            "correct": False,
            "message": t(player.lang, "not_your_turn"),
        })
        return

    guess = data.get("guess", "").strip()
    if not guess:
        await player.send({
            "type": "guess_result",
            "correct": False,
            "message": t(player.lang, "empty_guess"),
        })
        return

    correct, message = room.check_guess(player_id, guess)

    await player.send({
        "type": "guess_result",
        "correct": correct,
        "message": message,
        "rank": player.rank if correct else None,
        "turnCount": player.reveal_turn if correct else None,
        "elapsedSeconds": player.reveal_time_seconds if correct else None,
    })

    # Herkese tahmini chat log'a bildir
    guess_entry = {
        "id": f"g{len(room.qa_log) + 1}",
        "playerId": player.id,
        "playerName": player.name,
        "avatar": player.avatar,
        "text": guess,
        "kind": "guess_correct" if correct else "guess_wrong",
    }
    if correct:
        guess_entry["rank"] = player.rank
        guess_entry["turnCount"] = player.reveal_turn
        guess_entry["elapsedSeconds"] = player.reveal_time_seconds
    room.add_log_entry(guess_entry)
    await room.broadcast({
        "type": "log_message",
        "entry": guess_entry,
    })

    if correct:
        await room.broadcast({
            "type": "player_revealed",
            "playerId": player.id,
            "playerName": player.name,
            "assignedName": player.assigned_name,
            "rank": player.rank,
            "turnCount": player.reveal_turn,
            "elapsedSeconds": player.reveal_time_seconds,
        })

        if room.is_game_over():
            room.state = Room.FINISHED
            room._cancel_timer()
            await room.broadcast({
                "type": "game_over",
                "rankings": room.get_rankings(),
            })
            print(f"[benkimim] Oda {room.code} oyunu bitti!")
        else:
            room.advance_turn()
            await room.broadcast_turn()
            print(f"[benkimim] {player.name} doğru tahmin etti: {player.assigned_name} (sıra: {player.rank})")
    else:
        room.advance_turn()
        await room.broadcast_turn()


async def _handle_new_round(player_id: str, data: dict):
    """Yeni tur başlat."""
    room = get_player_room(player_id)
    if not room:
        return

    requester = room.players.get(player_id)
    rlang = requester.lang if requester else DEFAULT_LANG

    if room.host.id != player_id:
        await room.players[player_id].send({
            "type": "error",
            "message": t(rlang, "only_host_can_new_round")
        })
        return

    category = data.get("category", "populer_ikonlar")
    difficulty = data.get("difficulty", "hepsi")
    custom_words = data.get("customWords") or []
    timer_seconds = int(data.get("timerSeconds") or 0)
    pool_limit = int(data.get("poolLimit") or 0)
    pool_lang = data.get("poolLang") or room.pool_lang

    try:
        room.assign_names(category, difficulty, custom_words, timer_seconds, pool_limit,
                          pool_lang=pool_lang, requester_lang=rlang)
    except ValueError as e:
        await room.players[player_id].send({
            "type": "error",
            "message": str(e)
        })
        return

    await room.send_game_state()
    room.start_timer_task()
    print(f"[benkimim] Oda {room.code} yeni tur başlattı (dil={room.pool_lang})")


async def _handle_set_avatar(player_id: str, data: dict):
    """Oyuncu avatar emojisini değiştirir."""
    room = get_player_room(player_id)
    if not room:
        return
    player = room.players.get(player_id)
    if not player:
        return
    avatar = (data.get("avatar") or "").strip()
    if not avatar:
        return
    player.avatar = avatar[:8]
    await room.send_lobby_update()


async def _handle_set_lang(player_id: str, data: dict):
    """Oyuncu UI dilini değiştirir."""
    room = get_player_room(player_id)
    if not room:
        return
    player = room.players.get(player_id)
    if not player:
        return
    player.lang = normalize_lang(data.get("lang"))


async def _handle_post_message(player_id: str, data: dict):
    """Q&A log paneline mesaj gönder (oda chat'i)."""
    room = get_player_room(player_id)
    if not room:
        return
    player = room.players.get(player_id)
    if not player:
        return
    text = (data.get("text") or "").strip()
    if not text:
        return
    kind = data.get("kind") or "question"  # "question" | "yes" | "no" | "maybe" | "note"
    if kind not in ("question", "yes", "no", "maybe", "note"):
        kind = "question"

    entry = {
        "id": f"m{len(room.qa_log) + 1}",
        "playerId": player.id,
        "playerName": player.name,
        "avatar": player.avatar,
        "text": text[:200],
        "kind": kind,
    }
    room.add_log_entry(entry)
    await room.broadcast({
        "type": "log_message",
        "entry": entry,
    })


async def _handle_next_turn(player_id: str, data: dict):
    """Sırayı bir sonraki oyuncuya kaydır (pas hakkı)."""
    room = get_player_room(player_id)
    if not room or room.state != Room.PLAYING:
        return
    if player_id != room.current_turn_id and player_id != room.host.id:
        requester = room.players.get(player_id)
        rlang = requester.lang if requester else DEFAULT_LANG
        await room.players[player_id].send({
            "type": "error",
            "message": t(rlang, "only_turn_or_host_pass")
        })
        return
    room.advance_turn()
    await room.broadcast_turn()


async def handle_disconnect(websocket):
    """Bağlantı koptuğunda temizlik yap."""
    player_id = connected_players.pop(websocket, None)
    if not player_id:
        return

    room = get_player_room(player_id)
    remove_player(player_id)

    if room and room.players:
        await room.send_lobby_update()
        print(f"[benkimim] Oyuncu {player_id} ayrıldı, oda {room.code}")
    elif room:
        print(f"[benkimim] Oda {room.code} boşaldı, silindi")
