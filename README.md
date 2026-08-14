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

## Beeld

De fles is de hoofdpersoon. Alle tien beelden staan in één gedeelde
`.stage__media` laag en faden met opacity in elkaar over, zodat het product
tijdens de crossfade niet verspringt. Ze zijn met Higgsfield (GPT Image 2)
gegenereerd vanuit `media/concept-fles.png` en `media/daily-ch00-hero.jpg`
als vaste referentie, allemaal 1920 x 1080.

| Bestand | Hoofdstuk |
|---------|-----------|
| `daily-ch00-hero.jpg` | Hero, masterbeeld |
| `daily-ch01-problem.jpg` | Het probleem |
| `daily-ch02-product.jpg` | Het product |
| `daily-ch03-activate.jpg` | Zo werkt het |
| `daily-ch04-difference.jpg` | Eerlijk verschil |
| `daily-ch05-moments.jpg` | De momenten |
| `daily-ch06-flavours.jpg` | De smaken |
| `daily-ch07-story.jpg` | Ons verhaal |
| `daily-ch08-detail.jpg` | FAQ |
| `daily-ch09-cta.jpg` | Slot |

Elke `.shot` is voorbereid op video: vervang de `<img>` door
`<video autoplay muted loop playsinline poster="...">` zonder de layout aan te
raken. Voor mobiel komen er later verticale versies van 1080 x 1920 met de fles
iets lager in beeld.

## Nog te doen

- [ ] E-mailadres: staat nu op `hallo@daily.example`
- [ ] Logo (`media/logo.svg` + `media/logo.png`) staat nog op de template-placeholder
- [ ] Video's van 4 tot 6 seconden per hoofdstuk, naadloos loopend
- [ ] Verticale 1080 x 1920 versies voor mobiel
