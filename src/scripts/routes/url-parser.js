/**
 * Mengambil params dari URL yang cocok dengan route pattern.
 * Contoh:
 *   routePattern = '/story/:id'
 *   url = '/story/123'
 *   return { id: '123' }
 */
export function parseRouteParams(routePattern, url) {
  const patternSegments = routePattern.split('/').filter(Boolean);
  const urlSegments = url.split('/').filter(Boolean);

  const params = {};

  patternSegments.forEach((segment, i) => {
    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      params[paramName] = urlSegments[i] || null;
    }
  });

  return params;
}

// Pisahkan pathname menjadi resource dan id, contoh: /story/123 => { resource: 'story', id: '123' }
function extractPathnameSegments(path) {
  const segments = path.split('/').filter(Boolean);
  return {
    resource: segments[0] || null,
    id: segments[1] || null,
  };
}

// Buat route pattern dari segments, contoh: { resource: 'story', id: '123' } => '/story/:id'
function constructRouteFromSegments({ resource, id }) {
  if (!resource) return '/';
  return id ? `/${resource}/:id` : `/${resource}`;
}

// Ambil pathname dari URL hash, contoh: #/story/123 => /story/123
export function getActivePathname() {
  return window.location.hash.slice(1) || '/';
}

// Ambil route pattern yang cocok dari hash saat ini, contoh: #/story/123 => '/story/:id'
export function getActiveRoute() {
  const pathname = getActivePathname();
  const segments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(segments);
}

// Parse objek { resource, id } dari pathname string (contoh: '/story/123')
export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}

// Parse objek { resource, id } dari hash aktif saat ini (contoh: #/story/123)
export function parseActivePathname() {
  return parsePathname(getActivePathname());
}

// Dapatkan route pattern dari string path (misal input '/story/123' => output '/story/:id')
export function getRoute(pathname) {
  return constructRouteFromSegments(parsePathname(pathname));
}
