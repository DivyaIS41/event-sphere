import { api } from '../services/api.js';
import { studentAuthService } from '../services/studentAuth.js';

export const RegistrationModal = {
    open(eventData, onSuccess) {
        if (!studentAuthService.isLoggedIn()) {
            alert('Please login in Student Portal first.');
            window.location.hash = '#student';
            return;
        }

        const student = studentAuthService.getStudent();
        const eventId = eventData.id || eventData._id;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-card" role="dialog" aria-modal="true" aria-label="Event registration form">
                <div class="modal-head">
                    <h3>Register for ${this.escapeHtml(eventData.title || 'Event')}</h3>
                    <button class="modal-close" type="button">x</button>
                </div>
                <form id="common-registration-form" class="event-form">
                    <div class="form-group">
                        <label for="reg-name">Full Name</label>
                        <input id="reg-name" name="name" type="text" value="${this.escapeHtml(student?.name || '')}" required />
                    </div>
                    <div class="form-group">
                        <label for="reg-email">Email</label>
                        <input id="reg-email" name="email" type="email" value="${this.escapeHtml(student?.email || '')}" required />
                    </div>
                    <div class="form-group">
                        <label for="reg-department">Department</label>
                        <input id="reg-department" name="department" type="text" value="${this.escapeHtml(student?.department || '')}" />
                    </div>
                    <button type="submit" class="submit-btn">Confirm Registration</button>
                    <div id="registration-message" class="form-message"></div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => {
            modal.remove();
            document.body.classList.remove('modal-open');
        };

        document.body.classList.add('modal-open');
        modal.querySelector('.modal-close').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        const form = modal.querySelector('#common-registration-form');
        const message = modal.querySelector('#registration-message');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const payload = {
                name: String(formData.get('name') || '').trim(),
                email: String(formData.get('email') || '').trim().toLowerCase(),
                department: String(formData.get('department') || '').trim(),
                year: String(student?.year || '')
            };

            if (!payload.name || !/^\S+@\S+\.\S+$/.test(payload.email)) {
                message.textContent = 'Enter valid name and email.';
                message.className = 'form-message error';
                return;
            }

            const profileUpdate = studentAuthService.updateProfile({
                name: payload.name,
                email: payload.email,
                department: String(formData.get('department') || '').trim()
            });
            if (!profileUpdate.success) {
                message.textContent = profileUpdate.message;
                message.className = 'form-message error';
                return;
            }

            const submit = form.querySelector('button[type="submit"]');
            submit.disabled = true;
            submit.textContent = 'Registering...';

            try {
                await api.registerForEvent(eventId, payload);
                message.textContent = 'Registered successfully.';
                message.className = 'form-message success';
                if (typeof onSuccess === 'function') {
                    await onSuccess();
                }
                setTimeout(close, 600);
            } catch (error) {
                message.textContent = error.message || 'Registration failed.';
                message.className = 'form-message error';
                submit.disabled = false;
                submit.textContent = 'Confirm Registration';
            }
        });
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
