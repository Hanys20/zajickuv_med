type GoogleReview = {
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  reviews?: GoogleReview[];
  googleMapsUri?: string;
  googleMapsLinks?: { reviewsUri?: string };
  attributions?: { provider?: string; providerUri?: string }[];
};

type ReviewsCacheRow = {
  response_json: string | null;
  response_status: number;
  fetched_at: number | null;
  refresh_after: number;
};

const PLACE_NAME = 'Zajíčkův med';
const PLACE_LOCATION = { latitude: 49.8776674, longitude: 17.9737188 };
const PLACE_FIELDS =
  'id,displayName,location,rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks,attributions';
const CACHE_TTL_SECONDS = 24 * 60 * 60;

function isExpectedPlace(place: GooglePlace): boolean {
  const name = place.displayName?.text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  return (
    name === 'zajickuv med' &&
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Math.abs(latitude - PLACE_LOCATION.latitude) < 0.005 &&
    Math.abs(longitude - PLACE_LOCATION.longitude) < 0.005
  );
}

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

function cachedResponse(row: ReviewsCacheRow, cacheStatus: 'HIT' | 'STALE'): Response {
  const age = row.fetched_at === null ? null : Math.max(0, Math.floor(Date.now() / 1000) - row.fetched_at);
  return new Response(row.response_json, {
    status: row.response_status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-reviews-cache': cacheStatus,
      ...(age === null ? {} : { 'x-reviews-cache-age': String(age) }),
    },
  });
}

async function fetchGoogleReviews(apiKey?: string, placeId?: string): Promise<Response> {
  if (!apiKey) return json({ available: false });

  const usePlaceId = Boolean(placeId);
  const url = usePlaceId
    ? `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId!)}`
    : 'https://places.googleapis.com/v1/places:searchText';
  const fieldMask = usePlaceId
    ? PLACE_FIELDS
    : PLACE_FIELDS.split(',').map((field) => `places.${field}`).join(',');

  let data: GooglePlace & { places?: GooglePlace[] };
  try {
    const response = await fetch(url, {
      method: usePlaceId ? 'GET' : 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      ...(usePlaceId
        ? {}
        : {
            body: JSON.stringify({
              textQuery: 'Zajíčkův med, Raduňská 5/20, 747 06 Opava-Podvihov',
              languageCode: 'cs',
              regionCode: 'CZ',
              pageSize: 3,
              locationBias: { circle: { center: PLACE_LOCATION, radius: 1000 } },
            }),
          }),
    });

    if (!response.ok) {
      console.error('Google Places reviews request failed:', response.status);
      return json({ available: false }, 502);
    }
    data = (await response.json()) as GooglePlace & { places?: GooglePlace[] };
  } catch (error) {
    console.error('Google Places reviews request failed:', error);
    return json({ available: false }, 502);
  }
  const place = usePlaceId ? data : data.places?.find(isExpectedPlace);
  if (!place || !isExpectedPlace(place)) return json({ available: false }, 502);

  const reviews = (place.reviews ?? [])
    .filter((review) => Boolean(review.text?.text?.trim() && review.googleMapsUri))
    .slice(0, 3)
    .map((review) => ({
      text: review.text!.text!,
      rating: review.rating ?? null,
      relativeTime: review.relativePublishTimeDescription ?? null,
      authorName: review.authorAttribution?.displayName ?? 'Uživatel Google',
      authorUrl: review.authorAttribution?.uri ?? null,
      authorPhotoUrl: review.authorAttribution?.photoUri ?? null,
      reviewUrl: review.googleMapsUri!,
      translated: Boolean(
        review.originalText?.languageCode &&
          review.text?.languageCode &&
          review.originalText.languageCode !== review.text.languageCode
      ),
    }));

  return json({
    available: true,
    rating: place.rating ?? null,
    count: place.userRatingCount ?? 0,
    reviews,
    reviewsUrl: place.googleMapsLinks?.reviewsUri ?? place.googleMapsUri ?? null,
    attributions: place.attributions ?? [],
  });
}

export async function handleGoogleReviews(
  db: D1Database,
  apiKey?: string,
  placeId?: string
): Promise<Response> {
  const now = Math.floor(Date.now() / 1000);
  const selectCache = () =>
    db
      .prepare(
        'SELECT response_json, response_status, fetched_at, refresh_after FROM google_reviews_cache WHERE id = 1'
      )
      .first<ReviewsCacheRow>();

  let cached = await selectCache();
  if (cached?.response_json && cached.refresh_after > now) {
    return cachedResponse(cached, 'HIT');
  }

  // Atomický zápis zajistí, že globálně získá právo volat Google pouze jeden
  // požadavek za klouzavých 24 hodin, i kdyby přišlo více návštěv současně.
  const claim = await db
    .prepare(
      'UPDATE google_reviews_cache SET refresh_after = ? WHERE id = 1 AND refresh_after <= ?'
    )
    .bind(now + CACHE_TTL_SECONDS, now)
    .run();

  if (claim.meta.changes === 0) {
    cached = await selectCache();
    if (cached?.response_json) return cachedResponse(cached, 'STALE');
    return json({ available: false }, 200, {
      'x-reviews-cache': 'PENDING',
      'retry-after': '5',
    });
  }

  // I neúspěšná odpověď se uloží na 24 hodin. Výpadek nebo špatný klíč tak
  // nemůže způsobit opakované placené pokusy při každé návštěvě stránky.
  const upstream = await fetchGoogleReviews(apiKey, placeId);
  const responseJson = await upstream.text();
  await db
    .prepare(
      'UPDATE google_reviews_cache SET response_json = ?, response_status = ?, fetched_at = ? WHERE id = 1'
    )
    .bind(responseJson, upstream.status, now)
    .run();

  return new Response(responseJson, {
    status: upstream.status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-reviews-cache': 'MISS',
      'x-reviews-cache-age': '0',
    },
  });
}
