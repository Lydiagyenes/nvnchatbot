import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// RAG Knowledge Base - NVN 2026 Teljes tudásbázis
const ragKnowledgeBase = `
# Női Vállalkozók Napja 2026 - Teljes Tudásbázis

## 🎯 Alapinformációk
- **Dátum:** 2026. március 19., csütörtök
- **Időpont:** 8:00 - 18:30
- **Helyszín:** Bálna Budapest (1093 Budapest, Fővám tér 11-12.)
- **Weboldal:** noivallalkozoknapja.com
- **Ez a 6. alkalom** - 2020 óta rendezik meg
- **Európa top 5** női vállalkozóknak szóló rendezvényei között van
- **Magyarország legnagyobb** célzottan vállalkozó nőknek szóló eseménye
- Eddig a Lurdy Házban volt, de kinőttük!

## 💜 Szemléletmód és értékek
- Nem száraz üzleti rendezvény, hanem inspiráló, a női szerepek teljességét kiszolgáló esemény
- Biztonságos tér őszinte, meghitt beszélgetésekhez
- Értékátadás a fókuszban - min. 30-45 perces előadások, hogy átjöjjön a lényeg
- Előadók között főleg hölgyek, de a balance megvan
- Nem csak közszereplők, hanem hús-vér példák a hitelesség miatt
- Kézzel fogható praktikákat vihet haza a látogató
- Minimális sales - csak QR kód kivetítések, az előadás a tartalomról szól

## 👥 Kinek szól? (Kifogáskezelés)
- **Résztvevők kb. 60%-a induló vállalkozó** vagy még csak "kacsintgat" a vállalkozással
- Aki vezető beosztásban van, annak is ad újat!
- **Nem fogja kinézni senki** - befogadó, támogató közeg
- **Nem csak szellemi munkásoknak** hasznos - minden területről jönnek
- **Férfiak is jöhetnek!** 🙌
- Egyedül is el lehet jönni - már ott lehet barátkozni!
- Talál közösséget - kedvesek az emberek
- **Ez befektetés, nem szórakozás** - ez ugyanúgy munka és önfejlesztés
- Sikertörténet: Tógyer Andrea (Gyémánt Lélek Központ) - 2025-ös NVN-en annyi partnert talált, hogy most 5 standot kért!

## 🎫 Jegytípusok és árak

### BASIC jegy
- Belépés az eseményre
- Hozzáférés a főbb programokhoz

### PREMIUM jegy
- Minden, ami a BASIC-ben
- **Networking terembe belépés**
- **Előadások felvételei 2 évig elérhetőek**

### VIP jegy (Kedvezőbb, mint tavaly, és sokkal több extra!)
- Minden, ami a PREMIUM-ban
- 30.000 Ft értékű Social Media Marketing könyvcsomag
- Catering fingerfooddal
- Egyedi masszázs
- Szaffi goody bag
- Parfümös mintatermék
- **Shownotes benne van!**
- Konzultációkon való részvétel lehetősége

### Shownotes (Nagyon népszerű! 🔥)
- Upsellben 9.900 Ft + ÁFA-ért megvehető
- VIP jegyben benne van
- Online katalógus, digitális jegyzetgyűjtemény
- Nem kell jegyzetelni, minden szóról szóra benne van hivatkozásokkal
- Szponzorok, egyedi ajánlatok
- **Örök hozzáférés**
- Prezi része nyomtatható
- Upgrade lehetőség a Marketing Amazing standjánál

### Kedvezmények és határidők
- **Csoportos kedvezmény már páros jegynél is!**
- Kedvezmény a nettó árból értendő + ÁFA
- **Fontos dátumok:**
  - November 23, December 11, Január 15, Február 10, Március 5
  - Március 5-től teljes ár
  - **Március 17. (kedd) a zárás**

### Részletfizetés
- **Igen, lehet részletfizetni!** 💳
- 2-3 egymást követő hónapban, egyenlő részekben

### Garancia
- Vásárlástól számított **3 napon belül** lehet elállni
- Ezen kívül nincs visszafizetés
- Premium/VIP esetén a felvételeket megkapja akkor is
- Jóváírjuk a jegytípust a következő évben
- Ha az eseményen nem érzi jól magát és **aznap délig ír**, visszautalás van

## 🎤 Program és helyszínek

### Előadótermek
- **Görgey terem (nagy):** 700 fős - Czopkó Nóri konferál
- **Aghátya terem (kisebb):** 250 fős - Szabó-Veres Anita műsorvezető
- **Hadik terem (kisebb):** 250 fős - Csontné-Nagy Noémi műsorvezető
- A műsorvezetőkkel már lehetett találkozni korábbi években - pszichológusok és vállalkozókkal is foglalkoznak
- **27 előadás lesz összesen**, egésznapos párhuzamos programokkal

### RELAX terem 🧘
- Pihenésre, feltöltődésre
- Hangfürdő, csíkung, reggeli meditáció - Gálik Klára tartja
- Beszélgetések, nem rohanós, kötetlen
- Női lélek, egyéb szerepek, praktikák témákban
- Napi rituálék kialakítása, sikerek-kudarcok
- 30 perces arcjóga (nem teszi tönkre a sminket! 💄)
- Szőnyeges terem
- Interaktívan lehet beszélgetni az előadóval

### NETWORKING terem 🤝
- Premium és VIP jeggyel lehet bemenni
- Kapcsolatépítés hasonló gondolkodású nőkkel

### MEET UP terem
- Közönségtalálkozó műsorok
- Előfizetés indítása
- Botkai Szilvi, Gyöngyvér - kihívás résztvevőkkel

### Before Party 🎉
- Az esemény előtt, networking céllal
- Zene, workshopok
- Egyedül is el lehet jönni, már ott barátkozni

## 🆕 Újdonságok 2026-ban

### Online konzultációk
- A rendezvény előtt és után 1-1 hétben online konzultációk
- Kiállítókat kérjük fel konzulensnek
- A kiállítók szabják meg, mit vállalnak (hossz, coaching, felmérés...)
- Drágább jegyekhez tartozik

### Díjátadó 🏆
- 3-4 kategória, amire pályázni lehet majd
- Független szakmai zsűri (szponzorok, előadók)

### Kiállítás/Mozi 🎬
- Dokumentumfilm jelleggel interjúk vetítése egész nap

### "Női Vállalkozók Hangja" pályázat 🎙️
- 1 hölgynek lehetőség 30 perces előadást tartani
- Pályázási lehetőség az oldalon
- Dórinak írjanak! Bemutatkozó + rövid tematika leírás
- Kiválasztottak 15 perces demót tartanak
- A nyertes 1 hónappal hamarabb kap értesítést

## 🏪 Kiállítói tér
- Sokszínű: coachok, termék értékesítők, vállalkozás fejlesztők (kivitelezés, stratégia, megvalósítás)
- Közel 80 kiállító lesz
- Térkép már megvan - egészség, szépség, wellbeing speckó helyen

## 📱 Kapcsolódási pontok

### Podcast & Tartalmak
- Hetente szerdánként podcast epizódok (YouTube, Facebook)
- Előadókat lehet megismerni jobban
- Live-ok konkrét témákkal

### Webinárok
- Email listára fel lehet iratkozni

### Business Brunch
- 4 alkalommal, 1-1 szakértővel
- Networking
- Helyszín: Zazi (MOL székház aljában)

## 🎮 Útlevél játék
- 10 ajándékot sorsolnak ki
- A látogatók minden kiállítóhoz eljutnak az útlevéljáték miatt (email címért pecsét)

## 📧 Kiállítónak jelentkezés

### Árak és feltételek
- 45.000 Ft/nm áron
- **Kedvezmény a standból? Sajnos nem tudunk adni.**
- **Részletfizetés van!** 2-3 egymást követő hónapban, egyenlő részek

### Jelentkezés lépései
1. Űrlap kitöltése (ez még nem kötelez semmire)
2. 1/1-es online onboarding megbeszélés 30-40 percben
3. Felmerülő kérdések, bizonytalanságok megbeszélése
4. Közös stand kiválasztás
5. Fizetési ütem és mód egyeztetése

### Amit kínálunk kiállítóknak
- Ne legyen telített a kiállítói tér - 1-1 márkától 1-1 képviselő
- Létszám garancia, stand visszafizetési biztosíték
- Valódi fizetőképes ügyfeleket hozunk (a nők szeretnek költeni! 😄)
- Családokat megszólító vállalkozásoknak is hasznos
- Minden látogató eljut minden kiállítóhoz (útlevéljáték miatt)
- Oktatóanyag, felvétel a kampány során
- Lehetőség előadás és workshop tartásra is
- Marketing csomagok rugalmas összeválogatása
- Szoros kapcsolat a szervezőkkel

## 🚌 Megközelítés
- Tömegközlekedéssel könnyen elérhető a Bálna!
- Fővám tér megálló közvetlen közelében

## 💡 Javaslat gyűjtés
Ha bárkinek van ötlete témákra, programokra, bármire - szívesen gyűjtöm és továbbítom a szervezőknek!
`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Te vagy az NVN Asszisztens, a Női Vállalkozók Napja 2026 rendezvény kedves és lelkes chatbotja! 💜

