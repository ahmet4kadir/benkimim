/**
 * Ben Kimim? — Client WebSocket + UI Mantığı
 */

// ── Ayarlar ─────────────────────────────────────────
// WS sunucusu:
//   - oyun.ahmetkadir.com → ws.oyun.ahmetkadir.com (subdomain)
//   - localhost dev → ws://localhost:8765
//   - GitHub Pages / fallback → Render
const WS_URL = (() => {
    if (window.WS_URL) return window.WS_URL;
    const host = location.hostname;
    if (host === "oyun.ahmetkadir.com") {
        return "wss://wsoyun.ahmetkadir.com";
    }
    if (host === "localhost" || host === "127.0.0.1") {
        return "ws://localhost:8765";
    }
    return "wss://wsoyun.ahmetkadir.com";
})();

const AVATAR_OPTIONS = [
    "🎭", "🦊", "🐶", "🐱", "🐼", "🐯",
    "🐸", "🐵", "🦁", "🐺", "🐧", "🐙",
    "🦄", "🐲", "🤖", "👻", "😎", "🥷",
    "👽", "🧙", "🧛", "🧝", "🤡", "💀",
];

// ── i18n ────────────────────────────────────────────
const SUPPORTED_LANGS = ["tr", "en", "de"];

const I18N = {
    tr: {
        // Lobby
        app_title: "Ben Kimim?",
        subtitle: "Discord'da arka planda oyna!",
        your_name: "Adın",
        your_name_placeholder: "Adını yaz...",
        choose_avatar: "Avatar Seç",
        room_code: "Oda Kodu",
        room_code_hint: "(boş bırak = yeni oda)",
        room_code_label: "Oda Kodu:",
        join_room: "Odaya Katıl",
        joined: "✓ Katıldın",
        copy_code: "Kodu kopyala",
        copy_link: "Davet linkini kopyala",
        players: "Oyuncular",
        host_badge: "👑 Host",
        // Host controls
        pool_lang: "Kelime Dili",
        pool_lang_label: "Kelime Dili:",
        game_mode: "Oyun Modu",
        game_mode_label: "Oyun Modu:",
        difficulty: "Zorluk",
        diff_kolay: "Kolay (Sadece çok bilinenler)",
        diff_hepsi: "Hepsi (Tüm liste)",
        diff_ozel_sayi: "Özel (Toplam seçenek sayısı)",
        pool_size: "Toplam Seçenek Sayısı",
        pool_size_hint: "(havuzdan kaç öğe çekilsin — eleme defterinde de bu kadar gösterilir)",
        turn_timer: "Tur Süresi (saniye, 0 = kapalı)",
        custom_words: "Özel Kelimeler",
        custom_words_hint: "(her satıra bir tane, en az oyuncu sayısı kadar)",
        custom_words_placeholder: "Mesela:\nAhmet Hoca\nBerfin\nKantinci Hasan\n...",
        start_game: "Oyunu Başlat",
        waiting_host: "Oda sahibinin başlatmasını bekle...",
        // Categories
        cat_populer_ikonlar: "İkonik Kişiler / Karakterler",
        cat_hayvanlar: "🐾 Hayvanlar (Kurgusal Dahil)",
        cat_tarihi_olaylar: "📜 Tarihi Olaylar",
        cat_yemekler: "🍔 Yemekler",
        cat_filmler: "🎬 Filmler",
        cat_markalar: "🏷️ Markalar",
        cat_sehirler: "🌍 Şehirler",
        cat_meslekler: "👷 Meslekler",
        cat_sporlar: "⚽ Spor Dalları",
        cat_esyalar: "🪑 Eşyalar",
        cat_deyimler: "💬 Atasözleri & Deyimler",
        cat_karma: "🎲 Karma Mod (Hepsi Birden)",
        cat_karma_short: "🎲 Karma Mod",
        cat_ozel: "✏️ Özel Kategori (Sen Yaz)",
        // Connection
        no_connection: "● Bağlantı yok",
        connected: "● Bağlandı",
        disconnected: "● Bağlantı kesildi",
        conn_error: "● Bağlantı hatası",
        // Game
        turn_label: "Sıra:",
        pass_btn: "Pas ⏭",
        table: "MASA",
        guess_placeholder: "Kafandaki ismi tahmin et...",
        guess_placeholder_revealed: "Bildin! Diğer oyuncuları izle.",
        guess_placeholder_not_turn: "Sıran değil, bekle...",
        guess_btn: "Tahmin Et",
        // Log
        log_panel: "Soru/Cevap Defteri",
        log_title: "💬 Soru / Cevap",
        log_empty: "Henüz mesaj yok. Sorularını yazmaya başla!",
        log_input_placeholder: "Soru/Not yaz... (örn. 'Erkek misin?')",
        send: "Gönder",
        quick_yes: "✅ Evet",
        quick_no: "❌ Hayır",
        quick_maybe: "🤔 Belki",
        label_yes: "Evet",
        label_no: "Hayır",
        label_maybe: "Belki",
        close: "Kapat",
        // Elim
        elim_panel: "Eleme Defteri",
        elim_title: "📝 Eleme Defteri",
        elim_notes_placeholder: "Notların... (örn. 'erkek, tarihi figür, asker olabilir')",
        elim_search_placeholder: "🔍 Ara...",
        elim_reset: "Hepsini geri al",
        elim_tab_all: "Hepsi",
        elim_tab_active: "Aday",
        elim_tab_suspect: "Şüpheli",
        elim_tab_eliminated: "Elenen",
        elim_empty_no_list: "Liste yok. Oyun başladığında doldurulacak.",
        elim_empty_no_match: "Eşleşen öğe yok.",
        elim_count_template: "{active} aday · {suspect} şüpheli · {elim} elenmiş / {total}",
        elim_guess_btn: "Tahmin Et",
        elim_guess_tip: "Tıkla → aday / şüpheli / elenmiş",
        elim_guess_tooltip_can: '"{item}" olarak tahmin gönder',
        elim_guess_tooltip_revealed: "Zaten bildin",
        elim_guess_tooltip_not_turn: "Sıran değil",
        elim_guess_confirm: '"{item}" olarak tahmin gönderilsin mi?',
        elim_reset_confirm: "{count} işaretlenmiş öğeyi sıfırlamak istiyor musun?",
        // Result
        game_over: "Oyun Bitti!",
        new_round_btn: "Aynı Oyuncularla Yeni Tur",
        new_round_hint: "Aynı odada, aynı oyuncularla devam edersiniz.",
        waiting_new_round: "Oda sahibinin yeni tur başlatmasını bekle...",
        // Misc
        room_label: "Oda: {code}",
        you_suffix: " (sen)",
        guessed_correct: '✅ Tahmin etti: "{text}" — Doğru!',
        guessed_wrong: '❌ Tahmin etti: "{text}" — Yanlış',
        sound_toggle: "Ses Efektleri",
        theme_toggle: "Temayı Değiştir",
        please_enter_name: "Lütfen adını yaz!",
        link_copy_failed: "Link kopyalanamadı.",
        custom_min_words: "Özel kategori için en az 2 kelime girmelisin (şu an {count}).",
        pool_below_players: "Toplam seçenek sayısı oyuncu sayısından ({count}) az olamaz.",
        pool_below_two: "Toplam seçenek sayısı en az 2 olmalı.",
        stat_rank: "{rank}. bilen",
        stat_turn: "{turn}. tur",
        duration_sec: "{n}sn",
        duration_min: "{n}dk",
        duration_min_sec: "{m}dk {s}sn",
    },
    en: {
        app_title: "Who am I?",
        subtitle: "Play in the background on Discord!",
        your_name: "Your Name",
        your_name_placeholder: "Type your name...",
        choose_avatar: "Choose Avatar",
        room_code: "Room Code",
        room_code_hint: "(leave empty = new room)",
        room_code_label: "Room Code:",
        join_room: "Join Room",
        joined: "✓ Joined",
        copy_code: "Copy code",
        copy_link: "Copy invite link",
        players: "Players",
        host_badge: "👑 Host",
        pool_lang: "Word Language",
        pool_lang_label: "Word Language:",
        game_mode: "Game Mode",
        game_mode_label: "Game Mode:",
        difficulty: "Difficulty",
        diff_kolay: "Easy (Only well-known ones)",
        diff_hepsi: "All (Full list)",
        diff_ozel_sayi: "Custom (Total pool size)",
        pool_size: "Total Pool Size",
        pool_size_hint: "(how many items to pull from the pool — same count shown in elimination list)",
        turn_timer: "Turn Time (seconds, 0 = off)",
        custom_words: "Custom Words",
        custom_words_hint: "(one per line, at least as many as players)",
        custom_words_placeholder: "Example:\nMr. Smith\nBeth\nGrumpy Bob\n...",
        start_game: "Start Game",
        waiting_host: "Waiting for the host to start...",
        cat_populer_ikonlar: "Iconic People / Characters",
        cat_hayvanlar: "🐾 Animals (Incl. Fictional)",
        cat_tarihi_olaylar: "📜 Historical Events",
        cat_yemekler: "🍔 Foods",
        cat_filmler: "🎬 Movies",
        cat_markalar: "🏷️ Brands",
        cat_sehirler: "🌍 Cities",
        cat_meslekler: "👷 Professions",
        cat_sporlar: "⚽ Sports",
        cat_esyalar: "🪑 Objects",
        cat_deyimler: "💬 Idioms & Sayings",
        cat_karma: "🎲 Mixed Mode (Everything)",
        cat_karma_short: "🎲 Mixed Mode",
        cat_ozel: "✏️ Custom Category (You Write)",
        no_connection: "● No connection",
        connected: "● Connected",
        disconnected: "● Disconnected",
        conn_error: "● Connection error",
        turn_label: "Turn:",
        pass_btn: "Pass ⏭",
        table: "TABLE",
        guess_placeholder: "Guess the name in your head...",
        guess_placeholder_revealed: "You got it! Watch the others.",
        guess_placeholder_not_turn: "Not your turn — wait...",
        guess_btn: "Guess",
        log_panel: "Question/Answer Log",
        log_title: "💬 Q & A",
        log_empty: "No messages yet. Start asking!",
        log_input_placeholder: "Type a question/note... (e.g. 'Am I male?')",
        send: "Send",
        quick_yes: "✅ Yes",
        quick_no: "❌ No",
        quick_maybe: "🤔 Maybe",
        label_yes: "Yes",
        label_no: "No",
        label_maybe: "Maybe",
        close: "Close",
        elim_panel: "Elimination Notes",
        elim_title: "📝 Elimination Notes",
        elim_notes_placeholder: "Your notes... (e.g. 'male, historical figure, maybe soldier')",
        elim_search_placeholder: "🔍 Search...",
        elim_reset: "Reset all marks",
        elim_tab_all: "All",
        elim_tab_active: "Candidate",
        elim_tab_suspect: "Suspect",
        elim_tab_eliminated: "Eliminated",
        elim_empty_no_list: "List is empty. It'll be filled when the game starts.",
        elim_empty_no_match: "No matching items.",
        elim_count_template: "{active} candidate · {suspect} suspect · {elim} eliminated / {total}",
        elim_guess_btn: "Guess",
        elim_guess_tip: "Click → candidate / suspect / eliminated",
        elim_guess_tooltip_can: 'Send guess as "{item}"',
        elim_guess_tooltip_revealed: "You've already guessed",
        elim_guess_tooltip_not_turn: "Not your turn",
        elim_guess_confirm: 'Send guess as "{item}"?',
        elim_reset_confirm: "Reset {count} marked items?",
        game_over: "Game Over!",
        new_round_btn: "New Round with Same Players",
        new_round_hint: "Continue in the same room, with the same players.",
        waiting_new_round: "Waiting for the host to start a new round...",
        room_label: "Room: {code}",
        you_suffix: " (you)",
        guessed_correct: '✅ Guessed: "{text}" — Correct!',
        guessed_wrong: '❌ Guessed: "{text}" — Wrong',
        sound_toggle: "Sound Effects",
        theme_toggle: "Toggle Theme",
        please_enter_name: "Please enter your name!",
        link_copy_failed: "Couldn't copy the link.",
        custom_min_words: "You need at least 2 custom words (currently {count}).",
        pool_below_players: "Pool size can't be smaller than the number of players ({count}).",
        pool_below_two: "Pool size must be at least 2.",
        stat_rank: "#{rank} guesser",
        stat_turn: "round {turn}",
        duration_sec: "{n}s",
        duration_min: "{n}m",
        duration_min_sec: "{m}m {s}s",
    },
    de: {
        app_title: "Wer bin ich?",
        subtitle: "Spiel im Hintergrund auf Discord!",
        your_name: "Dein Name",
        your_name_placeholder: "Tippe deinen Namen...",
        choose_avatar: "Avatar wählen",
        room_code: "Raumcode",
        room_code_hint: "(leer lassen = neuer Raum)",
        room_code_label: "Raumcode:",
        join_room: "Raum beitreten",
        joined: "✓ Beigetreten",
        copy_code: "Code kopieren",
        copy_link: "Einladungslink kopieren",
        players: "Spieler",
        host_badge: "👑 Host",
        pool_lang: "Wortsprache",
        pool_lang_label: "Wortsprache:",
        game_mode: "Spielmodus",
        game_mode_label: "Spielmodus:",
        difficulty: "Schwierigkeit",
        diff_kolay: "Einfach (Nur bekannte)",
        diff_hepsi: "Alle (Komplette Liste)",
        diff_ozel_sayi: "Eigene (Gesamtzahl Optionen)",
        pool_size: "Gesamtzahl der Optionen",
        pool_size_hint: "(wie viele Einträge aus dem Pool — wird auch in der Ausschlussliste gezeigt)",
        turn_timer: "Rundenzeit (Sekunden, 0 = aus)",
        custom_words: "Eigene Wörter",
        custom_words_hint: "(eines pro Zeile, mindestens so viele wie Spieler)",
        custom_words_placeholder: "Zum Beispiel:\nHerr Müller\nLisa\nTante Anna\n...",
        start_game: "Spiel starten",
        waiting_host: "Warte, bis der Host startet...",
        cat_populer_ikonlar: "Ikonische Persönlichkeiten / Charaktere",
        cat_hayvanlar: "🐾 Tiere (inkl. fiktional)",
        cat_tarihi_olaylar: "📜 Historische Ereignisse",
        cat_yemekler: "🍔 Speisen",
        cat_filmler: "🎬 Filme",
        cat_markalar: "🏷️ Marken",
        cat_sehirler: "🌍 Städte",
        cat_meslekler: "👷 Berufe",
        cat_sporlar: "⚽ Sportarten",
        cat_esyalar: "🪑 Gegenstände",
        cat_deyimler: "💬 Sprichwörter & Redewendungen",
        cat_karma: "🎲 Mixmodus (Alles gemischt)",
        cat_karma_short: "🎲 Mixmodus",
        cat_ozel: "✏️ Eigene Kategorie (Selbst tippen)",
        no_connection: "● Keine Verbindung",
        connected: "● Verbunden",
        disconnected: "● Verbindung getrennt",
        conn_error: "● Verbindungsfehler",
        turn_label: "Dran:",
        pass_btn: "Passen ⏭",
        table: "TISCH",
        guess_placeholder: "Rate den Namen in deinem Kopf...",
        guess_placeholder_revealed: "Du hast's! Schau den anderen zu.",
        guess_placeholder_not_turn: "Du bist nicht dran — warte...",
        guess_btn: "Tippen",
        log_panel: "Fragen/Antworten-Liste",
        log_title: "💬 Fragen & Antworten",
        log_empty: "Noch keine Nachrichten. Stell deine erste Frage!",
        log_input_placeholder: "Frage/Notiz... (z.B. 'Bin ich männlich?')",
        send: "Senden",
        quick_yes: "✅ Ja",
        quick_no: "❌ Nein",
        quick_maybe: "🤔 Vielleicht",
        label_yes: "Ja",
        label_no: "Nein",
        label_maybe: "Vielleicht",
        close: "Schließen",
        elim_panel: "Ausschluss-Notizen",
        elim_title: "📝 Ausschluss-Notizen",
        elim_notes_placeholder: "Deine Notizen... (z.B. 'männlich, historische Figur, evtl. Soldat')",
        elim_search_placeholder: "🔍 Suchen...",
        elim_reset: "Alle zurücksetzen",
        elim_tab_all: "Alle",
        elim_tab_active: "Kandidat",
        elim_tab_suspect: "Verdächtig",
        elim_tab_eliminated: "Ausgeschlossen",
        elim_empty_no_list: "Liste ist leer. Wird beim Spielstart gefüllt.",
        elim_empty_no_match: "Keine Treffer.",
        elim_count_template: "{active} Kandidat · {suspect} verdächtig · {elim} ausgeschlossen / {total}",
        elim_guess_btn: "Tippen",
        elim_guess_tip: "Klick → Kandidat / verdächtig / ausgeschlossen",
        elim_guess_tooltip_can: 'Als "{item}" tippen',
        elim_guess_tooltip_revealed: "Du hast schon getippt",
        elim_guess_tooltip_not_turn: "Du bist nicht dran",
        elim_guess_confirm: 'Als "{item}" tippen?',
        elim_reset_confirm: "{count} markierte Einträge zurücksetzen?",
        game_over: "Spiel zu Ende!",
        new_round_btn: "Neue Runde mit denselben Spielern",
        new_round_hint: "Weiter im selben Raum, mit denselben Spielern.",
        waiting_new_round: "Warte, bis der Host eine neue Runde startet...",
        room_label: "Raum: {code}",
        you_suffix: " (du)",
        guessed_correct: '✅ Getippt: "{text}" — Richtig!',
        guessed_wrong: '❌ Getippt: "{text}" — Falsch',
        sound_toggle: "Soundeffekte",
        theme_toggle: "Theme wechseln",
        please_enter_name: "Bitte deinen Namen eingeben!",
        link_copy_failed: "Link konnte nicht kopiert werden.",
        custom_min_words: "Du brauchst mindestens 2 eigene Wörter (aktuell {count}).",
        pool_below_players: "Pool-Größe darf nicht kleiner als die Spielerzahl ({count}) sein.",
        pool_below_two: "Pool-Größe muss mindestens 2 sein.",
        stat_rank: "{rank}. erraten",
        stat_turn: "Runde {turn}",
        duration_sec: "{n}s",
        duration_min: "{n}m",
        duration_min_sec: "{m}m {s}s",
    },
};

