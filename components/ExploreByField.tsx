import Link from 'next/link';
import { Container } from '@/components/Container';

const categoryIcons: { [key: string]: string } = {
  'Επιχειρήσεις & Χρηματοοικονομικά': '💼',
  'Ενέργεια & Περιβάλλον': '🌿',
  'Δημόσια Υπηρεσία & Κυβέρνηση': '🏛️',
  'Τεχνολογία & Πληροφορική': '💻',
  'Φιλοξενία & Τουρισμός': '✈️',
  'Ακίνητα & Κατασκευές': '🏗️',
};

export function ExploreByField({ categories }: { categories: any[] }) {
  return (
    <section id="explore-by-field" className="bg-gray-50 py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Εξερευνήστε ανά τομέα
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Βρείτε το εργασιακό προφίλ που σας ταιριάζει, εξερευνώντας ανά τομέα ενδιαφέροντος.
          </p>
        </div>
        <div className="mx-auto mt-16 grid grid-cols-2 gap-4 text-center sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.category}
              href={`/job-profiles?category=${encodeURIComponent(category.category)}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-4xl">{categoryIcons[category.category] || '📁'}</span>
              <h3 className="mt-4 font-semibold text-gray-900">{category.category}</h3>
              <p className="mt-1 text-sm text-gray-500">{category.count} προφίλ</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
