let html = ""
let jsdom

beforeAll(() => {
    const fs = require('fs');
    const path = require('path');
    html = fs.readFileSync(path.resolve(__dirname, './facebook-page_zh-Hant.html'));
    const JSDOM = require("jsdom").JSDOM;
    jsdom = new JSDOM(html);
})

beforeEach(() => {
    resetDocument()
})

function resetDocument() {
    document.documentElement.innerHTML = html
    document.documentElement.lang = jsdom.window.document.documentElement.lang
}

describe("facebook-spam-remover spec", () => {
    it("getLanguage", () => {
        const getLanguage = require("../facebook-spam-remover.user")()["getLanguage"]
        expect(getLanguage).toBeDefined()
        document.documentElement.lang = "en"
        expect(getLanguage()).toBe("en")
    })

    describe("LanguageResource", () => {
        it("getLanguageLabel", () => {
            let LanguageResource = require("../facebook-spam-remover.user")()["LanguageResource"];
            let languageResource = new LanguageResource({
                "en": {"post": "News Feed posts", "sponsor": "Sponsored"},
                "zh-Hant": {"post": '動態消息貼文', "sponsor": "贊助"}
            })

            expect(languageResource.getLanguageLabel).toBeDefined()
            expect(languageResource.getLanguageLabel("en", "post")).toBe("News Feed posts")
            expect(languageResource.getLanguageLabel("zh-Hant", "post")).toBe("動態消息貼文")
        })

        it("isLanguageSupported", () => {
            let LanguageResource = require("../facebook-spam-remover.user")()["LanguageResource"];
            let languageResource = new LanguageResource({
                "en": {"post": "News Feed posts", "sponsor": "Sponsored"},
                "zh-Hant": {"post": '動態消息貼文', "sponsor": "贊助"}
            })

            expect(languageResource.isLanguageSupported).toBeDefined()
            expect(languageResource.isLanguageSupported("en")).toBeTruthy()
            expect(languageResource.isLanguageSupported("zh-Hant")).toBeTruthy()
            expect(languageResource.isLanguageSupported("nl")).toBeFalsy()
        })
    })

    it("getPosts", () => {
        const getPosts = require("../facebook-spam-remover.user")()["getPosts"]
        resetDocument()
        let posts = getPosts("動態消息貼文")
        expect(posts.length).toBe(8)
    })

    it("getSponsorLabelId", () => {
        const getSponsorLabelId = require("../facebook-spam-remover.user")()["getSponsorLabelId"]
        resetDocument()
        let sponsorLabelId = getSponsorLabelId("贊助")
        expect(sponsorLabelId).toBe(":rb:")
    })

    it("getSponsorUseTextId", () => {
        const getSponsorUseTextId = require("../facebook-spam-remover.user")()["getSponsorUseTextId"]
        resetDocument()
        let sponsorUseTextId = getSponsorUseTextId("贊助")
        expect(sponsorUseTextId).toBe("SvgT1")
    })

    describe("isSponsorPost", () => {
        it("determine by use tag", () => {
            const isSponsorPost = require("../facebook-spam-remover.user")()["isSponsorPost"]
            let post = fromHTML("<div><use xlink:href='#sponsor' xmlns:xlink='http://www.w3.org/1999/xlink'></use></div>")
            expect(isSponsorPost(post, '', "sponsor")).toBeTruthy()
            expect(isSponsorPost(post, '', "not-exist-id")).toBeFalsy()
        })
        it("determine by aria-labelledby", () => {
            const isSponsorPost = require("../facebook-spam-remover.user")()["isSponsorPost"]
            let post = fromHTML("<div><span aria-labelledby='sponsor'>test</span></div>")
            expect(isSponsorPost(post, 'sponsor', '')).toBeTruthy()
            expect(isSponsorPost(post, 'not-exist-id', '')).toBeFalsy()
        })
        it("determine by aria-labelledby", () => {
            const isSponsorPost = require("../facebook-spam-remover.user")()["isSponsorPost"]
            expect(isSponsorPost(fromHTML("<div><a href='/ads/about'></a></div>"), '', '')).toBeTruthy()
            expect(isSponsorPost(fromHTML("<div><a href='/something_else'></a></div>"), '', '')).toBeFalsy()
        })
    })

    describe('getHiddenUrlPostLinks', () => {
        it("href should start with '?__cft__'", () => {
            const getHiddenUrlPostLinks = require("../facebook-spam-remover.user")()["getHiddenUrlPostLinks"]
            let post = fromHTML("<div><a id='1' href='?__cft__'></a><a id='2' href='/some_link'></a></div>")
            let actual = getHiddenUrlPostLinks(post)
            expect(actual.length).toBe(1)
            expect(actual[0].id).toBe('1')
        })

        it("should not have aria-label attribute", () => {
            const getHiddenUrlPostLinks = require("../facebook-spam-remover.user")()["getHiddenUrlPostLinks"]
            let post = fromHTML("<div><a id='2' aria-label='' href='?__cft__'></a></div>")
            let actual = getHiddenUrlPostLinks(post)
            expect(actual.length).toBe(0)
        })
    })

    it("sponsor posts are hidden", () => {
        const getPosts = require("../facebook-spam-remover.user")()["getPosts"]
        let posts = getPosts("動態消息貼文")
        expect(posts[0].style.display).toBe("")
        expect(posts[1].style.display).toBe("none")
        expect(posts[4].style.display).toBe("none")
    })
})

/**
 * @param {String} html representing a single element.
 * @param {Boolean} trim representing whether or not to trim input whitespace, defaults to true.
 * @return {Element | HTMLCollection | null}
 */
function fromHTML(html, trim = true) {
    // Process the HTML string.
    html = trim ? html.trim() : html;
    if (!html) return null;

    // Then set up a new template element.
    const template = document.createElement('template');
    template.innerHTML = html;
    const result = template.content.children;

    // Then return either an HTMLElement or HTMLCollection,
    // based on whether the input HTML had one or more roots.
    if (result.length === 1) return result[0];
    return result;
}