import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Engedélyezett origin-ek listája
const allowedOrigins = [
  "https://nvnchatbot.lovable.app",
  "https://id-preview--0d7158c3-38de-47cd-9192-87cae002c497.lovable.app",
  "https://noivallalkozoknapja.com",
  "https://www.noivallalkozoknapja.com",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Dinamikus CORS header-ek az origin alapján
const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.some(allowed => 
    origin === allowed || 
    origin.endsWith(".lovable.app") || 
    origin.endsWith(".lovableproject.com")
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Supabase client for logging
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Aktuális dátum lekérdezése a dinamikus árképzéshez
const getCurrentDate = () => new Date();

// Kedvezmények határidői és árai
const getPricingInfo = () => {
  const now = getCurrentDate();
  const year = now.getFullYear();
  
  // Árperiódusok 2026-ra (frissítve a weboldalról 2026.01.27-én)
  const periods = [
    { deadline: new Date(2025, 10, 23), discount: "52%", label: "november 23-ig" },
    { deadline: new Date(2025, 11, 11), discount: "48%", label: "december 11-ig" },
    { deadline: new Date(2026, 0, 15), discount: "43%", label: "január 15-ig" },
    { deadline: new Date(2026, 1, 17), discount: "34%", label: "február 17-ig" },
    { deadline: new Date(2026, 2, 17), discount: "0%", label: "teljes ár" },
  ];

  // Aktuális árak (február 17-ig érvényes kedvezménnyel - 34% - frissítve weboldalról)
  const currentPrices = {
    basic: { original: "49.900 Ft + áfa", discounted: "34.000 Ft + áfa", pairPerPerson: "27.200 Ft + áfa/fő" },
    premium: { original: "59.900 Ft + áfa", discounted: "39.000 Ft + áfa", pairPerPerson: "31.200 Ft + áfa/fő" },
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
  - Február 17-ig: 34% kedvezmény
  - Február 17-től: teljes ár
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
- **Aktuális kedvezményes ár:** 34.000 Ft + áfa (34% kedvezmény február 17-ig!)
- **Páros jegy:** 27.200 Ft + áfa/fő (20% extra kedvezmény!)
- **Mit tartalmaz:**
  - Szabadon választhatsz az összes előadás/workshop közül
  - Részt vehetsz az "útleveles" nyereményjátékban
  - Kihasználhatod a kiállítók kedvezményes, exkluzív ajánlatait
  - Részt vehetsz a networking before partyn a rendezvény előtti estén
  - Ajándékok: táska, jegyzetfüzet, toll, frissítő

### PREMIUM jegy - "Legnépszerűbb" ⭐
- **Eredeti ár:** 59.900 Ft + áfa
- **Aktuális kedvezményes ár:** 39.000 Ft + áfa (34% kedvezmény február 17-ig!)
- **Páros jegy:** 31.200 Ft + áfa/fő (20% extra kedvezmény!)
- **Mit tartalmaz (minden, ami a BASIC-ben, plusz):**
  - Részvétel a kapcsolatépítő programokon
  - **Hozzáférés az előadások felvételeihez a rendezvény után!**
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
- **Fontos:** Aki utólag vásárolja meg, utólag kapja kézhez

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

## 🗺️ HELYSZÍN TÉRKÉP (I. Emelet)
- **Térkép URL:** https://nvnchatbot.lovable.app/images/terkep-i-emelet.png
- A térkép az I. emeleti elrendezést mutatja a következő területekkel:
  - **Görgei előadó terem** (bal oldal, nagy terem)
  - **Networking terem** (felső sor, bal)
  - **VIP terem** (felső sor, középbal)
  - **Well-Being Lounge** (felső sor, közép)
  - **Relax terem** (felső sor, középjobb)
  - **Aggházy előadó terem** (felső sor, jobb)
  - **Kiállítói tér** (központi nagy terület)
  - **Meetup terem** (alsó sor, közép)
  - **Lounge** (alsó sor, középjobb)
  - **Hadik előadó terem** (alsó sor, jobb)
  - **Előadói backstage** (alsó sor, bal)
  - **Ruhatár** (bal oldal, lent)
  - **Reading Lounge** (bal felső sarok)
  - **Mosdók** (jelölve a térképen ikonokkal)
- Ha a felhasználó helyszínről, teremről, elrendezésről, térképről, vagy "hol van" típusú kérdést tesz fel, MINDIG oszd meg a térkép linket markdown kép formátumban: ![I. Emelet térkép](https://nvnchatbot.lovable.app/images/terkep-i-emelet.png)

## 🎤 Program és helyszínek

### Előadótermek
- **Görgey terem (500 fő):** Czopkó Nóra konferál - fő előadások
- **Hadik terem (250 fő):** Kisebb, fókuszált előadások
- **Aggházy terem (250 fő):** Kisebb, fókuszált előadások
- **Hősök terem - MeetUp terem:** Közönségtalálkozók, kisebb workshopok (pl. Kassai Eszter, Mihalik Gyöngyvér, esetleg Szabados Ági)
- **Pálffy terem - Networking terem:** Egész napos vezetett networking a **Juhhé** csapatával (Prémium és VIP jegyeseknek)
- **Kinizsi terem - Relax:** Meditáció, arcjóga, hangfürdő, lelki programok

### 🚻 Mosdók a Bálnában
A Bálna több szintjén is rendelkezésre állnak mosdók, hogy elkerüljük a torlódást:

**Földszint:**
- Központosított, nagy kapacitású mosdók (6-8 fülke)
- A liftek és mozgólépcsők közelében találhatóak

**1. emelet (Fő helyszín):**
- Központi mosdók: A liftek és a teherlift mellett (6-8 fülke)
- Kiállítói tér: Kisebb, egyedi női és férfi mosdó
- A nagy létszámra való tekintettel ezeket a rendezvény alatt vegyesen (unisex) is igénybe lehet venni

**2. emelet:**
- Bár itt nincs programunk, a szinten található mosdók a vendégeink számára szabadon használhatóak
- Érdemes ide is felnézni, ha a többi szinten sorban állás van

**Tájékozódás a mosdókhoz:**
- Irányítótáblák: Minden szinten jól látható táblák jelzik a mosdók irányát
- Személyzet: A hostess lányok és a szervező csapat tagjai készséggel segítenek
- Mozgólépcsővel és lifttel gyorsan lehet közlekedni a szintek között

**Várakozási idő:**
- Egy ekkora monumentális épületben a mosdók elhelyezkedése fix (mint konferenciaközpontokban vagy stadionokban)
- A 2. emeleti mosdók általában kevésbé zsúfoltak, mint az első emeletiek
- A földszinti mosdók is gyakran gyorsabb alternatívát jelentenek
- Köszönjük a türelmet, a ház összes elérhető kapacitását biztosítjuk!

## 📅 RÉSZLETES NAPI PROGRAM (2026. március 19.)

### 08:15 - 08:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Kinizsi terem - Relax | Gálik Klára | Napindító meditáció - Reggeli ráhangolódás és meditáció |

### 09:00 - 09:15
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Minden terem | Szervezők | Megnyitó - Hivatalos megnyitó (nem kommunikált) |

### 09:15 - 10:00
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Máté Krisztina | Nyitó gondolatok - Bevezető előadás, célkitűzések |
| Hadik terem (250 fő) | Zolnay Judit | Célkitűzés, célok mérése, ambíciózus gondolkodás |
| Aggházy terem (250 fő) | Gál Kristóf | Üzleti stratégia, skálázódás - kisvállalkozói szemmel |

### 11:15 - 12:30
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hősök terem - MeetUp | Kassai Eszter | Flydentity találkozó - Közösségi találkozó |

### 09:15 - 09:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Kinizsi terem - Relax | Yurkov és Balázs | Lelkizős beszélgetés - Könnyed, mégis mély beszélgetés |

### 10:00 - 10:30
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Weiser | Előadás (TBA) - Egyeztetés alatt |
| Hadik terem (250 fő) | Forray Nikolett | Pénzügyi stabilitás és nyereségnövelés - Pénzügyi tervezés vállalkozóknak |
| Aggházy terem (250 fő) | Dr. Bús Enikő | A márkád esszenciája egy mondatban - A tökéletes bemutatkozás technikája |
| Kinizsi terem - Relax | Cserháti-Herold Janka + Aisha | Anyaság téma - Beszélgetés az anyaság és vállalkozás egyensúlyáról |

### 11:15 - 12:00
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Samsung / OTP (Szponzor) | Kerekasztal beszélgetés - Technológiai és pénzügyi megoldások |
| Hadik terem (250 fő) | Szabados Ági | Hobbiból lett szenvedély vállalkozás - Út a hobbitól a sikeres vállalkozásig |

### 11:15 - 12:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hősök terem - MeetUp | Csont Attila | ISVL találkozó - NE MOZGASSUK A GYEREKEK MIATT - Közösségi program |

### 11:15 - 11:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Kinizsi terem - Relax | Polgár Enikő | Arcjóga - Frissítő arcjóga gyakorlatok |

### 12:00 - 12:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Al Ghaoui Hesna | Félj bátran! - A félelem kezelése és hajtóerővé alakítása |
| Hadik terem (250 fő) | Kifli HR (Szponzor) | HR megoldások - Szponzori előadás |
| Aggházy terem (250 fő) | Mihalik Gyöngyvér | Projekt tervezés, megvalósítás, káoszból struktúra - Hatékonyság és szervezettség |

### 12:15 - 12:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Kinizsi terem - Relax | - | Apró női rituálék a mindennapokra - Mitől lesz több energia és béke a napban? |

### 13:00 - 13:30
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Kinizsi terem - Relax | Karacs Ildikó | Hangfürdő - Relaxáció hangtálakkal |

### 13:30 - 14:00
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Kinizsi terem - Relax | Szkálosi Rita | Csikung - Mozgásmeditáció |

### 13:45 - 14:15
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Szervezők | Díjátadó - Ünnepélyes díjátadó ceremónia |

### 14:15 - 14:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Jilly Krisztina | TikTok stratégiák - Hogyan használd a TikTok-ot üzleti célokra |
| Hadik terem (250 fő) | Egerszegi Krisztián + Zsolt Orsolya | Cégépítés emberi alapokon - Egy 10 milliárdos cég élén szerzett tapasztalatok |
| Aggházy terem (250 fő) | Mészáros Robi | Könyvírás - Tippek és tapasztalatok könyvíráshoz |

### 14:15 - 15:00
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hősök terem - MeetUp | Szabados Ági | Közönségtalálkozó / Mini Workshop *(egyeztetés alatt, véglegesítés folyamatban)* |

### Délután (pontos idő egyeztetés alatt)
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hősök terem - MeetUp | Mihalik Gyöngyvér | Közönségtalálkozó - Délutáni interaktív találkozó |

### 14:45 - 15:15
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Halmi Bence és Halmi Bajnok | AI + Short form videók - A bevételnövekedés leggyorsabb útja 2026-ban |
| Aggházy terem (250 fő) | Pszichosztori (Loretta) | Határhúzás, toxikus környezet legyűrése - Pszichológiai tanácsok vállalkozóknak |

### 15:00 - 15:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hősök terem - MeetUp | Szabó Ági | Virtuális asszisztensek? - Hogyan segíthet egy VA a vállalkozásodban |

### 15:15 - 15:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Gyenes Lídia | AI Trendek - Aktuális mesterséges intelligencia trendek, jövőbeli képességek |
| Hadik terem (250 fő) | Bíró Orsolya | Csapatépítés és delegálás - A osztályú munkatársak megtalálása és vezetése |
| Aggházy terem (250 fő) | Bíró Nóri | A sales nem ciki - Hogyan add el magad és a szolgáltatásod természetesen? |
| Kinizsi terem - Relax | Kalamár Hajnalka & Dorogi-Kabarcz Rebeka | Őszinte kör: sikerek és sebek - Biztonságos tér megosztásokhoz |

### 15:30 - 16:15
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Kinizsi terem - Relax | Cserháti-Herold Janka + Aisha | Anyaság téma - Beszélgetés (folytatás) |

### 16:30 - 17:15
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Kende-Hoffher Krisztina (KHK) | Időbeosztás hatékonyan vállalkozóként is - Time management tippek |

### 16:30 - 18:00
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hősök terem - MeetUp | Andrássy Bettina | Pszichológus, családállító - még kérdőjeles program |

### 16:30 - 16:45
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hadik terem | Szervezők | Nyeremény sorsolás - Az esemény zárása és sorsolás |

### 16:45 - 17:15
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Hadik terem | Szervezők | Jelentkezőknek fenntartott előadás - Kiválasztásos alapú program |

### 17:15 - 18:00 (ZÁRÓ BLOKK)
| Terem | Előadó | Előadás címe |
|-------|--------|--------------|
| Görgey terem (500 fő) | Oroszlán Szonja | Bátorság az újrakezdésre - Inspirációs előadás |
| Hadik terem (250 fő) | Fuller Bianka | Az a hang, ami visszatart - Hogyan győzd le a belső önbizalomgyilkost? |
| Aggházy terem (250 fő) | Fenyő Csilla | Miért nem hoz új ügyfeleket az Instagramod? - 3 poszttípus, ami hiányzik a stratégiádból |

## 🎤 RÉSZLETES ELŐADÓI ADATBÁZIS

### Dr. Zolnay Judit
- **Titulus:** Vezetési és üzleti tanácsadó, mentor, executive business coach
- **Előadás:** Célkitűzés, célok mérése, ambíciózus gondolkodás
- **Téma:** Stratégiai célkitűzés és mérés vállalkozóknak. Hogyan gondolkodjunk ambiciózusan és valósítsuk meg a terveinket.

### Kiss-Kocsis Ágnes
- **Titulus:** Európa szakértő, tréner, mester coach
- **Előadás:** Stresszmentesen = sikeresen
- **Téma:** Stresszoldó mini technikák vállalkozóknak. Stresszkezelés vállalkozó nőként, munka és házasság egyensúlya.

### Fenyő Csilla
- **Titulus:** Online marketing szakértő, The Content Queen alapítója
- **Előadás:** Miért nem hoz új ügyfeleket az Instagramod?
- **Téma:** 3 poszttípus, ami hiányzik a stratégiádból. Az Instagramos ügyfélszerzés nem a mennyiségen, hanem a tartalomtípuson múlik. Szakértői márka építés és vásárlószerzés.

### Dr. Bús Enikő
- **Titulus:** Szövegíró, a Szövegelő Klub alapítója
- **Előadás:** A márkád esszenciája egy mondatban – a tökéletes bemutatkozás technikája
- **Téma:** A 'one-liner' technika elsajátítása. Hogyan alkosd meg azt az egy mondatot, amitől networking eseményen odafordulnak hozzád.

### Oroszlán Szonja
- **Titulus:** Színművész, Masterson Method® Ló Fizióterapeuta
- **Előadás:** Élet több felvonásban - A váltás bátorsága
- **Téma:** Interjú jellegű beszélgetés az újrakezdésről, karrierváltásról és a bátorságról.

### Beros Loretta (Pszichosztori)
- **Titulus:** Pszichológus, közgazdász
- **Előadás:** Határhúzás női vállalkozóként: amikor a kedvesség már nem stratégia
- **Téma:** Miért nehezebb nőként határt húzni (megfelelési kényszer, bűntudat). Tipikus helyzetek: ingyenmunka, túlzott rugalmasság. Gyakorlati eszközök: empatikus nemet mondás. A határhúzás mint az önbecsülés védelme.

### Al Ghaoui Hesna
- **Titulus:** Író, újságíró, reziliencia tréner
- **Előadás:** Félj bátran!
- **Téma:** A félelem kezelése, reziliencia és lelki ellenállóképesség fejlesztése vállalkozóknak.

### Gál Kristóf
- **Titulus:** Vállalkozófejlesztő
- **Előadás:** Ezért nem nő nagyobbra a vállalkozásod
- **Téma:** A vállalkozói elakadások valódi okainak feltárása. Miért nem tud egy szint fölé lépni a cég? A megfelelő 'kezelés' alkalmazása.

### Cserháti-Herold Janka és Jansik Cynthia Aisha
- **Titulus:** Termékenységtudat-szakértő (Janka) és Anyafalva alapító (Aisha)
- **Előadás:** Sikeres nő, vállalkozó anya a társadalomban
- **Téma:** Beszélgetés az anyaságról és vállalkozásról. Hogyan lehet lavírozni a szerepek között? Merjünk belevágni kisgyerek mellett is.

### Polgár Enikő
- **Titulus:** Nemzetközi arcjóga oktató
- **Előadás:** 30 perc a Fiatalarcért
- **Téma:** Interaktív arcjóga workshop a Relax teremben. Természetes módszerek az arc fiatalítására.

### Gyenes Lídia
- **Titulus:** Újságíró, AI kutató
- **Előadás:** AI automatizmusok a vállalkozásunkban
- **Téma:** CustomGPT-k, AI asszisztensek és make.com automatizációk bemutatása. Hogyan növelhető a hatékonyság látványosan.

### Mihalik Gyöngyvér
- **Titulus:** A Női Vállalkozók Napja alapítója és főszervezője, projektmenedzsment szakértő
- **Előadás:** Káoszból struktúra
- **Téma:** Projekttervezés és stratégiák a fókuszáltságért. Hogyan teremtsünk rendet a vállalkozói káoszban.
- **Megjegyzés:** Délután a **Hősök terem (MeetUp)** -ben közönségtalálkozót is tart!
- **Kutyája:** Archie 🐕

### Jilly Krisztina
- **Titulus:** Marketing specialista
- **Előadás:** TikTok Masters - A sikeres tiktok fiók receptje
- **Téma:** Hogyan építs sikeres csatornát TikTok-on? Tippek, trükkök és stratégia.

### Mészáros Róbert
- **Titulus:** Író, kiadó
- **Előadás:** Könyvírás és szerzői márkaépítés
- **Téma:** Hogyan írjunk könyvet, hogyan segíti ez a vállalkozást és a szakértői státuszt.

### Forray Nikolett
- **Titulus:** Pénzügyi szakértő
- **Előadás:** Pénzügyi stabilitás és nyereségnövelés
- **Téma:** Tedd rendbe a céges pénzügyeidet! 8 pillér/eszköz a tisztánlátáshoz és a pénzügyi sikerhez.

### Kende-Hoffher Krisztina
- **Titulus:** Producer, kommunikációs szakember
- **Előadás:** Időbeosztás hatékonyan vállalkozóként is
- **Téma:** Hogyan osszuk be az időnket, hogy ne érezzük az állandó csúszást? Hatékony időmenedzsment, hogy 'legyen több, mint 24 óra egy napban'.

### Karacs Ildikó
- **Titulus:** Hangterapeuta és spirituális mentor
- **Előadás:** Hangfürdő
- **Téma:** Különleges hangterápiás élmény kristálytálakkal, gongokkal. Stresszoldás, blokkok oldása fizikai és érzelmi szinten.

### Kalamár Hajnalka és Dorogi-Kabarcz Rebeka
- **Titulus:** Klinikai szakpszichológus és Mentál tréner
- **Előadás:** Őszinte kör: sikerek és sebek
- **Téma:** Mély beszélgetés a vállalkozói lét lelki oldaláról, sikerekről és kudarcokról.

### Egerszegi Krisztián
- **Titulus:** MiniCRM exitált tulajdonosa, Cégépítők alapító
- **Előadás:** Cégépítés emberi alapokon - Rendszerek
- **Téma:** Vállalkozásépítés rendszerszemlélettel. Hogyan építsünk olyan céget, ami nélkülünk is működik? Folyamatok, delegálás, automatizálás.

### Zsolt Orsolya
- **Titulus:** Multi Alarm Zrt. vezérigazgatója
- **Előadás:** Női vezetői lét és rendszerépítés
- **Téma:** Beszélgetés a rendszerek fontosságáról és a női vezetői lét lelki oldaláról egy milliárdos cég élén.

### Szkálosi Rita
- **Titulus:** Csikung oktató és holisztikus mentor
- **Előadás:** Csikung
- **Téma:** A test és lélek harmonizálása mozgással. Stressz elengedése, életenergia (Qi) áramoltatása.

### Gálik Klára
- **Titulus:** Meditációs oktató
- **Előadás:** Napindító meditáció
- **Téma:** Reggeli ráhangolódás a napra.

### Kovács Orsolya (Yurkov) és Dr. Kékesi Balázs
- **Titulus:** Stílustanácsadó és Filozófus
- **Előadás:** Miben vagy? - Az Enstylement szemlélete
- **Téma:** Önalkotás stílussal. Hogyan hat az öltözékünk a lelki állapotunkra és fordítva?

### Fuller Bianka
- **Titulus:** Pszichológus és pszichoedukátor
- **Előadás:** Az a hang, ami visszatart: hogyan győzd le a belső önbizalomgyilkost?
- **Téma:** Imposztor szindróma, vállalkozói önbizalomhiány kezelése.

### Halmi Bence & Halmi Bajnok
- **Titulus:** Brand Legends alapítók, AI & Kreatív vezetők
- **Előadás:** AI + Short form videók = a leggyorsabb növekedés
- **Téma:** Hogyan használd a mesterséges intelligenciát és a rövid videókat a bevételed növelésére 2026-ban.

### Bíró Orsolya
- **Titulus:** Folyamatmodell.hu alapítója
- **Előadás:** Csapatépítés és delegálás - A osztályú munkatársak
- **Téma:** Hogyan találjunk kiváló munkatársakat és hogyan delegáljunk hatékonyan. Folyamat- és rendszerszemlélet.

### Szabados Ági
- **Titulus:** Tulajdonos, Libertine Könyvesboltok és Könyvkiadó
- **Előadás:** Hobbiból lett szenvedély - közösség- és vállalkozásépítés
- **Téma:** Hogyan épült fel a NIOK és a Libertine márka az olvasás szeretetéből. Közösségépítés, több lábon állás.
- **Megjegyzés:** A délutáni közönségtalálkozó/mini workshop még egyeztetés alatt áll. Egész nap megtalálható a **Libertine standjánál** a **Reading Lounge** területén.

## 🔍 ELŐADÓK TÉMA SZERINT (gyors kereséshez)
- **Stressz, kiégés, lelki egyensúly:** Kiss-Kocsis Ágnes, Karacs Ildikó, Szkálosi Rita, Gálik Klára
- **Önbizalom, imposztor szindróma:** Fuller Bianka, Al Ghaoui Hesna
- **Határhúzás, nemet mondás:** Beros Loretta (Pszichosztori)
- **Delegálás, csapatépítés:** Bíró Orsolya, Egerszegi Krisztián
- **Pénzügyek:** Forray Nikolett
- **Instagram, social media:** Fenyő Csilla
- **TikTok, videók:** Jilly Krisztina, Halmi Bence & Halmi Bajnok
- **AI, automatizálás:** Gyenes Lídia, Halmi Bence & Halmi Bajnok
- **Időmenedzsment:** Kende-Hoffher Krisztina
- **Projekt tervezés, struktúra:** Mihalik Gyöngyvér
- **Célkitűzés, stratégia:** Dr. Zolnay Judit, Gál Kristóf
- **Bemutatkozás, networking:** Dr. Bús Enikő
- **Anyaság és vállalkozás:** Cserháti-Herold Janka, Jansik Cynthia Aisha
- **Újrakezdés, bátorság:** Oroszlán Szonja

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

### Részletes kiállítói lista (Stand számmal):

| Stand | Kiállító | Tevékenység | Weboldal |
|-------|----------|-------------|----------|
| S1, S2, S5, S6, B8 | **Gyémántlélek Kft. (Tógyer Andrea)** | Oktatás, Fitline, doTERRA, Fohow terápia, egészségmagatartás fejlesztés | gyemantlelek.com |
| S3 | **Pilates Palace (LETICIARENT Kft.)** | Pilates stúdió és mozgásforma | - |
| 1 | **Marina Miracle (Beszteri-Bányai Barbara)** | MarinaMiracle termékcsalád, kozmetika | marinamiracle.hu |
| 2 | **Awaken Accounting Balance Kft. (Kállai Orsolya)** | Holisztikus orvoslás, családállítás | - |
| 3 | **Naturcleaning (Cudy Future Kft.)** | Természetes alapú tisztítószerek | naturcleaning.hu |
| 4 | **Chogan (Monzinger Zsófia)** | Parfümök, kozmetikai és sminktermékek, étrendkiegészítők | jovodillata.com |
| 5 | **Joy Of You Kft. (Forgó Krisztina)** | doTERRA és Aromatouch masszázs | facebook.com/essentialsforjoy |
| 9 | **Dentist For You Kft.** | Fogorvosi rendelő | dentistforyou.hu |
| 11 | **J. Rose Clinic (Rózsa Judit)** | BEMER terápia, holisztikus egészség, tanácsadás | jrose.hu |
| 13 | **Operidom Kft.** | Ingatlan, hitelszakértés, jogi tanácsadás | ridom.hu |
| 14 | **InvenQ Insight Innovációs Nonprofit Kft. (Bíró Orsolya)** | Szervezetfejlesztés, coaching, tréningek, tanácsadás | folyamatmodell.hu |
| 17 | **Madej Éva** | Ékszerek készítése | - |
| 18 | **Anita Toth Products Kft.** | Kozmetikumok, parfümolajok | anitatoth.com |
| 19 | **LaDea / Hormonmentes (Home Kreatíva Kft.)** | Szexwellness oldal | ladea.hu |
| 20 | **DotRoll Kft.** | Domain regisztráció, tárhely szolgáltatás, weboldal készítés KKV-knak | dotroll.com |
| 21 | **The Beauty (Tárnoki Edina)** | Natúrkozmetikumok, workshopok | the-beauty.hu |
| 24 | **Soulwave Business Kft. (Perneczky Andrea)** | Szervezetfejlesztés, üzleti növekedés stratégia és tudatosság alapokon | andreaperneczky.com |
| 28 | **Szövegelő Klub (BB Kreatív Kft.)** | Szövegírás és marketing oktatás, weboldal és webáruház készítés | szovegeloklub.hu |
| B29 | **BALANCE Adó- és Ügyviteli Szolgáltató Kft.** | Könyvelőiroda KKV-knak | balancekft.hu |
| 30 | **Kassai Eszter (Marketinginnovator S.r.o.)** | Coaching | kassaieszter.hu |
| 31 | **Gál Kristóf (LAKSHMI NAMAHA Zrt.)** | Vállalkozó fejlesztés, marketing | klikkmarketing.hu |
| B46 | **PPD Online Kft. (Polák Péter)** | Webfejlesztés, online marketing, Integralshop (ERP rendszer) | ppdonline.hu |
| 47 | **Rewa / Benke Flóra** | Vegán, fenntartható, lebomló hátizsákok. Weboldal és webshop építés (FlorartWebdesign) | rewa.hu |
| 50 | **Rossz Anyák tábora (Laczkó Kevin E.V.)** | Tematikus felnőtt női táborok | rosszanyaktabora.hu |
| 51 | **Z-PRESS Kiadó Kft.** | Könyvkiadó, önfejlesztés | z-press.hu |
| 101 | **BrandsLegend (Brand Legends Kft.)** | AI és TikTok szakértők, edukáció | - |
| 103 | **ANKA Optika (MyT Group Kft.)** | Szemészet, optika | ankaoptika.hu |

### Kiállítók kategória szerint:
- **Egészség & Wellness:** Gyémántlélek, Pilates Palace, J. Rose Clinic, Dentist For You, Joy Of You (doTERRA)
- **Kozmetika & Szépség:** Marina Miracle, Anita Toth Products, Chogan, The Beauty, LaDea
- **Üzleti szolgáltatások:** DotRoll, PPD Online, Szövegelő Klub, Balance könyvelőiroda, Gál Kristóf, Soulwave Business, InvenQ Insight
- **Coaching & Fejlesztés:** Kassai Eszter, BrandsLegend
- **Életmód:** Rossz Anyák tábora, Rewa (fenntartható táskák), Madej Éva (ékszerek)
- **Kiadó:** Z-Press Kiadó
- **Ingatlan & Pénzügyek:** Operidom, Awaken Accounting
- **Optika:** ANKA Optika

**Megjegyzés:** Tógyer Andrea (Gyémántlélek) 5 standot foglalt - ő 2025-ben annyi partnert talált az NVN-en, hogy idén ennyire bővített!

## 🚌 Megközelítés

### 🚌 Közlekedés & Logisztika
**Alapvetés:** A helyszín tömegközlekedéssel zseniálisan megközelíthető több irányból is. Az autóval érkezőknek a korlátozott parkolás nem akadály, hanem lehetőség a környezettudatosságra és az új ismeretségekre!

### Tömegközlekedés (A legbiztosabb opció! ⭐)
A Bálna Budapest tömegközlekedéssel kiválóan megközelíthető - ez a leggyorsabb és legstresszmentesebb módja az érkezésnek:
- **Villamos:** A 2-es, 2B és 23-as villamosok (Zsil utca vagy Fővám tér megálló) szinte a bejáratnál állnak meg
- **Metró:** Az M4-es metró Fővám téri megállója mindössze pár perc séta
- **Busz:** A 15-ös és 115-ös buszok is a közelben állnak meg
- Ha egy távolabbi parkolóházban hagyod az autód, ezekkel a járatokkal pillanatok alatt beérsz a helyszínre

### 🚗 Parkolás és autóval érkezés
A Bálna Budapest környékén a parkolási lehetőségek korlátozottak, ezért tervezz előre! Az alábbi részletes útmutatóban összegyűjtöttük a legjobb opciókat.

---

## 🅿️ KÖZVETLEN KÖZELBEN (1-2 km)

### Bálna Budapest mélygarázs (Fővám tér 11-12.)
- **Kapacitás:** Korlátozott (~100 hely)
- **Nyitvatartás:** 0-24
- **Díjak:** Első óra **INGYENES**, utána **450 Ft/óra**
- **Napi maximum:** ~8 órányi díj (~3.600 Ft), utána nem számolnak fel többet
- ⚠️ **Előzetes foglalás NEM lehetséges** - érkezési sorrendben!
- **Tipp:** A kapacitás korlátozott, érdemes korán érkezni vagy alternatívát választani

### Csarnok téri parkoló (Nagyvásárcsarnok mögött)
- **Helyszín:** Felszíni, sorompós parkoló a Vámház körútról nyíló Csarnok téren
- **Távolság:** Pár perc séta a Bálnától
- **Kapacitás:** Korlátozott (néhány tucat hely)
- **Díjak:** Hétköznap napközben ~**600 Ft/óra** (Ferencváros A-díjzóna)
- **Ingyenes:** Este 20:00 után és hétvégén
- ⚠️ Nagy rendezvény idején gyorsan megtelhet!

### Páva Ház Parkolóház (Mester utca 30-32.)
- **Helyszín:** Studium Irodaház/Páva Ház mélygarázsa
- **Kapacitás:** ~300 férőhely
- **Nyitvatartás:** 0-24
- **Díjak:** ~**600 Ft/óra**, hosszú tartózkodásra napi jegy ~**6.000 Ft/nap**
- **Távolság:** ~1 km a Bálnától (Petőfi híd pesti hídfő)
- **Megközelítés:** Gyalog vagy 4-6 villamossal (Boráros tér megálló)

### Corvin Plaza Parkolóház (Futó utca 52.)
- **Helyszín:** Corvin negyed mélygarázs
- **Kapacitás:** **800+ férőhely** ⭐
- **Nyitvatartás:** 0-24
- **Behajtás:** Futó utca vagy Vajdahunyad utca felől
- **Díjak:** Első 2 óra együtt **400 Ft**, minden további óra **400 Ft**
- **Egész napos parkolás:** ~10-12 óra = kb. **4.000–4.800 Ft**
- **Távolság:** ~1,5 km a Bálnától
- **Megközelítés:** 4-6-os villamossal (Corvin-negyedtől Boráros térig) ~5 perc

### Lurdy Ház parkoló (Könyves Kálmán krt. 12-14.)
- **Kapacitás:** Nagy! Felszíni + mélygarázs összesen ~**1.300 férőhely** ⭐
- **Díjak felszínen:** Első 2 óra **INGYENES**, utána **300 Ft/óra**
- **Díjak mélygarázs:** **450 Ft/óra**
- **Egész napos felszíni parkolás:** ~8-10 óra = kb. **1.800–2.400 Ft** 💰
- **Távolság:** ~2 km délkeletre
- **Megközelítés:** 2-es villamossal (Haller utcától Zsil utcáig) vagy H7 HÉV-vel (Közvágóhídtól Boráros térig) ~10 perc

---

## 🌉 BUDA OLDALI LEHETŐSÉGEK (Lágymányos környéke)

### Kopaszi-gát / BudaPart szabadtéri parkoló ⭐ AJÁNLOTT
- **Helyszín:** Kopaszi-gát bejáratánál, nagy murvás felszíni parkoló
- **Nyitvatartás:** Napközben 06:00-tól, télen 22:00-ig, nyáron 02:00-ig
- **Fizetés:** Csak bankkártyával vagy mobilappal (helyszíni automata)
- **Díjak:** Első 30 perc **INGYENES**, utána sávosan növekvő tarifa
- **Napi maximum:** 5+ óra = max. **~2.200 Ft** 💰
- **Előny:** Hétvégén is nyitva, nagy kapacitás, olcsó!
- **Megközelítés Bálnához:** ~20 perc tömegközlekedéssel
  - 1-es villamossal Közvágóhídig, onnan 2-es villamos, VAGY
  - 154-es, 33-as busszal Újbuda-központig, onnan M4 metróval a Fővám térre

### BudaPart mélygarázsok (Gate, City, Downtown)
- **Helyszín:** BudaPart városnegyed, Dombóvári útnál
- **Nyitvatartás:** Mind 0-24
- **Fizetés:** Csak bankkártyával vagy mobilappal

| Parkolóház | Cím | Kapacitás | Óradíj |
|------------|-----|-----------|--------|
| **Gate** | Dombóvári út 27. | ~101 hely | 470 Ft |
| **City** | Dombóvári út 26. | ~100 hely | 350 Ft |
| **Downtown** | Dombóvári út 25. | ~100 hely | 350 Ft |

- **10 órás parkolás City/Downtown:** ~**3.500 Ft**
- **Megközelítés:** Busz/villamos vagy H7 HÉV (Lágymányosi hídfő → Boráros tér) ~20 perc

---

## 🚙 TÁVOLABBI NAGY KAPACITÁSÚ PARKOLÓK (3-6 km)

### WestEnd City Parkoló (Ferdinánd híd mellett) ⭐ TOP VÁLASZTÁS
- **Helyszín:** Nyugati pályaudvarnál, WestEnd mögötti **szabadtéri** parkoló
- **Nyitvatartás:** 0-24 (non-stop)
- **Kapacitás:** Nagy, általában mindig van hely!
- **Díjak:** 
  - 12 órára: **2.500 Ft** 💰
  - 24 órára: **4.000 Ft**
- **Megközelítés:** 4-6-os villamossal Nyugati tértől Boráros térig ~**15 perc**, onnan 5 perc séta
- **Megjegyzés:** A fedett mélygarázs 600 Ft/óra, de hosszú időre a szabadtéri **sokkal olcsóbb**!

### Arena Mall parkolóháza (Kerepesi út 9.) ⭐ LEGJOBB ÁR-ÉRTÉK
- **Helyszín:** Keleti pályaudvar mellett
- **Kapacitás:** **~2.800 férőhely** - szinte biztosan van hely!
- **Nyitvatartás:** Behajtás 5:00–24:00, kihajtás 0-24
- **Díjak:**
  - Első óra: **INGYENES**
  - 2. óra: **200 Ft**
  - Minden további óra: **300 Ft**
  - **~8 óra parkolás = kb. 2.000 Ft** 💰💰
- **Megközelítés:** M4 metróval Keleti → Fővám tér = **3 megálló, 8 perc!** ⭐
- **Különösen ajánlott:** Ha a belvárosi parkolók telítettek!

### Allee Bevásárlóközpont mélygarázs (Október huszonharmadika u. 8-10.)
- **Kapacitás:** ~1.400 férőhely
- **Díjak:** Egységesen **450 Ft/óra** minden nap
- **~10 óra parkolás:** ~4.500 Ft
- **Megközelítés:** 47-es vagy 49-es villamossal Móricz Zs. körtérről → Fővám tér ~10-12 perc
- **Megjegyzés:** Ingyenes parkolás nincs, de ha máshol nem találsz helyet, jó alternatíva

---

## 💡 PARKOLÁSI TIPPEK

**Legjobb ár-érték arány:**
1. 🥇 **Arena Mall** - 8 óra ~2.000 Ft + M4 metró 8 perc
2. 🥈 **Lurdy Ház felszíni** - 8 óra ~1.800 Ft + villamos/HÉV 10 perc
3. 🥉 **Kopaszi-gát** - egész nap max ~2.200 Ft + tömegközlekedés 20 perc
4. **WestEnd szabadtéri** - 12 óra 2.500 Ft + 4-6 villamos 15 perc

**Fontos tudnivalók:**
- Mindegyik parkoló alkalmas **8+ órás** tartózkodásra
- Nincs 3 órás közterületi korlátozás, mint az utcán
- Érdemes **korán érkezni** a közvetlen környékre (Bálna, Csarnok tér)
- Ha biztosra akarsz menni: **Arena Mall** vagy **WestEnd** - nagy kapacitás, kedvező árak

### 🚙 Telekocsi (Oszkár együttműködés)
Szeretnénk, ha már az ideút is a kapcsolatépítésről szólna! Az Oszkár Telekocsival közös megoldást kínálunk:
**Cél:** Spórolj az üzemanyagon, óvd a környezetet és építs kapcsolatokat már az úton!

**Egyedi Landing Oldal:**
- **oszkar.com/noivallalkozoknapja** – Az eseménynek saját aloldala van az Oszkáron
- Kifejezetten a rendezvényre tartó sofőröket és utasokat találjátok meg
- Használd a **@noivallalkozok** címkét (ékezet nélkül!) a kereséshez/hirdetéshez

**"Női sofőr" opció:** 🙋‍♀️
- A keresőben és a hirdetés feladásakor is beállítható
- Hölgyek csak hölgy utasokat fogadhatnak/kereshetnek
- Az utazás garantáltan komfortos és jó hangulatú lesz

**Keresőbox:**
- A weboldalunkon/chatbotunkban is elérhető lesz egy beépített kereső (Oszkár kereső box)
- Azonnal csekkolhatjátok a szabad helyeket

**Parkolási "Challenge" megoldása:** 🚗💡
- "Bár a helyszínen a parkolóhelyek száma limitált, mi ezt lehetőségnek fogjuk fel!"
- Csatlakozz a Facebook csoporthoz vagy használd az Oszkárt, hogy összeálljatok más résztvevőkkel
- Így nemcsak a parkolás lesz egyszerűbb, de már a rendezvény előtt barátokra lelhetsz!

**Networking az úton:**
- Ha többen érkeztek egy autóval, megosztoztok a költségeken és a parkolási nehézségeken
- Már a rendezvény előtt megismerhetsz más szakembereket

**Hogyan csatlakozz?**
- Akár sofőrként (hogy megoszd a költségeid), akár utasként érkezel
- Figyeld a hírleveleinket a direkt linkért és a speciális címkékért!

## 🍽️ Étkezés & Gasztronómia
Többféle megoldással készülünk, a kínálat folyamatosan bővül!

### Helyszíni lehetőségek
**Kóstoltató partnerek:**
- A kiállítói térben több partnerünk is készül **egészséges falatkákkal és különleges finomságokkal**
- Napközben folyamatosan falatozhatsz különlegességeket
- 📢 **A kóstoltató partnerek listája még bővülhet** – érdemes követni a híreket, mert újabb partnerek csatlakozhatnak!
- **Gluténmentes / vegán opciók:** A **Szafi** termékei mindenképp elérhetők lesznek – gluténmentes és vegán alternatívák!
- **Kávés partnereknél** alternatív, **növényi tej** is elérhető lesz (pl. zab-, mandula-, kókusztej)
- **Fontos:** A Gyémántlélek Kft. (Tógyer Andrea) szimpla kiállító – náluk NEM lesznek mentes vagy egyéb falatkák

**Helyszíni catering/büfé:**
- Tervezetten lesz **fizetős büfé** is, ahol szendvicseket, üdítőket és egyéb frissítőket vásárolhatsz a szünetekben
- De ne aggódj: ha ez mégsem valósulna meg, akkor sem maradsz étel-ital nélkül – a kóstoltatók, kávépartnerek és a Bálna éttermei is rendelkezésedre állnak! 🙌
- **Minden részletről e-mailes tájékoztatást is küldünk!**

**VIP jeggyel:**
- Catering egész nap! (kávé, víz, üdítő, finger food, pogácsa, gyümölcs)

### 🍴 Bálna Éttermek (Földszint)
Közvetlenül az épületben több étterem is található:
- **Rombusz étterem:** **20% kedvezmény** karszalag felmutatásával a rendezvény ideje alatt 🎫
- **Esetleg Bisztró:** **20% kedvezmény** karszalag felmutatásával a rendezvény ideje alatt 🎫
- **BOHO:** **10% kedvezmény** karszalag felmutatásával a rendezvény ideje alatt 🎫
- **Nem kell kuponkód, a karszalagod a kulcs!**
- Részletek és előfoglalás hamarosan!
- Vannak à la carte éttermek is, ha egyénileg választanál
- **Figyelem:** az éttermi kiszolgálás hosszabb lehet a nagy létszám miatt

### Sétatávolságra (Fővám tér és környéke)
Pár perc sétára számos opciót találsz:
- Amber's French Bakery
- Burger King
- Vásárcsarnok környéki kifőzdék

### 💡 Szervezői tipp
Mivel nagy létszámú eseményről van szó, a várakozási idő elkerülése érdekében javasoljuk:
- Készíts be egy kis útravaló szendvicset vagy snacket a táskádba
- Így biztosan nem maradsz éhes a két előadás között!

## 🐾 Kisállatok
- **A Bálna Budapest állatbarát helyszín**, de az esemény volumene és az embertömeg miatt **NEM JAVASOLJUK, hogy kiskedvencekkel érkezzenek** a látogatók
- A rendezvényen várhatóan 2000+ ember lesz, ez stresszes lehet az állatoknak
- Kérjük, hagyjátok otthon a szőrös családtagokat! 💜

## 🎮 Útlevél játék
- 10 értékes ajándékot sorsolnak ki
- Minden kiállítóhoz eljutva gyűjtsd a pecséteket!

## 📧 KIÁLLÍTÓNAK JELENTKEZÉS - RÉSZLETES INFORMÁCIÓK

### Miért érdemes kiállítónak jönni?
- **2.000-2.500 fős célközönség** - többségében 25-45 év közötti női vállalkozók
- **LÉTSZÁM GARANCIA:** Legalább 1.500 résztvevő garantáltan - ha kevesebb lenne, a kiállítói díj arányos részét visszautalják!
- 45 perces szünetek az előadások között - bőven van idő a standokat végigjárni
- Útlevéljáték ösztönzi a látogatókat minden stand meglátogatására
- Ez a 6. alkalom - már kinőtték a Lurdy Házat, ezért 2026-ban a Bálna Budapest ad otthont!

### 🏷️ KIÁLLÍTÓI CSOMAGOK ÉS ÁRAK (2025. augusztus 31-ig érvényes árak!)

| Méret | Stand ára | Max létszám | Tiszteletjegy |
|-------|-----------|-------------|---------------|
| **6 nm** | **360.000 Ft + áfa** | 2 fő (+1 plusz fő: 9.900 Ft) | 1 db |
| **8 nm** | **480.000 Ft + áfa** | 3 fő | 2 db |
| **12 nm** | **720.000 Ft + áfa** | 4 fő | 4 db |

**Minden csomagban benne van:**
- WiFi a kiállítóknak
- Áram és víz kiépítése
- Kiállítói Útmutató (videós oktatóanyag) - tippek a sikeres standhoz!
- BASIC marketing csomag (logó a weboldalon, kiállítói aloldal megjelenés, útlevéljáték részvétel)

### 📢 MARKETING KIEGÉSZÍTŐ CSOMAGOK

| Csomag | Ár | Elérhető |
|--------|-----|----------|
| **BASIC** | Ingyenes (minden kiállítónak) | Korlátlan |
| **PRO** | **199.000 Ft + áfa** | Max 15 kiállítónak |
| **VIP** | **499.000 Ft + áfa** | Max 3 kiállítónak |

**PRO csomag extrák:** Kivetítőn promó videó, galéria típusú poszt (Instagram/Facebook), e-mail kommunikáció több kiállítóról, Shownotes-ban logó
**VIP csomag extrák:** Mindez + dedikált social media poszt, podcast felvétel, dedikált e-mail a 15.000+ fős listára, Shownotes banner, RollUp elhelyezés VIP és Networking teremben

### 📺 EXTRA LEHETŐSÉGEK (külön vásárolható)

| Lehetőség | Ár | Elérhetőség |
|-----------|-----|-------------|
| **Útlevél játék részvétel** | 10.000 Ft + áfa | Minden kiállítónak |
| **Előadás kis teremben** (max 300 fő) | 300.000 Ft + áfa | Limitált, kiválasztásos |
| **Előadás nagy teremben** (max 700 fő) | 600.000 Ft + áfa | Limitált, kiválasztásos |
| **SMS promó üzenet ebédszünetben** | 800.000 Ft + áfa | 1 kiállítónak |

### 🆕 2026-os ÚJDONSÁGOK kiállítóknak
- **Online konzultációk:** A rendezvény előtti és utáni 1 hétben is tarthatnak konzultációt a kiállítók - így több időpont és mélyebb kapcsolat!
- **Well-being sarok:** Új szekció szépség, egészség, nőiesség témájú kiállítóknak
- **Kiállítói Útmutató videó:** Segít az ajánlat összeállításában, stand felépítésében, hatékony értékesítésben

### 📋 JELENTKEZÉS MENETE
1. **Űrlap kitöltése:** marketingamazing.typeform.com/2026kiallitok (nem kötelez semmire!)
2. **Online onboarding meeting:** 30 perces videohívás a részletek átbeszélésére
3. **Stand kiválasztás:** Szerződés és fizetés után, érkezési sorrendben
4. **Stand építés:** Rendezvény előtti nap 12-16h között, vagy aznap 6:00-7:30 között

### ⏱️ FONTOS IDŐPONTOK kiállítóknak
- **Kiállítói tér nyitása:** 08:00
- **Kiállítói tér zárása:** 18:30
- **Aktív látogatási idő:** Összesen kb. 4,5 óra a szünetekben + előadások közben is sokan jönnek!
- **Bontás:** 18:30 után

### 💰 RÉSZLETFIZETÉS
- Igen, van részletfizetés! 2-3 egyenlő részletben
- Írj az iroda@noivallalkozoknapja.hu címre

### 🤝 KIEMELT ÉS FŐTÁMOGATÓ LEHETŐSÉGEK
- **2 kiemelt támogatói hely** és **1 főtámogatói hely** elérhető
- Egyedi reklámhelyek, erős marketing támogatás a kampány során
- Érdeklődj: iroda@noivallalkozoknapja.hu

### ✅ Már csatlakozott kiállítók 2026-ra
ANKA Optika, Hormonmentes/LaDea, Secret Soul Coaching, Kassai Eszter, ANITATOTH Organic, Joy of You, Brandbirds, Marina Miracle, J. Rose Clinic, Gyémántlélek Központ (5 standdal!), Hotel Európa Fit Hévíz, Z-Press Kiadó, Santai, NaturCleaning, DotRoll, Awaken Accounting, Rewa, PPD Online, doTERRA, Compass Med, Dentist for You, Bankmonitor, Balance Könyvelő, Gál Kristóf, Rossz Anyák Tábora, Pilates Palace, Brandlegends, The Beauty, Me-time Massage, BB Web, Szövegelő Klub, Folyamatmodell.hu

**Fontos:** A helyek 30%-át már a hivatalos nyitás előtt lefoglalták!

## 📱 Kapcsolódási pontok
- **Podcast:** Hetente szerdánként (YouTube, Facebook)
- **Live-ok:** Konkrét témákkal
- **Webinárok:** Email listára fel lehet iratkozni
- **Business Brunch:** 4 alkalom, Zazi (MOL székház)

## 👥 Facebook Csoport – Csatlakozz a közösséghez!

**Miért érdemes csatlakozni?**
- **Networking:** Ismerkedj meg a többi résztvevővel már az esemény előtt!
- **Praktikus infók:** Első kézből kapsz tájékoztatást a kényelmi funkciókról, partnerekről és kóstoltatókról
- **Live videók:** A szervezők élő bejelentkezésekben mutatják be a helyszínt (mosdók, terek, megközelítés)
- **Közösség:** Itt találhatsz útitársat vagy szakmai partnereket
- **Tájékozódás:** A csoportban videós bejárást is találsz majd, hogy otthonosan mozogj az épületben

**Link:** https://www.facebook.com/groups/1599872214379876/

## 🎟️ Érkezés és Regisztráció

A regisztráció gyors és egyszerű, az alábbiak szerint készülj:

**QR-kód:**
- A regisztrációs pultnál az e-mailben kapott QR-kódot kell bemutatnod
- Elegendő telefonon megmutatni, nem szükséges kinyomtatni!

**Regisztrációs pultok:**
- Külön sor várja a **VIP vendégeket** (soron kívüli beléptetés!)
- 4 külön pult a Basic, Prémium és Staff jegyeseknek

**Időrend:**
- **Kapunyitástól 08:40-ig:** A kiállítói térben tudsz ismerkedni, networkingelni
- **Reggeli meditáció:** A Relax teremben részt vehetsz a Napindító meditáción (08:15-08:45)
- **Előadótermek nyitása:** 08:40-08:45 között

**Késői érkezés:**
- Ha nem érsz oda reggelre, ne aggódj!
- A regisztráció **egész nap üzemel**, bármikor bekapcsolódhatsz a programba

## 🧥 Ruhatár és Gardrób

A helyszínen biztosítunk ruhatárat, de a Bálna adottságai miatt a kapacitás korlátozott:
- **Maximum 800 kabát** fér el

**Tippek:**
- Aki autóval (mélygarázsban vagy közelben) érkezik, javasoljuk, hogy a nagyobb kabátokat hagyja a kocsiban a gyorsabb haladás érdekében

**Kiállítóknak:**
- A saját standotoknál is elhelyezhetitek a dolgaitokat

**Előadóknak:**
- Számotokra külön backstage biztosított a kabátok és csomagok tárolására

## ♿ Akadálymentesítés és Speciális igények

**Akadálymentesítés:**
- A Bálna **teljes mértékben akadálymentes**
- A mélygarázstól személyliftek indulnak
- Az első emeleten nincsenek lépcsők vagy szinteltolások
- Kerekesszékkel is kényelmesen bejárható a teljes terület

**Gyermekfelügyelet:**
- ⚠️ A rendezvényen **gyermekfelügyelet NEM biztosított**
- Kérjük, erről egyénileg gondoskodjatok

## 🎉 Networking Before Party (Március 18.)

A fő esemény előestéjén, **2026. március 18-án (szerda) 18:00 és 23:00 között** tartunk egy exkluzív Before Partyt!

**Helyszín:** **Up Hotel**

**Program:**
- A pontos program még szervezés alatt áll – részletekről e-mailben tájékoztatunk!

**Részvétel:**
- **Minden jegytípussal** lehet regisztrálni!
- A helyszín befogadóképessége limitált (**max. 300 fő**)
- **Február végén** e-mailben kérdőívet küldünk, azt kitöltve tudsz jelentkezni

**Előregisztráció előnye:** 🎁
- Itt már átveheted a másnapi karszalagodat is
- A főnap reggelén **sorban állás nélkül, soron kívül** juthatsz be a Bálnába!

## 💼 Online Konzultációk (Prémium és VIP jegyeseknek)

A Prémium és VIP jegyesek számára idén **online formában** biztosítjuk a 30 perces, díjmentes szakmai konzultációkat a kiállítóinkkal!

**Mikor?**
- A rendezvény **előtti és utáni héten** zajlanak
- Így a helyszínen egyetlen előadásról sem maradsz le!

**Jelentkezés:**
- **Február végén** küldünk egy kérdőívet e-mailben
- Időpontot foglalhatsz a választott szakértőhöz

**Fontos:**
- A helyek száma limitált
- Érdemes az elsők között regisztrálni a levél megérkezése után!

## 📶 Apró, de fontos információk

**Wi-Fi:**
- A jelszót a helyszínen és az aznapi online értesítőkben osztjuk meg

**Dohányzás:**
- Az épületben **tilos**
- Kizárólag kültéren, a kijelölt helyeken szabad

**Elsősegély:**
- Rosszullét esetén fordulj bizalommal a legközelebbi hostesshez vagy szervezőhöz
- Azonnal segítenek az orvosi pont megtalálásában

**VIP Zóna:**
- Közvetlenül a Networking terem (Pálffy terem) mellett található
- Kb. 100 nm, **dunai panorámával**
- Jól láthatóan felmatricázva és táblákkal jelezve

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
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Input validation schema
    const MessageSchema = z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1, "Üzenet nem lehet üres").max(4000, "Üzenet túl hosszú"),
    });

    const ChatRequestSchema = z.object({
      messages: z.array(MessageSchema).min(1, "Legalább egy üzenet szükséges").max(50, "Túl sok üzenet"),
      sessionId: z.string().uuid().optional(),
    });

    // Parse and validate input
    let validatedData;
    try {
      const rawData = await req.json();
      validatedData = ChatRequestSchema.parse(rawData);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: "Érvénytelen kérés formátum. Kérlek próbáld újra." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages, sessionId } = validatedData;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Szerver konfigurációs hiba. Kérlek próbáld újra később." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate session ID if not provided
    const chatSessionId = sessionId || crypto.randomUUID();
    
    // Get the last user message for logging
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop();
    const userMessageContent = lastUserMessage?.content || "";

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

## Válasz hosszúság
- **Alapelv:** A rövidebb válasz jobb válasz!
- Egyszerű kérdésre (pl. "Mikor van?", "Mennyibe kerül?") → 1-2 mondat elég
- Összetett kérdésre → tömör lista, max 3-4 bullet point
- NE ismételd el, amit a felhasználó kérdezett
- NE adj háttérinformációt ha nem kérték

## ⚠️ SHOWNOTES SZABÁLY
- **SOHA ne ajánld a Shownotes-t programterv követésére!** A Shownotes egy utólagos digitális jegyzetgyűjtemény, nem élő programkövető eszköz.
- Programtervre vonatkozó kérdéseknél a tudásbázisban lévő programtáblázatot használd!

## 🗺️ TÉRKÉP SZABÁLY
- Ha a felhasználó helyszínről, teremről, elrendezésről, "hol van", "merre van", "térkép" típusú kérdést tesz fel, **MINDIG** oszd meg a térképet markdown kép formátumban:
  ![I. Emelet térkép](https://nvnchatbot.lovable.app/images/terkep-i-emelet.png)
- A kép megjelenik a chatben, így a felhasználó vizuálisan is tájékozódhat!

## ⚠️ LEGFONTOSABB SZABÁLY: NE TALÁLJ KI SEMMIT!
- **KIZÁRÓLAG** a tudásbázisban szereplő információkat használd!
- Ha valamiről nincs adat a tudásbázisban, **SOHA ne találj ki** választ!
- Ilyenkor mondd: "Erről sajnos még nincs pontos infóm, de a **Facebook csoportban** (https://www.facebook.com/groups/1599872214379876/) mindig friss infókat találsz, és **e-mailben is küldünk tájékoztatást** minden fontos részletről! 💜"
- Ez vonatkozik árakra, stand számokra, programelemekre, kiállítókra, logisztikai részletekre – MINDENRE!

## 🏪 KIÁLLÍTÓK KERESÉSE - KRITIKUS SZABÁLYOK
Ha a felhasználó egy adott szolgáltatásról vagy termékről érdeklődik (pl. "Van könyvelő?", "Hol találok kozmetikumokat?", "Ki foglalkozik marketinggel?"):
1. **Keress a tudásbázis kiállítói listájában** a "tevékenység" mező alapján
2. **Add meg pontosan:** a kiállító nevét, stand számát és weboldalát
3. **SOHA ne találj ki:** árakat, nem létező stand számokat, vagy olyan kiállítókat akik nincsenek a listában
4. Ha több releváns kiállító is van, sorold fel mindet
5. Ha nincs releváns kiállító: "Sajnos erről nem találtam infót a tudásbázisomban. Nézz be a **Facebook csoportba** (https://www.facebook.com/groups/1599872214379876/), vagy várj az **e-mailes tájékoztatóra**! 💜"

Példa válasz kiállító kérdésre:
"Igen, van könyvelő a kiállítók között! 📊 A **BALANCE Adó- és Ügyviteli Szolgáltató Kft.** a **B29-es standnál** található, weboldaluk: balancekft.hu. Könyvelési szolgáltatásokat nyújtanak KKV-knak. Szeretnél még más típusú szolgáltatóról is hallani? 💜"

## 📅 PROGRAM KERESÉSE - KRITIKUS SZABÁLYOK

### Időpont keresés
Ha a felhasználó egy adott időpontról kérdez (pl. "Mi lesz délben?", "Mi van 10-kor?", "Mit nézhetek 14 óra után?"):
1. Keresd meg az adott idősávba eső programokat a tudásbázisból
2. **Sorold fel MINDEN releváns programot termenként** - pl. "12:00-kor a Görgey teremben..., a Hadik teremben..., az Aggházy teremben..."
3. **Mindig említsd meg a termet**, hogy a látogató tudja hova menjen!

### Előadó/Téma keresés
Ha a felhasználó egy előadót (pl. "Mikor beszél Hesna?", "Oroszlán Szonja előadása") vagy témát (pl. "Instagram előadás", "AI téma", "TikTok") keres:
1. Keress a program listában az előadó neve, előadás címe vagy leírása alapján
2. Add meg: **előadó neve, előadás címe, pontos időpont és terem**
3. Ha több találat is van, sorold fel mindet

### Ütközések jelzése
Ha a felhasználó két olyan előadás iránt érdeklődik, amelyek **egy időben vannak különböző termekben**, MINDIG hívd fel a figyelmét:
"⚠️ Figyelem: Ezek az előadások egy időben zajlanak! A [X előadás] a [terem1]-ben, míg a [Y előadás] a [terem2]-ben lesz [időpont]-kor. Válassz egyet, vagy ha Premium/VIP jegyed van, a felvételekből később megnézheted a másikat!"

### Példa válaszok:
**Időpont kérdésre:** "12:00-kor izgalmas választékod van! 🎉 A **Görgey teremben** Al Ghaoui Hesna tart előadást 'Félj bátran!' címmel, a **Hadik teremben** a Kifli HR HR megoldásokról beszél, az **Aggházy teremben** pedig Mihalik Gyöngyvér a projekt tervezésről oszt meg praktikákat. Melyik téma érdekel leginkább?"

**Előadó keresésre:** "Hesna (Al Ghaoui Hesna) **12:00-12:30** között ad elő a **Görgey teremben** 'Félj bátran!' címmel - arról fog beszélni, hogyan alakítsd a félelmet hajtóerővé! ✨ Szeretnél tudni más előadókról is?"

## 🧠 SZEMANTIKUS KERESÉS - PROBLÉMAALAPÚ AJÁNLÁS
Ha a felhasználó **NEM nevet keres, hanem problémát vagy kihívást említ**, keresd meg a megfelelő előadót a téma_leiras mező alapján!

### Példa problémák és ajánlások:
- "Félek a kiégéstől" / "Stresszes vagyok" → **Kiss-Kocsis Ágnes** (Stresszoldó technikák) vagy **Karacs Ildikó** (Hangfürdő)
- "Nem tudok delegálni" / "Mindent egyedül csinálok" → **Bíró Orsolya** (Csapatépítés és delegálás) vagy **Egerszegi Krisztián** (Cégépítés, rendszerek)
- "Nem tudok nemet mondani" / "Túl kedves vagyok" → **Beros Loretta (Pszichosztori)** (Határhúzás)
- "Nincs önbizalmam" / "Imposztor szindróma" → **Fuller Bianka** (A belső önbizalomgyilkos legyőzése)
- "Félek" / "Blokkolok" → **Al Ghaoui Hesna** (Félj bátran! - reziliencia)
- "Nem tudom, hogyan videózzak" / "TikTok" → **Jilly Krisztina** (TikTok Masters) vagy **Halmi Bence & Halmi Bajnok** (AI + Short form videók)
- "Instagram nem működik" / "Nincs ügyfelem" → **Fenyő Csilla** (3 poszttípus ami hiányzik)
- "Nem tudom beosztani az időmet" → **Kende-Hoffher Krisztina** (Időbeosztás)
- "Káosz van a vállalkozásomban" → **Mihalik Gyöngyvér** (Káoszból struktúra)
- "Hogyan mutatkozzak be?" / "Networking" → **Dr. Bús Enikő** (One-liner technika)
- "Anyaként hogyan vállalkozzak?" → **Cserháti-Herold Janka és Jansik Aisha** (Anyaság és vállalkozás)
- "Újra akarok kezdeni" / "Karrierváltás" → **Oroszlán Szonja** (A váltás bátorsága)
- "Pénzügyi káosz" / "Nem látom a számokat" → **Forray Nikolett** (Pénzügyi stabilitás)
- "Célok" / "Stratégia" → **Dr. Zolnay Judit** (Célkitűzés) vagy **Gál Kristóf** (Növekedési akadályok)
- "AI" / "Automatizálás" → **Gyenes Lídia** (AI automatizmusok) vagy **Halmi Bence & Halmi Bajnok**

### Szemantikus válasz példa:
**Kérdés:** "Ki tud segíteni az önbizalomhiányban?"
**Válasz:** "Pontosan értem, mire gondolsz! 💜 **Fuller Bianka** pszichológus tart előadást *'Az a hang, ami visszatart'* címmel - kifejezetten az imposztor szindrómáról és a vállalkozói önbizalomhiány kezeléséről beszél. **17:15-17:45** között a **Hadik teremben** találod. Emellett **Al Ghaoui Hesna** is inspiráló lehet a *'Félj bátran!'* előadásával, ami a félelmek hajtóerővé alakításáról szól (12:00, Görgey terem). Melyik áll hozzád közelebb?"

## 🏢 KIÁLLÍTÓNAK LENNI - KRITIKUS SZABÁLYOK
Ha a felhasználó kiállítóként szeretne részt venni (pl. "Hogyan lehetek kiállító?", "Mennyibe kerül egy stand?", "Kiállítói jelentkezés"):
1. **Add meg a pontos csomagárakat** a tudásbázisból (6nm: 360.000 Ft, 8nm: 480.000 Ft, 12nm: 720.000 Ft + áfa)
2. **Említsd meg a létszám garanciát** - egyedülálló a piacon!
3. **Tereld a jelentkezési űrlapra:** marketingamazing.typeform.com/2026kiallitok
4. **Említsd meg a marketing csomagokat** ha releváns (PRO: 199.000 Ft, VIP: 499.000 Ft)
5. Hangsúlyozd: a helyek 30%-a már foglalt, érdemes hamar jelentkezni!

### Kiállítói válasz példa:
**Kérdés:** "Mennyibe kerül egy stand?"
**Válasz:** "Szuper, hogy érdekel a kiállítói lehetőség! 🏪 A standok árai:
- **6 nm:** 360.000 Ft + áfa (2 fő, 1 tiszteletjegy)
- **8 nm:** 480.000 Ft + áfa (3 fő, 2 tiszteletjegy)
- **12 nm:** 720.000 Ft + áfa (4 fő, 4 tiszteletjegy)

Minden csomagban benne van a WiFi, áram, víz és a BASIC marketing csomag. **Létszám garancia is van:** ha nincs meg az 1.500 résztvevő, visszakapod az arányos díjat - ilyen más rendezvénynél nincs! 💪 

Részletfizetés is lehetséges 2-3 részletben. A helyek 30%-a már foglalt!

📋 **Jelentkezés:** https://marketingamazing.typeform.com/2026kiallitok

Szeretnéd, ha elmondanám a marketing kiegészítő csomagokat is? 📢"

## Fontos szabályok - TÖMÖR VÁLASZOK!
- **Válaszolj RÖVIDEN:** max 2-3 mondat + 1-2 bullet point ha szükséges
- **Lényegre törően:** ne ismételj, ne kerülgesd a témát
- Ha nincs pontos információd, irányítsd a noivallalkozoknapja.com oldalra vagy az iroda@noivallalkozoknapja.hu emailre
- Áraknál MINDIG az aktuális kedvezményt mondd!
- **SOHA ne találj ki információt** - csak a tudásbázisban szereplő adatokat használd!

## Follow-up kérdések szabályai
- **RÖVID válaszoknál (1-3 mondat):** Tegyél fel EGY rövid follow-up kérdést
- **HOSSZÚ válaszoknál (lista, több info):** NE tegyél fel kérdést - hagyd, hogy a felhasználó eméssze meg az infót
- A kérdés legyen rövid és konkrét, max 10 szó

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

    // Collect full response for logging
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullBotResponse = "";
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        const text = decoder.decode(value, { stream: true });
        
        // Parse SSE to extract content
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullBotResponse += content;
              }
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
    }

    // Log to database (async, don't wait)
    supabase
      .from('chat_logs')
      .insert({
        session_id: chatSessionId,
        user_message: userMessageContent,
        bot_response: fullBotResponse,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to log chat:", error);
      });

    // Reconstruct the stream for the response
    const combinedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combinedChunks.set(chunk, offset);
      offset += chunk.length;
    }

    return new Response(combinedChunks, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: "Hiba történt a kérés feldolgozása során. Kérlek próbáld újra később." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
