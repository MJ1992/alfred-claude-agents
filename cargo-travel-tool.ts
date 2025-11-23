import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

/**
 * Calculate the travel time for a cargo plane between two points on Earth using great-circle distance.
 * 
 * Based on the haversine formula for calculating distances on a sphere.
 * Accounts for non-direct routes and includes takeoff/landing time.
 */
export const calculateCargoTravelTime = tool(
  'calculate_cargo_travel_time',
  'Calculate the travel time for a cargo plane between two points on Earth using great-circle distance.',
  {
    origin_coords: z
      .tuple([z.number(), z.number()])
      .describe('Tuple of [latitude, longitude] for the starting point'),
    destination_coords: z
      .tuple([z.number(), z.number()])
      .describe('Tuple of [latitude, longitude] for the destination'),
    cruising_speed_kmh: z
      .number()
      .optional()
      .default(750.0)
      .describe('Optional cruising speed in km/h (defaults to 750 km/h for typical cargo planes)'),
  },
  async (args) => {
    const { origin_coords, destination_coords, cruising_speed_kmh = 750.0 } = args;

    // Helper function to convert degrees to radians
    const toRadians = (degrees: number): number => {
      return degrees * (Math.PI / 180);
    };

    // Extract coordinates
    const [lat1, lon1] = origin_coords;
    const [lat2, lon2] = destination_coords;

    // Convert to radians
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Earth's radius in kilometers
    const EARTH_RADIUS_KM = 6371.0;

    // Calculate great-circle distance using the haversine formula
    const dlon = lon2Rad - lon1Rad;
    const dlat = lat2Rad - lat1Rad;

    const a =
      Math.pow(Math.sin(dlat / 2), 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.pow(Math.sin(dlon / 2), 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    const distance = EARTH_RADIUS_KM * c;

    // Add 10% to account for non-direct routes and air traffic controls
    const actualDistance = distance * 1.1;

    // Calculate flight time
    // Add 1 hour for takeoff and landing procedures
    const flightTime = actualDistance / cruising_speed_kmh + 1.0;

    // Format the results
    const roundedTime = Math.round(flightTime * 100) / 100;

    return {
      content: [
        {
          type: 'text',
          text: `Travel time from (${lat1}, ${lon1}) to (${lat2}, ${lon2}): ${roundedTime} hours`,
        },
      ],
    };
  }
);

