import { escapeRegex } from "./escapeRegex.js";
export const handleSpecialCharacters = (str, charsToSwap) => {
    return str.split(``).map(char => {
        if (char in charsToSwap) {
            return charsToSwap[char];
        }
        else {
            return escapeRegex(char);
        }
    }).join(``);
};
