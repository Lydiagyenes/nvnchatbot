export const DemoHeader = () => {
  return (
    <header className="gradient-accent py-3 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-accent-foreground text-sm">
            SZEREZD BE A JEGYED AKÁR 43% KEDVEZMÉNNYEL!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {[
              { value: "01", label: "nap" },
              { value: "08", label: "óra" },
              { value: "46", label: "perc" },
              { value: "09", label: "msp." },
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-lg px-3 py-2 text-center min-w-[50px]">
                <div className="font-bold text-lg text-foreground">{item.value}</div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