function detectInitialLang() {
    const saved = localStorage.getItem("whoami:lang");
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "tr").toLowerCase().slice(0, 2);
    return SUPPORTED_LANGS.includes(nav) ? nav : "tr";
}

let currentLang = detectInitialLang();

function t(key, vars) {
    const dict = I18N[currentLang] || I18N.tr;
    let str = dict[key];
    if (str == null) str = (I18N.tr[key] != null ? I18N.tr[key] : key);
    if (vars) {
        for (const k of Object.keys(vars)) {
            str = str.split("{" + k + "}").join(String(vars[k]));
        }
    }
    return str;
}

function applyI18nToDOM() {
    document.documentElement.setAttribute("lang", currentLang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (key) el.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const key = el.getAttribute("data-i18n-title");
        if (key) el.setAttribute("title", t(key));
    });
}

// ── State ───────────────────────────────────────────
let ws = null;
let myPlayerId = null;
let myRoomCode = null;
let isHost = false;
let currentPlayers = [];
let myAvatar = localStorage.getItem("whoami:avatar") || "🎭";
let soundEnabled = localStorage.getItem("whoami:sound") !== "off";

let turnPlayerId = null;
let timerRemaining = 0;
let timerTotal = 0;
let qaLog = [];
let logPanelSeenCount = 0;

