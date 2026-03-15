export type { AnchorDescriptor } from './types';
export { createDescriptor } from './descriptor';
export { serialize, deserialize, parseIds, COLOR_KEYS, CORNER_KEYS } from './serializer';
export { resolve } from './resolver';
export { hashCode, RAW_PLACEHOLDER_RE, collectStableText, getStableTextContent, getStableNormalizedText } from './stable-text';
