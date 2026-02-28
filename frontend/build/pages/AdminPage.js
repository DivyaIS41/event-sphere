import { api } from '../services/api.js';

export const AdminPage = {
    async render() {
        return `
            <div class="page admin-page">
                <div class="container">
                    <header class="page-header">
                        <h1>Admin Dashboard</h1>
                        <p>Create, edit, and monitor event registrations.</p>
                    </header>

                    <section class="admin-dashboard">
                        <article class="admin-card">
                            <div class="card-header">
                                <h2>Create Event</h2>
                            </div>
                            <form id="create-event-form" class="event-form">
                                <div class="form-group">
                                    <label for="event-title">Title</label>
                                    <input type="text" id="event-title" name="title" required />
                                </div>
                                <div class="form-group">
                                    <label for="event-date">Date</label>
                                    <input type="date" id="event-date" name="date" required />
                                </div>
                                <div class="form-group">
                                    <label for="event-description">Description</label>
                                    <textarea id="event-description" name="description" rows="4" required></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="event-capacity">Seating Capacity</label>
                                    <input type="number" id="event-capacity" name="capacity" min="0" placeholder="e.g. 120" />
                                </div>
                                <div class="form-group">
                                    <label for="event-speakers">Speakers (comma separated)</label>
                                    <textarea id="event-speakers" name="speakers" rows="2" placeholder="e.g. Dr. Rao, Prof. Mehta"></textarea>
                                </div>
                                <button type="submit" class="submit-btn">Create Event</button>
                            </form>
                            <div id="form-message" class="form-message"></div>
                        </article>

                        <article class="admin-card">
                            <div class="card-header">
                                <h2>Edit Event</h2>
                            </div>
                            <form id="edit-event-form" class="event-form" style="display:none;">
                                <input type="hidden" id="edit-event-id" />
                                <div class="form-group">
                                    <label for="edit-event-title">Title</label>
                                    <input type="text" id="edit-event-title" name="title" required />
                                </div>
                                <div class="form-group">
                                    <label for="edit-event-date">Date</label>
                                    <input type="date" id="edit-event-date" name="date" required />
                                </div>
                                <div class="form-group">
                                    <label for="edit-event-description">Description</label>
                                    <textarea id="edit-event-description" name="description" rows="4" required></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="edit-event-capacity">Seating Capacity</label>
                                    <input type="number" id="edit-event-capacity" name="capacity" min="0" placeholder="e.g. 120" />
                                </div>
                                <div class="form-group">
                                    <label for="edit-event-speakers">Speakers (comma separated)</label>
                                    <textarea id="edit-event-speakers" name="speakers" rows="2" placeholder="e.g. Dr. Rao, Prof. Mehta"></textarea>
                                </div>
                                <div style="display:flex; gap: 0.75rem;">
                                    <button type="submit" class="submit-btn">Update Event</button>
                                    <button type="button" id="cancel-edit-btn" class="btn-secondary">Cancel</button>
                                </div>
                            </form>
                            <div id="edit-message" class="form-message"></div>
                        </article>

                        <article class="admin-card">
                            <div class="card-header card-header-between">
                                <h2>Events</h2>
                                <span class="badge badge-primary" id="events-total-badge">0</span>
                            </div>
                            <div id="events-list-container" class="events-list-container">
                                <div class="loading-spinner">Loading events...</div>
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        `;
    },

    async afterRender() {
        await this.loadEventsList();
        this.bindCreateForm();
        this.bindEditForm();
    },

    bindCreateForm() {
        const form = document.getElementById('create-event-form');
        const messageDiv = document.getElementById('form-message');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const eventData = {
                title: String(formData.get('title') || '').trim(),
                date: formData.get('date'),
                description: String(formData.get('description') || '').trim(),
                capacity: Number(formData.get('capacity') || 0),
                speakers: this.parseSpeakersInput(formData.get('speakers'))
            };

            if (!eventData.title || !eventData.date || !eventData.description) {
                this.showMessage(messageDiv, 'All fields are required.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            try {
                await api.createEvent(eventData);
                form.reset();
                this.showMessage(messageDiv, 'Event created successfully.', 'success');
                await this.loadEventsList();
            } catch (error) {
                this.showMessage(messageDiv, error.message || 'Failed to create event.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Event';
            }
        });
    },

    bindEditForm() {
        const form = document.getElementById('edit-event-form');
        const messageDiv = document.getElementById('edit-message');
        const cancelBtn = document.getElementById('cancel-edit-btn');

        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
            form.reset();
            messageDiv.textContent = '';
            messageDiv.className = 'form-message';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const eventId = document.getElementById('edit-event-id').value;

            const eventData = {
                title: String(document.getElementById('edit-event-title').value || '').trim(),
                date: document.getElementById('edit-event-date').value,
                description: String(document.getElementById('edit-event-description').value || '').trim(),
                capacity: Number(document.getElementById('edit-event-capacity').value || 0),
                speakers: this.parseSpeakersInput(document.getElementById('edit-event-speakers').value)
            };

            if (!eventId || !eventData.title || !eventData.date || !eventData.description) {
                this.showMessage(messageDiv, 'All fields are required.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            try {
                await api.updateEvent(eventId, eventData);
                this.showMessage(messageDiv, 'Event updated successfully.', 'success');
                await this.loadEventsList();
            } catch (error) {
                this.showMessage(messageDiv, error.message || 'Failed to update event.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Event';
            }
        });
    },

    async loadEventsList() {
        const container = document.getElementById('events-list-container');
        const badge = document.getElementById('events-total-badge');

        try {
            const events = await api.getEvents();
            this.events = events;
            badge.textContent = String(events.length);

            if (events.length === 0) {
                container.innerHTML = '<div class="empty-state">No events created yet.</div>';
                return;
            }

            container.innerHTML = events
                .map((event) => {
                    const eventId = event.id || event._id;
                    return `
                        <div class="event-list-item">
                            <div>
                                <h3 class="event-list-title">${this.escapeHtml(event.title)}</h3>
                                <p class="event-description">${this.escapeHtml(event.description || '')}</p>
                                <p class="event-meta">${new Date(event.date).toLocaleDateString()}</p>
                                <p class="event-meta"><strong>Capacity:</strong> ${Number(event.capacity || 0) > 0 ? Number(event.capacity) : 'Not set'} | <strong>Registered:</strong> ${Number(event.registrationsCount || 0)} | <strong>Remaining:</strong> ${event.remainingSeats ?? 'N/A'}</p>
                                <p class="event-meta"><strong>Speakers:</strong> ${this.formatSpeakers(event.speakers)}</p>
                            </div>
                            <div style="display:flex; gap:0.75rem;">
                                <button type="button" class="btn-secondary edit-event-btn" data-event-id="${eventId}">
                                    Edit
                                </button>
                                <a href="#registrations/${eventId}" class="btn-secondary view-registrations-link" data-event-id="${eventId}">
                                    View Registrations
                                </a>
                            </div>
                        </div>
                    `;
                })
                .join('');

            container.querySelectorAll('.edit-event-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const eventId = btn.dataset.eventId;
                    const selected = this.events.find((e) => String(e.id || e._id) === String(eventId));
                    if (!selected) return;
                    this.populateEditForm(selected);
                });
            });
        } catch (error) {
            container.innerHTML = '<div class="error-message">Failed to load events.</div>';
        }
    },

    populateEditForm(event) {
        const form = document.getElementById('edit-event-form');
        document.getElementById('edit-event-id').value = event.id || event._id;
        document.getElementById('edit-event-title').value = event.title || '';
        document.getElementById('edit-event-description').value = event.description || '';
        document.getElementById('edit-event-date').value = this.toDateInputValue(event.date);
        document.getElementById('edit-event-capacity').value = Number(event.capacity || 0);
        document.getElementById('edit-event-speakers').value = Array.isArray(event.speakers) ? event.speakers.join(', ') : '';
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    toDateInputValue(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 10);
    },

    showMessage(element, text, type) {
        element.textContent = text;
        element.className = `form-message ${type}`;
    },

    parseSpeakersInput(value) {
        return String(value || '')
            .split(',')
            .map((speaker) => speaker.trim())
            .filter(Boolean);
    },

    formatSpeakers(speakers) {
        if (!Array.isArray(speakers) || !speakers.length) return 'To be announced';
        return speakers.map((speaker) => this.escapeHtml(speaker)).join(', ');
    },

    escapeHtml(text = '') {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};
