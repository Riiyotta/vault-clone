// Design tokens from CLONE_SPEC.md §0.1. The values live in tokens.json so the same file
// feeds tailwind.config.cjs (CommonJS) and the few Framer Motion color literals in JSX.
// stepBox = process-step number box (spec §8): active bg #fff / number #000, inactive bg white/2 / number #fff.
import tokens from './tokens.json'

export const colors = tokens.colors
export const stepBox = tokens.stepBox
