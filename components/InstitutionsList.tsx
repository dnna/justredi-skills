import { Container } from '@/components/Container';

export function InstitutionsList({ institutions }: { institutions: any[] }) {
  return (
    <section className="bg-gray-50 py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Οι Συνεργάτες μας
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Συνεργαζόμαστε με κορυφαία εκπαιδευτικά ιδρύματα της Ελλάδας για να σας προσφέρουμε τις
            καλύτερες μαθησιακές ευκαιρίες.
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root">
          <div className="-ml-8 -mt-4 flex flex-wrap justify-center lg:-ml-4">
            {institutions.map((institution) => (
              <div
                key={institution.id}
                className="ml-8 mt-4 flex flex-shrink-0 flex-grow items-center justify-center lg:ml-4 lg:flex-grow-0"
              >
                {institution.logo_url ? (
                  <img className="h-12" src={institution.logo_url} alt={institution.name} />
                ) : (
                  <p className="text-center font-medium text-gray-700">{institution.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
