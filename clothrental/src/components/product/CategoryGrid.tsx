import Link from 'next/link';

const categories = [
  { name: 'Gowns', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', count: '12 pieces' },
  { name: 'Suits', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop', count: '8 pieces' },
  { name: 'Dresses', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop', count: '15 pieces' },
  { name: 'Traditional', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop', count: '6 pieces' },
];

export function CategoryGrid() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold-600 text-sm font-medium uppercase tracking-widest mb-3">Shop by Category</p>
          <h2 className="section-title">Find Your Style</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/catalog?category=${cat.name}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-obsidian-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-xl font-semibold text-white">{cat.name}</h3>
                <p className="text-gold-300 text-sm mt-0.5">{cat.count}</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
