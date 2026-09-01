import Link from 'next/link';

const SAMPLE_ITEMS: { name: string; detail: string; price: string; status: 'AVAILABLE' | 'RESERVED' | 'SOLD' }[] = [
  { name: 'Vintage Nike Jacket', detail: 'Size L · Excellent', price: 'GH₵400', status: 'AVAILABLE' },
  { name: "Levi's 501", detail: 'Size 32 · Good', price: 'GH₵220', status: 'AVAILABLE' },
  { name: 'Carhartt Jacket', detail: 'Size M · Excellent', price: 'GH₵350', status: 'RESERVED' },
  { name: 'Yeezy 350', detail: 'Size 43 · Good', price: 'GH₵850', status: 'SOLD' },
];

const stampClass: Record<string, string> = {
  AVAILABLE: 'stamp-available',
  RESERVED: 'stamp-reserved',
  SOLD: 'stamp-sold',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-8">
        <span className="font-display text-[19px] italic">Cloud IMS</span>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="btn-ghost">
            Seller login
          </Link>
          <Link href="/register" className="btn-secondary">
            List your inventory
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl gap-12 px-6 pb-24 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pt-16">
        <div>
          <h1 className="font-display text-[44px] leading-[1.08] tracking-[-0.01em] sm:text-[54px]">
            Stop answering &ldquo;is this still available?&rdquo; in your DMs.
          </h1>
          <p className="mt-6 max-w-md font-sans text-[17px] leading-relaxed text-muted">
            One live inventory for everything you sell, exposed through a storefront your
            buyers can search and buy from directly. When something sells, it&rsquo;s gone —
            everywhere, instantly. No more selling the same one-of-one item twice.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/register" className="btn-primary">
              Create your storefront
            </Link>
            <Link href="/store/demo" className="btn-ghost">
              View a sample storefront
            </Link>
          </div>
        </div>

        <div className="rounded-tag border border-line bg-panel p-1">
          <div className="border-b border-line px-4 py-3 font-mono text-[12px] text-muted">
            @your-shop &mdash; inventory
          </div>
          <div className="px-4">
            {SAMPLE_ITEMS.map((item) => (
              <div key={item.name} className="ledger-row first:border-t-0">
                <div>
                  <p className="font-sans text-[15px] font-medium">{item.name}</p>
                  <p className="font-sans text-[13px] text-muted">{item.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[14px]">{item.price}</span>
                  <span className={stampClass[item.status]}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
          <p className="font-display text-[22px] italic">How it holds up under a real race condition</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[13px] text-muted">01</p>
              <p className="mt-2 font-sans text-[15px] leading-relaxed">
                A buyer places an order on an available item. It flips to reserved immediately —
                before any payment exists.
              </p>
            </div>
            <div>
              <p className="font-mono text-[13px] text-muted">02</p>
              <p className="mt-2 font-sans text-[15px] leading-relaxed">
                A second buyer tries to order the same item seconds later. The storefront
                already shows it&rsquo;s gone.
              </p>
            </div>
            <div>
              <p className="font-mono text-[13px] text-muted">03</p>
              <p className="mt-2 font-sans text-[15px] leading-relaxed">
                You confirm, then mark it complete when payment lands. One item, one buyer,
                every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10 font-sans text-[13px] text-muted sm:px-8">
        Cloud IMS — a CSBC 252 cloud computing capstone.
      </footer>
    </main>
  );
}
