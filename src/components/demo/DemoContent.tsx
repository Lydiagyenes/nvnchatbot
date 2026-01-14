import { X } from "lucide-react";

export const DemoContent = () => {
  const painPoints = [
    "A vállalkozás mehetne jobban is, egy csomó mindent fejleszteni kéne",
    "Jó lenne többet foglalkozni a gyerekekkel, kevés a családi program",
    "Idejét sem tudod, mikor voltál utoljára kettesben a pároddal",
    "A barátnőiddel ezer éve nem volt időd egy kávéra sem",
    "A szüleidet is sokkal ritkábban látod, mint szeretnéd",
  ];

  return (
    <section className="py-16 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
            Egy cipőben járunk
          </h2>
          <p className="text-xl text-muted-foreground">
            küzdjünk meg a nehézségeinkkel együtt!
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            <div className="h-1 w-20 bg-secondary-foreground rounded-full" />
            <div className="h-1 w-20 bg-accent rounded-full" />
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Vállalkozó, feleség, nő, anya, barátnő, "gyerek"... női vállalkozóként millió 
              szerepben kell helytállnod, és miközben szétszakadsz, folyton azt érzed, 
              hogy semmiben sem vagy elég jó.
            </p>
            
            <div className="space-y-3 mb-6">
              {painPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-destructive/60 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-destructive/60" />
                  </div>
                  <p className="text-foreground/80">{point}</p>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground mb-4">
              És Te...? Magadat fel sem teszed a listára, ugye?
            </p>
            
            <p className="text-muted-foreground">
              Közben azt látod, hogy van, akinek a kisujjában van ez az egész. De tudod 
              mit? NEM ügyesebbek vagy okosabbak nálad – ők is sokszor érezték pont 
              ugyanezt.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary to-muted overflow-hidden shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p className="text-center px-8">
                  [Eseményfotó helye - lelkes női vállalkozók a konferencián]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
