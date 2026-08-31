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

  const apiKey = process.env.LOCATIONIQ_API_KEY;

  if (!apiKey) {
    console.warn(
      'LOCATIONIQ_API_KEY is not configured in server environment. Location autocomplete fallback active.'
    );
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const locationIqUrl = `https://api.locationiq.com/v1/autocomplete?key=${encodeURIComponent(
      apiKey
    )}&q=${encodeURIComponent(query)}&limit=6&countrycodes=in&format=json`;

    const res = await fetch(locationIqUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'JayMaaSheetalaTours-LocationSearch/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    // LocationIQ returns HTTP 404 with {"error":"Unable to geocode"} when no matching locations exist
    if (res.status === 404) {
      return NextResponse.json({ success: true, data: [] });
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.warn(
        `LocationIQ API response warning (status ${res.status}):`,
        errorText || res.statusText
      );
      return NextResponse.json(
        { success: false, error: 'Location search unavailable', data: [] },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const json = await res.json();

    if (Array.isArray(json)) {
      const suggestions: LocationSuggestion[] = json.map(
        (item: any, idx: number) => {
          const mainText =
            item.display_place ||
            item.address?.name ||
            item.address?.city ||
            item.address?.town ||
            (item.display_name ? item.display_name.split(',')[0].trim() : query);

          const secondaryText =
            item.display_address ||
            [
              item.address?.state_district,
              item.address?.state,
              item.address?.country,
            ]
              .filter(Boolean)
              .join(', ') ||
            'India';

          const description =
            item.display_name ||
            `${mainText}${secondaryText ? `, ${secondaryText}` : ''}`;

          return {
            id: item.place_id ? String(item.place_id) : `liq-${idx}-${Date.now()}`,
            mainText,
            secondaryText,
            description,
          };
        }
      );

      return NextResponse.json({ success: true, data: suggestions });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      console.warn('LocationIQ request timed out for query:', query);
    } else {
      console.warn('LocationIQ autocomplete request failed:', err);
    }

    return NextResponse.json(
      { success: false, error: 'Location search error', data: [] },
      { status: 500 }
    );
  }
}