// ── DOM Referansları ────────────────────────────────
const $ = (id) => document.getElementById(id);

const screenLobby = $("screen-lobby");
const screenGame = $("screen-game");
const screenResult = $("screen-result");

// Lobby
const inputName = $("input-name");
const inputRoom = $("input-room");
const btnJoin = $("btn-join");
const lobbyInfo = $("lobby-info");
const displayRoomCode = $("display-room-code");
const btnCopyCode = $("btn-copy-code");
const btnCopyLink = $("btn-copy-link");
const playerList = $("player-list");
const hostControls = $("host-controls");
const btnStart = $("btn-start");
const selectCategory = $("select-category");
const selectPoolLang = $("select-pool-lang");
const selectDifficulty = $("select-difficulty");
const inputTimer = $("input-timer");
const poolSizeGroup = $("pool-size-group");
const inputPoolSize = $("input-pool-size");
const customCategoryGroup = $("custom-category-group");
const inputCustomWords = $("input-custom-words");
const waitingMsg = $("waiting-msg");
const connectionStatus = $("connection-status");
const avatarGrid = $("avatar-grid");

// Oyun
const gameRoomCode = $("game-room-code");
const playersCircle = $("players-circle");
const inputGuess = $("input-guess");
const btnGuess = $("btn-guess");
const guessFeedback = $("guess-feedback");
const turnBar = $("turn-bar");
const turnPlayerName = $("turn-player-name");
const timerPill = $("timer-pill");
const timerValue = $("timer-value");
const btnPass = $("btn-pass");

