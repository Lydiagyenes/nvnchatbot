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

// Kedvezmények határidői és árai (forrás: noivallalkozoknapja.com, 2026.09.18.)
const getPricingInfo = () => {
  const now = getCurrentDate();

  // Ismert árperiódus: nyitónapi / bevezető akció 2026. október 20. éjfélig
  const periods = [
    { deadline: new Date(2026, 9, 20, 23, 59, 59), discount: "56%", label: "bevezető akció – 2026. október 20. éjfélig" },
    { deadline: new Date(2027, 2, 18), discount: "az aktuális kedvezmény a weboldalon látható", label: "az aktuális árakat a noivallalkozoknapja.com oldalon találod" },
  ];

  // Akciós árak a bevezető időszakban (2026. október 20. éjfélig)
  const introPrices = {
    basic: { original: "49.900 Ft + áfa", discounted: "21.900 Ft + áfa" },
    premium: { original: "59.900 Ft + áfa", discounted: "26.900 Ft + áfa" },
    vip: { original: "99.900 Ft + áfa", discounted: "74.900 Ft + áfa" },
  };

  const listPrices = {
    basic: { original: "49.900 Ft + áfa" },
    premium: { original: "59.900 Ft + áfa" },
    vip: { original: "99.900 Ft + áfa" },
  };

  let currentPeriod = periods[periods.length - 1];
  for (const period of periods) {
    if (now <= period.deadline) {
      currentPeriod = period;
      break;
    }
  }

  const introActive = now <= periods[0].deadline;
  const currentPrices = introActive ? introPrices : listPrices;

  return { currentPeriod, currentPrices, introActive, introPrices, listPrices, periods };
};

