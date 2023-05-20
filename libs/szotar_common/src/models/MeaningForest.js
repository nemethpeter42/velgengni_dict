import { MeaningBranch } from "./MeaningBranch.js";
import { MeaningLeaf } from "./MeaningLeaf.js";
class MeaningForest {
    val;
    toString() {
        return `{val: ${this.val}}`;
    }
    includes(searchPhrase, wholeWordMatch = false) {
        let matches = (word) => wholeWordMatch ? word === searchPhrase : word.includes(searchPhrase);
        return this.val.some(branch => branch.labels.some(e => matches(e)) ||
            branch.notes.some(e => matches(e)) ||
            branch.nextLevel.some(branch => branch.labels.some(e => matches(e)) ||
                branch.notes.some(e => matches(e)) ||
                branch.nextLevel.some(branch => branch.labels.some(e => matches(e)) ||
                    branch.notes.some(e => matches(e)) ||
                    matches(branch.val))));
    }
    includesRegex(regexRaw, wholeWordMatch = false) {
        let regex = RegExp(wholeWordMatch ? regexRaw : `^.*${regexRaw}.*$`);
        let matches = (word) => regex.test(word);
        return this.val.some(branch => branch.labels.some(e => matches(e)) ||
            branch.notes.some(e => matches(e)) ||
            branch.nextLevel.some(branch => branch.labels.some(e => matches(e)) ||
                branch.notes.some(e => matches(e)) ||
                branch.nextLevel.some(branch => branch.labels.some(e => matches(e)) ||
                    branch.notes.some(e => matches(e)) ||
                    matches(branch.val))));
    }
    constructor(val = []) {
        this.val = val;
    }
    static fromString = (meaningsColumnEntryInCsv) => {
        const ESCAPE_CHARACTER = `\\`;
        const COMMENT_DELIMITER = `;`;
        // lvl 1 = meaning group
        const MEANING_GROUP_DELIMITER = `;`;
        const LVL1_COMMENT_OPENING = `(`;
        const LVL1_COMMENT_CLOSURE = `)`;
        // lvl 2 = close meanings
        const CLOSE_MEANINGS_DELIMITER = `,`;
        const LVL2_COMMENT_OPENING = `{`;
        const LVL2_COMMENT_CLOSURE = `}`;
        // lvl 3 = almost identical meanings
        const ALMOST_IDENTICAL_MEANINGS_DELIMITER = `/`;
        const LVL3_COMMENT_OPENING = `[`;
        const LVL3_COMMENT_CLOSURE = `]`;
        const COMMENT_CHARACTERS = new Set([
            LVL1_COMMENT_OPENING,
            LVL1_COMMENT_CLOSURE,
            LVL2_COMMENT_OPENING,
            LVL2_COMMENT_CLOSURE,
            LVL3_COMMENT_OPENING,
            LVL3_COMMENT_CLOSURE,
        ]);
        const findEscapedPositions = (str, specialCharacters) => {
            specialCharacters = new Set(specialCharacters);
            specialCharacters.add(ESCAPE_CHARACTER);
            //console.log(specialCharacters)
            let positions = new Set();
            let previousCharacter;
            if (str.length > 0) {
                previousCharacter = str[0];
            }
            for (let i = 1; i < str.length; ++i) {
                //console.log(str[i-1] === ESCAPE_CHARACTER)
                if (str[i - 1] === ESCAPE_CHARACTER && specialCharacters.has(str[i])) {
                    [i - 1, i].forEach(e => positions.add(e));
                    //console.log(str[i-1])
                    ++i; // dupla ugratás
                }
            }
            // ha az utolsó karakter ESCAPE_CHARACTER és az előtte álló nincs az eredményhalmazban, dobhatnánk hibát
            //console.log(positions)
            return positions;
        };
        const splitStringWithoutScanningParenthesesContent = (str, delimiter) => {
            const escapedPositions = findEscapedPositions(str, new Set([delimiter, ...COMMENT_CHARACTERS]));
            let isInsideLvl1Comment = false;
            let isInsideLvl2Comment = false;
            let isInsideLvl3Comment = false;
            let resultArray = [];
            let splittingPoints = [];
            for (let i = 0; i < str.length; ++i) {
                if (!escapedPositions.has(i)) {
                    if (isInsideLvl1Comment !== true && isInsideLvl2Comment !== true && isInsideLvl3Comment !== true) {
                        if (str[i] === LVL1_COMMENT_OPENING) {
                            isInsideLvl1Comment = true;
                        }
                        else if (str[i] === LVL2_COMMENT_OPENING) {
                            isInsideLvl2Comment = true;
                        }
                        else if (str[i] === LVL3_COMMENT_OPENING) {
                            isInsideLvl3Comment = true;
                        }
                        else if (str[i] === delimiter) {
                            splittingPoints.push(i);
                        }
                    }
                    else if (isInsideLvl1Comment === true && str[i] === LVL1_COMMENT_CLOSURE) {
                        isInsideLvl1Comment = false;
                    }
                    else if (isInsideLvl2Comment === true && str[i] === LVL2_COMMENT_CLOSURE) {
                        isInsideLvl2Comment = false;
                    }
                    else if (isInsideLvl3Comment === true && str[i] === LVL3_COMMENT_CLOSURE) {
                        isInsideLvl3Comment = false;
                    }
                }
            }
            splittingPoints = [-1, ...splittingPoints, str.length];
            // starting with second element
            for (let i = 1; i < splittingPoints.length; ++i) {
                resultArray.push(str.
                    substring(splittingPoints[i - 1] + 1, splittingPoints[i]).
                    trim().
                    replace(new RegExp(delimiter + delimiter + `+`, "g"), delimiter));
            }
            resultArray = resultArray.filter(e => e !== ``);
            if (resultArray.length === 0) {
                resultArray = [``];
            }
            return resultArray;
        };
        class ExtractLevelResponse {
            notes = [];
            labels = [];
            rawNextLevel = ``;
        }
        const transformStarsToSpecialLabels = (str, escapedPositions) => {
            for (let i = str.length - 1; i <= 0; --i) {
                if (str[i] === `*` && str[i - 1] === `*` && str[i - 2] === `*`) {
                    if (!escapedPositions.has(i - 2)) {
                        str = `${str.substring(0, i - 2)}(1!)${str.substring(i + 1)}`;
                    }
                    i = i - 2;
                }
                else if (str[i] === `*` && str[i - 1] === `*`) {
                    if (!escapedPositions.has(i - 1)) {
                        str = `${str.substring(0, i - 1)}{1!}${str.substring(i + 1)}`;
                    }
                    i = i - 1;
                }
                else if (str[i] === `*`) {
                    if (!escapedPositions.has(i)) {
                        str = `${str.substring(0, i)}[1!]${str.substring(i + 1)}`;
                    }
                    //itt nincs plusz léptetés
                }
            }
            return str;
        };
        const extractLevel = (str, openingSymbol, closureSymbol, commentDelimiter) => {
            const escapedPositions = findEscapedPositions(str, new Set([openingSymbol, closureSymbol, commentDelimiter]));
            let outsideSections = [``];
            let insideSections = [``];
            let isInsideComment = false;
            str = transformStarsToSpecialLabels(str, escapedPositions);
            for (let i = 0; i < str.length; ++i) {
                if (isInsideComment !== true) {
                    if (!escapedPositions.has(i) && str[i] === openingSymbol) {
                        isInsideComment = true;
                        insideSections.push(``);
                    }
                    else {
                        outsideSections[outsideSections.length - 1] = outsideSections[outsideSections.length - 1] + str[i];
                    }
                }
                else if (isInsideComment === true) {
                    if (!escapedPositions.has(i) && str[i] === closureSymbol) {
                        isInsideComment = false;
                        outsideSections.push(``);
                    }
                    else {
                        insideSections[insideSections.length - 1] = insideSections[insideSections.length - 1] + str[i];
                    }
                }
            }
            insideSections = insideSections.map(e => e.trim()).flatMap(e => splitStringWithoutScanningParenthesesContent(e, commentDelimiter)).map(e => e.trim()).filter(e => e !== ``);
            outsideSections = outsideSections.map(e => e.trim());
            let result = new ExtractLevelResponse();
            result.notes = insideSections.filter(e => e[e.length - 1] !== `!`).map(e => unesc(e));
            result.labels = insideSections.filter(e => e[e.length - 1] === `!`).map(e => unesc(e.substring(0, e.length - 1)));
            result.rawNextLevel = outsideSections.join(` `);
            return result;
        };
        // un-escape string
        const unesc = (str) => {
            const escapedPositions = findEscapedPositions(str, new Set([
                ...COMMENT_CHARACTERS,
                COMMENT_DELIMITER,
                MEANING_GROUP_DELIMITER,
                CLOSE_MEANINGS_DELIMITER,
                ALMOST_IDENTICAL_MEANINGS_DELIMITER,
                ESCAPE_CHARACTER,
            ]));
            let escapedPositionsArr = Array.from(escapedPositions);
            //escape characters are always the first from a pair
            //as we are deleting from string, we process it in backwards direction
            for (let i = escapedPositionsArr.length - 2; i >= 0; i -= 2) {
                let pos = escapedPositionsArr[i];
                str = str.substring(0, pos) + str.substring(pos + 1);
            }
            return str;
        };
        //console.log(meaningsColumnEntryInCsv)
        // lvl3 -outermost level lvl1 -innermost level (with the meaning values)
        let meaningTreeResult = splitStringWithoutScanningParenthesesContent(meaningsColumnEntryInCsv, MEANING_GROUP_DELIMITER).
            map(e => extractLevel(e, LVL1_COMMENT_OPENING, LVL1_COMMENT_CLOSURE, COMMENT_DELIMITER)).
            map(e => {
            let res = new MeaningBranch();
            res.labels = e.labels;
            res.notes = e.notes;
            res.nextLevel =
                splitStringWithoutScanningParenthesesContent(e.rawNextLevel, CLOSE_MEANINGS_DELIMITER).
                    map(e => extractLevel(e, LVL2_COMMENT_OPENING, LVL2_COMMENT_CLOSURE, COMMENT_DELIMITER)).
                    map(e => {
                    let res = new MeaningBranch();
                    res.labels = e.labels;
                    res.notes = e.notes;
                    res.nextLevel =
                        splitStringWithoutScanningParenthesesContent(e.rawNextLevel, ALMOST_IDENTICAL_MEANINGS_DELIMITER).
                            map(e => extractLevel(e, LVL3_COMMENT_OPENING, LVL3_COMMENT_CLOSURE, COMMENT_DELIMITER)).
                            map(e => {
                            let res = new MeaningLeaf();
                            res.labels = e.labels;
                            res.notes = e.notes;
                            res.val = unesc(e.rawNextLevel);
                            return res;
                        });
                    return res;
                });
            return res;
        });
        //console.log(JSON.stringify(meaningTreeResult)+`\n`)
        return new MeaningForest(meaningTreeResult);
    };
}
export { MeaningForest };
