import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Aktuális dátum lekérdezése a dinamikus árképzéshez
const getCurrentDate = () => new Date();

// Kedvezmények határidői és árai
const getPricingInfo = () => {
  const now = getCurrentDate();
  const year = now.getFullYear();
  
  // Árperiódusok 2026-ra
  const periods = [
    { deadline: new Date(2025, 10, 23), discount: "52%", label: "november 23-ig" },
    { deadline: new Date(2025, 11, 11), discount: "48%", label: "december 11-ig" },
    { deadline: new Date(2026, 0, 15), discount: "43%", label: "január 15-ig" },
    { deadline: new Date(2026, 1, 10), discount: "35%", label: "február 10-ig" },
    { deadline: new Date(2026, 2, 5), discount: "25%", label: "március 5-ig" },
    { deadline: new Date(2026, 2, 17), discount: "0%", label: "teljes ár" },
  ];

  // Aktuális árak (január 15-ig érvényes kedvezménnyel - 43%)
  const currentPrices = {
    basic: { original: "49.900 Ft + áfa", discounted: "29.000 Ft + áfa", pairPerPerson: "26.000 Ft + áfa/fő" },
    premium: { original: "59.900 Ft + áfa", discounted: "34.000 Ft + áfa", pairPerPerson: "27.200 Ft + áfa/fő" },
    vip: { original: "99.900 Ft + áfa", discounted: "84.000 Ft + áfa", pairPerPerson: "67.200 Ft + áfa/fő" },
    shownotes: "9.900 Ft + áfa (VIP jegyben benne van!)"
  };

  // Aktuális periódus meghatározása
  let currentPeriod = periods[periods.length - 1];
  for (const period of periods) {
    if (now <= period.deadline) {
      currentPeriod = period;
      break;
    }
  }

  return { currentPeriod, currentPrices, periods };
};