// Q&A log
const btnLogToggle = $("btn-log-toggle");
const logFabBadge = $("log-fab-badge");
const logPanel = $("log-panel");
const btnLogClose = $("btn-log-close");
const logList = $("log-list");
const logInput = $("log-input");
const btnLogSend = $("btn-log-send");
const logQuickBtns = document.querySelectorAll(".log-quick-btn");

// Sonuç
const rankingsList = $("rankings-list");
const hostControlsResult = $("host-controls-result");
const btnNewRound = $("btn-new-round");
const selectCategoryResult = $("select-category-result");
const selectPoolLangResult = $("select-pool-lang-result");
const waitingNewRound = $("waiting-new-round");

// Eleme Paneli (mevcut)
const elimFab = $("btn-elim-toggle");
const elimFabBadge = $("elim-fab-badge");
const elimPanel = $("elim-panel");
const elimClose = $("btn-elim-close");
const elimCount = $("elim-count");
const elimNotes = $("elim-notes");
const elimSearch = $("elim-search");
const elimReset = $("btn-elim-reset");
const elimList = $("elim-list");
const elimTabs = document.querySelectorAll(".elim-tab");

// Üst kontrol butonları
const btnSoundToggle = $("btn-sound-toggle");
const soundIconOn = $("sound-icon-on");
const soundIconOff = $("sound-icon-off");

// 3-state elim:  state ∈ {"active", "suspect", "eliminated"}
let elimItems = [];
let elimState = {};   // { itemName: "suspect" | "eliminated" }
let elimCategory = null;
let elimFilter = "all";
let elimSearchTerm = "";


// ══════════════════════════════════════════════════
// EKRAN GEÇİŞİ
// ══════════════════════════════════════════════════

function showScreen(screen) {
    [screenLobby, screenGame, screenResult].forEach((s) => {
        s.classList.remove("active");
    });
    screen.classList.add("active");
}


// ══════════════════════════════════════════════════
// SES EFEKTLERİ (Web Audio synth)
// ══════════════════════════════════════════════════

let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { return null; }
    }
    return audioCtx;
}

function playTone(freq, duration = 0.12, type = "sine", volume = 0.18) {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}

const sounds = {
    correct: () => { playTone(660, 0.1); setTimeout(() => playTone(880, 0.15), 90); },
    wrong:   () => playTone(180, 0.2, "square", 0.14),
    join:    () => playTone(520, 0.1, "triangle"),
    turn:    () => playTone(440, 0.08, "sine"),
    tick:    () => playTone(800, 0.04, "square", 0.08),
    gameOver:() => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.18), i * 100)); },
    message: () => playTone(720, 0.06, "triangle", 0.12),
};


// ══════════════════════════════════════════════════
// WEBSOCKET BAĞLANTISI
// ══════════════════════════════════════════════════

