export const NotificationsConfig = {
  channels: {
    maintenance: { id: 'maintenance', name: 'Maintenance Reminders', importance: 4 },
    documents: { id: 'documents', name: 'Document Expiry', importance: 5 },
    ai: { id: 'ai-insights', name: 'AI Insights', importance: 3 },
    diary: { id: 'diary-prompts', name: 'Daily Log Prompts', importance: 2 },
  },

  severity: {
    info: { color: '#3A8DFF', sound: false },
    warning: { color: '#F59E0B', sound: true },
    urgent: { color: '#FF4D4D', sound: true, vibrate: [0, 250, 250, 250] },
  },

  thresholds: {
    service: { daysWarning: 7, kmWarning: 500, daysUrgent: 2, kmUrgent: 100 },
    insurance: { daysWarning: 30, daysCritical: 7, daysExpired: 0 },
    puc: { daysWarning: 15, daysCritical: 7, daysExpired: 0 },
    rc: { daysWarning: 30 },
    warranty: { daysWarning: 60, daysCritical: 30 },
    inactivity: { days: 45 },
  },

  renotify: {
    maintenance: { intervalHours: 24 },
    documents: { intervalHours: 48 },
    ai: { intervalHours: 72 },
    diary: { intervalHours: 24 },
  },

  dailyDigestHour: 9,
} as const;
