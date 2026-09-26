// Tiny in-memory hand-off between the camera and result routes (avoids passing large JSON in URLs).
import type { ScanOutput } from '../model/engine';

let last: { output: ScanOutput; photoUri: string } | null = null;
export const setLastScan = (v: typeof last) => { last = v; };
export const getLastScan = () => last;
