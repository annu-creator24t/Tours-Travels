import { NextRequest, NextResponse } from 'next/server';

export interface LocationSuggestion {
  id: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  const googleMapsKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. If Google Maps API key is configured, query Google Places Autocomplete API
  if (googleMapsKey) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&components=country:in&language=en&key=${googleMapsKey}`;

      const res = await fetch(googleUrl, {
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'OK' && Array.isArray(json.predictions)) {
          const suggestions: LocationSuggestion[] = json.predictions.map(
            (item: any, idx: number) => ({
              id: item.place_id || `g-${idx}-${Date.now()}`,
              mainText:
                item.structured_formatting?.main_text ||
                item.description.split(',')[0] ||
                item.description,
              secondaryText:
                item.structured_formatting?.secondary_text ||
                item.description.split(',').slice(1).join(',').trim() ||
                'India',
              description: item.description,
            })
          );
          return NextResponse.json({ success: true, data: suggestions });
        }
      }
    } catch (err) {
      console.warn('Google Places autocomplete error, falling back to OSM:', err);
    }
  }

  // 2. OpenStreetMap / Photon Autocomplete Provider (Free, reliable, no key required)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query
    )}&limit=6&lang=en`;

    const res = await fetch(photonUrl, {
      headers: {
        'User-Agent': 'ToursAndTravels-LocationSearch/1.0',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.features)) {
        const suggestions: LocationSuggestion[] = json.features.map(
          (feat: any, idx: number) => {
            const props = feat.properties || {};
            const name = props.name || query;
            const contextParts = [
              props.district,
              props.city,
              props.state,
              props.country,
            ].filter(Boolean);
            const secondaryText = contextParts.join(', ') || 'India';
            const description = `${name}${secondaryText ? `, ${secondaryText}` : ''}`;

            return {
              id: props.osm_id ? String(props.osm_id) : `osm-${idx}-${Date.now()}`,
              mainText: name,
              secondaryText,
              description,
            };
          }
        );

        if (suggestions.length > 0) {
          return NextResponse.json({ success: true, data: suggestions });
        }
      }
    }
  } catch (photonErr) {
    console.warn('Photon autocomplete failed, trying Nominatim fallback:', photonErr);
  }

  // 3. Nominatim OSM Fallback
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=6&countrycodes=in`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'ToursAndTravels-LocationSearch/1.0',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        const suggestions: LocationSuggestion[] = json.map(
          (item: any, idx: number) => {
            const address = item.address || {};
            const mainText =
              address.city ||
              address.town ||
              address.village ||
              address.suburb ||
              item.display_name.split(',')[0];
            const secondaryText = [
              address.state_district,
              address.state,
              address.country,
            ]
              .filter(Boolean)
              .join(', ');

            return {
              id: item.place_id ? String(item.place_id) : `nom-${idx}-${Date.now()}`,
              mainText,
              secondaryText: secondaryText || 'India',
              description: item.display_name,
            };
          }
        );
        return NextResponse.json({ success: true, data: suggestions });
      }
    }
  } catch (nomErr) {
    console.warn('Nominatim fallback failed:', nomErr);
  }

  // Gracefully return empty list so manual typing works uninterrupted
  return NextResponse.json({ success: true, data: [] });
}
