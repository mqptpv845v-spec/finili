# Briefd (by Finali): Projektstatus & Konceptsammanfattning

> **Konceptdokument — inte verifierad produktstatus.** Funktionerna nedan innehåller målbild och modellgenererade förslag. Se `docs/briefd-release-contract.md` för vad som faktiskt har verifierats.

Det här dokumentet sammanfattar visionen, arkitekturen och de unika funktionerna för Briefd (by Finali) inför er genomgång.

---

## 1. Världsbild & Kärnproblem

> "This is not a technology problem. It is a translation problem."

Medieplanering och kreativ produktion talar helt skilda språk. Medieplanen styrs av reach, kampanjperioder, radnummer och budgetposter. Kreativ produktion styrs av proportioner, typografi, utfall (bleed) och millimeterprecision.

När dessa två världar möts via statiska, ostrukturerade Excel-filer och långa mejltrådar uppstår versionskonflikter, missförstånd och kostsamma felproduktioner. Briefd löser detta genom att fungera som den oumbärliga bron mellan medieaffären och den kreativa produktionen.

---

## 2. Kärnfunktioner & "Aha-upplevelser"

Briefd är uppbyggt för att ge omedelbar kognitiv avlastning och eliminera allt administrativt slavgöra innan designarbetet ens börjar.

### Det Visuella Kortrastret
Förvandlar torra kalkylbladsrader (t.ex. `300x250` eller `1185x1750 mm`) till skalanpassade, proportionella formatkort direkt i webbläsaren. Formgivaren kan planera rumsligt från sekund ett.

### Creative Build Sheet (Smart klustring)
Systemet analyserar hela medieplanen, räknar på överlappande proportioner och räknar automatiskt ut det absoluta minsta antalet master-layouter som faktiskt behöver produceras för att täcka hela kampanjen. Exempelvis att 24 bokade publicistformat endast kräver 3 unika original: stående, liggande och kvadratiskt.

### Zero-Login Live-länkar
Genererar en unik, molnbaserad länk (`briefd.app/p/kampanjnamn`) som delas med mediebyrå, formgivare och kund. Om planeraren uppdaterar en rad i Excel uppdateras vyn omedelbart i realtid för alla — helt utan konton eller inloggningskrav.

### Färdiga IDML/IDNT-mallar
Med ett klick kan formgivaren ladda ner tomma InDesign-mallar försedda med exakta millimeter- eller pixelmått, korrekta marginaler och skärmån (bleed) anpassade för respektive publicist, komplett med rätt filnamnsstruktur (t.ex. ordernummer och vecka).

### Linear Production Runway
En inbyggd, interaktiv tidslinje som visuellt visar inlämningsordningen — från tidningsprint som måste vara klart först, till digitala banners och sociala medier — vilket gör det enkelt att svara på den eviga frågan: "Vad måste vi leverera först?"

---

## 3. Strategisk Tvåstegsraket

### Steg 1: Briefd (Gratis verktyg & Trojansk häst)
Ett lättviktigt, friktionsfritt vardagsverktyg som löser kalkylark-kaoset helt gratis för byråer och kreatörer. Det bygger branschens mest tillförlitliga ekosystem för publicistspecifikationer och skapar ett starkt användarberoende.

### Steg 2: Finali AI (Den betalda motorn)
När kampanjstrukturen är satt i Briefd är steget till helautomatisering bara ett klick bort. Finali AI läser in formgivarens masterfiler (`.indd` / `.pdf`) och skalar, reflowar och preflightar automatiskt alla bokade format till exakta publicistkrav på några sekunder.

---

## 4. Om Teamet bakom

Vi är formgivare och kreativa teknologer som tillbringat år på byråer och levt igenom frustrationen med sena fredagsfiler och trasiga kalkylark. Vi bygger den mjukvara vi själva önskade fanns — där avancerad automatisering och maskininlärning enbart fungerar som tyst "backend-plumbing" utan att någonsin störa det mänskliga, kreativa hantverket.

---

*Sammanställt av Gemini, augusti 2026.*