function connectWebSocket() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        connectionStatus.textContent = t("connected");
        connectionStatus.className = "status-connected";

        ws.send(JSON.stringify({
            type: "join",
            playerName: inputName.value.trim(),
            roomCode: inputRoom.value.trim().toUpperCase(),
            lang: currentLang,
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleMessage(data);
    };

    ws.onclose = () => {
        connectionStatus.textContent = t("disconnected");
        connectionStatus.className = "status-disconnected";
    };

    ws.onerror = () => {
        connectionStatus.textContent = t("conn_error");
        connectionStatus.className = "status-disconnected";
    };
}

function sendMessage(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}


// ══════════════════════════════════════════════════
// EVENT HANDLER — Sunucudan gelen mesajları işle
// ══════════════════════════════════════════════════

function handleMessage(data) {
    switch (data.type) {
        case "welcome":          handleWelcome(data); break;
        case "lobby_update":     handleLobbyUpdate(data); break;
        case "game_started":     handleGameStarted(data); break;
        case "guess_result":     handleGuessResult(data); break;
        case "player_revealed":  handlePlayerRevealed(data); break;
        case "game_over":        handleGameOver(data); break;
        case "turn_changed":     handleTurnChanged(data); break;
        case "timer_tick":       handleTimerTick(data); break;
        case "timer_expired":    handleTimerExpired(data); break;
        case "log_message":      handleLogMessage(data); break;
        case "error":            handleError(data); break;
        default: console.warn("[WS] Bilinmeyen event:", data.type);
    }
}

function handleWelcome(data) {
    myPlayerId = data.playerId;
    myRoomCode = data.roomCode;
    isHost = data.isHost;

    lobbyInfo.classList.remove("hidden");
    displayRoomCode.textContent = myRoomCode;

    inputName.disabled = true;
    inputRoom.disabled = true;
    btnJoin.disabled = true;
    btnJoin.textContent = t("joined");

    // Host'un pool_lang seçicilerini odanın mevcut diline senkronla
    if (data.poolLang) {
        if (selectPoolLang) selectPoolLang.value = data.poolLang;
        if (selectPoolLangResult) selectPoolLangResult.value = data.poolLang;
    }

    // Avatar'ı sunucuya da bildir
    sendMessage({ type: "set_avatar", avatar: myAvatar });

    // URL'yi güncelle ki paylaşılan link doğru oda kodunu içersin
    try {
        const url = new URL(window.location.href);
        url.searchParams.set("room", myRoomCode);
        window.history.replaceState({}, "", url.toString());
    } catch (e) {}

    updateHostUI();
    sounds.join();
}

function handleLobbyUpdate(data) {
    playerList.innerHTML = "";
    data.players.forEach((p) => {
        const li = document.createElement("li");

        const av = document.createElement("span");
        av.className = "player-list-avatar";
        av.textContent = p.avatar || "🎭";
        li.appendChild(av);

        const nm = document.createElement("span");
        nm.textContent = p.name;
        li.appendChild(nm);

        if (p.id === data.hostId) {
            const badge = document.createElement("span");
            badge.className = "host-badge";
            badge.textContent = t("host_badge");
            li.appendChild(badge);
        }
        if (p.id === myPlayerId) {
            li.style.fontWeight = "bold";
        }
        playerList.appendChild(li);
    });
    // Host'un pool_lang seçicileri odanın güncel dilini göstersin
    if (data.poolLang) {
        if (selectPoolLang && selectPoolLang.value !== data.poolLang) {
            selectPoolLang.value = data.poolLang;
        }
        if (selectPoolLangResult && selectPoolLangResult.value !== data.poolLang) {
            selectPoolLangResult.value = data.poolLang;
        }
    }
}

function handleGameStarted(data) {
    currentPlayers = data.players;
    turnPlayerId = data.turnPlayerId;
    timerRemaining = data.timerRemaining || 0;
    timerTotal = data.timerTotal || 0;
    qaLog = [];
    logPanelSeenCount = 0;

    if (data.poolLang) {
        if (selectPoolLang) selectPoolLang.value = data.poolLang;
        if (selectPoolLangResult) selectPoolLangResult.value = data.poolLang;
    }

    showScreen(screenGame);
    gameRoomCode.textContent = t("room_label", { code: myRoomCode });
    renderPlayersOnTable(currentPlayers);
    renderTurnBar();
    renderLog();

    inputGuess.value = "";
    guessFeedback.classList.add("hidden");

    updateGuessUIState();

    if (data.categoryItems) {
        const diffKey = (data.difficulty || "hepsi") + (data.poolLimit ? `_n${data.poolLimit}` : "");
        initElimPanel(data.category, diffKey, data.categoryItems);
    }
}

function handleGuessResult(data) {
    guessFeedback.classList.remove("hidden", "correct", "wrong");
    const stats = data.correct ? formatRevealStats(data) : "";
    guessFeedback.textContent = data.message + (stats ? "  " + stats : "");

    if (data.correct) {
        guessFeedback.classList.add("correct");
        sounds.correct();
    } else {
        guessFeedback.classList.add("wrong");
        inputGuess.value = "";
        sounds.wrong();
    }
    updateGuessUIState();
}

function handlePlayerRevealed(data) {
    const player = currentPlayers.find((p) => p.id === data.playerId);
    if (player) {
        player.revealed = true;
        player.assignedName = data.assignedName;
    }
    renderPlayersOnTable(currentPlayers);
    renderElimList();
    updateGuessUIState();
    if (data.playerId !== myPlayerId) sounds.correct();
}

function handleGameOver(data) {
    showScreen(screenResult);
    renderRankings(data.rankings);
    sounds.gameOver();

    if (isHost) {
        hostControlsResult.classList.remove("hidden");
        waitingNewRound.classList.add("hidden");
    } else {
        hostControlsResult.classList.add("hidden");
        waitingNewRound.classList.remove("hidden");
    }
}

function handleTurnChanged(data) {
    turnPlayerId = data.turnPlayerId;
    timerRemaining = data.timerRemaining || 0;
    timerTotal = data.timerTotal || 0;
    renderTurnBar();
    renderPlayersOnTable(currentPlayers);
    renderElimList();
    updateGuessUIState();
    if (turnPlayerId === myPlayerId) sounds.turn();
}

function handleTimerTick(data) {
    timerRemaining = data.timerRemaining;
    updateTimerDisplay();
    if (timerRemaining > 0 && timerRemaining <= 5) sounds.tick();
}

function handleTimerExpired(data) {
    turnPlayerId = data.turnPlayerId;
    timerRemaining = data.timerRemaining || 0;
    timerTotal = data.timerTotal || 0;
    renderTurnBar();
    renderPlayersOnTable(currentPlayers);
    renderElimList();
    updateGuessUIState();
    sounds.wrong();
}

function handleLogMessage(data) {
    qaLog.push(data.entry);
    renderLog();
    sounds.message();
    if (logPanel.classList.contains("hidden")) {
        const unseen = qaLog.length - logPanelSeenCount;
        if (unseen > 0) {
            logFabBadge.textContent = unseen;
            logFabBadge.classList.remove("hidden");
        }
    } else {
        logPanelSeenCount = qaLog.length;
    }
}

function handleError(data) {
    alert("⚠️ " + data.message);
}


// ══════════════════════════════════════════════════
// UI RENDER FONKSİYONLARI
// ══════════════════════════════════════════════════

function updateHostUI() {
    if (isHost) {
        hostControls.classList.remove("hidden");
        waitingMsg.classList.add("hidden");
    } else {
        hostControls.classList.add("hidden");
        waitingMsg.classList.remove("hidden");
    }
}

function renderPlayersOnTable(players) {
    if (!playersCircle) return;
    playersCircle.innerHTML = "";

    const count = players.length;
    const centerX = 250;
    const centerY = 250;
    const radius = 180;

    players.forEach((player, index) => {
        const angle = (2 * Math.PI * index) / count - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const node = document.createElement("div");
        node.className = "player-node";
        if (player.id === turnPlayerId) node.classList.add("is-turn");
        node.style.left = x + "px";
        node.style.top = y + "px";

        const avatar = document.createElement("div");
        avatar.className = "player-avatar";
        if (player.revealed) avatar.classList.add("revealed");
        avatar.textContent = player.avatar || player.name.charAt(0).toUpperCase();

        const nameTag = document.createElement("div");
        nameTag.className = "player-assigned-name";
        nameTag.textContent = player.assignedName;
        if (player.assignedName === "???") nameTag.classList.add("mystery");
        else if (player.revealed) nameTag.classList.add("revealed");

        const realName = document.createElement("div");
        realName.className = "player-real-name";
        realName.textContent = player.name;

        node.appendChild(nameTag);
        node.appendChild(avatar);
        node.appendChild(realName);
        playersCircle.appendChild(node);
    });
}

function renderTurnBar() {
    if (!turnPlayerId) {
        turnBar.classList.add("hidden");
        return;
    }
    turnBar.classList.remove("hidden");
    const player = currentPlayers.find((p) => p.id === turnPlayerId);
    if (player) {
        turnPlayerName.textContent = `${player.avatar || ""} ${player.name}`;
        turnPlayerName.classList.toggle("is-me", player.id === myPlayerId);
    }
    if (timerTotal > 0) {
        timerPill.classList.remove("hidden");
        updateTimerDisplay();
    } else {
        timerPill.classList.add("hidden");
    }
}

function updateTimerDisplay() {
    const m = Math.floor(timerRemaining / 60);
    const s = timerRemaining % 60;
    timerValue.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    timerPill.classList.toggle("warning", timerRemaining <= 5 && timerRemaining > 0);
}

function renderRankings(rankings) {
    rankingsList.innerHTML = "";
    rankings.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "ranking-item";

        const pos = document.createElement("div");
        pos.className = "ranking-position";
        if (entry.rank) {
            pos.textContent = `#${entry.rank}`;
            if (entry.rank === 1) pos.classList.add("gold");
            else if (entry.rank === 2) pos.classList.add("silver");
            else if (entry.rank === 3) pos.classList.add("bronze");
        } else {
            pos.textContent = "—";
        }

        const details = document.createElement("div");
        details.className = "ranking-details";
        const statsHtml = entry.rank
            ? `<div class="ranking-stats">${escapeHtml(formatRevealStats(entry))}</div>`
            : "";
        details.innerHTML = `
            <div class="name">${escapeHtml(entry.name)}</div>
            <div class="assigned">${escapeHtml(entry.assignedName)}</div>
            ${statsHtml}
        `;

        item.appendChild(pos);
        item.appendChild(details);
        rankingsList.appendChild(item);
    });
}

