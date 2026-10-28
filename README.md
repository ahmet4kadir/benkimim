# Ben Kimim? 🎭

Çok oyunculu "Ben Kimim?" tahmin oyunu. Herkesin kafasına bir ünlü ismi
atanır, kendi ismini göremezsin; sorular sorarak kim olduğunu bulmaya
çalışırsın.

Bu depo, [TalhaTamirci/whoami](https://github.com/TalhaTamirci/whoami)
projesinin [ahmetkadir.com](https://ahmetkadir.com) altyapısına taşınmış
(port edilmiş) hâlidir.

- **Oyna:** https://oyun.ahmetkadir.com (aynı istemci
  https://ahmetkadir.com/oyun/benkimim adresinde de sunulur)
- **Sunucu:** `wss://wsoyun.ahmetkadir.com` — ahmetkadir.com deposundaki
  birleşik oyun sunucusu (`oyun-server/`), bu depodaki `server/benkimim`
  paketinin aynısını çalıştırır.

## Yapı

```
client/   Vanilla HTML/CSS/JS istemci (PWA, service worker ile)
server/   Python + websockets sunucusu
  benkimim/   oyun mantığı (game.py, handlers.py, messages.py, names.py)
  main.py     tek başına çalışan sunucu girişi
  Dockerfile  Coolify / Docker dağıtımı için
```

## Lokal çalıştırma

```bash
cd server
pip install -r requirements.txt
python main.py          # ws://localhost:8765
```

Sonra `client/index.html` dosyasını tarayıcıda aç. İstemci `localhost`
üzerinden açıldığında otomatik olarak `ws://localhost:8765` adresine
bağlanır; başka bir adres için sayfa yüklenmeden önce `window.WS_URL`
tanımlayabilirsin.

## Nasıl oynanır?

1. Adını yaz, **Odaya Katıl**'a tıkla (yeni oda oluşur).
2. Oda kodunu arkadaşlarınla paylaş.
3. Herkes katılınca host **Oyunu Başlat**'a tıklar.
4. Herkese bir isim atanır; kendininki "???" görünür.
5. Alttaki kutudan kafandaki ismi tahmin et. Doğru tahmin eden
   oyuncunun ismi açılır.
6. Herkes bulunca oyun biter, sıralama gösterilir.

## Dağıtım notları

- İstemci statik dosyalardan ibarettir; herhangi bir statik sunucuyla
  (nginx, GitHub Pages, Coolify "Static") yayınlanabilir.
- Sunucu için `server/Dockerfile` kullanılır; `PORT` ortam değişkeni
  dinlenecek portu belirler, `GET /health` 200 döner.
- İstemci ve sunucu arasındaki protokolü değiştirirsen ahmetkadir.com
  deposundaki `oyun-server/benkimim` paketini de eşle.
