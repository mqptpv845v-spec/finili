# Finali AI & Briefd — Sammanfattning för kompanjon

> **Vision — inte produktspecifikation.** Funktionerna nedan beskriver målbilden och ska inte läsas som levererade egenskaper. Se `docs/briefd-release-contract.md` för verifierad nulägesgräns.

---

## Vad vi bygger

Vi bygger det saknade lagret mellan medieplanering och kreativ produktion. Två produkter, ett ekosystem.

---

## Produkterna

### Briefd by Finali (Fas 1 — Gratis)
Ett lättviktigt, visuellt webbverktyg som dödar Excel-kaoset i det kreativa överlämnandet.

**Problemet det löser:**
Designers får en Excel-fil med 40 rader teknisk data och förväntas förstå exakt hur varje annonsformat ska se ut. Det tar tid, det skapar fel, och det är tråkigt.

**Hur det fungerar:**
1. Dra in din `.xlsx`-medieplan
2. Varje rad blir ett visuellt formatkort med rätt proportioner, exakta mått, deadlines och länk till publicistens specifikationer
3. Dela en live-länk med hela teamet — ingen laddar ner filer, ingen jobbar på fel version

**Varför gratis:**
- Bygger varumärkeskännedom för Finali AI
- Samlar data om vilka format och mediehus som är vanligast i Norden
- Ger oss direktkontakt med designers som har problemet Finali AI löser
- Varje klick på "Automate with Finali AI" är en varm lead

---

### Finali AI (Fas 2 — Betald motor)
En deterministisk produktionsmotor som tar en InDesign-masterfil och automatiskt genererar alla kampanjformat som trycksäkra PDF:er.

**Problemet det löser:**
En designer på ICA:s marknadsavdelning har gjort en perfekt layout för veckans korvkampanj. Nu måste exakt samma design göras om i 80 olika storlekar — olika skärmar, olika butiker, olika priser. Idag sitter någon och gör det manuellt i Adobe InDesign. Det tar dagar och det är superlätt att göra fel.

**Hur det fungerar:**
1. Ladda upp InDesign-masterfilen (`.idml`) + Excel-medieplanen
2. Mappa kolumner till variabler (tar ~15 sekunder, systemet minns det till nästa gång)
3. Systemet genererar alla format automatiskt i molnet
4. Granska i ett visuellt preview-grid — textspill flaggas automatiskt med röd ram
5. Godkänn → ladda ner ZIP med 80 trycksäkra, rätt namngivna PDF/X-filer

---

## De tre pelarna

### Pelare 1 — Spec-databasen (Vallgraven)
Centraliserad, dagsaktuell databas med tekniska krav från mediehus, distributörer och utomhusaktörer i Norden. Clear Channel, JCDecaux, Bonnier News, Schibsted, SDR med flera.

Systemet vet automatiskt vilka mått, färgprofiler, utfallsmarginaler och viktgränser som gäller för varje destination. När kunder väl är inlåsta i den här databasen vill de inte byta.

### Pelare 2 — Automatiserad filgenerering (Motorn)
IDML-parsning + datainjektion från Excel + rendering till trycksäkra PDF/X-filer.

**Teknisk nyckelinsikt:** `.idml` är öppen XML — vi kan parsa och modifiera InDesign-filer utan att betala Adobe en krona. Vi betalar bara för rendering när kunden faktiskt exporterar. Det ger oss marginaler på 80%+.

### Pelare 3 — Human-in-the-loop (Juridisk skyddsmur)
Inget exporteras utan att en människa granskat och godkänt. Det aktiva godkännandesteget är inte bara UX — det är vår juridiska skyddsmur enligt ALG 20 (Allmänna leveransvillkor för grafiska prestationer). Ansvaret för slutresultatet ligger hos kunden, inte hos oss.

---

## Marknaden

### Problemet är verkligt och stort
- ICA Reklam producerar 320 miljoner flygblad per år
- Designers lägger 30–50% av sin arbetstid på mekanisk formatanpassning
- Ett enda feltryck kan kosta hundratusentals kronor i omkörning
- Manuell DTP till offshore-hubbar i Indien/Östeuropa är vanligt men skapar ledtidsproblem och kvalitetsrisker

### Våra kunder (ICP)
**Primär målgrupp nu:**
Mellanstora reklambyråer och produktionsbyråer i Stockholm — de har inte volymen för egna offshore-team men sitter dagligen med kampanjer i 15–30 format.

En senior originalare i Stockholm kostar ~700 kr/timmen internt. Sparar vi 20 timmar/månad är vår licens på 4 900 kr/månad ihoptjänad direkt.

**Sekundär målgrupp:**
Inhouse-team på snabbrörliga B2B/B2C-varumärken inom tech, finans, e-handel och mode som vill ha full kontroll och korta ledtider.

### Konkurrenslandskapet — varför vi vinner
| Konkurrent | Vad de gör | Vad de inte gör |
|------------|------------|-----------------|
| CHILI GraFx | Kraftfull mallbaserad automation | Kräver mångers implementering, för stelt för ad-hoc |
| Bannerflow | Bäst på digital display | Hanterar inte print, CMYK eller PDF/X |
| Specle/Adsend | Validerar och larmar om filer är fel | Kan inte skapa eller bygga om layouten |
| Enfocus PitStop | Branschstandard för tryckeri-preflight | Inget visuellt gränssnitt, ingen medieplanskoppling |
| Adobe GenStudio | Enterprise-automation för globala jättar | För dyr, för tung, för global för vår målgrupp |

