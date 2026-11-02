# Fedemassaggi

Sito one-page di **Fedemassaggi**, i massaggi terapeutici di Federica Meier De Vecchi a Comano (Lugano). Massaggiatrice riconosciuta RME.

Anteprima: https://tommyzaffa.github.io/fedemassaggi/

## Run locally

Sito statico, nessuna build.

```bash
python3 -m http.server 8080
```

Poi apri http://localhost:8080

## Struttura

| File | Contenuto |
|------|-----------|
| `index.html` | Pagina unica: apertura col cerchio che respira e il motto, chi sono, trattamenti con filtro per esigenza, sessanta minuti, lo studio, buoni regalo, buono a sapersi, contatti |
| `css/style.css` | Stili e layout responsive |
| `js/main.js` | Cerchio che respira e si apre, immagine che segue il cursore, filtro trattamenti, anello dei 60 minuti (GSAP + ScrollTrigger), smooth scroll (Lenis), menu |
| `js/vendor/` | GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13 (self-hosted) |
| `fonts/` | Italiana e Instrument Sans (self-hosted, nessuna chiamata a Google) |
| `img/` | Foto in webp (640/1024/1600/2200 px), icone, immagine Open Graph |
| `scripts/optimize.sh` | Rigenera i webp da `img/src/` (originali esclusi da git) |

## Aggiornare i contenuti

- **Promozioni e novità**: lista `.gift__news` nella sezione `#regala` di `index.html`.
- **Foto**: metti l'originale in `img/src/` con lo stesso nome e lancia `./scripts/optimize.sh` (richiede `cwebp` e Pillow).
- **Dominio definitivo**: sostituire `https://tommyzaffa.github.io/fedemassaggi/` in `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` e `sitemap.xml`.

## Foto

Foto stock da [Unsplash](https://unsplash.com) (licenza Unsplash, uso commerciale consentito). Autori: Jakub Klucký, ika ika, Massage a Domicile, Performance Medicine, Anna Storsul, Mat Kilkeary, Simon Humler, Taylor Heery, Anna Keibalo, Rosalie Gdy, Christin Hume, Skyler Smith, Raymond Petrik, Fabrice Villard.
