const highlights = [
  { value: '4 hectares', label: 'de terrain boisé et modulable' },
  { value: '12 scénarios', label: 'inspirés des opérations tactiques' },
  { value: '7j/7', label: 'sur réservation pour groupes & entreprises' },
];

const features = [
  {
    title: 'Encadrement professionnel',
    description:
      'Animateurs diplômés, briefing sécurité personnalisé et suivi de partie pour garantir une expérience intense mais accessible à tous.',
    badge: 'Briefing & coaching inclus',
  },
  {
    title: 'Équipements premium',
    description:
      'Combinaisons, masques anti-buée, gants renforcés et lanceurs dernière génération préparés avant votre arrivée.',
    badge: 'Hygiène & entretien rigoureux',
  },
  {
    title: 'Scénarios immersifs',
    description:
      'Capture de drapeau, escorte de VIP, domination de zone ou battle royale : adaptez chaque partie à votre groupe.',
    badge: 'Adapté débutants & confirmés',
  },
  {
    title: 'Zone chill & restauration',
    description:
      'Espace ombragé avec boissons fraîches, tables pour anniversaires et possibilité de traiteur partenaire sur demande.',
    badge: 'Options sur-mesure',
  },
];

const packages = [
  {
    name: 'Escarmouche',
    price: '29€ / joueur',
    details: ['200 billes incluses', 'Session de 2 heures', 'Briefing sécurité + coach', 'Photos souvenir offertes'],
    highlight: 'Idéal découverte',
  },
  {
    name: 'Offensive',
    price: '39€ / joueur',
    details: [
      '350 billes incluses',
      'Session de 3 heures',
      'Accès scénarios exclusifs',
      'Réservations groupes prioritaires',
    ],
    highlight: 'Best-seller',
  },
  {
    name: 'Élite',
    price: '55€ / joueur',
    details: ['500 billes incluses', 'Session illimitée sur la journée', 'Animateur dédié', 'Options fumigènes & props'],
    highlight: 'Team building',
  },
];

const schedule = [
  {
    title: 'Sessions matinales',
    slots: '09h00 — 12h00',
    description: 'Parfait pour profiter de la fraîcheur et commencer la journée avec une dose d’adrénaline.',
  },
  {
    title: 'Sessions après-midi',
    slots: '14h00 — 17h00',
    description: 'Ambiance dynamique avec soleil couchant, idéale pour les groupes d’amis et EVJF/EVG.',
  },
  {
    title: 'Nocturnes privées',
    slots: 'Sur devis',
    description: 'Éclairage scénographique, musique et scénarios exclusifs pour vos événements d’entreprise.',
  },
];

const testimonials = [
  {
    quote:
      'Une équipe au top ! Nous avons organisé un team building pour 35 personnes, tout était millimétré : brief, matériel, scénarios personnalisés… On revient l’année prochaine.',
    name: 'Élodie R.',
    role: 'Responsable RH — TechWave',
  },
  {
    quote:
      'Super organisation pour l’anniversaire de notre fils. Les encadrants ont su mettre les enfants en confiance et l’espace chill permettait aux parents de profiter.',
    name: 'Karim B.',
    role: 'Parent heureux',
  },
  {
    quote:
      'Des sensations incroyables ! Les scénarios sont variés et l’équipe nous laisse personnaliser les parties selon nos envies. Mention spéciale pour les nocturnes.',
    name: 'Maëva G.',
    role: 'Capitaine d’équipe amateur',
  },
];

const faqs = [
  {
    question: 'Peut-on jouer si l’on n’a jamais fait de paintball ?',
    answer:
      'Bien sûr ! Chaque session débute par un briefing sécurité complet et des premiers scénarios d’échauffement adaptés aux débutants. Nos animateurs restent présents sur le terrain pour accompagner le groupe.',
  },
  {
    question: 'Quels équipements sont fournis ?',
    answer:
      'Chaque joueur dispose d’un lanceur, d’un masque anti-buée, d’une combinaison, de protections de cou et de gants. Les forfaits incluent un quota de billes et vous pouvez en racheter sur place.',
  },
  {
    question: 'Comment réserver et payer ?',
    answer:
      'Réservez en ligne via notre agenda ou contactez-nous par téléphone. Un acompte sécurisé par carte est demandé pour bloquer le créneau et le solde se règle sur place le jour J.',
  },
  {
    question: 'Y a-t-il un minimum de participants ?',
    answer:
      'Les sessions privées sont possibles dès 8 joueurs. Nous pouvons vous intégrer à un autre groupe pour les petits effectifs, contactez-nous pour connaître les disponibilités.',
  },
];