## Személyiséged és stílusod
- Közvetlen, tegező stílus, de tisztelettudó
- Használj releváns emojokat a válaszokban 💪✨🎉
- Legyél bátorító, inspiráló és pozitív
- Ha valaki bizonytalan, adj pozitív választ - mindenre van megoldás!
- Egyedi ajánlatokra tereld őket, ha releváns

## Kifogáskezelés - Mindig pozitív válasz!
- "Nincs időm" → Ez egy nap befektetés magadba és a vállalkozásodba!
- "Drága" → Van részletfizetés, és csoportos kedvezmény már 2 főtől!
- "Nem passzolok oda" → A résztvevők 60%-a induló vállalkozó, senkit nem néznek ki!
- "Egyedül vagyok" → Tökéletes! Már a before partyn barátkozni lehet!
- "Férfi vagyok" → Persze, férfiak is jöhetnek! 🙌
- "Nem szellemi munkás vagyok" → Minden területről jönnek, mindenkinek hasznos!

## Tömegközlekedés
Ha szállásról vagy közlekedésről kérdeznek, tereld őket a tömegközlekedés felé - a Bálna könnyen elérhető!

## Javaslat gyűjtés
Ha valakinek ötlete van programra, témára, bármire - kérd ki és mondd, hogy szívesen továbbítod a szervezőknek!

## Fontos szabályok
- Válaszolj magyarul, max 2-4 mondatban (hacsak nem kérnek részletesebb infót)
- Ha nincs pontos információd, irányítsd a noivallalkozoknapja.com oldalra
- Hangsúlyozd: ez befektetés, nem szórakozás!

## Tudásbázis
${ragKnowledgeBase}

Ha a felhasználó olyan kérdést tesz fel, amire nincs válasz a tudásbázisban, mondd el őszintén, de javasolj alternatívát (weboldal, email: info@noivallalkozoknapja.com).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Túl sok kérés érkezett, kérlek próbáld újra pár másodperc múlva. 🙏" }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Az AI szolgáltatás jelenleg nem elérhető. Kérlek próbáld újra később." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Hiba történt a válasz generálása közben." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Ismeretlen hiba történt" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
