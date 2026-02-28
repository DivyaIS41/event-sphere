import { RegistrationModal } from './RegistrationModal.js';

export const EventCard = {
    render(event) {
        const eventId = event.id || event._id;
        const speakers = Array.isArray(event.speakers) ? event.speakers.filter(Boolean) : [];
        const seatInfo = this.getSeatInfo(event);
        const isFull = seatInfo.hasCapacity && seatInfo.remainingSeats === 0;
        const speakerText = speakers.length
            ? speakers.map((name) => this.escapeHtml(name)).join(', ')
            : 'To be announced';

        return `
            <article class="event-card">
                <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                <p class="event-description">${this.escapeHtml(event.description || 'No description provided.')}</p>
                <div class="event-meta event-meta-grid">
                    <span class="event-date">${new Date(event.date).toLocaleDateString()}</span>
                    <span><strong>Speakers:</strong> ${speakerText}</span>
                    <span><strong>Total Seats:</strong> ${seatInfo.totalSeatsLabel}</span>
                    <span><strong>Registered:</strong> ${seatInfo.registeredSeats}</span>
                    <span class="${isFull ? 'seat-full' : ''}">
                        <strong>Remaining:</strong> ${seatInfo.remainingSeatsLabel}
                    </span>
                </div>
                <div class="event-card-footer">
                    <button class="register-btn" data-id="${eventId}" ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Event Full' : 'Register Now'}
                    </button>
                </div>
            </article>
        `;
    },

    attachHandlers(events = [], options = {}) {
        const { onRegisterSuccess } = options;
        const lookup = new Map(events.map((event) => [String(event.id || event._id), event]));

        document.querySelectorAll('.register-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;

                const eventId = String(btn.dataset.id || '');
                const selectedEvent = lookup.get(eventId);
                if (!selectedEvent) return;

                RegistrationModal.open(selectedEvent, async () => {
                    if (typeof onRegisterSuccess === 'function') {
                        await onRegisterSuccess();
                    }
                });
            });
        });
    },

    escapeHtml(text = '') {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    getSeatInfo(event) {
        const capacity = Number(event.capacity || 0);
        const registered = Number(event.registrationsCount || 0);
        const hasCapacity = capacity > 0;
        const remaining = hasCapacity ? Math.max(capacity - registered, 0) : null;

        return {
            hasCapacity,
            registeredSeats: Number.isFinite(registered) ? registered : 0,
            remainingSeats: remaining,
            totalSeatsLabel: hasCapacity ? String(capacity) : 'Not set',
            remainingSeatsLabel: hasCapacity ? String(remaining) : 'N/A'
        };
    }
};
