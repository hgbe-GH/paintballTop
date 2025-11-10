import { ReservationForm } from './components/reservation-form';

const highlights = [
  { value: '5 terrains', label: 'scénarisés au cœur de la garrigue' },
  { value: '15 ans', label: 'd’encadrement paintball & gellyball' },
  { value: '24 joueurs', label: 'gérés simultanément par nos arbitres' },
  { value: '20 min', label: 'de Marseille — accès A55 & parking' },
const highlights = [
  { value: '4 hectares', label: 'de terrain boisé et modulable' },
  { value: '12 scénarios', label: 'inspirés des opérations tactiques' },
  { value: '7j/7', label: 'sur réservation pour groupes & entreprises' },
];

const features = [
  {
    title: 'Staff certifié & briefing tactique',
    description:
      'Chaque session démarre par un briefing sécurité personnalisé, un échauffement progressif et un arbitre dédié qui anime vos missions.',
    badge: 'Encadrement pro',
  },
  {
    title: 'Équipements premium inclus',
    description:
      'Masques anti-buée, lanceurs dernière génération, combinaisons intégrales et protections de cou sont préparés et désinfectés avant votre arrivée.',
    badge: 'Matériel entretenu',
  },
  {
    title: 'Expériences pour tous',
    description:
      'Paintball classique ou Gellyball à faible impact dès 8 ans, scénarios adaptés aux anniversaires, EVG/EVJF, entreprises et associations.',
    badge: 'Dès 8 ans',
  },
  {
    title: 'Espace chill & traiteur',
    description:
      'Terrasse ombragée, boissons fraîches, jeux en libre accès et possibilité de privatiser un espace repas avec traiteur partenaire.',
    badge: 'Options sur mesure',
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
    name: 'Découverte',
    price: '20 € / joueur',
    details: ['120 billes incluses', '2 h sur 5 terrains', 'Briefing complet + arbitre'],
    highlight: 'Idéal première partie',
  },
  {
    name: 'Méditerranée',
    price: '25 € / joueur',
    details: ['200 billes incluses', 'Missions tactiques avancées', 'Pause boisson offerte'],
    highlight: 'Best-seller',
  },
  {
    name: 'Punisher',
    price: '35 € / joueur',
    details: ['450 billes incluses', 'Accès nocturne sur devis', 'Options fumigènes & coaching'],
    highlight: 'Équipes expertes',
  },
  {
    name: 'Tout public (dès 8 ans)',
    price: '18 € / joueur',
    details: ['Gellyball à faible impact', '90 min encadrées', 'Matériel léger adapté enfants'],
    highlight: 'Familles & scolaires',
  },
  {
    name: 'Link Ranger',
    price: '18 € / joueur',
    details: ['Parcours immersif thématisé', 'Version Paintball ou Orbeez', 'Briefing sécurité VIP'],
    highlight: 'Expérience signature',
  },
];

const addons = [
  { name: 'Recharge +100 billes', price: '6 €', description: 'Ajoutez 100 billes supplémentaires pour prolonger la mission.' },
  { name: 'Combinaison intégrale tissu', price: '4 €', description: 'Protection optimale pour les sessions intensives.' },
  { name: 'Gants coqués', price: '2,50 €', description: 'Renforcez l’adhérence et la protection de vos mains.' },
  { name: 'Nocturne (>=20h) / pers', price: '4 €', description: 'Illumination scénographique et bande-son sur-mesure.' },
  { name: 'Costume de lapin', price: '25 €', description: 'Incontournable pour les EVG/EVJF et défis fun.' },
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
    title: 'Matinée adrénaline',
    slots: '09h00 — 12h00',
    description: 'Températures douces, briefing prolongé et missions évolutives pour lancer la journée.',
  },
  {
    title: 'Après-midi dynamique',
    slots: '14h00 — 17h00',
    description: 'Ambiance conviviale, playlists motivantes et rotations rapides entre les terrains.',
  },
  {
    title: 'Nocturne privée',
    slots: 'Sur devis',
    description: 'Lumières LED, fumigènes et scénario exclusif pour team building ou anniversaires adultes.',
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
      'Organisation millimétrée pour notre séminaire : briefing clair, matériel nickel et staff hyper réactif. Les équipes en redemandent déjà !',
    name: 'Marion P.',
    role: 'Directrice RH — Agence MedCom',
  },
  {
    quote:
      'Un anniversaire d’enfants réussi grâce au Gellyball. L’équipe encadre tout, les parents peuvent profiter de la terrasse ombragée.',
    name: 'Olivier D.',
    role: 'Parent',
  },
  {
    quote:
      'Les nocturnes sont incroyables : lumières, musique et missions en mode infiltration. On reviendra avec tout le club.',
    name: 'Sonia L.',
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
    question: 'Quel est le nombre minimum de joueurs ?',
    answer:
      'Nous accueillons les groupes à partir de 4 joueurs. Pour privatiser un terrain, comptez 8 joueurs minimum ou un forfait spécifique.',
  },
  {
    question: 'Peut-on mixer paintball et gellyball ?',
    answer:
      'Oui, nous proposons des parcours Link Ranger déclinés en version Paintball ou Orbeez (Gellyball) pour alterner les intensités sur la même demi-journée.',
  },
  {
    question: 'Comment fonctionne le dépôt ?',
    answer:
      'Un acompte en ligne sécurisé est demandé après validation du créneau par notre équipe. Le solde se règle sur place (CB ou espèces).',
  },
  {
    question: 'Y a-t-il des espaces pour se restaurer ?',
    answer:
      'Un espace chill ombragé avec boissons fraîches est inclus. Sur demande, nous pouvons réserver un traiteur partenaire ou mettre à disposition un espace barbecue.',
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
          <span className="navbar__brand">Paintball Méditerranée</span>
          <span className="navbar__brand">PaintballTop</span>
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
              <span className="hero__eyebrow">Route des Pins — Marseille</span>
              <h1 className="hero__title">Terrain paintball & gellyball nouvelle génération</h1>
              <p className="hero__description">
                À 20 minutes de Marseille, Paintball Méditerranée vous accueille sur 5 hectares scénarisés entre garrigue et pinède.
                Briefings tactiques, équipements premium et ambiance survoltée sont inclus pour chaque session.
              </p>
              <div className="hero__actions">
                <a className="button-primary" href="#reservation">
                  Ouvrir la réservation
                </a>
                <a className="button-secondary" href="#tarifs">
                  Consulter les forfaits
                </a>
              </div>
            </div>
            <div className="grid" style={{ gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {highlights.map((item) => (
                <div key={item.label} className="highlight">
                  <strong style={{ fontSize: '1.35rem' }}>{item.value}</strong>
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
              <span className="section__eyebrow">Immersion garantie</span>
              <h2 className="section__title">Une équipe dédiée à vos missions outdoor</h2>
              <p className="section__description">
                Du briefing sécurité jusqu’au retour au calme, nos arbitres passionnés orchestrent des scénarios adaptés à votre groupe.
                Nous fournissons l’équipement complet, un espace chill ombragé et des options à la carte pour sublimer votre événement.
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
              <span className="section__eyebrow">Forfaits 2 h</span>
              <h2 className="section__title">Choisissez votre scénario</h2>
              <p className="section__description">
                Toutes nos formules incluent le briefing tactique, l’arbitrage professionnel et l’accès à nos 5 terrains thématiques.
                Les billes supplémentaires et options peuvent être ajoutées à tout moment.
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
                    Demander ce forfait
                    Réserver cette formule
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
                Composez un événement unique : rechargez vos billes, ajoutez un costume fun ou transformez votre session en nocturne scénarisée.
              </p>
            </div>
            <div className="options-grid">
              {addons.map((addon) => (
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

        <section className="section" id="reservation">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Réserver</span>
              <h2 className="section__title">Bloquez votre créneau en 2 minutes</h2>
              <p className="section__description">
                Remplissez le formulaire ci-dessous : notre équipe confirme la disponibilité sous 24h ouvrées et vous envoie, si nécessaire, le lien d’acompte sécurisé.
              </p>
            </div>
            <ReservationForm />
          </div>
        </section>

        <section className="section" id="disponibilites">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Créneaux</span>
              <h2 className="section__title">Des sessions adaptées à votre rythme</h2>
              <p className="section__description">
                Nous ouvrons le terrain 7j/7 sur réservation. Les créneaux ci-dessous sont les plus demandés ; contactez-nous pour une privatisation sur-mesure.
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
                Agenda mis à jour quotidiennement. Prévenez-nous dès que possible pour les nocturnes et les groupes de plus de 20 joueurs.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="plan">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Accès</span>
              <h2 className="section__title">Route des Pins — Domaine Chez Paulette</h2>
              <p className="section__description">
                Rejoignez-nous facilement depuis Marseille, Vitrolles ou Marignane. Parking gratuit à 100 m, piste cyclable dédiée et covoiturage encouragé.
              </p>
            </div>
            <div className="map-block">
              <iframe
                title="Localisation de Paintball Méditerranée"
                src="https://maps.google.com/maps?q=43.36,5.347&z=15&output=embed"
                loading="lazy"
                allowFullScreen
              />
              <div className="map-actions">
                <a className="button-primary" href="https://www.google.com/maps/dir/?api=1&destination=43.36,5.347" target="_blank" rel="noopener noreferrer">
                  Itinéraire Google Maps
                </a>
                <a className="button-secondary" href="https://waze.com/ul?ll=43.36,5.347&navigate=yes" target="_blank" rel="noopener noreferrer">
                  Itinéraire Waze
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
              <span className="section__eyebrow">Avis</span>
              <h2 className="section__title">Ils recommandent Paintball Méditerranée</h2>
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
              <span className="section__eyebrow">Contact</span>
              <h2 className="section__title">Coordonnées & infos pratiques</h2>
              <p className="section__description">
                Notre équipe est joignable 7j/7 pour préparer votre événement, privatiser un créneau ou organiser un devis sur-mesure.
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
                  <span>Paintball Méditerranée</span>
                  <span>Route des Pins — Domaine Chez Paulette</span>
                  <span>13000 Marseille</span>
                  <a href="tel:+33442000000">+33 4 42 00 00 00</a>
                  <a href="mailto:contact@paintball-med.com">contact@paintball-med.com</a>
                </address>
              </div>
              <div className="contact-card">
                <h3>Horaires</h3>
                <address>
                  <span>Lundi au vendredi : 09h00 — 18h00</span>
                  <span>Samedi : 09h00 — 19h00</span>
                  <span>Dimanche : 10h00 — 17h00 (sur réservation)</span>
                </address>
              </div>
              <div className="contact-card">
                <h3>Réservations & dépôt</h3>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.8 }}>
                  Après confirmation, un lien d’acompte sécurisé vous est transmis. Le solde est à régler sur place par carte ou espèces.
                  Besoin d’un devis entreprise ? Envoyez-nous vos contraintes (nombre de joueurs, durée, traiteur) pour une réponse sous 24h.
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
            © {new Date().getFullYear()} Paintball Méditerranée. Tous droits réservés — Siret fictif 000 000 000 00000 — activités de loisirs sportifs.
          </p>
          <div className="footer__links">
            <a href="#faq">Questions fréquentes</a>
            <a href="mailto:contact@paintball-med.com">Nous écrire</a>
            <a href="#reservation">Réserver</a>
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