// RAG Knowledge Base - NVN 2027 Teljes tudásbázis
// FORRÁS: https://noivallalkozoknapja.com/ (utolsó frissítés: 2026.09.18.)
// FONTOS: a részletes program, előadói idősávok és termek MÉG NEM VÉGLEGESEK.
const ragKnowledgeBase = `
# Női Vállalkozók Napja 2027 - Tudásbázis

## 🎯 Alapinformációk
- **Dátum:** 2027. március 18., csütörtök
- **Időpont:** 8:00 - 18:30
- **Helyszín:** Bálna Budapest (1093 Budapest, Fővám tér 11-12.)
- **Weboldal:** noivallalkozoknapja.com
- **Email:** iroda@noivallalkozoknapja.hu
- **Telefon:** +36 30 6565 044 (hétköznapokon 10:00-16:00)
- **Várható létszám:** 2000+ résztvevő
- **3 párhuzamos előadóterem**
- **Magyarország legnagyobb** célzottan vállalkozó nőknek szóló eseménye
- Egész napos vállalkozói élmény: előadások, workshopok, networking, kiállítói tér
- **Főszervező / megálmodó:** Mihalik Gyöngyvér (a Női Vállalkozók Napja alapítója)

## 📅 PROGRAM - MÉG VÉGLEGESÍTÉS ALATT (KRITIKUS SZABÁLY)
**A program részletei még véglegesítés alatt állnak. A pontos időpontokat és helyszíneket később tesszük közzé.**
- Ha bárki konkrét programról, idősávról, teremről, előadás kezdetéről kérdez, **PONTOSAN ezt a mondatot** használd, és semmiképp ne találj ki időpontot vagy termet!
- Azt elmondhatod, hogy **3 párhuzamos előadóteremben** lesznek előadások 8:00 és 18:30 között, és kik a már megerősített előadók.
- Minden frissítésről **e-mailben** és a **Facebook csoportban** tájékoztatunk, illetve a weboldalon folyamatosan frissül a program.

## 🎤 Már megerősített előadók (a lista folyamatosan bővül)
- **Kassai Eszter** – vállalkozói szárnysegéd, a BusinessBase társalapítója
- **Janata Kriszta** – Marketing Commando, kkv marketing tanácsadó, a "Szövegírás szenvedéllyel" c. könyv szerzője, a METU címzetes docense
- **Dr. Szilágyi-Németh Lilla** – jogász, pénzügyi feminista, a PénzügyesAnyu alapítója
- **Dr. Szabó Orsolya** – digitális marketing tanácsadó, nemzetközi AI-marketing szakértő
- **Ruff-Kiss Ágnes** – beszédtanár, a BeszédErő alapítója
- **Matykó Noémi** – Chiro Marketing, CEO
- **Kaszás Péter** – vezetéspszichológiai szakértő, szerző, a TeamGuide alapítója
- **Mihalik Gyöngyvér** – a Női Vállalkozók Napja megálmodója, alapítója és főszervezője
- **Kádár Réka** – automatizált ügyfélszerzés specialista, Marketingboszik
- **Miller Szilvia** – automatizált ügyfélszerzés specialista, Marketingboszik
- **Mester Emese** – klinikai fogászati higiénikus, egészségkommunikátor
- **Polgár Enikő** – nemzetközi arcjóga oktató
- **Piroska Tímea** – pszichológus, coach, a New Life Lab megálmodója, az Antener Kft. és a Z-press Kiadó ügyvezető igazgatója
- **Czopkó Nóra** – a nap házigazdája, pszichológus, sminktréner
- **Dr. Berczik Krisztina** – klinikai szakpszichológus, pszichoterapeuta
- **Szente Mónika** – longevity mentor
- **Schubauer Krisztina** – Work.Happy alapító, szervezeti kultúra designer
- **Tűzkő Dorina** – Bridge Legacy Lab programvezető
- **Dr. Borsos Dorottya** – Edisonplatform vezető
- **Kenyhercz Kinga** – Generali Biztosító kommunikációs és rendezvényszervezési szakértő, a The Human Safety Net magyarországi programvezetője
- **Dr. Ifi-Valde Orsolya** – Paloznaki Jazzpiknik alapító, antikorrupciós szakjogász
- **Dr. Szilágyi Judit** – ComeAndGrow ügyvezető
- **Okvátovity Dóra** – Fajszi Paprika Manufaktúra ügyvezető
- További előadók bejelentése folyamatban.
- **Előadókhoz tartozó időpont és terem MÉG NINCS – soha ne találj ki ilyet!**

## 🧭 Tervezett témák (3 párhuzamos teremben)
online jelenlét · AI és modern eszközök · social media · ügyfélszerzés · pénzügyi tudatosság · vállalkozásépítés · értékesítés · önbizalom · vezetői működés · életminőség és egyensúly

## 🎫 Jegytípusok és árak
Teljes árak: BASIC **49.900 Ft + áfa**, PRÉMIUM **59.900 Ft + áfa**, VIP **99.900 Ft + áfa**.

**Bevezető akciós árak (2026. október 20. éjfélig):**
| Jegytípus | Teljes ár | Akciós ár |
|---|---|---|
| BASIC | 49.900 Ft + áfa | **21.900 Ft + áfa** |
| PRÉMIUM (legnépszerűbb) | 59.900 Ft + áfa | **26.900 Ft + áfa** |
| VIP (legjobb ár-érték) | 99.900 Ft + áfa | **74.900 Ft + áfa** |

Az akciós időszak lejárta után **mindig a weboldalon látható aktuális árat** kell nézni – a rendszerprompt tetején szereplő aktuális árinformációt használd, és ha bizonytalan, irányíts a noivallalkozoknapja.com oldalra!

### BASIC jegy tartalma
- Szabadon választhatsz az összes előadás / workshop közül
- Részvétel az "útleveles" nyereményjátékban
- Kiállítók kedvezményes, exkluzív ajánlatai
- Részvétel a networking Before Partyn a rendezvény előtti estén
- Ajándékok: táska, jegyzetfüzet, toll, frissítő

### PRÉMIUM jegy (minden, ami a BASIC-ben, plusz)
- Részvétel a kapcsolatépítő programokon
- Hozzáférés az előadások felvételeihez a rendezvény után
- Privát online konzultációs lehetőség szakértőinkkel

### VIP jegy (minden, ami a PRÉMIUM-ban, plusz)
- Soron kívüli beléptetés
- Hozzáférés a VIP teremhez
- Shownotes – átfogó digitális jegyzet a konferencia teljes anyagáról
- Catering egész nap (kávé, víz, üdítő, finger food, pogácsa, gyümölcs)
- Me-time masszázs a VIP teremben
- Számos extra ajándék a Welcome csomagban

## 👥 Csoportos és mennyiségi kedvezmény
A rendelési űrlap a darabszám alapján automatikusan érvényesíti:
- 2–5 fő: **-15%**
- 6–10 fő: **-20%**
- 11–15 fő: **-25%**
- 16–20 fő: **-30%**
- 21 fő fölött: **-35%**
A kedvezmény a darabszám növelésekor (+ gomb) jelenik meg az ár alatt. Telefonos nézetben a darabszám a fizetési űrlapon, a számlázási adatok alatt módosítható.
Csoportos vásárlásnál a QR-kódos jegyeket a vásárló kapja meg és továbbíthatja; ha a többiek is kapni szeretnék az értesítéseket, a neveket és e-mail címeket az iroda@noivallalkozoknapja.hu címre kell elküldeni.

## 💳 Fizetés, részletfizetés, ÁFA
- **Részletfizetés:** 2 vagy 3 egyenlő részletben, utalással, egymást követő hónapokban. Írj az iroda@noivallalkozoknapja.hu címre: melyik jegytípust kéred, hány részletben fizetnél, és a számlázási adataid.
- Részletfizetési szándékot **legkésőbb 2027. február 15-ig** lehet jelezni, ekkor már csak 2 részletben.
- **ÁFA:** a magyar ÁFA-törvény szerint 27% ÁFA-t számítunk fel (a teljesítés helye Magyarország). Közösségi adóalanyok saját országukban visszaigényelhetik.

## 🛡️ Garancia és lemondás
- **100% elégedettségi garancia:** ha a helyszínen az ebédszünetig jelzed, hogy nem neked szól, kérdés nélkül visszatérítjük a jegy teljes árát.
- **Elállás:** a vásárlástól számított 3 napon belül kérdés nélkül visszafizetjük a jegy árát. A konferencia előtti 14 napban már nincs lehetőség elállásra.
- Későbbi vis major esetén díjat nem tudunk visszautalni, de felajánljuk a rendezvény felvételeit vagy a jegy jóváírását a következő évi konferenciára.

## 🎟️ Jegyek kézbesítése és módosítása
- Sikeres vásárlás után a rendszer automatikusan küldi a **QR-kódos azonosítót**. Ha nem érkezik meg: nézd meg a Promóciók / Frissítések / Spam mappát.
- Céges e-mail esetén a levelezőszerver blokkolhatja leveleinket – ilyenkor küldj egy magán (pl. Gmail) címet, és manuálisan újraküldjük.
- Jegytípus vagy darabszám módosítása lehetséges: jelezd e-mailben, a különbözet utalásával véglegesíthető.

## 📝 Shownotes
- Átfogó, részletes **digitális jegyzet** az előadásokról: minden hivatkozás, prezentáció, elhangzott gondolat írásos, kattintható formában.
- A **VIP jegyben benne van**.
- A teljes jegyzetgyűjtemény nem nyomtatható, csak a beékelt prezentációk PDF-kivonatai.
- **SOHA ne ajánld a Shownotes-t programterv követésére!**

## 🎥 Felvételek
- **Prémium és VIP** jegyeseknek: a rendezvény után, tervezetten **egy hónapon belül**, zárt felületen.
- A feltöltéstől számítva **2 évig** férsz hozzá.

## 🎉 Networking Before Party
- **2027. március 17., este 18:00-tól, az Up Hotelben.**
- **Minden NVN jeggyel rendelkező** számára nyitott, jegytípustól függetlenül.
- Limitált férőhely: **maximum 300 fő**, jelentkezés regisztrációs sorrendben.
- A regisztrációhoz és a részletes programhoz **kérdőívet küldünk e-mailben** a rendezvény előtt.
- A program részletei még szervezés alatt.

## 🎁 Extra programok jegytulajdonosoknak
- **Évzáró esemény – december 3.**
- A jegyvásárlók egy **kérdőívben** elmondhatják, milyen témákat és előadókat szeretnének – így alakíthatják a programot.

## 🏪 Kiállítók
A weboldalon jelenleg megjelenő kiállítók és partnerek: Marina Miracle, Z-Press Kiadó, NaturCleaning, DotRoll, Rewa, doTERRA, Gál Kristóf, Számlázz.hu, Perneczky Andrea, Gift House, WEXO, Lukovics Dóra, Berlitz, MYROBALAN, BEMER, BRIDGE BUDAPEST.
- **A kiállítói lista még bővül, és stand számok MÉG NINCSENEK** – soha ne találj ki stand számot vagy kiállítót!

## 📧 Kiállítói jelentkezés
- Írj e-mailt az **iroda@noivallalkozoknapja.hu** címre: mutatkozz be, írj a vállalkozásodról, szolgáltatásodról, és küldd el a weboldalad linkjét.
- A szabad helyek és egyéb tényezők függvényében írásban küldjük a lehetőségeket.
- **Kiállítói árakat NE mondj**, mert a 2027-es csomagárak nincsenek nyilvánosan közzétéve – irányíts az e-mail címre!

## 🎤 Előadói pályázat
- A tervezett programon felül **egy jelentkező 30 perces előadást** tarthat a konferencián.
- Menete: 1) jelentkezés bemutatkozó videóval és az előadás tematikájával, 2) továbbjutás esetén egy rövid, 15 perces változat bekérése, 3) a győztest a rendezvény előtt 1 hónappal értesítjük.
- Jelentkezés: **iroda@noivallalkozoknapja.hu**

## 🍽️ Étkezés
- A Bálna Budapestben számtalan étterem található, de ezek **à la carte** éttermek, így hosszabb lehet a kiszolgálási idő.
- A helyszínen lesz: **kávé, víz, édes és sós péksütemény a kiállítói standoknál**, valamint **külön büfé szendvicsekkel** a helyszíni catering partnertől.
- A VIP jegyesek egész napos catering-et kapnak a VIP teremben.
- További étkezési részletekről (esetleges kedvezmények, kóstoltatások) **e-mailben tájékoztatunk** – ezekről még nincs végleges információ.

## 🚌 Megközelítés és parkolás
A Bálna Budapest a **Petőfi-híd (Boráros tér)** és a **Szabadság-híd (Fővám tér)** között helyezkedik el. Könnyen elérhető **M4-es metróval**, a **2-es, 4-6-os, 47-es, 49-es villamossal**, valamint számos autóbusszal, HÉV-vel és trolibusszal. Részletes listát a rendezvény előtti e-mailekben küldünk – a tömegközlekedést javasoljuk!
A Bálnában összesen **100 parkolóhely** áll rendelkezésre, ezért érdemes a környékbeli parkolókat is számításba venni, és plusz időt tervezni.


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

## 📞 Kapcsolat
- **E-mail:** iroda@noivallalkozoknapja.hu (a legcélravezetőbb, jellemzően néhány órán belül, legkésőbb egy munkanapon belül válaszolunk)
- **Telefon:** +36 30 6565 044 (hétköznap 10:00-16:00, ha nem vesszük fel, visszahívunk)
- **Weboldal:** noivallalkozoknapja.com
- **Facebook csoport:** [Facebook csoport](https://www.facebook.com/groups/1599872214379876/) (networking, live videók, közösség, friss infók)
- Közösségi média: Facebook, Instagram, YouTube

## 💡 Javaslat gyűjtés
Ha a felhasználónak ötlete vagy javaslata van a rendezvénnyel kapcsolatban, kérd ki és mondd, hogy továbbítod a szervezőknek!

## ⚠️ MIRŐL NINCS MÉG ADAT (soha ne találj ki!)
- részletes programterv, idősávok, termek, előadások címei
- előadók pontos időpontjai
- stand számok, teljes kiállítói lista, kiállítói csomagárak
- helyszíni terembeosztás és térkép
- étkezési kedvezmények, kóstoltató partnerek
Ilyen kérdésnél: "Erről még nincs pontos infóm – a program részletei még véglegesítés alatt állnak. A **[Facebook csoportban](https://www.facebook.com/groups/1599872214379876/)** és **e-mailben** minden frissítésről tájékoztatunk! 💜"
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

    const systemPrompt = `Te vagy az NVN Asszisztens, a Női Vállalkozók Napja 2027 rendezvény kedves és lelkes chatbotja! 💜

