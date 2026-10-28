"""Sunucudan istemciye gönderilen mesajların TR/EN/DE çevirileri."""

SUPPORTED_LANGS = ("tr", "en", "de")
DEFAULT_LANG = "tr"


MESSAGES: dict[str, dict[str, str]] = {
    # join / lobby
    "empty_name": {
        "tr": "İsim boş olamaz!",
        "en": "Name can't be empty!",
        "de": "Name darf nicht leer sein!",
    },
    "room_game_started": {
        "tr": "Oyun zaten başlamış, katılamazsın!",
        "en": "Game already started — you can't join!",
        "de": "Spiel hat schon begonnen — du kannst nicht beitreten!",
    },

    # host gating
    "only_host_can_start": {
        "tr": "Sadece oda sahibi oyunu başlatabilir!",
        "en": "Only the room host can start the game!",
        "de": "Nur der Host kann das Spiel starten!",
    },
    "only_host_can_new_round": {
        "tr": "Sadece oda sahibi yeni tur başlatabilir!",
        "en": "Only the room host can start a new round!",
        "de": "Nur der Host kann eine neue Runde starten!",
    },
    "only_turn_or_host_pass": {
        "tr": "Sadece sırası gelen oyuncu veya oda sahibi pas çekebilir.",
        "en": "Only the current player or the host can pass.",
        "de": "Nur der aktuelle Spieler oder der Host kann passen.",
    },

    # game state
    "game_not_active": {
        "tr": "Oyun aktif değil.",
        "en": "Game is not active.",
        "de": "Das Spiel ist nicht aktiv.",
    },
    "not_your_turn": {
        "tr": "Sıran değil, biraz bekle!",
        "en": "Not your turn — wait a moment!",
        "de": "Du bist nicht dran — warte einen Moment!",
    },

    # guesses
    "empty_guess": {
        "tr": "Boş tahmin gönderilemez!",
        "en": "Can't submit an empty guess!",
        "de": "Du kannst keinen leeren Tipp abgeben!",
    },
    "player_not_found": {
        "tr": "Oyuncu bulunamadı.",
        "en": "Player not found.",
        "de": "Spieler nicht gefunden.",
    },
    "already_guessed": {
        "tr": "Zaten doğru tahmin ettin!",
        "en": "You've already guessed correctly!",
        "de": "Du hast schon richtig getippt!",
    },
    "guess_correct": {
        "tr": "Doğru! Sen {name} idin!",
        "en": "Correct! You were {name}!",
        "de": "Richtig! Du warst {name}!",
    },
    "guess_wrong": {
        "tr": "Yanlış tahmin, tekrar dene!",
        "en": "Wrong guess — try again!",
        "de": "Falscher Tipp — versuch's nochmal!",
    },

    # pool / category errors
    "category_empty": {
        "tr": "Kategori boş, oyun başlatılamaz.",
        "en": "Category is empty — can't start the game.",
        "de": "Kategorie ist leer — Spiel kann nicht starten.",
    },
    "pool_smaller_than_players": {
        "tr": "Toplam seçenek ({limit}) oyuncu sayısından ({players}) az olamaz.",
        "en": "Pool size ({limit}) can't be smaller than the number of players ({players}).",
        "de": "Pool-Größe ({limit}) darf nicht kleiner als die Spielerzahl ({players}) sein.",
    },
    "pool_not_enough_words": {
        "tr": "Havuzda en fazla {available} kelime var, {players} oyuncuya yetmez.",
        "en": "Pool has only {available} words — not enough for {players} players.",
        "de": "Pool hat nur {available} Wörter — reicht nicht für {players} Spieler.",
    },

    # protocol
    "invalid_json": {
        "tr": "Geçersiz JSON formatı.",
        "en": "Invalid JSON format.",
        "de": "Ungültiges JSON-Format.",
    },
    "unknown_event_type": {
        "tr": "Bilinmeyen event tipi: {kind}",
        "en": "Unknown event type: {kind}",
        "de": "Unbekannter Ereignistyp: {kind}",
    },
}


def normalize_lang(lang: str | None) -> str:
    """Get a supported language code (fallback to default)."""
    if not lang:
        return DEFAULT_LANG
    lang = lang.lower().strip()[:2]
    return lang if lang in SUPPORTED_LANGS else DEFAULT_LANG


def t(lang: str | None, key: str, **kwargs) -> str:
    """Translate a message key for the given language."""
    lang = normalize_lang(lang)
    entry = MESSAGES.get(key)
    if not entry:
        return key
    msg = entry.get(lang) or entry.get(DEFAULT_LANG) or key
    if kwargs:
        try:
            return msg.format(**kwargs)
        except (KeyError, IndexError):
            return msg
    return msg
