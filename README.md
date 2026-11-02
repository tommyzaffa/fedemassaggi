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
| `index.html` | Pagina unica: hero, chi sono, trattamenti, motto, come funziona, casse malati, promozioni, FAQ, contatti |
| `css/style.css` | Stili e layout responsive |
| `js/main.js` | Animazioni (GSAP + ScrollTrigger), smooth scroll (Lenis), menu, FAQ |
| `js/vendor/` | GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13 (self-hosted) |
| `fonts/` | Cormorant Garamond e Manrope (self-hosted, nessuna chiamata a Google) |
| `img/` | Foto in webp (640/1024/1600/2200 px), icone, immagine Open Graph |
| `scripts/optimize.sh` | Rigenera i webp da `img/src/` (originali esclusi da git) |

## Aggiornare i contenuti

- **Promozioni**: sezione `#promozioni` in `index.html`, basta cambiare i testi delle card.
- **Foto**: metti l'originale in `img/src/` con lo stesso nome e lancia `./scripts/optimize.sh` (richiede `cwebp` e Pillow).
- **Dominio definitivo**: sostituire `https://tommyzaffa.github.io/fedemassaggi/` in `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` e `sitemap.xml`.

## Foto

Foto stock da [Unsplash](https://unsplash.com) (licenza Unsplash, uso commerciale consentito). Autori: Jakub Klucký, ika ika, Katherine Hanlon, Massage a Domicile, Performance Medicine, Anna Storsul, Mat Kilkeary, Simon Humler, Taylor Heery, Anna Keibalo, Rosalie Gdy, Christin Hume, 360floralflaves, Skyler Smith, Raymond Petrik, Fabrice Villard.
