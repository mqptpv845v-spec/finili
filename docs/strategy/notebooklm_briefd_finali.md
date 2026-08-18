# Briefd by Finali & Finali AI – Strategisk Produktsammanfattning
*Källa: Google NotebookLM*

Detta dokument dekonstruerar affärsmodellen, produktarkitekturen och de tekniska samt juridiska vallgravarna för Briefd och Finali AI. Syftet är att ge en skarp översikt över hur vi går från det analoga "Excel-kaoset" till en automatiserad, trycksäker och högmarginal-SaaS-plattform för grafisk produktion.

---

## 1. Problemet: Overhead, pre-press-fel och det förlamande "Excel-kaoset"

Inom marknadsföring och publicering har medieköp och digital distribution digitaliserats helt, medan den kreativa slutproduktionen — Final Art (originalarbete) — har förblivit en analog flaskhals.

- **DTP-slavgörat äter marginalerna:** Grafiska formgivare och originalare tvingas lägga 30–50% av sin arbetstid på att manuellt ändra storlek, beskära och formatera om godkända master-original till dussintals publicistformat.
- **Excel-kaoset skapar versionskonflikter:** Medieplaner och formatspecifikationer hanteras och skickas nästan uteslutande via statiska Excel-kalkylblad. Ändringar under pågående kampanj leder direkt till brutna informationskedjor, felaktiga filleveranser och missade deadlines.
- **Kostsamma feltryck och pre-press-avvisningar:** Missat utfall (bleed), felaktiga färgrymder (RGB istället för CMYK), dolda textspill (overset text) eller överskriden färgtäckningsgräns leder till att kampanjer stoppas eller resulterar i omtryckskostnader på hundratusentals kronor.

---

## 2. Två-stegs-lösningen: Briefd & Finali AI

Plattformen är uppdelad i en kostnadsfri lead-magnet (Briefd) och en betald automatiseringsmotor (Finali).

```
[ adoption ] ──────────► [ aktivering ] ──────────► [ monetarisering ]
Fas 1: Briefd Spec Hub   Fas 2: DTP-produktion Beta  Fas 3: Finali Enterprise
- Kostnadsfritt verktyg  - Formgivare laddar upp IDML - Betald motor aktiveras
- Ersätter Excel-kaoset  - Formaten genereras på 15s  - ALG 20-audit trail
- Virala live-länkar      - Preflight & copy-fitting   - Hybrid B2B SaaS-licens
```

### Briefd by Finali — Den kostnadsfria spec-hubben (Adoption)

Briefd agerar som ett smidigt mellanlager. Medieplaneraren kan fortsätta arbeta i Excel. När planen är klar dras den in i Briefd via Drag & Drop Excel-import.

- **Det Visuella Kortrastret:** Parsear och översätter Excel-raderna till skalanpassade, interaktiva formatkort med direkt spatial förståelse för layoutproportionerna.
- **Creative Build Sheet:** Grupperar formaten efter bildförhållanden och räknar ut det absoluta minsta antalet master-assets som formgivaren faktiskt behöver producera. Minimerar dubbelarbete radikalt.
- **Unika, levande delningslänkar:** Genererar en live-URL för kampanjschemat. Om placeringar ändras uppdateras vyn i realtid för formgivare, tryckerier och kunder utan versionskonflikter eller inloggningskrav.
- **Blank Canvas-export:** Direkt nedladdning av tomma, förkonfigurerade InDesign-mallar med exakta dokumentmått, marginaler och korrekt utfall utifrån medieplanen.

### Finali — Den betalda layout- och renderingsmotorn (Monetarisering)

Formgivaren laddar upp sin master-IDML direkt i vyn. Finali tar över, parsar IDML-XML-strukturen programmatiskt i backend och genererar automatiskt alla formatspecifika, trycksäkra PDF-leveransfiler på under 15 sekunder.

---

## 3. De tre integrerade pelarna — Vallgrav och skyddsmur

De tre pelarna är ömsesidigt beroende. Om en komponent tas bort komprometteras antingen produktens tillförlitlighet, bruttomarginal eller juridiska skydd.

### Pelare 1 — Spec-databasen (The Defensive Moat)

Centraliserad, maskinläsbar och kontinuerligt verifierad databas med exakta parametrar från alla stora nordiska mediehus, tryckerier och OOH/DOOH-operatörer (Bonnier News, Schibsted, Clear Channel, JCDecaux, SDR m.fl.).

Databasen lagrar kompletta specifikationsprofiler: bredd, höjd, utfall (bleed), säkerhetsmarginaler, ICC-färgprofiler, Total Ink Limit, PDF-standarder (PDF/X-4) och leveransdeadlines.

**Låsningseffekt:** När en byrå integrerat ett flöde där systemet automatiskt garanterar regelefterlevnad för dussintals publicister blir byteskostnaden extremt hög.

### Pelare 2 — Automatiserad filgenerering (The Mechanical Engine)

Istället för tunga Adobe InDesign-serverlicenser använder motorn programmatisk IDML-parsning. IDML är en öppen XML-standard i en ZIP-behållare.

- **Regelbaserad layoutmanipulering:** Deterministisk logik placerar om logotyper, justerar textramar och applicerar korrekt CMYK-färgkonvertering utifrån spec-databasen.
- **Generativ expansion:** Adobe Firefly Services API används kirurgiskt enbart för att bygga ut bakgrunder vid extrema formatomvandlingar utan att beskära det centrala motivet.
- **Automatisk Preflight & Copy-fitting:** Validerar bildupplösning, tvättar färgrymder och justerar automatiskt textstorlek om textspill uppstår. Utmatningen sker som trycksäkra PDF/X-4-filer.

### Pelare 3 — Human-in-the-Loop & ALG 20 (The Legal Shield)

En 100% autonom "black box" är en kommersiell mardröm — tryckfel på miljonkampanjer medför massiva skadeståndskrav.

- **Visuellt Soft-Proofing-gränssnitt:** Alla genererade format visas i ett preview-grid med preflight-rapporter. Formgivaren gör en sista mänsklig granskning direkt i webbläsaren.
- **Det juridiska ansvarsbytet (ALG 20):** När användaren klickar på "Godkänn och Exportera" genereras en digital spårbarhetslogg. Enligt ALG 20 ligger det slutgiltiga ansvaret för fel som beställaren borde ha upptäckt vid korrekturgranskning alltid på köparen. Detta befriar Finali AI från ekonomiskt och juridiskt skadeståndsansvar vid eventuella feltryck.

---

## 4. Driftskostnader och marginaler

- **Kostnadseffektiv arkitektur:** All interaktiv layoutredigering och förhandsvisning sker gratis på klientsidan i användarens webbläsare. Endast vid slutgiltigt godkännande skickas IDML-filen till servern för en enda PDF/X-export. Beräkningskostnaden hamnar under 0,18 SEK per genererad fil.
- **Bruttomarginal:** Över 80% tack vare hybrid-arkitekturen.
- **Hybrid abonnemangsmodell:** Fast månadspris med tak för antal kampanjer, plus rörlig överstegsavgift. Skapar stabil och förutsägbar CARR (Committed ARR).

---

## 5. Prissättning

| Nivå | Pris | Målgrupp |
|------|------|----------|
| Growth | 4 900 kr/mån | Mellanstora inhouse-team och byråer, upp till 5 kampanjer/mån |
| Enterprise | 14 900 kr/mån | Stora detaljhandelskedjor (ICA, Coop, H&M), obegränsad volym |

---

*Källa: Google NotebookLM, augusti 2026.*
