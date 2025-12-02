export type MoonPhase = 'Poornima' | 'Amavasya' | 'Ekadashi';

interface MoonPhaseDate {
  date: Date;
  phase: MoonPhase;
}

/**
 * Calculate moon phase for a given date
 * Returns phase as a number: 0 = New Moon, 0.25 = First Quarter, 0.5 = Full Moon, 0.75 = Last Quarter
 */
const getMoonPhase = (date: Date): number => {
  // Calculate days since last known new moon (approximate)
  // Using a simplified calculation
  const knownNewMoon = new Date(2000, 0, 6); // Known new moon date
  const daysSince = Math.floor((date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24));
  const lunarCycle = 29.53058867; // Average lunar cycle in days
  const phase = (daysSince % lunarCycle) / lunarCycle;
  
  return phase;
};

/**
 * Get moon phase name
 */
const getMoonPhaseName = (phase: number): MoonPhase | null => {
  if (phase < 0.03 || phase > 0.97) return 'Amavasya'; // New Moon
  if (phase > 0.47 && phase < 0.53) return 'Poornima'; // Full Moon
  if (phase > 0.27 && phase < 0.30) return 'Ekadashi'; // Approximate Ekadashi
  if (phase > 0.77 && phase < 0.80) return 'Ekadashi'; // Approximate Ekadashi
  return null;
};

/**
 * Get all moon phase dates for a year
 */
export const getMoonPhasesForYear = (year: number, selectedPhases: MoonPhase[] = []): MoonPhaseDate[] => {
  if (selectedPhases.length === 0) {
    return [];
  }

  const moonPhases: MoonPhaseDate[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Check each day of the year
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const phase = getMoonPhase(date);
    const phaseName = getMoonPhaseName(phase);
    
    if (phaseName && selectedPhases.includes(phaseName)) {
      moonPhases.push({
        date: new Date(date),
        phase: phaseName
      });
    }
  }
  
  return moonPhases;
};

/**
 * Check if a date matches a specific moon phase
 */
export const isMoonPhase = (date: Date, selectedPhases: MoonPhase[] = []): MoonPhase | null => {
  if (selectedPhases.length === 0) {
    return null;
  }

  const phase = getMoonPhase(date);
  const phaseName = getMoonPhaseName(phase);
  
  return phaseName && selectedPhases.includes(phaseName) ? phaseName : null;
};

