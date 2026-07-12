import { api } from '../services/api.js';
import { studentAuthService } from '../services/studentAuth.js';
import { RegistrationModal } from '../components/RegistrationModal.js';

export const StudentPortalPage = {
    render() {
        const student = studentAuthService.getStudent();

        if (!studentAuthService.isLoggedIn()) {
            return `
                <div class="page student-portal-page student-auth-page">
                    <div class="student-confetti confetti-one"></div><div class="student-confetti confetti-two"></div><div class="student-confetti confetti-three"></div>
                    <div class="container student-auth-shell">
                        <section class="student-welcome-art">
                            <span class="student-kicker">✦ YOUR CAMPUS PASSPORT</span>
                            <h1>Make campus life<br><em>more colourful.</em></h1>
                            <p>Save your seat at exciting events, collect your passes, and never miss what is happening around you.</p>
                            <div class="floating-event-card card-purple"><span>🎨</span><div><strong>Creative events</strong><small>Meet your people</small></div></div>
                            <div class="floating-event-card card-yellow"><span>⚡</span><div><strong>Tech & innovation</strong><small>Build something bold</small></div></div>
                            <div class="floating-event-card card-pink"><span>🎵</span><div><strong>Culture & music</strong><small>Feel the campus energy</small></div></div>
                        </section>
                        <section class="student-card student-login-card colourful-login">
                            <div class="student-login-icon">👋</div>
                            <span class="eyebrow">STUDENT SIGN IN</span>
                            <h2>Welcome to your space</h2>
                            <p>Tell us a little about you. No password needed.</p>
                            <form id="student-login-form" class="event-form">
                                <div class="form-group full">
                                    <label for="student-login-name">Full name</label>
                                    <div class="colour-input"><span>☺</span><input id="student-login-name" name="name" type="text" placeholder="What should we call you?" required /></div>
                                </div>
                                <div class="form-group full">
                                    <label for="student-login-email">College email</label>
                                    <div class="colour-input"><span>✉</span><input id="student-login-email" name="email" type="email" placeholder="you@college.edu" required /></div>
                                </div>
                                <div class="form-group"><label for="student-login-department">Department</label><select id="student-login-department" name="department"><option value="">Choose department</option><option>Computer Science</option><option>Information Science</option><option>Electronics</option><option>Mechanical</option><option>Civil</option><option>Business</option><option>Other</option></select></div>
                                <div class="form-group"><label for="student-login-year">Year</label><select id="student-login-year" name="year"><option value="">Choose year</option><option value="1">1st year</option><option value="2">2nd year</option><option value="3">3rd year</option><option value="4">4th year</option></select></div>
                                <button type="submit" class="student-enter-btn full">Enter my portal <span>→</span></button>
                                <div id="student-login-message" class="form-message full"></div>
                            </form>
                            <small class="privacy-note">🔒 Your details are only used for event registrations.</small>
                        </section>
                    </div>
                </div>
            `;
        }

        return `
            <div class="page student-portal-page">
                <div class="container">
                    <header class="student-dashboard-banner page-header-with-action">
                        <div>
                            <span class="student-kicker">MY EVENTSPHERE</span>
                            <h1>Hey, ${this.escapeHtml((student?.name || 'Student').split(' ')[0])}! <span>👋</span></h1>
                            <p>Your campus adventure starts here. Manage passes and discover something new.</p>
                        </div>
                        <div class="student-avatar">${this.escapeHtml((student?.name || 'S').charAt(0).toUpperCase())}</div>
                        <button class="student-logout" data-action="student-logout">Sign out</button>
                    </header>

                    <section class="student-card student-my-registrations tickets-panel">
                        <div class="card-header card-header-between"><div><span class="eyebrow">YOUR EVENT PASSES</span><h2>My registrations</h2></div><span id="my-registration-count" class="badge badge-primary">0 tickets</span></div>
                        <div id="my-registrations"><div class="loading-spinner">Loading your tickets...</div></div>
                    </section>

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
        await this.renderMyRegistrations();
    },

    bindLoginForm() {
        const form = document.getElementById('student-login-form');
        const message = document.getElementById('student-login-message');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const result = studentAuthService.login({
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

    async renderMyRegistrations() {
        const box = document.getElementById('my-registrations');
        const student = studentAuthService.getStudent();
        if (!box || !student) return;
        try {
            const regs = await api.getMyRegistrations(student.email);
            const count = document.getElementById('my-registration-count');
            if (count) count.textContent = `${regs.length} ticket${regs.length === 1 ? '' : 's'}`;
            box.innerHTML = regs.length ? regs.map((r) => `<div class="student-event-item ticket-row"><div class="ticket-mark">✓</div><div class="ticket-info"><span class="badge badge-primary">${this.escapeHtml(r.status || 'confirmed')}</span><h3>${this.escapeHtml(r.eventId?.title || 'Event')}</h3><p>${r.eventId?.date ? new Date(r.eventId.date).toLocaleDateString() : ''} · ${this.escapeHtml(r.eventId?.startTime || '10:00')} · ${this.escapeHtml(r.eventId?.venue || 'Campus')}</p><small>Registered with ${this.escapeHtml(student.email)}</small></div><button class="btn-danger cancel-registration" data-id="${r._id}">Cancel registration</button></div>`).join('') : '<div class="empty-state"><strong>No registrations yet</strong><p>Explore an event and reserve your first seat.</p><a href="#events" class="submit-btn">Explore events</a></div>';
            box.querySelectorAll('.cancel-registration').forEach((button) => button.addEventListener('click', async () => {
                if (!confirm('Cancel this registration?')) return;
                button.disabled = true;
                button.textContent = 'Cancelling...';
                await api.cancelRegistration(button.dataset.id);
                await this.renderMyRegistrations();
                await this.renderPortalData();
            }));
        } catch (_) { box.innerHTML = '<div class="error-message">Could not load registrations.</div>'; }
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
