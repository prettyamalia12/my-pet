export const BODY_COLORS = [
  { value: '#fdf8f0', label: 'Snow' },
  { value: '#ed9752', label: 'Ginger' },
  { value: '#9aa5b1', label: 'Misty grey' },
  { value: '#5c534e', label: 'Cocoa' },
] as const;

export const EYE_COLORS = [
  { value: '#d9a441', label: 'Amber' },
  { value: '#5fa86b', label: 'Green' },
  { value: '#5b8dd9', label: 'Blue' },
] as const;

/** Secondary coat color — fills the patched ear, forehead, and body zones. */
export const PATCH_COLORS = [
  { value: '#c47837', label: 'Toffee' },
  { value: '#4a4a55', label: 'Charcoal' },
  { value: '#e5a0a8', label: 'Rosé' },
  { value: '#8a5a3b', label: 'Chocolate' },
  { value: '#9aa5b1', label: 'Misty grey' },
] as const;

/** Tertiary accent — tail tip, ear tip, and a small belly spot. */
export const ACCENT_COLORS = [
  { value: '#4a4a55', label: 'Charcoal' },
  { value: '#fdf8f0', label: 'Snow' },
  { value: '#c47837', label: 'Toffee' },
  { value: '#5c534e', label: 'Cocoa' },
] as const;

export interface CatBreed {
  id: string;
  label: string;
  bodyColor: string;
  secondaryColor: string;
  accentColor: string;
  /** 'short' squashes the figure toward the ground; 'slender' narrows it. */
  build: 'round' | 'short' | 'slender';
  /** Which color zones are active. */
  pattern: 'patch' | 'solid' | 'points';
}

export const CAT_BREEDS: readonly CatBreed[] = [
  {
    id: 'british-shorthair',
    label: 'British Shorthair',
    bodyColor: '#fdf8f0',
    secondaryColor: '#c47837',
    accentColor: '#4a4a55',
    build: 'round',
    pattern: 'patch',
  },
  {
    id: 'calico',
    label: 'Calico',
    bodyColor: '#fdf8f0',
    secondaryColor: '#e8862e',
    accentColor: '#4a4a55',
    build: 'round',
    pattern: 'patch',
  },
  {
    id: 'munchkin',
    label: 'Munchkin',
    bodyColor: '#f2dfc8',
    secondaryColor: '#c47837',
    accentColor: '#4a4a55',
    build: 'short',
    pattern: 'patch',
  },
  {
    id: 'persian',
    label: 'Persian',
    bodyColor: '#fdf8f0',
    secondaryColor: '#c47837',
    accentColor: '#8a5a3b',
    build: 'round',
    pattern: 'solid',
  },
  {
    id: 'angora',
    label: 'Angora',
    bodyColor: '#fdf8f0',
    secondaryColor: '#4a4a55',
    accentColor: '#4a4a55',
    build: 'slender',
    pattern: 'points',
  },
] as const;

export const DEFAULT_BREED = CAT_BREEDS[0];
