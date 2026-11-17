console.log("Content script loaded");

// Return trimmed innerText of the first selector that matches with non-empty text
function firstText(selectors) {
    for (const sel of selectors) {
        const text = document.querySelector(sel)?.innerText?.trim();
        if (text) return text;
    }
    return null;
}

// Many job sites (Indeed, Greenhouse, Lever, Workday, public LinkedIn pages...)
// embed a schema.org JobPosting in JSON-LD
function fromJsonLd() {
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
            const data = JSON.parse(script.textContent);
            const items = [].concat(data, data?.["@graph"] || []);
            const job = items.find((i) => i && [].concat(i["@type"]).includes("JobPosting"));
            if (job) {
                const tmp = document.createElement("div");
                tmp.innerHTML = job.description || "";
                return {
                    jobTitle: job.title || null,
                    companyName: job.hiringOrganization?.name || null,
                    jobDesc: tmp.innerText.trim() || null,
                };
            }
        } catch (_) { /* ignore malformed JSON-LD */ }
    }
    return {};
}

function getMeta(name) {
    return document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content?.trim() || null;
}

// LinkedIn's Save / Apply buttons carry labels like
// "Save Software Engineer at Trulioo" - these survive class name changes
function fromButtonLabels() {
    for (const el of document.querySelectorAll("button[aria-label], a[aria-label]")) {
        const label = el.getAttribute("aria-label").trim();
        const m = label.match(/^(?:Save|Unsave|Apply to|Easy Apply to|Share)\s+(.+)\s+at\s+(.+?)\.?$/i);
        if (m) return { jobTitle: m[1].trim(), companyName: m[2].trim() };
    }
    return {};
}

// LinkedIn tab title: "(3) Job Title | Company | LinkedIn"
function fromDocumentTitle() {
    const parts = document.title.replace(/^\(\d+\+?\)\s*/, "").split(" | ").map((p) => p.trim());
    if (parts.length >= 3 && /linkedin/i.test(parts[parts.length - 1])) {
        return { jobTitle: parts[0], companyName: parts[1] };
    }
    return {};
}

// Find the "About the job" heading and return the text of the section around it
function fromAboutTheJob() {
    const heading = [...document.querySelectorAll("h1, h2, h3, h4, span, p, div")]
        .find((el) => el.childElementCount === 0 && /^about the job$/i.test(el.innerText?.trim() || ""));
    if (!heading) return null;
    let container = heading.parentElement;
    // Walk up until the container holds more than just the heading
    while (container && container.innerText.trim().length < 100) container = container.parentElement;
    return container?.innerText.replace(/^about the job\s*/i, "").trim() || null;
}

function extractJobInfo() {
    // LinkedIn (several layouts / class name generations)
    let jobTitle = firstText([
        ".job-details-jobs-unified-top-card__job-title h1",
        ".job-details-jobs-unified-top-card__job-title",
        ".jobs-unified-top-card__job-title",
        "h1.t-24.t-bold.inline a",
        "h1.t-24.t-bold.inline",
        ".top-card-layout__title",
    ]);
    let companyName = firstText([
        ".job-details-jobs-unified-top-card__company-name a",
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name a",
        ".jobs-unified-top-card__company-name",
        ".topcard__org-name-link",
    ]);
    let jobDesc = firstText([
        ".job-details-about-the-job-module__description",
        "#job-details",
        ".jobs-description__content",
        ".jobs-box__html-content",
        ".show-more-less-html__markup",
    ]);

    // Class-name-independent LinkedIn fallbacks
    const btn = fromButtonLabels();
    const tab = fromDocumentTitle();
    jobTitle = jobTitle || btn.jobTitle || tab.jobTitle;
    companyName = companyName || btn.companyName || tab.companyName;
    jobDesc = jobDesc || fromAboutTheJob();

    // Structured data fallback
    const ld = fromJsonLd();
    jobTitle = jobTitle || ld.jobTitle;
    companyName = companyName || ld.companyName;
    jobDesc = jobDesc || ld.jobDesc;

    // Last-resort fallbacks
    jobTitle = jobTitle || getMeta("og:title") || firstText(["h1"]);
    companyName = companyName || getMeta("og:site_name");
    jobDesc = jobDesc || getMeta("og:description") || getMeta("description");

    if (jobDesc) jobDesc = jobDesc.replace(/…\s*show more/gi, "").trim();

    return { jobTitle, companyName, jobDesc };
}

// Guard against registering the listener twice if the popup injects us again
if (!window.__trackMyAppsLoaded) {
window.__trackMyAppsLoaded = true;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action !== "getJobInfo") return;

    let info = extractJobInfo();
    if (info.jobTitle && info.companyName) {
        sendResponse(info);
        return;
    }

    // Page may still be rendering (LinkedIn is an SPA) - try once more
    setTimeout(() => sendResponse(extractJobInfo()), 500);
    return true;
});
}
