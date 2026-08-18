# Finali AI — Teknisk Dekonstruktion av Motorn
*Källa: Google NotebookLM*

Finali AI är en stängd, deterministisk layout- och preflight-motor i backend som helt automatiserar "sista milen" i den grafiska produktionen (DTP/originalarbete).

Det är den betalda kärnprodukten där magin faktiskt sker under huven. Istället för att en formgivare ska sitta och manuellt rita om en godkänd master-design till 30 olika format utifrån torra rader i en Excel-fil, tar Finali över och genererar alla tryck- och publicistklara originalfiler på under 15 sekunder.

---

## Processen under huven — steg för steg

### Steg 1 — Inmatning (Input)

Formgivaren drar och släpper sitt godkända huvudoriginal (IDML-filen) tillsammans med den digitala medieplanen (Excel eller API) direkt i systemet.

**Varför IDML?**
IDML (InDesign Markup Language) är inte ett stängt, binärt format utan en ZIP-behållare som innehåller en strikt strukturerad katalog av XML-filer. Detta gör att backend programmatiskt kan läsa, redigera och spara om filen på millisekunder via ren XML-manipulering — helt utan dyra licenser för serversidiga InDesign-motorer i molnet.

---

### Steg 2 — Intelligent Spec-matchning

Systemet läser av bokningsraderna i medieplanen och söker i den centrala Spec-databasen efter exakta tekniska parametrar för varje vald yta (t.ex. Bonnier News, JCDecaux eller SDR).

Systemet hämtar:
- Exakta fysiska mått och marginaler
- Krav på utfall (bleed) och säkerhetszoner (safe zones)
- Exakt färgprofil (ICC-profil) och maximal färgtäckningsgräns (Total Ink Limit, t.ex. max 240% TIC för dagspress)
- Publicistens unika filnamnskrav

---

### Steg 3 — Automatiserad layoutanpassning (The Rule Engine)

Finalis layoutmotor analyserar IDML-XML-strukturen och tillämpar regelbaserad logik för att skala om vektorgrafik, flytta logotyper till säkerhetszoner och anpassa textramar.

**Generative Expand (Adobe Firefly API)**
Om ett format kräver en extrem proportionell förändring (t.ex. från kvadratisk 1:1 till en bred 21:9-banner) skickas bildtillgångarna till Adobe Firefly Services API. Firefly målar ut en förlängd bakgrund så att huvudmotivet inte beskärs eller förvrängs.

**Autonom Copy-fitting**
Om en text eller ett kampanjpris flödar över sin textram (overset text) upptäcker motorn detta automatiskt och kör en copy-fitting-algoritm som justerar teckenstorlek, radavstånd och tracking tills texten passar perfekt.

---

### Steg 4 — Tryckteknisk tvätt (Preflight)

Motorn tvättar automatiskt allt material:
- Konverterar RGB-bilder till DeviceCMYK
- Applicerar rätt ICC-färgprofil (t.ex. `ISOnewspaper26v4` för tidningar eller `FOGRA39` för magasin) utifrån Spec-databasens krav
- Verifierar att bildupplösningen håller måttet (minst 300 dpi)

---

### Steg 5 — PDF/X-4 Rendering

När alla geometriska och färgmässiga justeringar är klara i XML-koden skickas den slutgiltiga IDML-strukturen till en headless renderingsmotor på serversidan som renderar ut en faktisk, trycksäker PDF/X-4-fil. Typsnitt bäddas in som obrutna vektorer och korrekta skärmärken appliceras.

---

### Steg 6 — Human-in-the-Loop & ALG 20 (Juridiskt ansvarsskifte)

De färdiggenererade PDF-filerna presenteras för formgivaren i ett visuellt preview-grid i webbläsaren.

- Användaren granskar filerna, ser tekniska preflight-rapporter och kan göra sista-minuten-justeringar direkt på skärmen
- När användaren klickar på "Godkänn och Exportera" genereras en digital spårbarhetslogg (audit trail)

**Det juridiska skyddet:**
Enligt de nordiska branschvillkoren ALG 20 (Allmänna leveransvillkor för grafiska prestationer) ligger det slutgiltiga ansvaret för fel som beställaren borde ha upptäckt vid korrekturgranskning alltid på köparen. Genom att tvinga kunden att göra ett aktivt godkännande av de genererade PDF-filerna flyttas hela den ekonomiska risken för eventuella feltryck bort från Finali AI till kunden.

---

### Steg 7 — Utleverans

Trycksäkra, färgseparerade och korrekt döpta filer förpackas i en komprimerad ZIP-fil som levereras direkt till molnet, redo för tryckeri eller medieägare.

---

## Sammanfattning av flödet

```
[IDML-master + Excel-medieplan]
              │
              ▼
    [Spec-matchning mot databas]
    Mått, bleed, ICC, ink limit
              │
              ▼
    [Regelbaserad layoutanpassning]
    Vektorskalning, copy-fitting,
    Firefly Generative Expand
              │
              ▼
    [Tryckteknisk tvätt / Preflight]
    RGB → CMYK, ICC-profil, 300 dpi
              │
              ▼
    [PDF/X-4 rendering på server]
    Inbäddade typsnitt, skärmärken
              │
              ▼
    [Human-in-the-Loop / Preview Grid]
    Granskning, justering, sign-off
              │
              ▼
    [ZIP-leverans]
    Trycksäkra, rätt namngivna filer
```

---

*Källa: Google NotebookLM, augusti 2026.*
