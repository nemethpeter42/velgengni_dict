import express from 'express';
import iconv from 'iconv-lite';
const router = express.Router();
const dudenEntryUrlFormat = (word) => {
    let charachtersToReplace = [
        { from: 'ä', to: 'ae' },
        { from: 'ö', to: 'oe' },
        { from: 'ü', to: 'ue' },
        { from: 'ß', to: 'sz' },
        { from: 'Ä', to: 'Ae' },
        { from: 'Ö', to: 'Oe' },
        { from: 'Ü', to: 'Ue' },
    ];
    charachtersToReplace.forEach(e => { word = word.split(e.from).join(e.to); });
    return word;
};
const encodeURI = (str, encoding) => {
    if (!encoding || encoding == 'utf8' || encoding == 'utf-8') {
        return encodeURIComponent(str);
    }
    let buf = iconv.encode(str, encoding);
    let encoded = [];
    for (let pair of buf.entries()) {
        let value = pair[1];
        // Test if value is unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~" https://tools.ietf.org/html/rfc3986#section-2.3
        if ((value >= 65 && value <= 90) || // A-Z 
            (value >= 97 && value <= 122) || // a-z
            (value >= 48 && value <= 57) || // 0-9
            value == 45 || value == 46 || // "-" / "."
            value == 95 || value == 126 // "_" / "~"      
        ) {
            encoded.push(String.fromCharCode(value));
        }
        else {
            let hex = value.toString(16).toUpperCase();
            encoded.push("%" + (hex.length === 1 ? '0' + hex : hex));
        }
    }
    return encoded.join("");
};
const generateLinks = (lang, phrase) => {
    const all = {
        'de': [
            {
                title: `Wiktionary`,
                url: `https://en.wiktionary.org/wiki/${phrase}#German`,
            },
            {
                title: `Images`,
                url: `https://www.google.com/search?q=${phrase}+site%3A*.de&tbm=isch`,
            },
            {
                title: `Duden #1`,
                url: `https://www.duden.de/suchen/dudenonline/${phrase}`,
            },
            {
                title: `Duden #2`,
                url: `https://www.duden.de/rechtschreibung/${dudenEntryUrlFormat(phrase)}`,
            },
        ],
        'es': [
            {
                title: `Wiktionary`,
                url: `https://en.wiktionary.org/wiki/${phrase}#Spanish`,
            },
            {
                title: `Images`,
                url: `https://www.google.com/search?q=${phrase}+site%3A*.es&tbm=isch`,
            },
            {
                title: `Collins`,
                url: `https://www.collinsdictionary.com/dictionary/spanish-english/${phrase.replaceAll(` `, `-`)}`,
            },
        ],
        'is': [
            {
                title: `Wiktionary`,
                url: `https://en.wiktionary.org/wiki/${phrase}#Icelandic`,
            },
            {
                title: `Images`,
                url: `https://www.google.com/search?q=${phrase}+site%3A*.is&tbm=isch`,
            },
            {
                title: `Orðabók`,
                url: `https://islenskordabok.arnastofnun.is/leit/${phrase}`,
            },
            {
                title: `Wikt. German`,
                url: `https://de.wiktionary.org/wiki/${phrase}#${phrase}_(Isländisch)`,
            },
            {
                title: `UniWisconsin`,
                url: `http://digicoll.library.wisc.edu/cgi-bin/IcelOnline/IcelOnline.TEId-idx?type=simple&size=First+100&rgn=lemma&q1=${encodeURI(phrase, 'iso-8859-1')}&submit=Search`,
            },
        ],
        'ja': [
            {
                title: `Wiktionary`,
                url: `https://en.wiktionary.org/wiki/${phrase}#Japanese`,
            },
            {
                title: `Images`,
                url: `https://www.google.com/search?q=${phrase}+site%3A*.jp&tbm=isch`,
            },
            {
                title: `Jisho #1`,
                url: `https://www.jisho.org/search/${phrase}`,
            },
            {
                title: `Jisho #2`,
                url: `https://www.jisho.org/search/${phrase} %23sentences`,
            },
            {
                title: `Weblio`,
                url: `https://ejje.weblio.jp/content/${phrase}`,
            },
        ],
        'zh_cn': [
            {
                title: `Wiktionary`,
                url: `https://en.wiktionary.org/wiki/${phrase}#Chinese`
            },
            {
                title: `Images`,
                url: `https://www.google.com/search?q=${phrase}+site%3A*.jp&tbm=isch`
            },
        ]
    };
    return Object.keys(all).includes(lang) ? all[lang] : [];
};
router.get('/generate_links_for_entry', async (req, res) => {
    const reqParams = req.query;
    const lang = reqParams?.lang ?? ``;
    if (lang.trim() === ``) {
        res.status(400).send(`"lang" param must not be empty`);
        return;
    }
    const phrase = reqParams?.phrase?.trim() ?? ``;
    if (phrase.trim() === ``) {
        res.status(400).send(`"phrase" param must not be empty`);
        return;
    }
    const result = generateLinks(lang, phrase);
    res.json(result);
});
export default router;
