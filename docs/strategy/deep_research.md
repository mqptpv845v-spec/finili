# Deep Research: Marknadsanalys för Finali AI & Briefd

> **Vision och research — inte produktspecifikation.** Påståenden i detta dokument beskriver hypoteser, marknadsanalys och önskad produkt. De bevisar inte vad som är implementerat. Se `docs/briefd-release-contract.md` för verifierad nulägesgräns.

Sammanfattning av två oberoende marknads- och teknikanalyser.
Båda rapporterna bekräftar samma grundläggande bild — de kompletterar snarare än motsäger varandra.

---

## 1. Kärnproblemet — varför marknaden behöver Finali AI

Reklambranschen har en djup strukturell friktion mellan två världar som talar olika språk:

**Medieplanering** styrs av reach, budgetar, KPI:er och Excel-ark.
**Kreativ produktion** styrs av proportioner, typografi, millimeterprecision och ICC-färgprofiler.

Mötet mellan dessa två världar sker idag via statiska Excel-filer och långa mejltrådar. Resultatet är:

- **Versionskonflikter** — formgivaren jobbar på fel version av medieplanen
- **Mekaniskt DTP-slavjobb** — 30–50% av en designers arbetstid går åt till att manuellt ändra storlek på InDesign-filer
- **Kostsamma preflight-fel** — fel färgprofil, saknat utfall (bleed) eller textspill leder till avvisade filer och omtryckskostnader på hundratusentals kronor

### Exempel på teknisk komplexitet som skapar fel

| Format | Färgrymd | Upplösning | Utfall |
|--------|----------|------------|--------|
| Tidningsannons (dagspress) | CMYK, max 220–240% ink limit | 300 dpi | 3–5 mm |
| Magasin (glättat) | CMYK, Fogra 39/51, upp till 300% | 300 dpi | 3 mm |
| Digital OOH (DOOH) | RGB | Exakt pixelmappning | Ingen bleed |
| Busskur / Eurosize | CMYK | 300 dpi vid skala 1:10 | 5–10 mm |

Ett enda fel — som att leverera en DOOH-fil i CMYK istället för RGB — leder till omedelbart avvisad fil.

---

## 2. Hur löser branschen problemet idag?

### Stora byrånätverk
Outsourcar DTP-arbetet till offshore-hubbar i Indien eller Östeuropa. Billigt per timme men skapar:
- Långa ledtider (24h+ tidszonsskillnad)
- Kommunikationsmissar kring specifikationer
- Svår kvalitetskontroll vid sista-minuten-ändringar i medieplanen

### Inhouse-team
Anställer fler interna DTP-operatörer. Resultatet är att högkvalificerade designers lägger lejonparten av sin tid på lågintensivt, mekaniskt arbete — vilket påverkar lönsamhet och personalomsättning negativt.

**Ingen av dessa lösningar är hållbar i en mediecykel där planerna ändras i realtid.**

---

## 3. Konkurrenslandskapet — varför gapet finns

Båda rapporterna kartlägger samma bild: marknaden är uppdelad i silos som inte kommunicerar.

| Aktör | Vad de gör | Vad de inte gör |
|-------|------------|-----------------|
| **Mediatool / Mediaocean** | Budget, KPI-spårning, medieköp | Ingen DTP-koppling, exporterar statisk Excel |
| **CHILI GraFx / Papirfly** | Kraftfull mallbaserad automation | Kräver mångers mallbygge, passar inte ad-hoc-kampanjer |
| **Bannerflow** | Bäst på digital display och DOOH | Hanterar inte print, CMYK eller PDF/X |
| **Specle / Adsend** | Validerar och levererar färdiga PDF:er | Kan inte skapa eller bygga om layouten |
| **Enfocus PitStop** | Branschstandard för tryckeri-preflight | Inget visuellt gränssnitt, ingen medieplanskoppling |
| **Cape.io** | Kreativ automation för digital video och display | Inte byggt för typografisk print eller IDML |

### Slutsats från båda rapporterna
> Inget existerande verktyg kombinerar interaktiv hantering av mediespecifikationer med automatiserad IDML-parsning och mänskligt granskad pre-press-rendering. Marknaden är segmenterad — och gapet är Finali AI:s position.

---

## 4. Finali AI:s arkitektur — de tre pelarna

De tre pelarna är ömsesidigt beroende. Ta bort en och hela produktens värde och juridiska skydd raseras.

### Pelare 1 — Spec-databasen (Vallgraven)
Centraliserad, dagsaktuell databas med tekniska krav från nordiska mediehus, OOH-aktörer och distributörer (Clear Channel, JCDecaux, Bauer Media, Bonnier News, Schibsted, SDR med flera).

Databasen lagrar inte bara mått — utan kompletta specifikationsprofiler:
- Bleed och säkerhetszoner
- ICC-färgprofiler per papperskvalitet och tryckteknik
- Total Ink Limit per destination
- PDF-standard (PDF/X-1a eller PDF/X-4)
- Leveransdeadlines och filnamnskonventioner

**Strategisk effekt:** När en byrå väl är inlåst i systemet och slipper leta specs manuellt, blir tröskeln för att byta mycket hög. Det är plattformens primära retention moat.

### Pelare 2 — Automatiserad filgenerering (Motorn)
En deterministisk IDML-baserad layoutmotor som:
1. Parsear InDesign-masterfilen (`.idml`) — öppen XML, ingen Adobe-licens krävs
2. Injicerar data från medieplanen (priser, texter, bildlänkar) direkt i XML-strukturen
3. Kör automatisk preflight (upplösning, färgrymd, textspill)
4. Renderar trycksäkra PDF/X-4-filer med inbäddade typsnitt och skärmärken

