import { ReservationForm } from './components/reservation-form';

const highlights = [
  { value: 'Montpellier', label: '140 passage Charles Tillon' },
  { value: '8 joueurs', label: 'minimum par session' },
  { value: 'Jusqu’à 2 h', label: 'de jeu en calibre .50' },
  { value: 'Cadre boisé', label: 'buvette, pétanque & molky' },
];

const features = [
  {
    title: 'Encadrement passionné',
    description:
      'Briefing sécurité, scénarios adaptés et arbitre dédié pour chaque groupe. Tommy et l’équipe veillent à votre confort du début à la fin.',
    badge: 'Staff sur place',
  },
  {
    title: 'Équipement complet inclus',
    description:
      'Casques, lanceurs, plastrons, tours de cou et vestes dédiées aux femmes et enfants (-14 ans) sont fournis. Un sweat-shirt et une paire de gants suffisent.',
    badge: 'Prêt à jouer',
  },
  {
    title: 'Expériences sur mesure',
    description:
      'Paintball classique, gellyball et formules Link Ranger dès 8 ans. Forfaits adaptés aux EVG/EVJF, anniversaires, entreprises et sorties scolaires.',
    badge: 'Dès 8 ans',
  },
  {
    title: 'Accueil convivial',
    description:
      'Cadre boisé en lisière de rivière avec buvette, pétanque, fléchettes, molky et espace chill pour profiter entre les parties.',
    badge: 'Esprit club',
  },
];

const paintballPackages = [
  {
    name: 'Découverte',
    price: '20 € / joueur',
    details: ['120 billes incluses', 'Jusqu’à 2 h de session', 'Briefing & arbitre dédiés'],
    highlight: 'Idéal pour débuter',
  },
  {
    name: 'Méditerranée',
    price: '25 € / joueur',
    details: ['200 billes incluses', 'Jusqu’à 2 h de session', 'Ambiance scénarisée'],
    highlight: 'Classique',
  },
  {
    name: 'Player',
    price: '30 € / joueur',
    details: ['300 billes incluses', 'Jusqu’à 2 h de session', 'Cadence soutenue'],
    highlight: 'Pour joueurs réguliers',
  },
  {
    name: 'Punisher (promo été)',
    price: '35 € / joueur',
    details: ['450 billes incluses', 'Jusqu’à 2 h de session', 'Idéal pour les gros volumes'],
    highlight: 'Best-seller été',
  },
  {
    name: 'Expendables',
    price: '45 € / joueur',
    details: ['600 billes incluses', 'Jusqu’à 2 h de session', 'Sessions longues & intensives'],
    highlight: 'Équipe survoltée',
  },
];

const extras = [
  { name: 'Recharge +100 billes', price: '6 €', description: 'Ajoutez 100 billes pour prolonger la session.' },
  { name: 'Combinaison intégrale tissu', price: '4 €', description: 'Protection intégrale pour plonger dans l’action.' },
  { name: 'Gants coqués', price: '2,50 €', description: 'Renforcez la prise en main et la protection des mains.' },
  { name: 'Costume de lapin', price: '25 €', description: 'Accessoire parfait pour les défis EVG/EVJF.' },
  { name: 'Nocturne (dès 20h00) / joueur', price: '+4 €', description: 'Ambiance nocturne immersive sur réservation.', },
];

const publicBundles = [
  {
    name: 'Forfait tout public',
    price: '18 € / personne',
    details: ['Paintball dès 8 ans', 'Paintball ou gellyball au choix', 'Encadrement adapté aux plus jeunes'],
    highlight: 'Familles & écoles',
  },
];

const linkRangerOptions = [
  {
    name: 'Paintball Link Ranger',
    price: '18 € / personne',
    details: ['120 billes', 'Jusqu’à 1 h 30 de jeu', 'Recharge +100 billes : 6 €'],
    highlight: 'Scénario immersif',
  },
  {
    name: 'Orbeez Link Ranger',
    price: '18 € / personne',
    details: ['1 600 billes Orbeez', 'Jusqu’à 1 h de jeu', 'Impact ultra léger'],
    highlight: 'Dès 8 ans',
  },
];

