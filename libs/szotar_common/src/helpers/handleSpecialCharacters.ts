import { escapeRegex } from "./escapeRegex.js"

export const handleSpecialCharacters = (str: string, charsToSwap: Record<string, string>): string => {
  return str.split(``).map(char => {			
    if (char in charsToSwap) {
      return charsToSwap[char]
    } else {
      return escapeRegex(char)
    }
  }).join(``)
}