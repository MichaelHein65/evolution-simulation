const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '');

const baseSegment = trimSlashes(import.meta.env.BASE_URL);

export const routerBasename = baseSegment ? `/${baseSegment}` : undefined;

export const withBasePath = (path = ''): string => {
  const trimmedPath = trimSlashes(path);

  if (!trimmedPath) {
    return routerBasename ?? '/';
  }

  return routerBasename ? `${routerBasename}/${trimmedPath}` : `/${trimmedPath}`;
};

const apiOrigin = import.meta.env.VITE_API_ORIGIN?.replace(/\/+$/g, '') ?? (import.meta.env.DEV ? 'http://127.0.0.1:3001' : '');

export const withApiPath = (path: string): string => {
  const trimmedPath = trimSlashes(path);

  if (!trimmedPath) {
    return apiOrigin || '/';
  }

  return apiOrigin ? `${apiOrigin}/${trimmedPath}` : `/${trimmedPath}`;
};