const equipmentIncluded = [
  'Casque & masque de protection',
  'Lanceur paintball calibré .50',
  'Plastron & tour de cou',
  'Veste pour les femmes et enfants de moins de 14 ans',
  'Briefing sécurité + arbitre dédié',
  'Conseils tenue : sweat-shirt & gants suffisent',
];

const convivialities = [
  {
    title: 'Buvette & pause fraîcheur',
    description: 'Boissons fraîches et snacks pour récupérer entre deux scénarios.',
  },
  {
    title: 'Jeux d’extérieur',
    description: 'Pétanque, fléchettes, molky et espaces chill à partager.',
  },
  {
    title: 'Parking & covoiturage',
    description: 'Petit parking privé à 100 m : pensez au covoiturage pour la planète.',
  },
];

const schedule = [
  {
    title: 'Sessions journée',
    slots: '09h00 – 20h00 sur réservation',
    description: 'Créneaux planifiés par tranche de 2 h selon la disponibilité de votre groupe.',
  },
  {
    title: 'Nocturne',
    slots: 'Dès 20h00 (+4 € / joueur)',
    description: 'Illuminations et ambiance sonore pour prolonger la soirée.',
  },
  {
    title: 'Groupes & privatisations',
    slots: 'À partir de 8 joueurs',
    description: 'EVG, EVJF, anniversaires, team building : contactez-nous pour un devis personnalisé.',
  },
];

const faqs = [
  {
    question: 'Combien de joueurs faut-il pour réserver ?',
    answer:
      'Les sessions sont ouvertes à partir de 8 joueurs. En dessous, les places manquantes sont facturées 25 € / personne pour privatiser le terrain.',
  },
  {
    question: 'Que comprend l’acompte ?',
    answer:
      'Pour valider votre créneau, déposez un acompte sécurisé sur https://www.paintballmediterranee.com/produit.php?id_prod=1. Il est restitué sur place le jour J.',
  },
  {
    question: 'Que dois-je apporter ?',
    answer:
      'Prévoyez une tenue adaptée : chaussures fermées, vêtements confortables et éventuellement un sweat-shirt. Le reste de l’équipement est fourni.',
  },
  {
    question: 'Comment nous rejoindre ?',
    answer:
      'Rendez-vous 140 passage Charles Tillon, 34070 Montpellier. Depuis le rond-point de Chez Paulette, prenez la piste cyclable : parking à 100 m sur la droite. Merci d’arriver 5 minutes avant.',
  },
];