function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    if (s < 60) return t("duration_sec", { n: s });
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r === 0 ? t("duration_min", { n: m }) : t("duration_min_sec", { m: m, s: r });
}

function updateGuessUIState() {
    const me = currentPlayers.find((p) => p.id === myPlayerId);
    const iAmRevealed = !!(me && me.revealed);
    const isMyTurn = turnPlayerId === myPlayerId;

    if (iAmRevealed) {
        inputGuess.disabled = true;
        btnGuess.disabled = true;
        inputGuess.placeholder = t("guess_placeholder_revealed");
    } else if (!isMyTurn) {
        inputGuess.disabled = true;
        btnGuess.disabled = true;
        inputGuess.placeholder = t("guess_placeholder_not_turn");
    } else {
        inputGuess.disabled = false;
        btnGuess.disabled = false;
        inputGuess.placeholder = t("guess_placeholder");
        if (document.activeElement !== inputGuess) inputGuess.focus();
    }
}

function formatRevealStats(entry) {
    const parts = [];
    if (entry.rank) parts.push(t("stat_rank", { rank: entry.rank }));
    if (entry.turnCount) parts.push(t("stat_turn", { turn: entry.turnCount }));
    if (entry.elapsedSeconds != null) parts.push(formatDuration(entry.elapsedSeconds));
    return parts.length ? `(${parts.join(" · ")})` : "";
}


// ══════════════════════════════════════════════════
// Q&A LOG PANELİ
// ══════════════════════════════════════════════════

function renderLog() {
    logList.innerHTML = "";
    if (qaLog.length === 0) {
        const empty = document.createElement("div");
        empty.className = "log-empty";
        empty.textContent = t("log_empty");
        logList.appendChild(empty);
        return;
    }
    qaLog.forEach((entry) => {
        const row = document.createElement("div");
        row.className = "log-entry";
        row.dataset.kind = entry.kind || "question";

        const av = document.createElement("span");
        av.className = "log-entry-avatar";
        av.textContent = entry.avatar || "🎭";

        const body = document.createElement("div");
        body.className = "log-entry-body";

        const author = document.createElement("div");
        author.className = "log-entry-author";
        author.textContent = entry.playerName + (entry.playerId === myPlayerId ? t("you_suffix") : "");

        const txt = document.createElement("div");
        txt.className = "log-entry-text";
        if (entry.kind === "guess_correct") {
            const stats = formatRevealStats(entry);
            txt.textContent = t("guessed_correct", { text: entry.text }) + (stats ? "  " + stats : "");
        } else if (entry.kind === "guess_wrong") {
            txt.textContent = t("guessed_wrong", { text: entry.text });
        } else {
            txt.textContent = entry.text;
        }

        body.appendChild(author);
        body.appendChild(txt);
        row.appendChild(av);
        row.appendChild(body);
        logList.appendChild(row);
    });
    logList.scrollTop = logList.scrollHeight;
}

function sendLogMessage(text, kind = "question") {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    sendMessage({ type: "post_message", text: trimmed, kind });
    logInput.value = "";
}


// ══════════════════════════════════════════════════
// ELEME PANELİ (3-state)
// ══════════════════════════════════════════════════

function elimStorageKey(suffix) {
    return `whoami:elim:${myRoomCode || "_"}:${elimCategory || "_"}:${suffix}`;
}

function initElimPanel(category, difficulty, items) {
    elimCategory = `${category}:${difficulty}`;
    elimItems = items.slice();

    const saved = localStorage.getItem(elimStorageKey("state"));
    elimState = saved ? JSON.parse(saved) : {};

    const savedNotes = localStorage.getItem(elimStorageKey("notes"));
    elimNotes.value = savedNotes || "";

    elimSearch.value = "";
    elimSearchTerm = "";
    elimFilter = "all";
    elimTabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === "all"));
    renderElimList();
}

function getItemState(item) {
    return elimState[item] || "active";
}