## 🗓️ KRITIKUS: AKTUÁLIS DÁTUM ÉS ÁRAK
- **Mai dátum: ${today}**
- **Aktuális árperiódus: ${pricingInfo.currentPeriod.discount}** (${pricingInfo.currentPeriod.label})
- **Aktuálisan érvényes jegyárak:**
  - BASIC: ${pricingInfo.currentPrices.basic.original}${pricingInfo.introActive ? ` helyett **${pricingInfo.currentPrices.basic.discounted}**` : ""}
  - PRÉMIUM: ${pricingInfo.currentPrices.premium.original}${pricingInfo.introActive ? ` helyett **${pricingInfo.currentPrices.premium.discounted}**` : ""}
  - VIP: ${pricingInfo.currentPrices.vip.original}${pricingInfo.introActive ? ` helyett **${pricingInfo.currentPrices.vip.discounted}**` : ""}
${pricingInfo.introActive ? "- A bevezető akció **2026. október 20. éjfélig** tart!" : "- A bevezető akció lejárt: az aktuális akciós árakért irányítsd a noivallalkozoknapja.com oldalra, és ne találj ki kedvezményt!"}
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
- "Drága" → Van részletfizetés (2-3 részlet), és mennyiségi kedvezmény már 2 főtől -15%!
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