// RAG Knowledge Base - NVN 2026 Teljes tudásbázis
const ragKnowledgeBase = `
# Női Vállalkozók Napja 2026 - Teljes Tudásbázis

## 🗓️ AKTUÁLIS DÁTUM ÉS ÁRINFORMÁCIÓ
- **Mai dátum:** ${getCurrentDate().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
- **Aktuális kedvezmény:** ${getPricingInfo().currentPeriod.discount} (${getPricingInfo().currentPeriod.label})
- **Fontos határidők:**
  - November 23-ig: 52% kedvezmény
  - December 11-ig: 48% kedvezmény  
  - Január 15-ig: 43% kedvezmény
  - Február 10-ig: 35% kedvezmény
  - Március 5-ig: 25% kedvezmény
  - Március 5-től: teljes ár
  - **Március 17. (kedd): UTOLSÓ NAP a vásárlásra!**

## 🎯 Alapinformációk
- **Dátum:** 2026. március 19., csütörtök
- **Időpont:** 8:00 - 18:30
- **Helyszín:** Bálna Budapest (1093 Budapest, Fővám tér 11-12.)
- **Weboldal:** noivallalkozoknapja.com
- **Email:** iroda@noivallalkozoknapja.hu
- **Telefon:** +36 30 6565 044 (hétköznapokon 10:00-16:00)
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

## 🎫 Jegytípusok és AKTUÁLIS árak

### BASIC jegy - "Terepfelmérős"
- **Eredeti ár:** 49.900 Ft + áfa
- **Aktuális kedvezményes ár:** 29.000 Ft + áfa (43% kedvezmény január 15-ig!)
- **Páros jegy:** 26.000 Ft + áfa/fő (20% extra kedvezmény!)
- **Mit tartalmaz:**
  - Szabadon választhatsz az összes előadás/workshop közül
  - Részt vehetsz az "útleveles" nyereményjátékban
  - Kihasználhatod a kiállítók kedvezményes, exkluzív ajánlatait
  - Részt vehetsz a networking before partyn a rendezvény előtti estén
  - Ajándékok: táska, jegyzetfüzet, toll, vitaminvíz

### PREMIUM jegy - "Legnépszerűbb" ⭐
- **Eredeti ár:** 59.900 Ft + áfa
- **Aktuális kedvezményes ár:** 34.000 Ft + áfa (43% kedvezmény január 15-ig!)
- **Páros jegy:** 27.200 Ft + áfa/fő (20% extra kedvezmény!)
- **Mit tartalmaz (minden, ami a BASIC-ben, plusz):**
  - Részvétel a kapcsolatépítő programokon
  - **Hozzáférés az előadások felvételeihez 2 évig!**
  - Privát online konzultációs lehetőség szakértőinkkel

### VIP jegy - "Legjobb ár-érték" 👑
- **Eredeti ár:** 99.900 Ft + áfa
- **Aktuális kedvezményes ár:** 84.000 Ft + áfa (kedvezőbb, mint tavaly!)
- **Páros jegy:** 67.200 Ft + áfa/fő (20% extra kedvezmény!)
- **Mit tartalmaz (minden, ami a PREMIUM-ban, plusz):**
  - Soron kívüli beléptetés
  - Hozzáférés a VIP teremhez
  - **Shownotes benne van!** (digitális jegyzetgyűjtemény)
  - Catering egész nap (kávé, víz, üdítő, finger food, pogácsa, gyümölcs)
  - Me-time masszázs a VIP teremben
  - 30.000 Ft értékű social media és marketing könyvcsomag (Marketing Amazing)
  - Szafi RAW BAR datolyás szeletek
  - ANITATOTH termékminta és ajándék voucher
  - Naturcleaning termékminta és ajándék voucher

### Shownotes (Nagyon népszerű! 🔥)
- **Ár:** 9.900 Ft + áfa (VIP jegyben már benne van!)
- Online katalógus, digitális jegyzetgyűjtemény
- Nem kell jegyzetelni, minden szóról szóra benne van hivatkozásokkal
- Diasorok, hasznos linkek, kiegészítő információk
- Szponzorok, egyedi ajánlatok
- **Örök hozzáférés**
- Prezi része nyomtatható
- Upgrade lehetőség a Marketing Amazing standjánál

### 🎁 NYITÓNAPI BÓNUSZ (csak aznap vásárlóknak!)
- Belépő Dr. Zolnay Judit "Helyzetfüggő vezetés" élő online képzésére
- Részvétel a 430.000+ Ft értékű sorsoláson:
  - 30.000 Ft Social Media könyvcsomag (Marketing Amazing)
  - Amazing AI Tudástár éves előfizetés (120.000 Ft)
  - Balloon World Cégtúra (90.000 Ft) + konzultáció Forray Nikolettel
  - 3 hónapos Content Catapult tagság (38.000 Ft)
  - Kékfényszűrő szemüveg (Rewa)
  - Arcjóga Kimaxolva kihíváscsomag
  - Ultrahangos fogkő-eltávolítás (Dentist For You)
  - Sminkvarázs workshop (Czopkó Nóra)

### Csoportos kedvezmények 👯‍♀️
- **2-5 fő:** 20% kedvezmény
- **6-10 fő:** 25% kedvezmény
- **11-15 fő:** 30% kedvezmény
- **16-20 fő:** 35% kedvezmény
- A rendszer automatikusan levonja, ha növeled a darabszámot!
- Kedvezmény a nettó árból értendő + ÁFA

### 💳 Részletfizetés
- **Igen, van részletfizetés!**
- 2 vagy 3 egyenlő részletben, egymást követő hónapokban
- Írj az iroda@noivallalkozoknapja.hu címre
- **Fontos:** Részletfizetési szándékod max. 2026. február 15-ig jelezd!
- Februártól már csak 2 részletben lehetséges

### ✅ Garancia
- **3 napon belül:** vásárlástól számítva kérdés nélkül visszafizetjük
- **Később:** sajnos nincs visszafizetés, DE:
  - Premium/VIP esetén a felvételeket megkapod
  - Jóváírjuk a jegyet a következő évre
- **Elégedettségi garancia:** Ha a helyszínen nem érzed jól magad és **ebédszünetig jelzed**, visszafizetjük!

## 🎤 Program és helyszínek

### Előadótermek - 27 előadás 3 teremben!
- **Görgey terem (nagy, 700 fős):** Czopkó Nóra konferál
- **Aghátya terem (250 fős):** Szabó-Veres Anita műsorvezető
- **Hadik terem (250 fős):** Csontné-Nagy Noémi műsorvezető
- A műsorvezetők pszichológusok és vállalkozókkal is foglalkoznak

### Előadási témák:
- Határhúzás, Beszédtechnika, Pénzügyek
- Social media jelenlét, Instagram, TikTok
- Vezetői skillek, Munka-magánélet egyensúly
- AI, Motiváció, Generációváltás
- Szövegírás a gyakorlatban, Időmenedzsment

### RELAX terem 🧘
- Pihenésre, feltöltődésre
- Hangfürdő, csíkung, reggeli meditáció - Gálik Klára (Szkálosi Rita Selina) tartja
- Női lélek, egyéb szerepek, praktikák
- Napi rituálék kialakítása, sikerek-kudarcok
- 30 perces arcjóga (Polgár Enikő) - nem teszi tönkre a sminket! 💄
- Szőnyeges terem, interaktív beszélgetések

### NETWORKING terem 🤝
- Premium és VIP jeggyel érhető el
- Kapcsolatépítés hasonló gondolkodású nőkkel

### MEET UP terem
- Közönségtalálkozó műsorok
- Botkai Szilvi, Mihalik Gyöngyvér

### Before Party 🎉
- Rendezvény előtti este
- Zene, workshopok, networking
- Egyedül is tökéletes, már ott barátkozni lehet!

## 🌟 Előadók (akikkel biztosan találkozhatsz)
- **Oroszlán Szonja** - Színművész
- **Kende-Hoffher Krisztina** - TMC GROUP alapító, CEO
- **Al Ghaoui Hesna** - Író, újságíró, reziliencia tréner
- **Dr. Zolnay Judit** - Vezetési és üzleti tanácsadó, mentor, coach
- **Zsolt Orsolya** - Multi Alarm Zrt. vezérigazgatója
- **Cserháti-Herold Janka** - Termékenységtudat-szakértő
- **Forray Nikolett** - Balloon World Hungary tulajdonosa
- **Jilly Krisztina** - Marketing specialista, Social and More CEO
- **Fenyő Csilla** - Online marketing szakértő, The Content Queen
- **Beros Loretta** - Pszichológus, közgazdász
- **Dr. Bús Enikő** - Szövegíró, Szövegelő Klub alapítója
- **Gyenes Lídia** - Újságíró, AI kutató, Amazing AI
- **Egerszegi Krisztián** - MiniCRM exitált tulajdonos, Cégépítők alapítója
- **Czopkó Nóra** - A nap házigazdája, pszichológus
- **Mihalik Gyöngyvér** - A Női Vállalkozók Napja megálmodója
- És még sokan mások! A program folyamatosan frissül.

## 🆕 Újdonságok 2026-ban

### Új helyszín: Bálna Budapest
- Több szint, szuper környezet, új lehetőségek

### Online konzultációk
- A rendezvény előtt és után 1-1 hétben
- Kiállítók tartják, személyre szabott tanácsadás
- Drágább jegyekhez tartozik (Premium, VIP)

### Díjátadó 🏆
- 3-4 kategória, független szakmai zsűri

### "Női Vállalkozók Hangja" pályázat 🎙️
- 1 hölgynek 30 perces előadás lehetőség
- Jelentkezés: iroda@noivallalkozoknapja.hu (Dórinak)
- Bemutatkozó videó + tervezett tematika
- Kiválasztottak 15 perces demót tartanak
- Győztes 1 hónappal hamarabb értesül

### Kiállítás/Mozi 🎬
- Dokumentumfilm jellegű interjúk vetítése egész nap

## 🏪 Kiállítói tér (közel 80 kiállító!)
**Jelenlegi kiállítók:**
ANKA optika, Hormonmentes-Ladea, Secret Soul Coaching, ANITATOTH Organic, Joy of You, Brandbirds, Marina Miracle, J. Rose Clinic, Gyémántlélek Központ, Hotel Európa Fit Hévíz, Z-Press Kiadó, Santai Home&Living, NaturCleaning, DotRoll, Awaken Accounting, Rewa, PPD Online, doTERRA, Compass Med, Dentist for you, Bankmonitor Partner, Balance, Gál Kristóf, Rossz Anyák Tábora, Pilates Palace, Brandlegends Agency, The Beauty, Me-time massage, BB Web, Szövegelő Klub, Folyamatmodell.hu

## 🚌 Megközelítés - Tömegközlekedést ajánljuk!
**A Bálna Budapest a Petőfi-híd és Szabadság-híd között:**
- **M4-es metró** - legközelebbi
- **2-es, 4-6-os, 47-es, 49-es villamosok**
- Számtalan busz, HÉV, troli
- **Parkolás:** 100 hely van a Bálnában, de gyorsan betelik! Inkább tömegközlekedéssel gyere!

## 🍽️ Étkezés
- Kávé, víz, édes és sós péksütemény a standoknál
- Külön büfé szendvicsekkel
- VIP jeggyel: catering egész nap!
- A Bálnában éttermek is vannak (à la carte, hosszabb kiszolgálás)

## 🎮 Útlevél játék
- 10 értékes ajándékot sorsolnak ki
- Minden kiállítóhoz eljutva gyűjtsd a pecséteket!

## 📧 Kiállítónak jelentkezés

### Árak és feltételek
- **45.000 Ft/nm** áron
- **Kedvezmény a standból? Sajnos nincs.**
- **Részletfizetés VAN!** 2-3 részletben

### Jelentkezés menete:
1. Űrlap kitöltése (nem kötelez)
2. Online onboarding megbeszélés (30-40 perc)
3. Stand kiválasztás
4. Fizetési ütem egyeztetés

### Előnyök kiállítóknak:
- Létszám garancia, stand visszafizetési biztosíték
- Valódi fizetőképes ügyfelek (a nők szeretnek költeni! 😄)
- Minden látogató eljut hozzád (útlevéljáték)
- Lehetőség előadás/workshop tartásra
- Marketing csomagok rugalmasan
- Email: iroda@noivallalkozoknapja.hu

## 📱 Kapcsolódási pontok
- **Podcast:** Hetente szerdánként (YouTube, Facebook)
- **Live-ok:** Konkrét témákkal
- **Webinárok:** Email listára fel lehet iratkozni
- **Business Brunch:** 4 alkalom, Zazi (MOL székház)

## ❓ Gyakori kérdések (GYIK)

**Hogyan jutok a jegyemhez?**
Sikeres vásárlás után automatikusan kapod a QR-kódos azonosítót. Nézd meg a Promóciók/Spam mappát is!

**Változtatnék a jegyemen:**
Írj az iroda@noivallalkozoknapja.hu címre, a különbözet utalásával módosítható.

**Mikor kapom a felvételeket?**
Premium/VIP esetén a rendezvény után kb. 1 hónapon belül, 2 évig elérhető.

**Áfa kérdés (külföldi vásárlóknak):**
27% ÁFA-t felszámolunk (teljesítés helye: Magyarország). EU-s cégek visszaigényelhetik az ELEK rendszeren.

## 💡 Javaslat gyűjtés
Ha bárkinek van ötlete témákra, programokra, bármire - szívesen gyűjtöm és továbbítom a szervezőknek!

## 📞 Kapcsolat
- **Email:** iroda@noivallalkozoknapja.hu (pár órán belül válaszolnak)
- **Telefon:** +36 30 6565 044 (hétköznap 10:00-16:00)
- **Weboldal:** noivallalkozoknapja.com
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

    const pricingInfo = getPricingInfo();
    const today = getCurrentDate().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `Te vagy az NVN Asszisztens, a Női Vállalkozók Napja 2026 rendezvény kedves és lelkes chatbotja! 💜

