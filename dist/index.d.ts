import type { Plugin } from 'rollup';
export interface ExtractDrupalTOptions {
    include?: string | string[];
    exclude?: string | string[];
}
export default function extractDrupalT(options?: ExtractDrupalTOptions): Plugin;
