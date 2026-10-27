import { useState } from 'react';

export type WebGLSupport = 'supported' | 'unsupported';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

/** Detects once whether the browser can create a WebGL context. */
export function useWebGLSupport(): WebGLSupport {
  const [support] = useState<WebGLSupport>(() =>
    detectWebGL() ? 'supported' : 'unsupported',
  );
  return support;
}