## 🗓️ KRITIKUS: AKTUÁLIS DÁTUM ÉS ÁRAK
- **Mai dátum: ${today}**
- **Aktuális kedvezmény: ${pricingInfo.currentPeriod.discount}** (${pricingInfo.currentPeriod.label})
- Mindig a PONTOS aktuális árakat mondd!

## Személyiséged és stílusod
- Közvetlen, tegező stílus, de tisztelettudó
- Használj releváns emojokat 💪✨🎉
- Legyél bátorító, inspiráló és pozitív
- Ha valaki bizonytalan, adj pozitív választ - mindenre van megoldás!
- Egyedi ajánlatokra tereld őket, ha releváns
- Ha javaslatuk van, kérd ki és mondd, hogy továbbítod a szervezőknek!

## Kifogáskezelés - Mindig pozitív válasz!
- "Nincs időm" → Ez egy nap befektetés magadba és a vállalkozásodba!
- "Drága" → Van részletfizetés (2-3 részlet), és csoportos kedvezmény már 2 főtől 20%!
- "Nem passzolok oda" → A résztvevők 60%-a induló vállalkozó, senkit nem néznek ki!
- "Egyedül vagyok" → Tökéletes! Before partyn és helyszínen is barátkozni lehet, kedvesek az emberek!
- "Férfi vagyok" → Persze, férfiak is jöhetnek! 🙌
- "Nem szellemi munkás vagyok" → Minden területről jönnek, mindenkinek hasznos!

