# DAILY — scroll website

Testopzet voor een drankmerk, gebouwd op de `scroll-editorial` template uit
[website-templates](../website-templates/scroll-editorial). Eén vastgepinde stage
met tien hoofdstukken die in elkaar overvloeien via kleurwas-overgangen.

**Status:** skelet staat, inhoud is nog placeholder. Alle nog in te vullen teksten
staan in `[brackets]` in `index.html` en `pagina-1.html`.

## Draaien

Statische site, geen build:

```
cd ~/Documents/GitHub/daily
python3 -m http.server 8096
```

Dan: http://localhost:8096

## Opbouw

| Bestand | Inhoud |
|---------|--------|
| `index.html` | Home, 10 scroll-hoofdstukken |
| `pagina-1.html` | Detailpagina, 5 hoofdstukken |
| `styles.css` | Layout, transities, type-scale (merkvrij) |
| `brand.css` | `:root` tokens + wash-gradients |
| `app.js` | Scrolly-engine, Lenis, magnetic buttons |
| `media/` | Placeholder posters + logo |
| `brand.json` | Merkwaarden, input voor het bake-script |

## Opnieuw bakken na een merkwijziging

Kleuren, fonts, naam, contact en CTA staan in `brand.json`. Wijzig daar, en bak
opnieuw vanuit de template:

```
cd ~/Documents/GitHub/website-templates/scroll-editorial
cp ~/Documents/GitHub/daily/brand.json ./examples/daily.brand.json
node apply-brand.mjs ./examples/daily.brand.json ~/Documents/GitHub/daily
```

Let op: bakken overschrijft `index.html` en `pagina-1.html`. Doe de merkkeuzes dus
vóór het schrijven van de bodyteksten, of neem de teksten daarna opnieuw over.

## Nog te doen

- [ ] Merkinfo: naam-uitleg, tagline, propositie, toon
- [ ] Palet en fonts (nu nog template-default: warm cream/espresso, Fraunces + Inter)
- [ ] Bodyteksten per hoofdstuk
- [ ] Beeld: `media/ch00-hero.mp4` t/m `ch09-slot.mp4` plus bijbehorende `.jpg` posters
- [ ] Logo (`media/logo.svg` + `media/logo.png`)
