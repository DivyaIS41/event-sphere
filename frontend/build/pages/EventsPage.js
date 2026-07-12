import { api } from '../services/api.js';
import { EventCard } from '../components/EventCard.js';

export const EventsPage = {
    events: [],
    render() { return `<div class="page"><div class="container">
        <section class="hero"><div><span class="eyebrow">YOUR CAMPUS. YOUR COMMUNITY.</span><h1>Find your next<br><span>great experience.</span></h1><p>Discover workshops, competitions, cultural nights and communities that make campus life unforgettable.</p><div class="hero-actions"><button type="button" id="explore-events-btn" class="submit-btn">Explore events</button><a class="btn-secondary" href="#student">My registrations</a></div></div><div class="hero-orbit"><div class="orbit-card"><span>✦ FEATURED</span><strong>Ideas become<br>experiences here.</strong><small>Curated for curious minds</small></div></div></section>
        <section class="stats-strip"><div><strong id="stat-events">—</strong><span>Live events</span></div><div><strong id="stat-seats">—</strong><span>Open seats</span></div><div><strong>8+</strong><span>Categories</span></div><div><strong>100%</strong><span>Campus energy</span></div></section>
        <section id="event-catalog" class="catalog-head"><div><span class="eyebrow">HAPPENING ON CAMPUS</span><h2>Explore events</h2></div></section>
        <section class="filter-bar"><label class="search-box">⌕<input id="event-search" placeholder="Search events, speakers or venues..."></label><select id="category-filter"><option value="">All categories</option></select><select id="sort-events"><option value="date">Soonest first</option><option value="popular">Most popular</option><option value="seats">Most seats</option></select></section>
        <div id="result-summary" class="result-summary"></div><section id="events-grid" class="events-grid"><div class="loading-spinner">Finding great events...</div></section>
    </div></div>`; },
    async afterRender() {
        document.getElementById('explore-events-btn')?.addEventListener('click', () => document.getElementById('event-catalog')?.scrollIntoView({ behavior: 'smooth' }));
        this.events = await api.getEvents();
        document.getElementById('stat-events').textContent = this.events.filter(e => e.status !== 'cancelled').length;
        document.getElementById('stat-seats').textContent = this.events.reduce((n,e) => n + (Number(e.remainingSeats)||0), 0);
        const categories = [...new Set(this.events.map(e => e.category || 'General'))].sort();
        document.getElementById('category-filter').insertAdjacentHTML('beforeend', categories.map(c => `<option>${this.escape(c)}</option>`).join(''));
        ['event-search','category-filter','sort-events'].forEach(id => document.getElementById(id).addEventListener(id==='event-search'?'input':'change', () => this.paint()));
        this.paint();
    },
    paint() {
        const q=document.getElementById('event-search').value.toLowerCase(), category=document.getElementById('category-filter').value, sort=document.getElementById('sort-events').value;
        let list=this.events.filter(e=>e.status!=='draft'&&(!category||(e.category||'General')===category)&&`${e.title} ${e.description} ${e.venue} ${(e.speakers||[]).join(' ')}`.toLowerCase().includes(q));
        list.sort((a,b)=>sort==='popular'?b.registrationsCount-a.registrationsCount:sort==='seats'?(b.remainingSeats||0)-(a.remainingSeats||0):new Date(a.date)-new Date(b.date));
        document.getElementById('result-summary').textContent=`${list.length} event${list.length===1?'':'s'} found`;
        const grid=document.getElementById('events-grid'); grid.innerHTML=list.length?list.map(e=>EventCard.render(e)).join(''):'<div class="empty-state">No events match those filters.</div>';
        EventCard.attachHandlers(list,{onRegisterSuccess:async()=>{this.events=await api.getEvents();this.paint();}});
    },
    escape(v=''){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
};
