/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return parseFloat(distance.toFixed(1));
}

/**
 * Geocode UK postcode to lat/lng using postcodes.io API
 */
export async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const cleanedPostcode = postcode.trim().replace(/\s+/g, "");
        const response = await fetch(`https://api.postcodes.io/postcodes/${cleanedPostcode}`);
        
        if (!response.ok) {
            console.warn(`Geocoding failed for postcode: ${postcode}`);
            return null;
        }

        const data = await response.json();
        
        if (data.result) {
            return {
                lat: data.result.latitude,
                lng: data.result.longitude,
            };
        }

        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

/**
 * Format distance for display (e.g., "0.2 miles", "1.5 miles")
 */
export function formatDistance(miles: number): string {
    if (miles < 0.1) {
        return "< 0.1 miles";
    }
    return `${miles} miles`;
}
