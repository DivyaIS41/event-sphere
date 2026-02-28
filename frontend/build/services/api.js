/**
 * API service module
 * Handles backend communication with safe fallbacks.
 */

const API_BASE = '/api';

async function parseResponse(response) {
    if (response.ok) {
        if (response.status === 204) return null;
        return response.json();
    }

    let message = `Request failed (${response.status})`;
    try {
        const data = await response.json();
        if (data?.message) message = data.message;
    } catch (_) {
        // Ignore body parse failures.
    }

    throw new Error(message);
}

function normalizeEvent(event) {
    return {
        ...event,
        id: event?.id || event?._id || ''
    };
}

export const api = {
    async getEvents() {
        try {
            const response = await fetch(`${API_BASE}/events`);
            const data = await parseResponse(response);
            return Array.isArray(data) ? data.map(normalizeEvent) : [];
        } catch (error) {
            console.error('Failed to fetch events:', error);
            return this.getMockEvents().map(normalizeEvent);
        }
    },

    async createEvent(event) {
        try {
            const response = await fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            const data = await parseResponse(response);
            return normalizeEvent(data);
        } catch (error) {
            console.error('Failed to create event:', error);
            return normalizeEvent({ ...event, id: Date.now().toString() });
        }
    },

    async updateEvent(eventId, event) {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        const data = await parseResponse(response);
        return normalizeEvent(data);
    },

    async registerForEvent(eventId, payload) {
        const response = await fetch(`${API_BASE}/events/${eventId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return parseResponse(response);
    },

    async getRegistrations(eventId) {
        const response = await fetch(`${API_BASE}/events/${eventId}/registrations`);
        return parseResponse(response);
    },

    getMockEvents() {
        return [
            {
                id: '1',
                title: 'Tech Symposium',
                date: '2026-03-15',
                description: 'Talks and demos from student and industry speakers.'
            },
            {
                id: '2',
                title: 'Career Fair',
                date: '2026-03-20',
                description: 'Meet hiring partners and explore internship opportunities.'
            }
        ];
    }
};
