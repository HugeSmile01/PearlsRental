import { Search, CalendarCheck, MapPin, CreditCard } from 'lucide-react';

const steps = [
  { icon: Search, step: '01', title: 'Browse & Choose', desc: 'Explore our curated collection. Filter by size, occasion, or style.' },
  { icon: CalendarCheck, step: '02', title: 'Reserve Online', desc: 'Select your rental dates. Our system checks availability in real time.' },
  { icon: MapPin, step: '03', title: 'Pick Up in Store', desc: 'Visit our Makati location during your scheduled pickup time.' },
  { icon: CreditCard, step: '04', title: 'Pay in Cash', desc: 'Pay the total amount in cash when you arrive. Simple and transparent.' },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-obsidian-900 border-y border-obsidian-100 dark:border-obsidian-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold-600 text-sm font-medium uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="section-title mb-4">How It Works</h2>
          <div className="gold-divider mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative text-center group">
              <div className="relative inline-block mb-5">
                <div className="w-16 h-16 bg-gold-50 dark:bg-gold-900/20 border-2 border-gold-200 dark:border-gold-800 rounded-2xl flex items-center justify-center group-hover:bg-gold-600 group-hover:border-gold-600 transition-all duration-300 mx-auto">
                  <Icon className="w-7 h-7 text-gold-600 group-hover:text-white transition-colors" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-obsidian-900 dark:bg-obsidian-700 text-white text-xs font-mono font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-obsidian-900">
                  {step.slice(1)}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-obsidian-500 dark:text-obsidian-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
