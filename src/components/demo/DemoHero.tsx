import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DemoHero = () => {
  return (
    <section className="gradient-primary py-20 px-6 text-center">
      <div className="container mx-auto max-w-4xl">
        <p className="text-accent font-medium tracking-widest mb-4 uppercase text-sm">
          Új helyszín, új élmények, új dimenziók
        </p>
        
        <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Női Vállalkozók Napja
        </h1>
        
        <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto uppercase tracking-wide">
          Egy teljes nap fejlődés és kikapcsolódás<br />
          neked és a vállalkozásodnak
        </p>
        
        <Button 
          size="lg" 
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          Ott leszek!
        </Button>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex items-center gap-3 text-primary-foreground">
            <Calendar className="w-5 h-5 text-accent" />
            <div className="text-left">
              <div className="font-semibold">2026.03.19.</div>
              <div className="text-sm opacity-70">8:00 – 18:30</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground">
            <MapPin className="w-5 h-5 text-accent" />
            <div className="text-left">
              <div className="font-semibold">Budapest:</div>
              <div className="text-sm opacity-70">Bálna</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
