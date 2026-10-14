import { escapeRegex } from "./escapeRegex.js";
import { charsToSwap } from "./charsToSwap.js";
import { lastCharsToSwap } from "./lastCharsToSwap.js";
import { handleSpecialCharacters } from "./handleSpecialCharacters.js";
import { swapFirstCharCase } from "./swapFirstCharCase.js";
export const getPatternForSearchCondition = (searchCondition) => {
    const str = searchCondition.expression;
    return (searchCondition.onlyWithSpacePrefix ? `(^|[ ¿¡'])` : ``) +
        (str.charAt(0).toLowerCase() !== str.charAt(0).toUpperCase() ? `[${str.charAt(0)}${swapFirstCharCase(str.charAt(0))}]` : escapeRegex(str.charAt(0))) +
        handleSpecialCharacters(str.substring(1, str.length - 1), charsToSwap) +
        handleSpecialCharacters(str.charAt(str.length - 1), lastCharsToSwap) +
        (searchCondition.onlyWithSpaceDotOrCommaSuffix ? `($|[ \\.,;\?!])` : ``);
};
