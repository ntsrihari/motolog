export const AiConfig = {
  features: {
    enableAnomalyDetection: true,
    enableDiaryPatternWatch: true,
    enableMaintenancePrediction: true,
    enableVehicleInference: true,
    enableDocumentExpiry: true,
  },

  anomaly: {
    efficiencyDropThresholdPct: 15,
    efficiencyRollingDays: 90,
    expenseSpikePct: 30,
    serviceIntervalOverrunPct: 20,
    inactivityDays: 45,
  },

  diary: {
    patternEscalationMentions: 3,
    patternEscalationDays: 14,
  },

  maintenance: {
    notifyDaysBefore: 7,
    notifyKmBefore: 500,
    modifiedVehicleIntervalReductionPct: 20,
  },

  documents: {
    insuranceDaysBefore: [30, 7, 1],
    pucDaysBefore: [15, 7, 1],
    rcRenewalDaysBefore: [30],
    warrantyDaysBefore: [60, 30],
  },

  progressiveDisclosure: {
    coreOnlyDays: 3,
    coreOnlyMaxLogs: 2,
    fluidSpecsMinServiceLogs: 3,
    enthusiastFieldsTriggers: ['first_performance_mod', 'tune', 'remap'],
    trackSessionTriggers: ['track_session'],
  },

  prompts: {
    vehicleInference: `You are MotoLog's vehicle inference engine. Given usage patterns, infer which vehicle the user likely drove today.
Context: {context}
Vehicles: {vehicles}
Today: {dayOfWeek}, {date}
Reply with: {"vehicleId": "...", "confidence": 0.0-1.0, "reason": "one sentence"}`,

    maintenanceAlert: {
      level1: `Your {vehicle}'s {service} is due in ~{days} days or {km} km.`,
      level2: `Your {vehicle}'s {service} interval is approaching — {km} km remaining or ~{days} days.`,
      level3: `{vehicle} approaching {service} threshold: {km} km since last, interval is {interval} km. {technicalNote}`,
    },

    anomalyAnalysis: `Analyze this vehicle's fuel efficiency data for anomalies.
Vehicle: {vehicle}
Recent avg: {recentAvg} km/l
Baseline avg (90 days): {baselineAvg} km/l
Drop: {dropPct}%
Last service: {lastService}
Recent diary notes: {diaryNotes}
User level: {userLevel}

Respond with JSON: {"detected": bool, "dropPct": number, "causes": ["ranked", "causes"], "recommendation": "action"}`,

    diaryInsight: `Review these diary notes for recurring patterns that warrant a maintenance log.
Notes (last {days} days): {notes}
Pattern threshold: {threshold} mentions
Reply with JSON: {"pattern": "string or null", "mentions": number, "suggestion": "string or null"}`,
  },
} as const;
