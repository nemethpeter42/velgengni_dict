// Minimal OpenDocument Spreadsheet (.ods) reader.
// An .ods file is a zip archive; the cell data lives in content.xml.
import { unzipSync, strFromU8 } from 'fflate';
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: ``,
    ignoreDeclaration: true,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
});
const tagOf = (node) => Object.keys(node).find(key => key !== `:@`);
const attrsOf = (node) => node[`:@`] ?? {};
const childrenOf = (node) => Array.isArray(node[tagOf(node)]) ? node[tagOf(node)] : [];
const findChild = (nodes, tag) => nodes.find(node => tagOf(node) === tag);
// ODF white-space rules: a run of literal whitespace collapses into a single space and is dropped
// at the start and end of a paragraph; intended spaces are stored as <text:s text:c="n"/>.
function paragraphText(paragraph) {
    let text = ``;
    let pendingSpace = false;
    const append = (part) => {
        if (pendingSpace && text !== ``)
            text += ` `;
        pendingSpace = false;
        text += part;
    };
    const walk = (nodes) => {
        for (const node of nodes) {
            switch (tagOf(node)) {
                case `#text`:
                    for (const part of String(node[`#text`]).split(/([ \t\r\n]+)/)) {
                        if (/^[ \t\r\n]+$/.test(part))
                            pendingSpace = true;
                        else if (part !== ``)
                            append(part);
                    }
                    break;
                case `text:s`:
                    append(` `.repeat(Number(attrsOf(node)[`text:c`] ?? 1)));
                    break;
                case `text:tab`:
                    append(`\t`);
                    break;
                case `text:line-break`:
                    append(`\n`);
                    break;
                // comments and footnotes are not part of the cell's value
                case `office:annotation`:
                case `text:note`: break;
                default: walk(childrenOf(node));
            }
        }
    };
    walk(childrenOf(paragraph));
    return text;
}
function cellValue(cell) {
    const attrs = attrsOf(cell);
    switch (attrs[`office:value-type`]) {
        case `float`:
        case `percentage`:
        case `currency`:
            return Number(attrs[`office:value`]);
        case `boolean`:
            return attrs[`office:boolean-value`] === `true`;
    }
    return childrenOf(cell)
        .filter(node => tagOf(node) === `text:p`)
        .map(paragraphText)
        .join(`\n`);
}
function readRows(table) {
    const rows = [];
    // LibreOffice pads sheets with huge repeated empty rows/cells (e.g. 1048576 rows),
    // so empty ones are only materialized when something non-empty follows them.
    let pendingEmptyRows = 0;
    const readRow = (row) => {
        const cells = [];
        let pendingEmptyCells = 0;
        for (const cell of childrenOf(row)) {
            const tag = tagOf(cell);
            if (tag !== `table:table-cell` && tag !== `table:covered-table-cell`)
                continue;
            const repeat = Number(attrsOf(cell)[`table:number-columns-repeated`] ?? 1);
            const value = cellValue(cell);
            if (value === ``) {
                pendingEmptyCells += repeat;
                continue;
            }
            for (; pendingEmptyCells > 0; pendingEmptyCells--)
                cells.push(``);
            for (let i = 0; i < repeat; i++)
                cells.push(value);
        }
        const repeat = Number(attrsOf(row)[`table:number-rows-repeated`] ?? 1);
        if (cells.length === 0) {
            pendingEmptyRows += repeat;
            return;
        }
        for (; pendingEmptyRows > 0; pendingEmptyRows--)
            rows.push([]);
        for (let i = 0; i < repeat; i++)
            rows.push([...cells]);
    };
    const visit = (nodes) => {
        for (const node of nodes) {
            switch (tagOf(node)) {
                case `table:table-row`:
                    readRow(node);
                    break;
                case `table:table-header-rows`:
                case `table:table-rows`:
                case `table:table-row-group`:
                    visit(childrenOf(node));
                    break;
            }
        }
    };
    visit(childrenOf(table));
    return rows;
}
export function readOds(data) {
    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const files = unzipSync(bytes, { filter: file => file.name === `content.xml` });
    if (!files[`content.xml`])
        throw new Error(`Not an .ods file: content.xml is missing`);
    const xml = parser.parse(strFromU8(files[`content.xml`]));
    const documentContent = findChild(xml, `office:document-content`);
    const body = documentContent && findChild(childrenOf(documentContent), `office:body`);
    const spreadsheet = body && findChild(childrenOf(body), `office:spreadsheet`);
    if (!spreadsheet)
        throw new Error(`Not an .ods file: no spreadsheet in content.xml`);
    return childrenOf(spreadsheet)
        .filter(node => tagOf(node) === `table:table`)
        .map(table => ({ name: attrsOf(table)[`table:name`] ?? ``, rows: readRows(table) }));
}
// Turns rows into objects keyed by the first non-empty row (the header), like SheetJS's
// sheet_to_json(sheet, { defval: `` }): blank rows are skipped, missing cells become ``,
// empty headers become __EMPTY, __EMPTY_1, ... and duplicate headers get a _1, _2 suffix.
export function sheetToObjects(rows) {
    const headerIndex = rows.findIndex(row => row.length > 0);
    if (headerIndex === -1)
        return [];
    const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const usedKeys = new Map();
    const keys = [];
    for (let col = 0; col < width; col++) {
        const header = rows[headerIndex][col];
        const base = header === undefined || header === `` ? `__EMPTY` : String(header);
        const count = usedKeys.get(base) ?? 0;
        usedKeys.set(base, count + 1);
        keys.push(count === 0 ? base : `${base}_${count}`);
    }
    return rows
        .slice(headerIndex + 1)
        .filter(row => row.some(value => value !== ``))
        .map(row => Object.fromEntries(keys.map((key, col) => [key, row[col] ?? ``])));
}
