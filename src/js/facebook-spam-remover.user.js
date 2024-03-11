// ==UserScript==
// @name         Remove Facebook Spam
// @namespace    http://tampermonkey.net/
// @version      0.3.3
// @description  Removes Facebook Spam
// @author       Samabcde
// @match        https://www.facebook.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @updateURL    https://github.com/samabcde/facebook-spam-remover/raw/main/src/js/facebook-spam-remover.user.js
// @downloadURL  https://github.com/samabcde/facebook-spam-remover/raw/main/src/js/facebook-spam-remover.user.js
// @grant        none
// ==/UserScript==
const facebookSpamRemover = function () {
    class LanguageResource {
        languageLabel

        constructor(languageLabel) {
            this
                .languageLabel = languageLabel;
        }

        /**
         * @param {String} language
         * @param {String} labelName
         * @return {String}
         */
        getLanguageLabel(language, labelName) {
            return this.languageLabel[language][labelName]
        }

        /**
         * @param {String} language
         * @return {Boolean}
         */
        isLanguageSupported(language) {
            return this.languageLabel[language] !== undefined;
        }
    }

    let languageResource = new LanguageResource({
        "en": {"post": "News Feed posts", "sponsor": "Sponsored"},
        "zh-Hant": {"post": '動態消息貼文', "sponsor": "贊助"}
    })
    console.log("start facebook spam remover")
    const language = getLanguage()
    let postLabel = languageResource.getLanguageLabel(language, "post")
    let sponsorLabel = languageResource.getLanguageLabel(language, "sponsor")
    let isSupported = languageResource.isLanguageSupported(language)
    if (!isSupported) {
        console.log(`language ${language} is not supported, consider raise issue for language support`)
        return
    }
    console.log(`language is ${language}`)
    focusHiddenUrlPostLinks(postLabel)
    hideSponsorPost(postLabel, sponsorLabel)
    setInterval(() => {
        focusHiddenUrlPostLinks(postLabel)
    }, 800);
    setInterval(() => {
        hideSponsorPost(postLabel, sponsorLabel)
    }, 1000);
    var lastRunPostLength = 0;

    function hideSponsorPost(postLabel, sponsorLabel) {
        let posts = getPosts(postLabel)
            .filter(value => value.style.display !== 'none')
        if (posts.length === 0) return
        if (posts.length === lastRunPostLength) {
            console.debug(`post length no change: ${posts.length}`)
        }
        let sponsorUseTextId = getSponsorUseTextId(sponsorLabel)
        let sponsorLabelId = getSponsorLabelId(sponsorLabel)
        if (sponsorUseTextId === "" && sponsorLabelId === "") {
            console.debug(`sponsorUseTextId and sponsorLabelId are empty`)
        }
        posts
            .filter(el => isSponsorPost(el, sponsorLabelId, sponsorUseTextId))
            .forEach(el => el.style.display = 'none')
        lastRunPostLength = posts.length
    }

    /**
     * @return {String}
     */
    function getLanguage() {
        return document.querySelector("html").getAttribute("lang")
    }

    /**
     * @param {String} postLabel
     */
    function focusHiddenUrlPostLinks(postLabel) {
        let parent = Array.from(document.querySelectorAll("div[role=main] h3"))
            .find(el => el.textContent === postLabel)
            .parentElement
        Array.from(parent.querySelectorAll("a[href='#']:not([aria-label])"))
            .forEach(value => value.focus({preventScroll: true}))
    }

    /**
     * @param {String} postLabel
     * @return {Element[]}
     */
    function getPosts(postLabel) {
        let parent = Array.from(document.querySelectorAll("div[role=main] h3"))
            .find(el => el.textContent === postLabel)
            .parentElement
        return Array.from(Array.from(parent.children).find(el => el.tagName === "DIV").children)
    }

    /**
     * @param {String} sponsorLabel
     * @return {String}
     */
    function getSponsorLabelId(sponsorLabel) {
        let sponsorLabelSpan = Array.from(document.querySelectorAll("body>div[hidden=true]>div>span"))
            .find(el => el.textContent === sponsorLabel)
        if (sponsorLabelSpan === undefined) {
            return "";
        }
        return sponsorLabelSpan.id
    }

    /**
     * @param {String} sponsorLabel
     * @return {String}
     */
    function getSponsorUseTextId(sponsorLabel) {
        let sponsorUseText = Array.from(document.querySelectorAll("body>div>div>svg>text"))
            .find(el => el.textContent === sponsorLabel)
        if (sponsorUseText === undefined) {
            return "";
        }
        return sponsorUseText.id
    }

    /**
     * @param {Element} post
     * @param {String} sponsorLabelId
     * @param {String} sponsorUseTextId
     * @return {Boolean}
     */
    function isSponsorPost(post, sponsorLabelId, sponsorUseTextId) {
        console.debug(`sponsorLabelId: ${sponsorLabelId}, sponsorUseTextId: ${sponsorUseTextId}`)
        if (sponsorUseTextId !== ""
            && Array.from(post.querySelectorAll("use")).filter(value => value.getAttribute('xlink:href') === `#${sponsorUseTextId}`).length > 0
        ) {
            console.debug(`${post.className} ${post.innerHTML.length} is sponsor post by xlink:href ${sponsorUseTextId}`);
            return true;
        }
        if (sponsorLabelId !== "" && post.querySelectorAll(`span[aria-labelledby='${sponsorLabelId}']`).length > 0) {
            console.debug(`${post.className} ${post.innerHTML.length} is sponsor post by aria-labelledby ${sponsorLabelId}`);
            return true;
        }
        if (post.querySelectorAll("a[href^='/ads/about']").length > 0) {
            console.debug(`${post.className} ${post.innerHTML.length} is sponsor post by link start with "/ads/about/"`);
            return true
        }
        return false;
    }

    // for unit testing
    return {
        "getLanguage": getLanguage,
        "LanguageResource": LanguageResource,
        "getPosts": getPosts,
        "getSponsorLabelId": getSponsorLabelId,
        "isSponsorPost": isSponsorPost,
        "getSponsorUseTextId": getSponsorUseTextId,
    };
}
facebookSpamRemover()

module.exports = facebookSpamRemover;