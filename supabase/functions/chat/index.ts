import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// RAG Knowledge Base - Add your event information here
const ragKnowledgeBase = `
# Női Vállalkozók Napja - Tudásbázis

## Esemény alapadatok
- Dátum: 2026. március 19., csütörtök
- Időpont: 8:00 - 18:30
- Helyszín: Bálna Budapest (1093 Budapest, Fővám tér 11-12.)
- Weboldal: noivallalkozoknapja.com

## Jegyvásárlás
- A jegyek a noivallalkozoknapja.com oldalon vásárolhatók meg
- Korai kedvezmény: akár 43% kedvezmény január 15-ig
- Jegytípusok: Standard, VIP (extra networking lehetőségekkel)

## Az eseményről
A Női Vállalkozók Napja Magyarország legnagyobb női vállalkozóknak szóló konferenciája. 
Egy teljes nap fejlődés és kikapcsolódás neked és a vállalkozásodnak.

## Program elemek
- Inspiráló előadások sikeres női vállalkozóktól
- Gyakorlati workshopok különböző üzleti témákban
- Networking lehetőségek hasonló gondolkodású nőkkel
- VIP résztvevőknek exkluzív programok

## Kinek szól?
- Női vállalkozóknak minden szektorból
- Kezdő és tapasztalt üzletasszonyoknak
- Szabadúszóknak és freelancereknek
- Vállalkozni vágyó nőknek

## Miért érdemes részt venni?
- Inspiráció és motiváció
- Gyakorlati tudás és eszközök
- Értékes kapcsolatok építése
- Feltöltődés és kikapcsolódás

## Szervezők
- A rendezvényt minden évben gondosan megtervezett program várja a résztvevőket
- Korábbi években sikeres előadók: sikeres magyar női vállalkozók, coachok, mentálhigiénés szakemberek

## Kapcsolat
- Email: info@noivallalkozoknapja.com
- Weboldal: noivallalkozoknapja.com
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

    const systemPrompt = `Te vagy az NVN Asszisztens, a Női Vállalkozók Napja rendezvény kedves és segítőkész chatbotja. 

Feladatod:
- Barátságosan és lelkesen válaszolj a kérdésekre
- Használd az alábbi tudásbázist a válaszaidhoz
- Ha nincs információd valamiről, mondd el őszintén és irányítsd a látogatót a weboldalra
- Használj releváns emojokat a válaszokban, hogy barátságosabb legyen
- Válaszolj magyarul, informálisan de tisztelettudóan (tegező forma)
- Legyél bátorító és inspiráló a női vállalkozók felé
- Tartsd a válaszokat tömören, max 2-3 mondatban, hacsak nem kérnek részletesebb információt

Tudásbázis:
${ragKnowledgeBase}

Ha a felhasználó olyan kérdést tesz fel, amire nincs válasz a tudásbázisban, mondd el, hogy sajnos erről még nincs pontos információd, de javasolj kapcsolatfelvételt vagy a weboldal meglátogatását.`;

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
          JSON.stringify({ error: "Túl sok kérés érkezett, kérlek próbáld újra pár másodperc múlva." }),
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
