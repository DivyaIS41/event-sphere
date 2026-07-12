import { authService } from '../services/auth.js';
import { studentAuthService } from '../services/studentAuth.js';

export const Navbar = {
    render() {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        const student = studentAuthService.getStudent();
        const studentLabel = studentAuthService.isLoggedIn() ? 'My Tickets' : 'Student Portal';

        return `
            <div class="navbar">
                <div class="container">
                    <div class="navbar-content">
                        <a href="#events" class="navbar-brand" data-nav="events">
                            <span class="brand-icon">ES</span>
                            EventSphere
                            <span class="badge badge-primary navbar-beta-badge">Campus</span>
                        </a>

                        <div class="nav-links">
                            <a href="#events" data-nav="events" class="nav-link">Discover</a>
                            <a href="#student" data-nav="student" class="nav-link">${studentLabel}</a>
                            <a href="/admin#${isAuthenticated ? 'admin' : 'login'}" class="nav-link admin-entry">${isAuthenticated ? 'Admin Console ↗' : 'Admin Login'}</a>
                        </div>
                        <button class="theme-toggle" aria-label="Toggle dark mode" onclick="document.body.classList.toggle('dark'); localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light')">◐</button>
                    </div>
                </div>
            </div>
        `;
    }
};