export default function HomePage() {
  return (
    <div className="page">
      <header className="navbar">
        <div className="navbar__inner">
          <span className="navbar__brand">PaintballTop</span>
          <nav aria-label="Navigation principale">
            <ul className="navbar__links">
              <li>
                <a href="#experience">Expérience</a>
              </li>
              <li>
                <a href="#tarifs">Tarifs</a>
              </li>
              <li>
                <a href="#disponibilites">Disponibilités</a>
              </li>
              <li>
                <a href="#temoignages">Avis</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
          <a className="navbar__cta" href="#reservation">
            Réserver
          </a>
        </div>
      </header>

      <main id="contenu-principal">
        <section className="hero" id="accueil">
          <div className="hero__inner">
            <div className="hero__content">
              <span className="hero__eyebrow">Paintball en Méditerranée</span>
              <h1 className="hero__title">
                L’expérience paintball premium pour vos équipes et vos amis
              </h1>
              <p className="hero__description">
                À deux pas de Montpellier, PaintballTop vous accueille sur un terrain de plusieurs hectares, scénarisé et sécurisé,
                pour des sessions intenses du lever du soleil jusqu’aux nocturnes privées.
              </p>
              <div className="hero__actions">
                <a className="button-primary" href="#reservation">
                  Voir les disponibilités
                </a>
                <a className="button-secondary" href="#tarifs">
                  Découvrir nos formules
                </a>
              </div>
            </div>
            <div className="grid" style={{ gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {highlights.map((item) => (
                <div key={item.label} className="highlight">
                  <strong style={{ fontSize: '1.4rem' }}>{item.value}</strong>
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="experience">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Immersion totale</span>
              <h2 className="section__title">Un terrain pensé pour l’adrénaline et la cohésion</h2>
              <p className="section__description">
                Que vous organisiez un anniversaire, un EVG/EVJF ou un séminaire, nos infrastructures et notre staff s’occupent de tout :
                briefing sécurité, équipement complet, scénarios adaptés et suivi personnalisé.
              </p>
            </div>
            <div className="grid features-grid">
              {features.map((feature) => (
                <article key={feature.title} className="feature-card">
                  <span className="feature-card__badge">{feature.badge}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="tarifs">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Formules</span>
              <h2 className="section__title">Des packs flexibles pour chaque type de groupe</h2>
              <p className="section__description">
                Sélectionnez la formule qui correspond à votre événement. Toutes incluent l’encadrement, l’équipement complet et
                un quota de billes. Options supplémentaires disponibles sur simple demande.
              </p>
            </div>
            <div className="grid pricing-grid">
              {packages.map((pack) => (
                <article key={pack.name} className="pricing-card">
                  <span className="pricing-card__badge">{pack.highlight}</span>
                  <h3>{pack.name}</h3>
                  <p className="pricing-card__price">{pack.price}</p>
                  <ul>
                    {pack.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <a className="button-primary" href="#reservation">
                    Réserver cette formule
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="disponibilites">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Planifiez</span>
              <h2 className="section__title">Choisissez votre créneau idéal</h2>
              <p className="section__description">
                Nos sessions se remplissent rapidement les week-ends. Consultez les créneaux ci-dessous et contactez-nous pour
                verrouiller votre réservation. Un conseiller vous guidera dans les 24h.
              </p>
            </div>
            <div className="schedule" aria-label="Créneaux disponibles">
              <div className="schedule__grid">
                {schedule.map((item) => (
                  <div key={item.title} className="schedule__card">
                    <strong>{item.title}</strong>
                    <span>{item.slots}</span>
                    <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>{item.description}</p>
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                Agenda mis à jour quotidiennement. Privatisations possibles en dehors de ces créneaux sur simple demande.
              </p>
            </div>
            <div className="cta-banner" id="reservation">
              <div>
                <h2 style={{ margin: '0 0 0.75rem', fontSize: '2rem' }}>Réservez votre session en quelques minutes</h2>
                <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '60ch' }}>
                  Indiquez votre date souhaitée et le nombre de participants : notre équipe confirme votre créneau par mail ou téléphone.
                </p>
              </div>
              <div className="cta-banner__actions">
                <a
                  className="button-primary"
                  href="mailto:contact@paintballtop.fr?subject=R%C3%A9servation%20PaintballTop"
                >
                  Demander un créneau
                </a>
                <a className="button-secondary" href="tel:+33400000000">
                  Nous appeler directement
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="temoignages">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Ils témoignent</span>
              <h2 className="section__title">Des joueurs conquis par l’expérience PaintballTop</h2>
            </div>
            <div className="grid testimonials">
              {testimonials.map((testimonial) => (
                <blockquote key={testimonial.name} className="testimonial">
                  <p className="testimonial__quote">“{testimonial.quote}”</p>
                  <footer className="testimonial__author">
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">FAQ</span>
              <h2 className="section__title">Questions fréquentes</h2>
            </div>
            <div className="faq">
              {faqs.map((item) => (
                <article key={item.question} className="faq__item">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Nous rencontrer</span>
              <h2 className="section__title">Contact & accès</h2>
              <p className="section__description">
                Notre terrain est situé à 20 minutes de Montpellier, facilement accessible par l’A709. Parking gratuit, vestiaires et
                douches disponibles sur place.
              </p>
            </div>
            <div className="contact-grid">
              <div className="contact-card">
                <h3>Coordonnées</h3>
                <address>
                  <span>PaintballTop</span>
                  <span>Chemin des Arènes</span>
                  <span>34920 Le Crès</span>
                  <a href="tel:+33400000000">+33 4 00 00 00 00</a>
                  <a href="mailto:contact@paintballtop.fr">contact@paintballtop.fr</a>
                </address>
              </div>
              <div className="contact-card">
                <h3>Horaires d’ouverture</h3>
                <address>
                  <span>Du lundi au dimanche</span>
                  <span>09h00 — 19h00 sur réservation</span>
                  <span>Nocturnes privées sur devis</span>
                </address>
              </div>
              <div className="contact-card">
                <h3>Préparez votre venue</h3>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.8 }}>
                  Prévoyez une tenue confortable, des chaussures fermées et une bouteille d’eau. Des vestiaires sont à votre disposition
                  pour vous changer avant et après la session.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p>
            © {new Date().getFullYear()} PaintballTop. Tous droits réservés. Siret fictif 000 000 000 00000 — activités de loisirs
            sportifs encadrés.
          </p>
          <div className="footer__links">
            <a href="#faq">Questions fréquentes</a>
            <a href="mailto:contact@paintballtop.fr">Nous écrire</a>
            <a href="#tarifs">Nos formules</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
