# MXEX

Ställ in din crosscykel: fjädring efter din vikt och dagens underlag, mappning för ditt märke och delning av inställningar med kompisar.

## Funktioner

- **Garage** – välj märke (direktsökning), årsmodell och modell. Gaffel- och stötdämpartyp fylls i automatiskt (spiral eller luft, KYB, Showa eller WP) och kan ändras om cykeln är ombyggd.
- **Fjädring**
  - Rekommenderade fjädrar i N/mm och kg/mm, eller lufttryck för luftgafflar, utifrån vikt, nivå och gren.
  - Klickinställningar för underlaget: sand, hårt, lera, sten, stora hopp. Visas som exakta klick om du anger standardläget från instruktionsboken.
  - Sag-kalkylator: målvärden per märke, och besked om du ska ändra förspänningen eller byta fjäder.
  - Gaffelhöjd i kronan och däcktryck.
  - Felsökning: "gaffeln bottnar", "bakänden sparkar", "styrskakningar" och fler.
- **Motor / mappning**
  - Visar vad just din modell och årsmodell kan ställas in med. Exempel: Yamaha Power Tuner (Wi-Fi), Honda motorlägen + HSTC, Kawasaki-kontakter och Rideology, Suzuki S-HAC och MX-Tuner, KTM-koncernens mappknapp + TC + quickshifter + Connectivity Unit.
  - Karteditor för bränsle och tändning med samma rutnät som tillverkarens app (4×4 för Yamaha Wi-Fi, 3×3 för GYTR). Fält för TC, launch, snabbinställning 1–7 med mera.
  - Delning via QR-kod, länk (`mxex://map?d=…`) eller `.mxex`-fil.
- **Logg**
  - Pass med bana, underlag, inställning och betyg.
  - Servicepåminnelser per motortimme.
  - Varvtidtagare.

All data sparas lokalt i telefonen. Det finns inget konto och ingen server.

## Begränsningar

- Appen skriver **inte** direkt till cykelns styrenhet. Tillverkarnas protokoll är slutna, och Yamahas kartfiler (`.yptsjsnz`) är krypterade. Du för därför över värdena för hand i tillverkarens app, vilket tar under en minut.
- Fjäder- och klickråden är riktvärden. Stäm av med en fjädringsverkstad innan du köper fjädrar.

## Använda

Öppna webbadressen (GitHub Pages) i mobilen. Installera den sedan som en app:

- **iPhone (Safari):** Dela → *Lägg till på hemskärmen*.
- **Android (Chrome):** meny ⋮ → *Installera app* eller *Lägg till på startskärmen*.

Appen fungerar offline ute på banan efter första besöket.

## Utveckla

```bash
npm install
npx expo start          # skanna QR-koden med Expo Go / dev build
npx expo export -p web  # webbversion i dist/
npm run typecheck
```

## Publicera

Varje push till `main` byggs och publiceras automatiskt på GitHub Pages via `.github/workflows/web.yml`. I repot: Settings → Pages → Source: **GitHub Actions**.

Lokalt: `npm run build:web && npm run serve`.