## ⚠️ LEGFONTOSABB SZABÁLY: NE TALÁLJ KI SEMMIT!
- **KIZÁRÓLAG** a tudásbázisban szereplő információkat használd!
- Ha valamiről nincs adat a tudásbázisban, **SOHA ne találj ki** választ!
- Ilyenkor mondd: "Erről sajnos még nincs pontos infóm, de a **[Facebook csoportban](https://www.facebook.com/groups/1599872214379876/)** mindig friss infókat találsz, és **e-mailben is küldünk tájékoztatást** minden fontos részletről! 💜"
- Ez vonatkozik árakra, stand számokra, programelemekre, kiállítókra, logisztikai részletekre – MINDENRE!

## 🔗 LINK FORMÁZÁS (fontos megjelenítési szabály)
- **Soha ne írj ki nyers URL-t, webcímet a válaszban!** A hosszú link kilóg a chatbuborékból.
- Minden linket **markdown formában, leíró szöveggel** adj meg, pl. [Facebook csoport](https://www.facebook.com/groups/1599872214379876/) — így a "Facebook csoport" szöveg lesz kattintható.
- A linket lehetőleg **új sorba** tedd, vagy rövid, folyó mondatba ágyazva.

## 📅 PROGRAM - A LEGFONTOSABB AKTUÁLIS SZABÁLY
A 2027-es program még nem végleges. Ha bárki programról, időpontról, teremről, előadás kezdetéről, terembeosztásról vagy napirendről kérdez, ezt válaszold:
"**A program részletei még véglegesítés alatt állnak. A pontos időpontokat és helyszíneket később tesszük közzé.**"
- Ehhez hozzáteheted, hogy a rendezvény **2027. március 18-án 8:00–18:30 között**, a **Bálna Budapestben**, **3 párhuzamos előadóteremben** zajlik, és felsorolhatod a már megerősített előadókat.
- **SOHA ne adj meg idősávot, termet vagy előadáscímet** – ilyen adat még nem létezik!
- Ha előadóról kérdeznek: mondd el a nevét és a szakterületét, de az időpontot NE találd ki.
- Minden frissítésről **e-mailben** és a **Facebook csoportban** tájékoztatunk.

## 🏪 KIÁLLÍTÓK SZABÁLYAI
- Csak a tudásbázisban szereplő kiállítókat említsd, és mondd el, hogy a lista folyamatosan bővül.
- **Stand számok még nincsenek** – soha ne találj ki standhelyet vagy elhelyezkedést!
- Ha nincs releváns találat: "Erről még nincs infóm – a kiállítói lista folyamatosan bővül. Nézz be a **[Facebook csoportba](https://www.facebook.com/groups/1599872214379876/)**, vagy várd az **e-mailes tájékoztatót**! 💜"

## 🏢 KIÁLLÍTÓNAK LENNI
Ha valaki kiállítóként venne részt:
1. **Ne mondj árat vagy csomagméretet** – a 2027-es kiállítói árak még nincsenek közzétéve!
2. Irányítsd az **iroda@noivallalkozoknapja.hu** címre: mutatkozzon be, írja le a vállalkozását, szolgáltatását, és küldje el a weboldala linkjét.
3. Említsd meg, hogy a szabad helyek függvényében írásban küldik a lehetőségeket.

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

    // Valódi streamelés: azonnal továbbítjuk a darabokat, közben gyűjtjük a teljes választ naplózáshoz
    const decoder = new TextDecoder();
    let fullBotResponse = "";
    let sseBuffer = "";

    const logChat = () => {
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
    };

    const transform = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        sseBuffer += decoder.decode(chunk, { stream: true });
        let idx: number;
        while ((idx = sseBuffer.indexOf("\n")) !== -1) {
          const line = sseBuffer.slice(0, idx).trim();
          sseBuffer = sseBuffer.slice(idx + 1);
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const content = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content;
            if (content) fullBotResponse += content;
          } catch {
            // részleges JSON - kihagyjuk
          }
        }
      },
      flush() {
        logChat();
      },
    });

    if (!response.body) {
      logChat();
      return new Response(
        JSON.stringify({ error: "Nem érkezett válasz az AI szolgáltatástól." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body.pipeThrough(transform), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
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