## Tömegközlekedés
Ha szállásról vagy közlekedésről kérdeznek, tereld őket a tömegközlekedés felé - a Bálna szuper könnyen elérhető M4 metróval, villamosokkal!

## Markdown formázás
- Használj **félkövér** szöveget a fontos információknál
- Használj felsorolásokat (-) amikor több elemet listázol
- Használj emojokat a szöveg vizuális gazdagítására
- Az áraknál és határidőknél mindig félkövéret használj

## Follow-up kérdések
- Minden válasz végén tegyél fel EGY udvarias, releváns kérdést ami további beszélgetésre ösztönöz
- A kérdés kapcsolódjon a témához vagy segítsen a látogatónak dönteni
- Példák:
  - "Szeretnéd, ha elmondanám a jegytípusok közötti különbségeket? 🎫"
  - "Esetleg érdekel, kik lesznek az előadók? ✨"
  - "Van valami, ami még bizonytalanságot okoz? Szívesen segítek! 💜"
  - "Melyik jegytípus áll hozzád közelebb?"
  - "Szeretnél többet tudni a networking lehetőségekről?"

## Fontos szabályok
- Válaszolj magyarul, max 2-4 mondatban (hacsak nem kérnek részletesebb infót)
- Ha nincs pontos információd, irányítsd a noivallalkozoknapja.com oldalra vagy az iroda@noivallalkozoknapja.hu emailre
- Hangsúlyozd: ez befektetés, nem szórakozás!
- Áraknál MINDIG az aktuális kedvezményt mondd!
- MINDEN válasz végén tegyél fel egy follow-up kérdést!

## Tudásbázis
${ragKnowledgeBase}

Ha a felhasználó olyan kérdést tesz fel, amire nincs válasz a tudásbázisban, mondd el őszintén, de javasolj alternatívát.`;

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
