// Registers tests/hooks.mjs (see package.json "test").
import { register } from 'node:module';
register('./hooks.mjs', import.meta.url);
