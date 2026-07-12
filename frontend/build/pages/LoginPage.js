import { authService } from '../services/auth.js';

export const LoginPage = {
    render() {
        return `<div class="page simple-admin-login"><div class="simple-login-wrap">
            <a href="/#events" class="simple-login-brand"><span class="brand-icon">ES</span><strong>EventSphere</strong></a>
            <section class="login-card simple-login-card">
                <div class="login-header"><span class="eyebrow">ADMIN ACCESS</span><h1>Welcome back</h1><p>Sign in to manage campus events.</p></div>
                <form id="login-form" class="login-form">
                    <div class="form-group"><label for="username">Username</label><input id="username" name="username" autocomplete="username" placeholder="Enter username" required></div>
                    <div class="form-group"><label for="password">Password</label><input type="password" id="password" name="password" autocomplete="current-password" placeholder="Enter password" required></div>
                    <label class="checkbox-wrap"><input type="checkbox" id="remember" checked><span>Remember me for 7 days</span></label>
                    <button class="submit-btn" type="submit">Sign in</button><div id="login-message" class="form-message"></div>
                </form>
                <div class="demo-credentials"><span>Demo credentials</span><code>admin / admin123</code></div>
            </section><a href="/#events" class="back-to-site">← Back to EventSphere</a>
        </div></div>`;
    },
    afterRender(done) {
        const form=document.getElementById('login-form'), message=document.getElementById('login-message');
        form.addEventListener('submit',(event)=>{event.preventDefault();const result=authService.login(form.username.value.trim(),form.password.value,document.getElementById('remember').checked);if(!result.success){message.textContent=result.message;message.className='form-message error';return;}message.textContent='Login successful.';message.className='form-message success';setTimeout(()=>{done?.();window.location.href='/admin#admin';},300);});
    }
};
