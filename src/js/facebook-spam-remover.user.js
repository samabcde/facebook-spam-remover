// ==UserScript==
// @name         Remove Spam
// @namespace    http://tampermonkey.net/
// @version      0.2.3
// @description  Removes Facebook Spam
// @author       Samabcde
// @match        https://www.facebook.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @updateURL    TODO
// @downloadURL  TODO
// @grant        none
// ==/UserScript==
const facebookSpamRemover = function () {
    console.log("start facebook spam remover")
    const language = getLanguage()
    console.log(`language is ${language}`)
    hideSponsorPost()
    setInterval(() => {
        hideSponsorPost()
    }, 1000);
    var lastRunPostLength = 0;

    function hideSponsorPost() {
        let posts = getPosts(getLanguageLabel(language, "post"))
        if (posts.length === 0) return
        if (posts.length === lastRunPostLength) {
            console.debug(`post length no change: ${posts.length}`)
            return
        }
        let sponsorUseTextId = getSponsorUseTextId(getLanguageLabel(language, "sponsor"))
        let sponsorLabelId = getSponsorLabelId(getLanguageLabel(language, "sponsor"))
        if (sponsorUseTextId === "" && sponsorLabelId === "") {
            console.debug(`sponsorUseTextId and sponsorLabelId are empty`)
            return
        }
        Array.from(posts)
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
     * @return {HTMLCollection}
     */
    function getPosts(postLabel) {
        let parent = Array.from(document.querySelectorAll("div[role=main] h3"))
            .find(el => el.textContent === postLabel)
            .parentElement
        return Array.from(parent.children).find(el => el.tagName === "DIV").children
    }

    /**
     * @param {String} language
     * @param {String} labelName
     * @return {String}
     */
    function getLanguageLabel(language, labelName) {
        const languageLabel = {
            "en": {"post": "News Feed posts", "sponsor": "Sponsored"},
            "zh-Hant": {"post": '動態消息貼文', "sponsor": "贊助"}
        }
        return languageLabel[language][labelName]
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
        return false;
    }

    // for unit testing
    return {
        "getLanguage": getLanguage,
        "getLanguageLabel": getLanguageLabel,
        "getPosts": getPosts,
        "getSponsorLabelId": getSponsorLabelId,
        "isSponsorPost": isSponsorPost,
        "getSponsorUseTextId": getSponsorUseTextId,
    };
}
facebookSpamRemover()

module.exports = facebookSpamRemover;