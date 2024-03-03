// ==UserScript==
// @name         Remove Spam
// @namespace    http://tampermonkey.net/
// @version      0.1.1
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

    function hideSponsorPost() {
        let posts = getPosts(getLanguageLabel(language, "post"))
        console.log(`post length: ${posts.length}`)
        if (posts.length === 0) return
        let sponsorLabelId = getSponsorLabelId(getLanguageLabel(language, "sponsor"))
        Array.from(posts)
            .filter(el => isSponsorPost(el, sponsorLabelId))
            .forEach(el => el.style.display = 'none')
    }

    function getLanguage() {
        return document.querySelector("html").getAttribute("lang")
    }

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
        return Array.from(document.querySelectorAll("body>div[hidden=true]>div>span"))
            .find(el => el.textContent === sponsorLabel)
            .id
    }

    /**
     * @param {Element} post
     * @param {String} sponsorLabelId
     * @return {Boolean}
     */
    function isSponsorPost(post, sponsorLabelId) {
        return post.querySelectorAll(`span[aria-labelledby='${sponsorLabelId}']`).length > 0
    }

    // for unit testing
    return {
        "getLanguage": getLanguage,
        "getLanguageLabel": getLanguageLabel,
        "getPosts": getPosts,
        "getSponsorLabelId": getSponsorLabelId,
        "isSponsorPost": isSponsorPost,
    };
}
facebookSpamRemover()

module.exports = facebookSpamRemover;