function cycleElim(item) {
    const current = getItemState(item);
    const next = current === "active" ? "suspect" : current === "suspect" ? "eliminated" : "active";
    if (next === "active") delete elimState[item];
    else elimState[item] = next;
    localStorage.setItem(elimStorageKey("state"), JSON.stringify(elimState));
    renderElimList();
}

function renderElimList() {
    elimList.innerHTML = "";
    const term = elimSearchTerm.toLowerCase();
    const filtered = elimItems.filter((item) => {
        const state = getItemState(item);
        if (elimFilter === "active" && state !== "active") return false;
        if (elimFilter === "suspect" && state !== "suspect") return false;
        if (elimFilter === "eliminated" && state !== "eliminated") return false;
        if (term && !item.toLowerCase().includes(term)) return false;
        return true;
    });

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "elim-empty";
        empty.textContent = elimItems.length === 0
            ? t("elim_empty_no_list")
            : t("elim_empty_no_match");
        elimList.appendChild(empty);
    } else {
        filtered.forEach((item) => {
            const row = document.createElement("div");
            const state = getItemState(item);
            row.className = "elim-item";
            if (state === "suspect") row.classList.add("suspect");
            if (state === "eliminated") row.classList.add("eliminated");

            const mark = document.createElement("span");
            mark.className = "elim-item-mark";

            const text = document.createElement("span");
            text.className = "elim-item-text";
            text.textContent = item;

            const me = currentPlayers.find((p) => p.id === myPlayerId);
            const iAmRevealed = !!(me && me.revealed);
            const isMyTurn = turnPlayerId === myPlayerId;
            const canGuess = !iAmRevealed && isMyTurn;

            const guessBtn = document.createElement("button");
            guessBtn.type = "button";
            guessBtn.className = "elim-item-guess";
            guessBtn.textContent = t("elim_guess_btn");
            guessBtn.disabled = !canGuess;
            guessBtn.title = canGuess
                ? t("elim_guess_tooltip_can", { item })
                : iAmRevealed ? t("elim_guess_tooltip_revealed") : t("elim_guess_tooltip_not_turn");
            guessBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!canGuess) return;
                if (!confirm(t("elim_guess_confirm", { item }))) return;
                sendMessage({ type: "guess", guess: item });
            });

            row.appendChild(mark);
            row.appendChild(text);
            row.appendChild(guessBtn);
            row.title = t("elim_guess_tip");
            row.addEventListener("click", () => cycleElim(item));
            elimList.appendChild(row);
        });
    }

    let suspectCount = 0, elimCount2 = 0;
    Object.values(elimState).forEach((s) => {
        if (s === "suspect") suspectCount++;
        else if (s === "eliminated") elimCount2++;
    });
    const total = elimItems.length;
    const active = total - suspectCount - elimCount2;
    elimCount.textContent = t("elim_count_template", {
        active, suspect: suspectCount, elim: elimCount2, total,
    });

    if (elimCount2 + suspectCount > 0) {
        elimFabBadge.textContent = elimCount2 + suspectCount;
        elimFabBadge.classList.remove("hidden");
    } else {
        elimFabBadge.classList.add("hidden");
    }
}


// ══════════════════════════════════════════════════
// AVATAR PICKER (lobby)
// ══════════════════════════════════════════════════

function renderAvatarGrid() {
    avatarGrid.innerHTML = "";
    AVATAR_OPTIONS.forEach((emoji) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "avatar-cell" + (emoji === myAvatar ? " selected" : "");
        cell.textContent = emoji;
        cell.title = "Avatar olarak seç";
        cell.addEventListener("click", () => {
            myAvatar = emoji;
            localStorage.setItem("whoami:avatar", emoji);
            renderAvatarGrid();
            if (ws && ws.readyState === WebSocket.OPEN) {
                sendMessage({ type: "set_avatar", avatar: emoji });
            }
        });
        avatarGrid.appendChild(cell);
    });
}


// ══════════════════════════════════════════════════
// URL ile oda doldurma
// ══════════════════════════════════════════════════

function prefillFromUrl() {
    try {
        const url = new URL(window.location.href);
        const room = url.searchParams.get("room");
        if (room) inputRoom.value = room.toUpperCase();
    } catch (e) {}
}


// ══════════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════════

btnJoin.addEventListener("click", () => {
    const name = inputName.value.trim();
    if (!name) {
        alert(t("please_enter_name"));
        inputName.focus();
        return;
    }
    connectWebSocket();
});

inputName.addEventListener("keydown", (e) => { if (e.key === "Enter") btnJoin.click(); });
inputRoom.addEventListener("keydown", (e) => { if (e.key === "Enter") btnJoin.click(); });

btnCopyCode.addEventListener("click", () => {
    navigator.clipboard.writeText(myRoomCode).then(() => {
        btnCopyCode.textContent = "✓";
        setTimeout(() => (btnCopyCode.textContent = "📋"), 1500);
    });
});

btnCopyLink.addEventListener("click", () => {
    try {
        const url = new URL(window.location.href);
        url.searchParams.set("room", myRoomCode);
        navigator.clipboard.writeText(url.toString()).then(() => {
            btnCopyLink.textContent = "✓";
            setTimeout(() => (btnCopyLink.textContent = "🔗"), 1500);
        });
    } catch (e) {
        alert(t("link_copy_failed"));
    }
});

// Özel kategori seçilince textarea'yı göster
selectCategory.addEventListener("change", () => {
    if (selectCategory.value === "ozel") {
        customCategoryGroup.classList.remove("hidden");
    } else {
        customCategoryGroup.classList.add("hidden");
    }
});

// Özel zorluk (toplam sayı) seçilince sayı input'unu göster
function updatePoolSizeVisibility() {
    if (selectDifficulty.value === "ozel_sayi") {
        poolSizeGroup.classList.remove("hidden");
    } else {
        poolSizeGroup.classList.add("hidden");
    }
}
selectDifficulty.addEventListener("change", updatePoolSizeVisibility);

function buildGameConfig(category, poolLangValue) {
    const difficulty = selectDifficulty.value;
    const timerSeconds = parseInt(inputTimer.value || "0", 10) || 0;
    const poolLimit = difficulty === "ozel_sayi"
        ? Math.max(0, parseInt(inputPoolSize.value || "0", 10) || 0)
        : 0;
    let customWords = [];
    if (category === "ozel") {
        customWords = inputCustomWords.value
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        if (customWords.length < currentPlayers.length && customWords.length < 2) {
            alert(t("custom_min_words", { count: customWords.length }));
            return null;
        }
    }
    if (difficulty === "ozel_sayi") {
        if (poolLimit < currentPlayers.length) {
            alert(t("pool_below_players", { count: currentPlayers.length }));
            return null;
        }
        if (poolLimit < 2) {
            alert(t("pool_below_two"));
            return null;
        }
    }
    const poolLang = poolLangValue || (selectPoolLang ? selectPoolLang.value : currentLang);
    return { category, difficulty, timerSeconds, customWords, poolLimit, poolLang };
}