**Teknisk nyckelinsikt:** Eftersom `.idml` är öppen XML kan all datainjektion ske gratis på servern. Rendering till PDF sker bara vid export — vilket ger marginaler på 80%+.

### Pelare 3 — Human-in-the-Loop (Juridisk skyddsmur)
Inget exporteras utan att en människa granskat och godkänt.

- Visuellt preview-grid i webbläsaren med alla format sida vid sida
- Textspill och tekniska avvikelser flaggas automatiskt med röd ram
- Enkla justeringar möjliga direkt i gränssnittet
- Aktivt godkännande (sign-off) innan export

**Juridisk grund — ALG 20:**
Enligt Allmänna leveransvillkor för grafiska prestationer (ALG 20), framtagna av Grafiska Företagen i samverkan med Sveriges Annonsörer och Komm!, bär beställaren ansvaret för fel som borde ha upptäckts vid korrekturläsning. Det aktiva godkännandesteget skapar en digital audit trail som juridiskt förskjuter ansvaret till kunden — och skyddar Finali AI mot skadeståndskrav.

---

## 5. Go-to-market — den trojanska hästen

Båda rapporterna rekommenderar samma inträdesstrategi: börja med ett lättviktigt gratisverktyg som löser ett omedelbart problem, och konvertera sedan till den betalda motorn.

### Briefd by Finali (Fas 1 — Gratis)
Visuell, webbaserad mediaplan som dödar Excel-kaoset i det kreativa överlämnandet.

**Konverteringsresa:**
1. **Adoption** — Formgivaren använder Briefd för att slippa tolka Excel-ark
2. **Aktivering** — Formgivaren testar automatiserad filgenerering för att spara tid
3. **Monetarisering** — Byrån uppgraderar till full Finali AI-licens

### Finali AI (Fas 2 — Betald motor)
Full DTP-automatisering med IDML-motor, spec-databas och human-in-the-loop godkännande.

---

## 6. Prissättning

Kampanjvolym-baserad prenumeration — inte seat-based. Ett team på 2–3 designers kan producera tusentals filer per månad; seat-based pricing missar värdet helt.

| Nivå | Pris | Inkluderat | Målgrupp |
|------|------|------------|----------|
| **Growth** | 4 900 kr/mån | Upp till 5 aktiva kampanjer/mån | Mellanstora byråer och inhouse-team |
| **Enterprise** | 14 900 kr/mån | Obegränsad volym, full API-åtkomst | Stora detaljhandelskedjor (ICA, Coop, H&M) |

**Konkurrensposition:** CHILI GraFx kostar 22 000 kr/mån bara för API-åtkomst. Finali AI:s Enterprise-nivå är ett ekonomiskt attraktivt alternativ för inhouse-avdelningar som vill automatisera utan enterprise-implementering.

---

## 7. Makrotrender som gynnar Finali AI

- **DOOH-fragmentering** — Clear Channel och JCDecaux adderar löpande nya skärmstorlekar. En manuell DTP-process hinner inte med i en mediecykel där planerna ändras i realtid.
- **Ekonomiskt tryck på byråer** — Kunder kräver mer output till lägre kostnad. Att fakturera 50 timmars manuell formatanpassning per kampanj är inte längre konkurrenskraftigt.
- **Adobe Cloud-API:er** — Adobe har flyttat sina renderingsmotorer till molnet, vilket gör det möjligt för en startup att erbjuda enterprise-klass rendering utan miljontals kronor i infrastruktur.
- **IDML som öppen standard** — `.idml` är öppen XML. Finali AI är inte beroende av Adobe-licenser för parsning och manipulation.

---

## 8. Rekommenderad lanserings- och utvecklingsfas

| Fas | Fokus | Målgrupp |
|-----|-------|----------|
| **Fas 1 — Briefd Launch** | Bygga och lansera Briefd med Excel-import och visuellt kortraster | Formgivare och frilansare — viral spridning |
| **Fas 2 — Data & Motor Beta** | Säkra spec-databasen för Norden, betatesta IDML-motorn | Mediehus och tryckerier (Clear Channel, JCDecaux, Bonnier) |
| **Fas 3 — Full Platform Launch** | Kommersialisera B2B-plattformen med Human-in-the-Loop och ALG 20-audit trail | Enterprise-byråer och inhouse-team |

---

## 9. Strategiska rekommendationer

**Värna om vallgraven** — Spec-databasens korrekthet är kritisk. Bygg mot direkta API-kopplingar med nordiska publicister för att hålla specs uppdaterade i realtid utan manuell handpåläggning.

**Betona den juridiska tryggheten** — ALG 20-skyddet via Pelare 3 är ett säljargument mot enterprise-byråer. Den mänskliga granskningen är inte en teknisk brist utan en medveten försäkringsmekanism.

**IDML som teknisk spjutspets** — Kommunicera fördelarna med IDML-parsning framför pixelbaserad rendering. Att InDesigns typografiska hierarki och vektorer respekteras maskinellt är ett krav för att printbranschen ska ta verktyget på allvar.

**Börja smalt** — Nordisk marknad, svenska TU-standarder och Clear Channel/JCDecaux-specs täcker 90%+ av den lokala marknadens behov. Tre framgångsrika case studies hos svenska inhouse-byråer är målet för fas 1.

---

*Sammanfattat från två oberoende deep research-rapporter, augusti 2026.*