export default function HomePage() {
  return (
    <div className="page">
      <header className="navbar">
        <div className="navbar__inner">
          <span className="navbar__brand">Paintball Méditerranée Montpellier</span>
          <nav aria-label="Navigation principale">
            <ul className="navbar__links">
              <li>
                <a href="#experience">Expérience</a>
              </li>
              <li>
                <a href="#tarifs">Forfaits</a>
              </li>
              <li>
                <a href="#options">Options</a>
              </li>
              <li>
                <a href="#reservation">Réservation</a>
              </li>
              <li>
                <a href="#plan">Accès</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
          <a className="navbar__cta" href="tel:+33623735002">
            Appeler Tommy
          <a className="navbar__cta" href="#reservation">
            Réserver
          </a>
        </div>
      </header>

      <main id="contenu-principal">
        <section className="hero" id="accueil">
          <div className="hero__inner">
            <div className="hero__content">
              <span className="hero__eyebrow">Paintball & Gellyball — Montpellier</span>
              <h1 className="hero__title">Sessions paintball immersives en pleine nature</h1>
              <p className="hero__description">
                À 140 passage Charles Tillon, Paintball Méditerranée vous accueille dans un cadre boisé en bord de rivière.
                Forfaits adaptés à tous les niveaux, encadrement passionné et ambiance conviviale avant, pendant et après vos parties.
              </p>
              <div className="hero__actions">
                <a className="button-primary" href="#reservation">
                  Demander une date
                </a>
                <a className="button-secondary" href="https://www.paintballmediterranee.com/produit.php?id_prod=1" target="_blank" rel="noopener noreferrer">
                  Déposer l’acompte
                </a>
              </div>
            </div>
            <div className="grid" style={{ gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {highlights.map((item) => (
                <div key={item.label} className="highlight">
                  <strong style={{ fontSize: '1.35rem' }}>{item.value}</strong>
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="experience">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Immersion garantie</span>
              <h2 className="section__title">Une équipe locale pour des missions inoubliables</h2>
              <p className="section__description">
                Briefing sécurité, scénarios fun et encadrement attentionné : tout est pensé pour que votre groupe profite de 2 heures d’action en toute sérénité.
                Nos terrains accueillent anniversaires, EVG/EVJF, entreprises et sorties en famille dès 8 ans.
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
              <span className="section__eyebrow">Nos forfaits Paintball</span>
              <h2 className="section__title">Jusqu’à 2 h de session — billes incluses</h2>
              <p className="section__description">
                Toutes les formules incluent le matériel complet, le briefing sécurité, l’arbitre dédié et l’accès à nos terrains scénarisés.
                Les recharges et options s’ajoutent facilement selon l’ambiance recherchée.
              </p>
            </div>
            <div className="grid pricing-grid">
              {paintballPackages.map((pack) => (
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
                    Réserver ce forfait
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="tout-public-title">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Dès 8 ans</span>
              <h2 id="tout-public-title" className="section__title">Forfaits paintball tout public 18 € / personne</h2>
              <p className="section__description">
                Le plaisir du paintball ou du gellyball en version accessible aux plus jeunes : parfait pour les anniversaires, sorties scolaires ou moments en famille.
              </p>
            </div>
            <div className="grid pricing-grid">
              {publicBundles.map((bundle) => (
                <article key={bundle.name} className="pricing-card">
                  <span className="pricing-card__badge">{bundle.highlight}</span>
                  <h3>{bundle.name}</h3>
                  <p className="pricing-card__price">{bundle.price}</p>
                  <ul>
                    {bundle.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <a className="button-secondary" href="#reservation">
                    Demander ce format
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="link-ranger-title">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Les Link Ranger</span>
              <h2 id="link-ranger-title" className="section__title">Forfaits Link Ranger — 18 € / personne</h2>
              <p className="section__description">
                Deux expériences immersives inspirées de l’univers Link Ranger : choisissez le paintball ou l’Orbeez (gellyball) pour varier les sensations.
              </p>
            </div>
            <div className="grid pricing-grid">
              {linkRangerOptions.map((option) => (
                <article key={option.name} className="pricing-card">
                  <span className="pricing-card__badge">{option.highlight}</span>
                  <h3>{option.name}</h3>
                  <p className="pricing-card__price">{option.price}</p>
                  <ul>
                    {option.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <a className="button-secondary" href="#reservation">
                    Réserver une session Link Ranger
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="options">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Options à la carte</span>
              <h2 className="section__title">Boostez votre expérience</h2>
              <p className="section__description">
                Complétez votre session avec des recharges de billes, accessoires fun ou ambiance nocturne pour un souvenir inoubliable.
              </p>
            </div>
            <div className="options-grid">
              {extras.map((addon) => (
                <article key={addon.name} className="option-card">
                  <div>
                    <h3>{addon.name}</h3>
                    <p>{addon.description}</p>
                  </div>
                  <span>{addon.price}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="equipement-title">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Inclus dans tous les forfaits</span>
              <h2 id="equipement-title" className="section__title">Équipement & sécurité</h2>
              <p className="section__description">
                Tout est prêt à votre arrivée. Il ne vous reste qu’à enfiler une tenue confortable et profiter du briefing pour plonger dans l’action.
              </p>
            </div>
            <ul className="equipment-list">
              {equipmentIncluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" aria-labelledby="convivial-title">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Avant & après la partie</span>
              <h2 id="convivial-title" className="section__title">Profitez du cadre convivial</h2>
              <p className="section__description">
                Nous vous accueillons en lisière de rivière dans un cadre ombragé où toute l’équipe peut se retrouver avant et après les parties.
              </p>
            </div>
            <div className="grid features-grid">
              {convivialities.map((item) => (
                <article key={item.title} className="feature-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="reservation">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Réserver</span>
              <h2 className="section__title">Bloquez votre créneau en 2 minutes</h2>
              <p className="section__description">
                Remplissez le formulaire pour nous indiquer la date souhaitée, le nombre de joueurs et vos envies. Nous répondons sous 24 h et vous invitons à déposer l’acompte sécurisé pour confirmer.
              </p>
            </div>
            <ReservationForm />
          </div>
        </section>

        <section className="section" id="disponibilites">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Créneaux</span>
              <h2 className="section__title">Des sessions adaptées à votre groupe</h2>
              <p className="section__description">
                Les plannings sont ajustés selon vos disponibilités. Pensez à nous prévenir au plus tôt pour les nocturnes et les grands groupes.
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
                Merci d’arriver 5 minutes avant le début de la session pour finaliser l’équipement et le briefing.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="plan">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Accès</span>
              <h2 className="section__title">140 passage Charles Tillon — Montpellier</h2>
              <p className="section__description">
                Au rond-point de Chez Paulette, prenez la piste cyclable : notre parking se trouve 100 m plus loin sur la droite. Waze vous guide jusqu’aux portes du terrain.
              </p>
            </div>
            <div className="map-block">
              <iframe
                title="Localisation de Paintball Méditerranée à Montpellier"
                src="https://www.google.com/maps?q=140+Passage+Charles+Tillon,+34070+Montpellier&z=16&output=embed"
                loading="lazy"
                allowFullScreen
              />
              <div className="map-actions">
                <a
                  className="button-primary"
                  href="https://www.google.com/maps/dir/?api=1&destination=140%20Passage%20Charles%20Tillon%2C%2034070%20Montpellier"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Itinéraire Google Maps
                </a>
                <a
                  className="button-secondary"
                  href="https://waze.com/ul?ll=43.59341,3.84509&navigate=yes"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Itinéraire Waze
                </a>
              </div>
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
              <span className="section__eyebrow">Contact</span>
              <h2 className="section__title">Belle journée — Tommy vous répond</h2>
              <p className="section__description">
                Appelez ou envoyez un message pour organiser votre venue. Pensez au covoiturage, la planète vous dira merci !
              </p>
            </div>
            <div className="contact-grid">
              <div className="contact-card">
                <h3>Coordonnées</h3>
                <address>
                  <span>Paintball Méditerranée</span>
                  <span>140 passage Charles Tillon</span>
                  <span>34070 Montpellier</span>
                  <span>Tommy — Responsable terrain</span>
                  <a href="tel:+33623735002">06 23 73 50 02</a>
                  <a href="mailto:contact@paintballmediterranee.com">contact@paintballmediterranee.com</a>
                </address>
              </div>
              <div className="contact-card">
                <h3>Avant votre venue</h3>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.8 }}>
                  Merci d’arriver 5 minutes avant l’heure de rendez-vous pour l’équipement. Sessions à partir de 8 joueurs, les places manquantes sont facturées 25 € / personne.
                </p>
              </div>
              <div className="contact-card">
                <h3>Acompte & règlement</h3>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.8 }}>
                  Déposez votre acompte sécurisé en ligne :
                  {' '}
                  <a href="https://www.paintballmediterranee.com/produit.php?id_prod=1" target="_blank" rel="noopener noreferrer">
                    https://www.paintballmediterranee.com/produit.php?id_prod=1
                  </a>
                  . Il vous sera restitué sur place le jour J.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p>
            © {new Date().getFullYear()} Paintball Méditerranée Montpellier. Tous droits réservés — Loisirs paintball & gellyball.
          </p>
          <div className="footer__links">
            <a href="#faq">Questions fréquentes</a>
            <a href="mailto:contact@paintballmediterranee.com">Nous écrire</a>
            <a href="#reservation">Réserver</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
