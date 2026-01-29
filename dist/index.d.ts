import type { Plugin } from 'vite';
export interface ExtractDrupalTOptions {
    include?: string | string[];
    exclude?: string | string[];
}
export default function extractDrupalT(options?: ExtractDrupalTOptions): Plugin;
