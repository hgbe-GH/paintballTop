'use client';

import type { FormEventHandler } from 'react';
import { useMemo, useState } from 'react';

const EMAIL = 'contact@paintballmediterranee.com';
const MIN_PLAYERS = 8;
const MAX_PLAYERS = 40;
const EMAIL = 'contact@paintball-med.com';
const MIN_PLAYERS = 4;
const MAX_PLAYERS = 24;
type Slot = 'matin' | 'apres-midi' | 'nocturne';

const emailPattern = /^(?:[A-Za-z0-9_'^&+\-])+(?:\.(?:[A-Za-z0-9_'^&+\-])+)*@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

type Status =
  | { type: 'idle'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function ReservationForm() {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [email, setEmail] = useState('');
  const [teamSize, setTeamSize] = useState<number>(8);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<Slot>('matin');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' });

  const resetForm = () => {
    setEmail('');
    setTeamSize(8);
    setDate('');
    setSlot('matin');
    setNotes('');
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!emailPattern.test(email.trim())) {
      setStatus({ type: 'error', message: 'Veuillez renseigner une adresse email valide.' });
      return;
    }

    if (Number.isNaN(teamSize) || teamSize < MIN_PLAYERS || teamSize > MAX_PLAYERS) {
      setStatus({
        type: 'error',
        message: `La réservation nécessite entre ${MIN_PLAYERS} et ${MAX_PLAYERS} joueurs.`,
      });
      return;
    }

    if (!date) {
      setStatus({ type: 'error', message: 'Merci d’indiquer la date souhaitée.' });
      return;
    }

    const selectedDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < now) {
      setStatus({ type: 'error', message: 'Choisissez une date à venir pour votre session.' });
      return;
    }

    const humanDate = selectedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const slotLabel =
      slot === 'matin'
        ? '09h00 – 12h00'
        : slot === 'apres-midi'
          ? '14h00 – 17h00'
          : 'Nocturne (sur devis)';

    const emailBody = [
      'Bonjour Paintball Méditerranée,',
      '',
      `Je souhaite réserver une session pour ${teamSize} joueurs le ${humanDate}.`,
      `Créneau préféré : ${slotLabel}.`,
      '',
      'Précisions :',
      notes ? notes : '— À compléter —',
      '',
      'Merci pour votre retour !',
    ].join('\n');

    const subject = encodeURIComponent(`Demande de réservation ${humanDate}`);
    const body = encodeURIComponent(emailBody);

    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

    setStatus({
      type: 'success',
      message:
        'Votre messagerie s’ouvre avec le récapitulatif. Après confirmation, déposez votre acompte pour garantir le créneau.',
        'Votre messagerie va s’ouvrir avec un récapitulatif. Nous vous confirmons le créneau sous 24h ouvrées.',
    });
    resetForm();
  };

  return (
    <form className="reservation-form" onSubmit={handleSubmit} aria-describedby="reservation-help">
      <div className="form-grid">
        <label className="form-field">
          <span>Email de contact *</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="vous@exemple.fr"
            autoComplete="email"
          />
        </label>
        <label className="form-field">
          <span>Nombre de joueurs *</span>
          <input
            type="number"
            name="teamSize"
            value={teamSize}
            onChange={(event) => setTeamSize(Number.parseInt(event.target.value, 10))}
            min={MIN_PLAYERS}
            max={MAX_PLAYERS}
            required
          />
        </label>
      </div>
      <div className="form-grid">
        <label className="form-field">
          <span>Date souhaitée *</span>
          <input type="date" name="date" value={date} min={today} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label className="form-field">
          <span>Tranche horaire</span>
          <select name="slot" value={slot} onChange={(event) => setSlot(event.target.value as Slot)}>
            <option value="matin">09h00 – 12h00</option>
            <option value="apres-midi">14h00 – 17h00</option>
            <option value="nocturne">Nocturne (sur devis)</option>
          </select>
        </label>
      </div>
      <label className="form-field">
        <span>Précisions (anniversaire, entreprise, options…)</span>
        <textarea
          name="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Exemple : EVG de 12 personnes, combo Paintball + Gellyball, besoin d’un espace traiteur."
        />
      </label>
      <p id="reservation-help" className="form-help">
        Minimum {MIN_PLAYERS} joueurs — un acompte sécurisé est demandé après confirmation du créneau.
      </p>
      <div className="form-actions">
        <button type="submit" className="button-primary">
          Envoyer la demande
        </button>
        <a className="button-secondary" href="tel:+33623735002">
          Appeler 06 23 73 50 02
        </a>
      </div>
      {status.type !== 'idle' ? (
        <p className={`form-feedback form-feedback--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
