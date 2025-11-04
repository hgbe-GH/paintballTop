export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
        Bienvenue sur PaintballTop
      </h1>
      <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        Préparez votre prochaine aventure paintball avec notre site optimisé pour GitHub Pages et Next.js 14.
      </p>
      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <article style={{ padding: '1.5rem', borderRadius: '0.75rem', background: '#0f172a', color: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Organisation simplifiée</h2>
          <p>
            Consultez les scénarios, les équipements recommandés et les règles pour vivre une expérience immersive.
          </p>
        </article>
        <article style={{ padding: '1.5rem', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5f5' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Prêt pour GitHub Pages</h2>
          <p>
            La configuration statique de Next.js facilite le déploiement sur GitHub Pages sans effort.
          </p>
        </article>
      </section>
    </main>
  );
}
