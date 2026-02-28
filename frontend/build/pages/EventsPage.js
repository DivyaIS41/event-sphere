import { api } from '../services/api.js';
import { EventCard } from '../components/EventCard.js';

export const EventsPage = {
    render() {
        return `
            <div class="page">
                <div class="container">
                    <header class="page-header">
                        <h1>Upcoming Events</h1>
                        <p>Discover campus events and register in seconds. Student login required for registration.</p>
                    </header>
                    <section id="events-grid" class="events-grid">
                        <div class="loading-spinner">Loading events...</div>
                    </section>
                </div>
            </div>
        `;
    },

    async afterRender() {
        const grid = document.getElementById('events-grid');

        const renderEvents = async () => {
            try {
                const events = await api.getEvents();

                if (!events.length) {
                    grid.innerHTML = '<div class="empty-state">No events available right now.</div>';
                    return;
                }

                grid.innerHTML = events.map((event) => EventCard.render(event)).join('');
                EventCard.attachHandlers(events, {
                    onRegisterSuccess: renderEvents
                });
            } catch (err) {
                console.error(err);
                grid.innerHTML = '<div class="error-message">Failed to load events.</div>';
            }
        };

        await renderEvents();
    }
};
