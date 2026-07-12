import { Navbar } from './components/Navbar.js';
import { AdminNavbar } from './components/AdminNavbar.js';
import { EventsPage } from './pages/EventsPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { RegistrationsPage } from './pages/RegistrationsPage.js';
import { authService } from './services/auth.js';
import { LoginPage } from './pages/LoginPage.js';
import { StudentPortalPage } from './pages/StudentPortalPage.js';

class App {
    constructor() {
        this.currentPage = 'events';
        this.currentEventId = null;
        this.init();
    }

    async init() {
        if (window.location.pathname.startsWith('/admin') && !window.location.hash) window.location.hash = authService.isAuthenticated() ? '#admin' : '#login';
        this.renderNavbar();
        this.setupNavigation();
        await this.handleRouting();

        window.addEventListener('hashchange', async () => {
            await this.handleRouting();
        });
    }

    renderNavbar() {
        const navbarContainer = document.getElementById('navbar');
        const isAdminWorkspace = ['admin', 'registrations'].includes(this.currentPage);
        const isAdminLogin = this.currentPage === 'login' || (window.location.pathname.startsWith('/admin') && !authService.isAuthenticated());
        navbarContainer.innerHTML = isAdminWorkspace ? AdminNavbar.render(this.currentPage) : (isAdminLogin ? '' : Navbar.render());
        document.body.classList.toggle('admin-shell', isAdminWorkspace);
        document.body.classList.toggle('admin-login-shell', isAdminLogin);
        this.updateActiveNavLink();
    }

    setupNavigation() {
        document.addEventListener('click', async (e) => {
            const navLink = e.target.closest('[data-nav]');
            const regLink = e.target.closest('.view-registrations-link');
            const logoutBtn = e.target.closest('[data-action="logout"]');

            if (logoutBtn) {
                e.preventDefault();
                authService.logout();
                window.location.href = '/#events';
                return;
            }

            if (navLink) {
                e.preventDefault();
                const page = navLink.dataset.nav;

                if (page === 'admin' && !authService.isAuthenticated()) {
                    window.location.hash = '#login';
                    return;
                }

                window.location.hash = `#${page}`;
                return;
            }

            if (regLink) {
                e.preventDefault();
                const eventId = regLink.dataset.eventId;
                window.location.hash = `#registrations/${eventId}`;
            }
        });
    }

    normalizeHash(rawHash) {
        const cleaned = (rawHash || '').replace('#', '').trim();
        if (!cleaned) return 'events';
        const aliases = { discover: 'events', tickets: 'student', dashboard: 'admin', 'admin-login': 'login' };
        if (aliases[cleaned]) {
            history.replaceState(null, '', `#${aliases[cleaned]}`);
            return aliases[cleaned];
        }
        if (cleaned === 'event-catalog') {
            history.replaceState(null, '', '#events');
            return 'events';
        }
        return cleaned.startsWith('/') ? cleaned.slice(1) : cleaned;
    }

    async handleRouting() {
        const hash = this.normalizeHash(window.location.hash);

        if (hash.startsWith('registrations/')) {
            if (!authService.isAuthenticated()) {
                this.currentPage = 'login';
                await this.loadPage('login');
                this.renderNavbar();
                return;
            }

            const eventId = hash.split('/')[1];
            this.currentPage = 'registrations';
            this.currentEventId = eventId;
            await this.loadPage('registrations', eventId);
            this.renderNavbar();
            return;
        }

        if (hash === 'admin' && !authService.isAuthenticated()) {
            this.currentPage = 'login';
            await this.loadPage('login');
            this.renderNavbar();
            return;
        }

        this.currentPage = hash;
        this.currentEventId = null;
        await this.loadPage(hash);
        this.renderNavbar();
    }

    updateActiveNavLink() {
        document.querySelectorAll('[data-nav]').forEach((link) => {
            link.classList.remove('active');
        });

        const normalizedPage = this.currentPage === 'login' ? 'login' : this.currentPage;
        const activeLink = document.querySelector(`[data-nav="${normalizedPage}"]`);
        activeLink?.classList.add('active');
    }

    async loadPage(page, eventId = null) {
        const mainContent = document.getElementById('main-content');

        try {
            switch (page) {
                case 'events':
                    mainContent.innerHTML = EventsPage.render();
                    await EventsPage.afterRender();
                    break;

                case 'login':
                    mainContent.innerHTML = LoginPage.render();
                    LoginPage.afterRender(() => {
                        this.renderNavbar();
                    });
                    break;

                case 'student':
                    mainContent.innerHTML = StudentPortalPage.render();
                    await StudentPortalPage.afterRender();
                    break;

                case 'admin':
                    mainContent.innerHTML = await AdminPage.render();
                    await AdminPage.afterRender();
                    break;

                case 'registrations':
                    mainContent.innerHTML = await RegistrationsPage.render(eventId);
                    await RegistrationsPage.afterRender(eventId);
                    break;

                default:
                    mainContent.innerHTML = `
                        <div class="container">
                            <div class="error-message" style="margin-top: var(--space-8);">
                                Page not found.
                            </div>
                        </div>
                    `;
            }
        } catch (err) {
            console.error('Routing error:', err);
            mainContent.innerHTML = `
                <div class="container">
                    <div class="error-message" style="margin-top: var(--space-8);">
                        Error loading page.
                    </div>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
