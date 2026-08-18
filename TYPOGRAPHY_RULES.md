# Design- och Typografiregler för Briefd & Finali

> [!IMPORTANT]
> **1. Fluid Typografisystem med `vw` & `clamp()` (Full Desktop Dynamic Scale)**
> - **Display Rubrik (Hero H1):** `text-[clamp(3.5rem,6.8vw,8.5rem)]` Bold (`font-bold`), `tracking-tight`, `leading-[1.02]`.
> - **Sektionsrubriker (H2):** `text-[clamp(2.5rem,4.5vw,5.5rem)]` Bold (`font-bold`), `tracking-tight`, `leading-[1.05]`.
> - **Modul- & Bento-rubriker:** `text-[clamp(1.25rem,1.8vw,2.25rem)]` Bold (`font-bold`), `leading-snug`.
> - **Ingresser & Stora Brödtexter:** `text-[clamp(1.15rem,1.5vw,1.85rem)]` Regular (`font-normal`), `leading-relaxed`.
> - **Detalj- & UI-typografi:** `text-[clamp(0.8rem,0.9vw,1.05rem)]` Regular/Medium.

> [!IMPORTANT]
> **2. Aldrig Versaler (No ALL CAPS / Uppercase)**
> - Vi använder **aldrig** enbart versaler (`uppercase` / ALL CAPS) i några rubriker, etiketter, knappar, undermenyer eller brödtexter.
> - All text skrivs med naturlig versalisering (Sentence case eller Title case).

> [!IMPORTANT]
> **3. Inga Badges (No Biscuit / Pill Badges)**
> - Inga pill-formade dekorativa badges eller pulsing dots ovanför rubriker.
> - Håll layouten ren, redaktionell och fri från fluff.

> [!IMPORTANT]
> **4. Skärmärken (Authentic Print Crop Marks)**
> - Viktiga sektioner och moduler ramas in med `CropFrame` för den unika grafiska DTP-känslan.
> - **Placering i applikations-/verktygsvyer (t.ex. Briefd):** Enbart högst upp runt headern och längst ner runt footern för att hålla arbetsytan ren och funktionell.
> - **Tjocklek:** `0.5px` (subpixel hairline för skarp, hårfin teknisk rendering).
> - **Längd:** `12px` (optimerat för 4px-gridet).
> - **Mellanrum i hörn (Corner Gap):** `4px` (linjerna möts aldrig i hörnet utan lämnar ett 4px öppet mellanrum, precis som i professionell prepress/DTP).
> - **Färg:** `#000000` (ren svart som standard).

> [!IMPORTANT]
> **5. 4px Grid System (Base-4 Spacing & Sizing)**
> - Alla avstånd, marginaler, paddings, gap och komponentmått ska i regel vara jämnt delbara med 4 (t.ex. 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px osv.).
> - Håll layouten strikt linjerad mot 4px-basen för matematisk harmoni och precision.

> [!IMPORTANT]
> **6. Full Bredd (Edge-to-Edge Canvas)**
> - Utnyttja skärmens fulla bredd utan att begränsa till trånga containers, med balanserad marginal (`px-5 sm:px-[30px]`).

> [!IMPORTANT]
> **7. Ton i Ton (Tone-on-Tone Color System)**
> - Strikt färgdisciplin:
>   - **Petroleum & Cyan**: `#173537` parat med `#84CCEF`.
>   - **Plommon & Magenta**: `#520037` parat med `#FFADEB`.
>   - **Taupe/Brun & Gul**: `#7C705A` parat med `#FFFFA8` (WCAG AA godkänd kontrast: 4.64:1).
>   - **Grafit & Ljusgrå / Vit**: `#191A1C` parat med `#F5F5F5` / `#FFFFFF`.

> [!IMPORTANT]
> **8. Typsnittsdisciplin (100% Instrument Sans, inga monospace-typsnitt)**
> - Vi använder **enbart Instrument Sans** för all text, alla rubriker, måttangivelser, bildförhållanden och specifikationer.
> - Inga monospace-typsnitt (ingen `font-mono`) tillåts. All information ska kännas redaktionell, sammanhållen och sofistikerad.

> [!IMPORTANT]
> **9. Gyllene Snittet-skalan ($\Phi = 1.618$) på Briefd**
> - All typografi på Briefd styrs strikt av 5 matematiska proportioner:
>   - **78 px**: Hero Display (`text-[78px]`)
>   - **48 px**: Sektionsrubriker (`text-[48px]`)
>   - **30 px**: Formatkortens titlar, kundnamn & varumärke (`text-[30px]`)
>   - **18 px**: Mått, fältvärden, länkar, menyer & knappar (`text-[18px]`)
>   - **11 px**: Fältetiketter, formaträknare & metadata (`text-[11px]`)