**Ingen av dem gör det vi gör:** tar en dagsaktuell medieplan, kopplar den till en specifikationsdatabas och genererar storleksanpassade tryckoriginal via IDML för mänskligt godkännande.

---

## Teknisk arkitektur

```
[InDesign-master (.idml) + Excel-medieplan]
                    │
                    ▼
        [Steg 1: IDML-parsning — GRATIS]
        Packar upp XML, läser objektträd,
        injicerar data direkt i XML-koden.
        Kostnad: ~0 kr (standard serverkapacitet)
                    │
                    ▼
        [Steg 2: Spec-databas cross-referens]
        Hämtar mått, bleed, CMYK-profil,
        viktgränser för varje destination.
                    │
                    ▼
        [Steg 3: Webb-förhandsvisning — GRATIS]
        Lätta previews renderas i webbläsaren.
        Textspill flaggas automatiskt.
        Kostnad: 0 kr (lokal datorkraft)
                    │
                    ▼
        [Steg 4: Godkännande & Export]
        Kunden sign-offar → ansvar skiftar (ALG 20)
        PDF/X renderas på server — ENDAST nu betalar vi.
        Kostnad: <0,18 kr per genererad fil
```

---

## Affärsmodell

**Briefd:** Gratis alltid. Lead-magnet och varumärkesbyggare.

**Finali AI:** Kampanjvolym-baserad prenumeration.

| Nivå | Pris | Målgrupp |
|------|------|----------|
| Growth | 4 900 kr/mån | Upp till 5 aktiva kampanjer/mån. Mellanstora byråer och inhouse-team |
| Enterprise | 14 900 kr/mån | Obegränsad volym. Stora detaljhandelskedjor och enterprise-byråer |

**Varför kampanjvolym och inte per användare:**
Ett team på 2–3 designers kan producera tusentals filer per månad. Seat-based pricing missar värdet helt.

---

## Varför nu

- Adobe har flyttat sina renderingsmotorer till molnbaserade API:er — det som tidigare krävde miljontals kronor i egen infrastruktur kan vi nu bygga som en smidig startup
- `.idml` är öppen XML — vi är inte beroende av Adobe för parsning och manipulation
- InDesign är och förblir branschstandard för professionell print i Norden — Figma och Canva hanterar inte CMYK eller PDF/X
- Adobe bygger åt de 100 största globala varumärkena — vi bygger åt de 1 000 nordiska byråerna och inhouse-teamen som är för små för Adobe och för stora för att göra det manuellt

---

## Positionering

**Finali i ett stycke:**
> Vi bygger det saknade lagret mellan medieplanering och kreativ produktion. Briefd översätter kaoset i Excel-medieplaner till visuella formatkort som hela teamet förstår. Finali AI tar det vidare och genererar alla kampanjformat automatiskt — från InDesign-master till 80 trycksäkra PDF:er på sekunder.

**Teknisk position:**
> Detta är inte ett verktyg där man designar. Det är verktyget man använder för att exekvera och spotta ut filerna när designen redan är klar.

**"Boring AI":**
> Vi försöker inte vara sexiga. Vi löser ett extremt tråkigt, dyrt och administrativt tungt problem i en nisch där betalningsviljan är bevisad.

---

## Who we are (About-text)

Designers and technologists who spent years inside agencies. We know what it feels like to receive a 47-row Excel file on a Friday afternoon and be expected to have production-ready artwork by Monday.

**The problem we care about:**
Media planning and creative production speak completely different languages. One is driven by numbers, reach, and budget allocation. The other by proportion, typography, and millimeter precision. The handoff between them — still happening mostly through static spreadsheets and email threads — is where campaigns lose time, money, and quality.

This is not a technology problem. It is a translation problem.

**Our mission:**
To make the handoff from media strategy to production invisible.

---

## Nästa steg

1. **Den här helgen:** Designa känslan för Finali/Briefd. Förklara Briefd för kompanjonen. Bestäm gemensam riktning.

2. **Kommande 4 veckor:** Bygg Briefd MVP. Visa för 10 designers och produktionschefer i Stockholm.

3. **Månad 2–3:** Stäng första betalande kunden på Finali AI. 4 900 kr/månad.

4. **Månad 6:** Beslut om att gå ner till 80% eller frilansa baserat på vad kunderna säger.

---

## Realistisk 5-årsplan

| Period | Fokus | Mål |
|--------|-------|-----|
| År 1 | Validera kvällar och helger | 3–5 betalande kunder |
| År 2 | Barn + Briefd sprids organiskt | 5–10 kunder, Almi-kontakt |
| År 3 | Säg upp dig/frilansa heltid | 20–40 kunder, 1–3 MSEK ARR |
| År 4 | Skala Norden | 4–8 MSEK ARR |
| År 5 | Exit eller fortsätt | 8–15 MSEK ARR, 30–75 MSEK bolagsvärde |

---

*Sammanställt från strategisk konversation, augusti 2026.*
