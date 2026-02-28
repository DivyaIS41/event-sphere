import { api } from '../services/api.js';
import { studentAuthService } from '../services/studentAuth.js';
import { RegistrationModal } from '../components/RegistrationModal.js';

export const StudentPortalPage = {
    render() {
        const student = studentAuthService.getStudent();

        if (!studentAuthService.isLoggedIn()) {
            return `
                <div class="page student-portal-page">
                    <div class="container">
                        <header class="page-header">
                            <h1>Student Portal Login</h1>
                            <p>Login once to access common event registration form.</p>
                        </header>

                        <section class="student-card student-login-card">
                            <form id="student-login-form" class="event-form">
                                <div class="form-group">
                                    <label for="student-login-name">Full Name</label>
                                    <input id="student-login-name" name="name" type="text" required />
                                </div>
                                <div class="form-group">
                                    <label for="student-login-email">Email</label>
                                    <input id="student-login-email" name="email" type="email" required />
                                </div>
                                <button type="submit" class="submit-btn">Login as Student</button>
                                <div id="student-login-message" class="form-message"></div>
                            </form>
                        </section>
                    </div>
                </div>
            `;
        }

        return `
            <div class="page student-portal-page">
                <div class="container">
                    <header class="page-header page-header-with-action">
                        <div>
                            <h1>Student Registration Portal</h1>
                            <p>Welcome, ${this.escapeHtml(student?.name || 'Student')}.</p>
                        </div>
                        <button class="btn-secondary" data-action="student-logout">Logout</button>
                    </header>

                    <section class="student-layout">
                        <article class="student-card">
                            <div class="card-header"><h2>My Profile</h2></div>
                            <form id="student-profile-form" class="event-form">
                                <div class="form-group">
                                    <label for="student-name">Full Name</label>
                                    <input id="student-name" name="name" type="text" value="${this.escapeHtml(student?.name || '')}" required />
                                </div>
                                <div class="form-group">
                                    <label for="student-email">Email</label>
                                    <input id="student-email" name="email" type="email" value="${this.escapeHtml(student?.email || '')}" required />
                                </div>
                                <div class="form-group">
                                    <label for="student-department">Department</label>
                                    <input id="student-department" name="department" type="text" value="${this.escapeHtml(student?.department || '')}" />
                                </div>
                                <div class="form-group">
                                    <label for="student-year">Year</label>
                                    <select id="student-year" name="year">
                                        <option value="">Select year</option>
                                        <option value="1" ${student?.year === '1' ? 'selected' : ''}>1st Year</option>
                                        <option value="2" ${student?.year === '2' ? 'selected' : ''}>2nd Year</option>
                                        <option value="3" ${student?.year === '3' ? 'selected' : ''}>3rd Year</option>
                                        <option value="4" ${student?.year === '4' ? 'selected' : ''}>4th Year</option>
                                    </select>
                                </div>
                                <button type="submit" class="submit-btn">Update Profile</button>
                                <div id="student-profile-message" class="form-message"></div>
                            </form>
                        </article>

                        <article class="student-card">
                            <div class="card-header card-header-between">
                                <h2>Available Events</h2>
                                <span id="student-events-count" class="badge badge-primary">0</span>
                            </div>
                            <div id="student-events-list" class="events-list-container">
                                <div class="loading-spinner">Loading events...</div>
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        `;
    },

    async afterRender() {
        if (!studentAuthService.isLoggedIn()) {
            this.bindLoginForm();
            return;
        }

        this.bindProfileForm();
        this.bindStudentLogout();
        await this.renderPortalData();
    },

    bindLoginForm() {
        const form = document.getElementById('student-login-form');
        const message = document.getElementById('student-login-message');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const result = studentAuthService.login({
                name: form.name.value,
                email: form.email.value
            });

            if (!result.success) {
                message.textContent = result.message;
                message.className = 'form-message error';
                return;
            }

            message.textContent = 'Login successful. Loading portal...';
            message.className = 'form-message success';
            setTimeout(() => {
                window.dispatchEvent(new HashChangeEvent('hashchange'));
            }, 300);
        });
    },

    bindProfileForm() {
        const form = document.getElementById('student-profile-form');
        const message = document.getElementById('student-profile-message');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const result = studentAuthService.updateProfile({
                name: form.name.value,
                email: form.email.value,
                department: form.department.value,
                year: form.year.value
            });

            if (!result.success) {
                message.textContent = result.message;
                message.className = 'form-message error';
                return;
            }

            message.textContent = 'Profile updated.';
            message.className = 'form-message success';
            await this.renderPortalData();
        });
    },

    bindStudentLogout() {
        const btn = document.querySelector('[data-action="student-logout"]');
        btn?.addEventListener('click', () => {
            studentAuthService.logout();
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        });
    },

    async renderPortalData() {
        const eventsContainer = document.getElementById('student-events-list');
        const eventsCount = document.getElementById('student-events-count');

        const events = await api.getEvents();
        eventsCount.textContent = String(events.length);

        this.renderEvents(eventsContainer, events);
        this.attachEventRegistrationHandlers(events);
    },

    renderEvents(container, events) {
        if (!events.length) {
            container.innerHTML = '<div class="empty-state">No events available.</div>';
            return;
        }

        container.innerHTML = events.map((event) => {
            const eventId = String(event.id || event._id);
            const seatInfo = this.getSeatInfo(event);
            const isFull = seatInfo.hasCapacity && seatInfo.remainingSeats === 0;

            return `
                <div class="student-event-item">
                    <div>
                        <h3 class="event-list-title">${this.escapeHtml(event.title)}</h3>
                        <p class="event-description">${this.escapeHtml(event.description || 'No description')}</p>
                        <p class="event-meta">${new Date(event.date).toLocaleDateString()}</p>
                        <p class="event-meta"><strong>Speakers:</strong> ${this.formatSpeakers(event.speakers)}</p>
                        <p class="event-meta"><strong>Seats:</strong> ${seatInfo.totalSeatsLabel} | <strong>Registered:</strong> ${seatInfo.registeredSeats} | <strong>Remaining:</strong> ${seatInfo.remainingSeatsLabel}</p>
                    </div>
                    <button class="submit-btn student-register-btn" data-event-id="${eventId}" ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Event Full' : 'Open Form'}
                    </button>
                </div>
            `;
        }).join('');
    },

    attachEventRegistrationHandlers(events) {
        const lookup = new Map(events.map((event) => [String(event.id || event._id), event]));

        document.querySelectorAll('.student-register-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;

                const eventId = String(btn.dataset.eventId || '');
                const eventData = lookup.get(eventId);
                if (!eventData) return;

                RegistrationModal.open(eventData, async () => {
                    await this.renderPortalData();
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

    formatSpeakers(speakers) {
        if (!Array.isArray(speakers) || !speakers.length) return 'To be announced';
        return speakers.map((speaker) => this.escapeHtml(speaker)).join(', ');
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
