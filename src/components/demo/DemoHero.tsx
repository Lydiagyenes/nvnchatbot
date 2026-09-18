import { Calendar, MapPin } from "lucide-react";

export const DemoHero = () => {
  return (
    <section className="gradient-primary py-20 px-6 text-center relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative">
        <div className="inline-block border border-accent rounded-full px-6 py-2 mb-8">
          <span className="text-accent font-semibold tracking-widest uppercase text-xs md:text-sm">
            ✨ Magyarország legnagyobb női vállalkozói eseménye
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground mb-4 leading-tight">
          Női Vállalkozók Napja
        </h1>

        <p className="font-display italic text-primary-foreground/90 text-2xl md:text-3xl mb-6">
          Többre vagy hivatott – hozzuk ki belőled együtt!
        </p>

        <p className="text-primary-foreground/75 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Itt nemcsak inspirációt kapsz, hanem gyakorlati tudást, valódi
          kapcsolódásokat, új lendületet és egy olyan közösséget, ami
          emlékeztet rá: <strong className="text-primary-foreground">nem kell mindent egyedül megoldanod.</strong>
        </p>

        <button className="gradient-accent text-accent-foreground font-bold px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          Ott leszek!
        </button>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-14">
          <div className="flex items-center gap-3 bg-primary-foreground/5 border border-primary-foreground/20 rounded-2xl px-6 py-4 text-primary-foreground min-w-[220px]">
            <Calendar className="w-6 h-6 text-accent" />
            <div className="text-left">
              <div className="font-semibold">2027. március 18.</div>
              <div className="text-sm opacity-70">8:00 – 18:30</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-primary-foreground/5 border border-primary-foreground/20 rounded-2xl px-6 py-4 text-primary-foreground min-w-[220px]">
            <MapPin className="w-6 h-6 text-accent" />
            <div className="text-left">
              <div className="font-semibold">Bálna</div>
              <div className="text-sm opacity-70">Budapest</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
