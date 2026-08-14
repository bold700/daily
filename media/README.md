# media — placeholder assets

Het template verwacht in deze folder de volgende bestanden. Vervang ze 1-op-1
met de assets van de klant. Voor het hero-blok is video optioneel — als die
ontbreekt valt het terug op het `.jpg` poster-frame.

## Logo + portret

| Bestand        | Wat                                | Aanbevolen                                    |
|----------------|------------------------------------|-----------------------------------------------|
| `logo.png`     | Bookmark + dock + footer logo      | 256×256 PNG, transparante achtergrond, contrast op cream en espresso |
| `logo.svg`     | (Optioneel) vectorvariant          | Vierkant viewbox, één kleur die invertbaar is |
| `portrait.jpg` | Portret in chapter 06 + 07         | 1442×1600 of vergelijkbaar (portret-verhouding), gezicht in bovenste helft, ruimte rondom — het wordt in een arch gecropped |

## Chapter media (10 hoofdstukken)

Elke chapter heeft een `.jpg` poster + `.mp4` loop. Het script-fallback toont
de `.jpg` als de `.mp4` ontbreekt of als de browser autoplay blokkeert.

| Bestand                  | Hoofdstuk                | Tip                                                       |
|--------------------------|--------------------------|-----------------------------------------------------------|
| `ch00-hero.jpg / .mp4`   | 00 Hero                  | Iconisch openingsbeeld, langzaam bewegen, donker overlay  |
| `ch01-kern.jpg / .mp4`   | 01 De kern               | Detailshot of sfeerbeeld dat propositie ondersteunt       |
| `ch02-probleem.jpg / .mp4` | 02 Het probleem        | Beeld dat het probleem voelbaar maakt                     |
| `ch03-diensten.jpg / .mp4` | 03 Diensten            | Abstract sfeerbeeld, niet te druk (kaarten staan ervoor)  |
| `ch04-werkwijze.jpg / .mp4` | 04 Werkwijze          | Abstract sfeerbeeld (5 stap-kaarten ervoor)               |
| `ch05-tweede.jpg / .mp4` | 05 Tweede doelgroep      | Beeld vanuit het perspectief van die doelgroep            |
| `ch09-slot.jpg / .mp4`   | 09 Slot                  | Sterk slotbeeld, ruimte voor CTA-tekst eroverheen         |

Chapters 06 (Over), 07 (Over vervolg) en 08 (Referenties) gebruiken het portret
of geen video — ze tonen `portrait.jpg` of een card-panel zonder achtergrondbeeld.

## Detail-pagina

| Bestand                    | Wat                              |
|----------------------------|----------------------------------|
| `detail-hero.jpg / .mp4`   | Hero op detail-pagina            |
| `detail-section-1.jpg`     | Beeld in sectie 1 (wanneer)      |
| `detail-section-2.jpg`     | Beeld in sectie 2 (wat ik doe)   |
| `detail-section-3.jpg`     | Beeld in sectie 3 (wat je krijgt)|

## Specs

- **Video**: H.264 MP4, max ~150KB per loop. Maak loops 4-8 sec, naadloze
  herhaling. Mute (geluid wordt niet afgespeeld), 1280×720 of 1920×1080.
- **Foto's**: JPG 80-85% kwaliteit, breedte rond 1600px. Donkere/contrast-
  rijke beelden werken het best onder de overlay.
- **Logo**: PNG met transparantie. Het CSS filter `invert(1)` wordt op
  donkere secties toegepast — kies dus een neutrale grijswaarde-tolerant logo,
  of laat het logo voldoende contrasten op beide achtergronden.