btnStart.addEventListener("click", () => {
    const cfg = buildGameConfig(selectCategory.value);
    if (!cfg) return;
    sendMessage({
        type: "start_game",
        category: cfg.category,
        difficulty: cfg.difficulty,
        customWords: cfg.customWords,
        timerSeconds: cfg.timerSeconds,
        poolLimit: cfg.poolLimit,
        poolLang: cfg.poolLang,
    });
});

btnGuess.addEventListener("click", () => {
    const guess = inputGuess.value.trim();
    if (!guess) return;
    sendMessage({ type: "guess", guess });
});
inputGuess.addEventListener("keydown", (e) => { if (e.key === "Enter") btnGuess.click(); });

btnNewRound.addEventListener("click", () => {
    const poolLangResult = selectPoolLangResult ? selectPoolLangResult.value : null;
    const cfg = buildGameConfig(selectCategoryResult.value, poolLangResult);
    if (!cfg) return;
    sendMessage({
        type: "new_round",
        category: cfg.category,
        difficulty: cfg.difficulty,
        customWords: cfg.customWords,
        timerSeconds: cfg.timerSeconds,
        poolLimit: cfg.poolLimit,
        poolLang: cfg.poolLang,
    });
});

// Pas
btnPass.addEventListener("click", () => {
    sendMessage({ type: "next_turn" });
});

// Boşluk = Pas (oyun ekranı açıkken, input/textarea'da değilse)
document.addEventListener("keydown", (e) => {
    if (e.key !== " " && e.code !== "Space") return;
    if (!screenGame.classList.contains("active")) return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    e.preventDefault();
    sendMessage({ type: "next_turn" });
});

// Q&A log
btnLogToggle.addEventListener("click", () => {
    const wasHidden = logPanel.classList.contains("hidden");
    logPanel.classList.toggle("hidden");
    if (wasHidden) {
        logPanelSeenCount = qaLog.length;
        logFabBadge.classList.add("hidden");
        logList.scrollTop = logList.scrollHeight;
        setTimeout(() => logInput.focus(), 100);
    }
});
btnLogClose.addEventListener("click", () => logPanel.classList.add("hidden"));
btnLogSend.addEventListener("click", () => sendLogMessage(logInput.value, "question"));
logInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendLogMessage(logInput.value, "question");
});
logQuickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const kind = btn.dataset.kind;
        const labels = { yes: t("label_yes"), no: t("label_no"), maybe: t("label_maybe") };
        sendLogMessage(labels[kind] || "?", kind);
    });
});

// Eleme paneli kontrolleri
elimFab.addEventListener("click", () => elimPanel.classList.toggle("hidden"));
elimClose.addEventListener("click", () => elimPanel.classList.add("hidden"));
elimSearch.addEventListener("input", (e) => {
    elimSearchTerm = e.target.value;
    renderElimList();
});
elimTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        elimTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        elimFilter = tab.dataset.tab;
        renderElimList();
    });
});
elimReset.addEventListener("click", () => {
    const total = Object.keys(elimState).length;
    if (total === 0) return;
    if (!confirm(t("elim_reset_confirm", { count: total }))) return;
    elimState = {};
    localStorage.removeItem(elimStorageKey("state"));
    renderElimList();
});
elimNotes.addEventListener("input", () => {
    localStorage.setItem(elimStorageKey("notes"), elimNotes.value);
});


// ══════════════════════════════════════════════════
// SES TOGGLE
// ══════════════════════════════════════════════════
function updateSoundIcon() {
    if (soundEnabled) {
        soundIconOn.classList.remove("hidden");
        soundIconOff.classList.add("hidden");
    } else {
        soundIconOn.classList.add("hidden");
        soundIconOff.classList.remove("hidden");
    }
}
btnSoundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("whoami:sound", soundEnabled ? "on" : "off");
    updateSoundIcon();
    if (soundEnabled) sounds.message();
});


// ══════════════════════════════════════════════════
// THEME TOGGLE
// ══════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    const body = document.body;

    function applyTheme(theme) {
        if (theme === "dark") {
            body.classList.add("dark-mode");
            sunIcon.classList.remove("hidden");
            moonIcon.classList.add("hidden");
        } else {
            body.classList.remove("dark-mode");
            sunIcon.classList.add("hidden");
            moonIcon.classList.remove("hidden");
        }
    }
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);
    themeToggle.addEventListener("click", () => {
        const isDark = body.classList.contains("dark-mode");
        const newTheme = isDark ? "light" : "dark";
        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    });

    // Dil seçici
    const langSelect = document.getElementById("lang-select");
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener("change", () => {
            const newLang = langSelect.value;
            if (!SUPPORTED_LANGS.includes(newLang)) return;
            currentLang = newLang;
            localStorage.setItem("whoami:lang", currentLang);
            applyI18nToDOM();
            // Aktif ekranlardaki dinamik metinleri tazele
            if (myRoomCode) gameRoomCode.textContent = t("room_label", { code: myRoomCode });
            updateGuessUIState();
            renderTurnBar();
            renderLog();
            if (elimItems && elimItems.length > 0) renderElimList();
            if (connectionStatus.classList.contains("status-connected")) {
                connectionStatus.textContent = t("connected");
            } else if (ws && ws.readyState === WebSocket.OPEN) {
                connectionStatus.textContent = t("connected");
            } else if (ws) {
                connectionStatus.textContent = t("disconnected");
            } else {
                connectionStatus.textContent = t("no_connection");
            }
            if (btnJoin.disabled) btnJoin.textContent = t("joined");
            else btnJoin.textContent = t("join_room");
            // Sunucuya UI dilini bildir ki gelecekteki mesajlar bu dilde olsun
            if (ws && ws.readyState === WebSocket.OPEN && myPlayerId) {
                sendMessage({ type: "set_lang", lang: currentLang });
            }
        });
    }

    // İlk yüklemede UI hazırlıkları
    applyI18nToDOM();
    renderAvatarGrid();
    prefillFromUrl();
    updateSoundIcon();
    updatePoolSizeVisibility();

    // PWA service worker registrasyonu
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
});
