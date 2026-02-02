/**
 * Mr360ai - Static Website Checker
 * Analyzes static sites for AdSense readiness
 * Focused on Netlify, GitHub Pages, Vercel deployments
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('static-checker-form');
    
    if (form) {
        form.addEventListener('submit', handleStaticCheck);
    }
});

// CORS proxy options
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

/**
 * Main check handler
 */
async function handleStaticCheck(e) {
    e.preventDefault();
    
    const urlInput = document.getElementById('website-url');
    const resultsContainer = document.getElementById('results-container');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter your static website URL.');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL (e.g., https://yoursite.netlify.app)');
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    hideError();
    
    try {
        const html = await fetchWebsiteContent(url);
        
        if (!html) {
            throw new Error('Could not fetch website content');
        }
        
        const results = analyzeStaticSite(html, url);
        displayResults(results);
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        showError(`Unable to analyze the website. ${error.message || 'Please check the URL.'}`);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Check My Static Site';
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

async function fetchWebsiteContent(url) {
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
    }
    
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        try {
            const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(targetUrl);
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: { 'Accept': 'text/html,application/xhtml+xml' }
            });
            
            if (response.ok) {
                const html = await response.text();
                if (html && html.length > 100) return html;
            }
        } catch (error) {
            console.log(`Proxy ${i + 1} failed, trying next...`);
        }
    }
    
    throw new Error('Could not access the website.');
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
    }
}

function hideError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) errorContainer.classList.add('hidden');
}

/**
 * Analyze static site for AdSense readiness
 */
function analyzeStaticSite(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const checks = [];
    let totalScore = 0;
    let maxScore = 0;
    
    // Detect hosting platform
    const platform = detectPlatform(url);
    
    // Check 1: Custom Domain (weight: 15)
    checks.push(checkCustomDomain(url, platform));
    maxScore += 15;
    
    // Check 2: HTTPS (weight: 12)
    checks.push(checkHTTPS(url));
    maxScore += 12;
    
    // Check 3: Essential Pages (weight: 15)
    checks.push(checkEssentialPages(doc));
    maxScore += 15;
    
    // Check 4: Navigation Structure (weight: 12)
    checks.push(checkNavigation(doc));
    maxScore += 12;
    
    // Check 5: Content Depth (weight: 15)
    checks.push(checkContentDepth(doc));
    maxScore += 15;
    
    // Check 6: Meta Tags (weight: 10)
    checks.push(checkMetaTags(doc));
    maxScore += 10;
    
    // Check 7: 404 Page Indicator (weight: 8)
    checks.push(check404Setup(doc, html));
    maxScore += 8;
    
    // Check 8: Contact Information (weight: 8)
    checks.push(checkContactInfo(doc));
    maxScore += 8;
    
    // Check 9: Footer/Copyright (weight: 5)
    checks.push(checkFooter(doc));
    maxScore += 5;
    
    checks.forEach(check => totalScore += check.score);
    
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    return {
        score: finalScore,
        url: url,
        platform: platform,
        checks: checks
    };
}

/**
 * Detect hosting platform
 */
function detectPlatform(url) {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('netlify.app') || lowerUrl.includes('netlify.com')) {
        return 'Netlify';
    }
    if (lowerUrl.includes('github.io') || lowerUrl.includes('github.com')) {
        return 'GitHub Pages';
    }
    if (lowerUrl.includes('vercel.app') || lowerUrl.includes('vercel.com')) {
        return 'Vercel';
    }
    if (lowerUrl.includes('surge.sh')) {
        return 'Surge';
    }
    if (lowerUrl.includes('cloudflare')) {
        return 'Cloudflare Pages';
    }
    if (lowerUrl.includes('render.com')) {
        return 'Render';
    }
    
    return 'Custom/Unknown';
}

/**
 * Check for custom domain
 */
function checkCustomDomain(url, platform) {
    const subdomainPatterns = [
        /\.netlify\.app$/i,
        /\.github\.io$/i,
        /\.vercel\.app$/i,
        /\.surge\.sh$/i,
        /\.pages\.dev$/i,
        /\.onrender\.com$/i
    ];
    
    let hostname = '';
    try {
        hostname = new URL(url).hostname;
    } catch (e) {}
    
    const isSubdomain = subdomainPatterns.some(pattern => pattern.test(hostname));
    
    if (isSubdomain) {
        return {
            name: 'Custom Domain',
            status: 'fail',
            score: 3,
            message: `Using ${platform} subdomain. Not ideal for AdSense.`,
            suggestion: 'Register a custom domain (yoursite.com). Most registrars offer domains for $10-15/year. This significantly improves AdSense approval chances.'
        };
    }
    
    // Check if it looks like a proper domain
    const parts = hostname.split('.');
    if (parts.length >= 2 && !hostname.includes('localhost')) {
        return {
            name: 'Custom Domain',
            status: 'pass',
            score: 15,
            message: 'Using a custom domain. Professional appearance.',
            suggestion: null
        };
    }
    
    return {
        name: 'Custom Domain',
        status: 'warning',
        score: 8,
        message: 'Could not definitively verify custom domain status.',
        suggestion: 'Ensure you are using a custom domain like yoursite.com for AdSense applications.'
    };
}

/**
 * Check HTTPS
 */
function checkHTTPS(url) {
    if (url.toLowerCase().startsWith('https://')) {
        return {
            name: 'HTTPS Security',
            status: 'pass',
            score: 12,
            message: 'Site uses HTTPS. Secure and trusted.',
            suggestion: null
        };
    }
    
    return {
        name: 'HTTPS Security',
        status: 'fail',
        score: 0,
        message: 'Site not using HTTPS.',
        suggestion: 'Enable HTTPS immediately. All major static hosts (Netlify, Vercel, GitHub Pages) provide free SSL certificates.'
    };
}

/**
 * Check for essential pages
 */
function checkEssentialPages(doc) {
    const allLinks = doc.querySelectorAll('a[href]');
    let hasPrivacy = false;
    let hasAbout = false;
    let hasContact = false;
    let hasTerms = false;
    
    allLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const text = (link.textContent || '').toLowerCase();
        
        if (href.includes('privacy') || text.includes('privacy')) hasPrivacy = true;
        if (href.includes('about') || text.includes('about')) hasAbout = true;
        if (href.includes('contact') || text.includes('contact')) hasContact = true;
        if (href.includes('terms') || text.includes('terms') || href.includes('tos')) hasTerms = true;
    });
    
    const pagesFound = [hasPrivacy, hasAbout, hasContact, hasTerms].filter(Boolean).length;
    const missing = [];
    if (!hasPrivacy) missing.push('Privacy Policy');
    if (!hasAbout) missing.push('About');
    if (!hasContact) missing.push('Contact');
    
    if (pagesFound <= 1) {
        return {
            name: 'Essential Pages',
            status: 'fail',
            score: 3,
            message: `Missing essential pages: ${missing.join(', ')}.`,
            suggestion: 'Add Privacy Policy (mandatory), About, and Contact pages. These are required for AdSense approval.'
        };
    }
    
    if (pagesFound < 4) {
        return {
            name: 'Essential Pages',
            status: 'warning',
            score: 10,
            message: `Most essential pages found (${pagesFound}/4). Missing: ${missing.join(', ')}.`,
            suggestion: hasPrivacy ? 'Consider adding the missing pages.' : 'Add Privacy Policy immediately—it is mandatory for AdSense.'
        };
    }
    
    return {
        name: 'Essential Pages',
        status: 'pass',
        score: 15,
        message: 'All essential pages detected (Privacy, About, Contact, Terms).',
        suggestion: null
    };
}

/**
 * Check navigation structure
 */
function checkNavigation(doc) {
    const nav = doc.querySelector('nav, [role="navigation"], .nav, .navbar, header nav');
    const navLinks = doc.querySelectorAll('nav a, header a, .nav a, .menu a');
    
    if (!nav && navLinks.length < 3) {
        return {
            name: 'Navigation Structure',
            status: 'fail',
            score: 2,
            message: 'No clear navigation found. Poor user experience.',
            suggestion: 'Add a navigation menu with links to main sections. Use <nav> tag for semantic markup.'
        };
    }
    
    if (navLinks.length < 5) {
        return {
            name: 'Navigation Structure',
            status: 'warning',
            score: 8,
            message: `Limited navigation (${navLinks.length} links).`,
            suggestion: 'Add more navigation links to help users find content easily.'
        };
    }
    
    return {
        name: 'Navigation Structure',
        status: 'pass',
        score: 12,
        message: `Good navigation structure (${navLinks.length} links).`,
        suggestion: null
    };
}

/**
 * Check content depth
 */
function checkContentDepth(doc) {
    const clone = doc.body.cloneNode(true);
    const scripts = clone.querySelectorAll('script, style, noscript, nav, header, footer');
    scripts.forEach(el => el.remove());
    
    const text = clone.textContent || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    // Check for multiple pages (look for article-like content)
    const articles = doc.querySelectorAll('article, .post, .blog-post, .content');
    const h2Count = doc.querySelectorAll('h2').length;
    
    if (wordCount < 300) {
        return {
            name: 'Content Depth',
            status: 'fail',
            score: 3,
            message: `Very little content (~${wordCount} words). Likely rejection for thin content.`,
            suggestion: 'Static sites need substantial content. Aim for 15-20 pages with 500+ words each.'
        };
    }
    
    if (wordCount < 600) {
        return {
            name: 'Content Depth',
            status: 'warning',
            score: 8,
            message: `Light content on this page (~${wordCount} words).`,
            suggestion: 'Expand content or ensure other pages have substantial depth. Homepage should be comprehensive.'
        };
    }
    
    if (wordCount < 1000) {
        return {
            name: 'Content Depth',
            status: 'warning',
            score: 12,
            message: `Moderate content (~${wordCount} words).`,
            suggestion: 'Good start. Ensure overall site has 15+ content pages.'
        };
    }
    
    return {
        name: 'Content Depth',
        status: 'pass',
        score: 15,
        message: `Good content depth (~${wordCount} words on this page).`,
        suggestion: null
    };
}

/**
 * Check meta tags
 */
function checkMetaTags(doc) {
    const title = doc.querySelector('title');
    const description = doc.querySelector('meta[name="description"]');
    const viewport = doc.querySelector('meta[name="viewport"]');
    const charset = doc.querySelector('meta[charset]');
    
    let found = 0;
    if (title && title.textContent.length > 10) found++;
    if (description && description.getAttribute('content')?.length > 50) found++;
    if (viewport) found++;
    if (charset) found++;
    
    if (found < 2) {
        return {
            name: 'Meta Tags',
            status: 'fail',
            score: 2,
            message: 'Missing critical meta tags.',
            suggestion: 'Add title, meta description, viewport, and charset tags to all pages.'
        };
    }
    
    if (found < 4) {
        return {
            name: 'Meta Tags',
            status: 'warning',
            score: 6,
            message: `Some meta tags missing (${found}/4 basic tags).`,
            suggestion: 'Ensure all pages have complete meta tags for SEO and proper rendering.'
        };
    }
    
    return {
        name: 'Meta Tags',
        status: 'pass',
        score: 10,
        message: 'Essential meta tags present.',
        suggestion: null
    };
}

/**
 * Check for 404 handling
 */
function check404Setup(doc, html) {
    // Look for 404 page link or common 404 patterns
    const has404Link = html.toLowerCase().includes('404.html') || 
                       html.toLowerCase().includes('page not found');
    
    const allLinks = doc.querySelectorAll('a[href]');
    let linkCount = 0;
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
            linkCount++;
        }
    });
    
    // Can't directly test 404, but check for good internal linking
    if (linkCount < 5) {
        return {
            name: '404 & Error Handling',
            status: 'warning',
            score: 4,
            message: 'Cannot verify 404 page setup remotely.',
            suggestion: 'Create a 404.html page. Netlify, Vercel, and GitHub Pages use it automatically for missing pages.'
        };
    }
    
    return {
        name: '404 & Error Handling',
        status: 'pass',
        score: 8,
        message: 'Good internal linking suggests proper site structure.',
        suggestion: 'Verify you have a 404.html file in your root directory.'
    };
}

/**
 * Check for contact information
 */
function checkContactInfo(doc) {
    const bodyText = doc.body.textContent.toLowerCase();
    
    const hasEmail = /@[\w.-]+\.[a-z]{2,}/i.test(bodyText) || 
                     bodyText.includes('email') ||
                     doc.querySelector('a[href^="mailto:"]');
    
    const hasContactLink = Array.from(doc.querySelectorAll('a')).some(a => 
        a.href.toLowerCase().includes('contact') || 
        a.textContent.toLowerCase().includes('contact')
    );
    
    if (!hasEmail && !hasContactLink) {
        return {
            name: 'Contact Information',
            status: 'fail',
            score: 2,
            message: 'No contact information detected.',
            suggestion: 'Add a contact page or visible email address. AdSense wants to see legitimate, contactable businesses.'
        };
    }
    
    if (hasEmail && hasContactLink) {
        return {
            name: 'Contact Information',
            status: 'pass',
            score: 8,
            message: 'Contact information and contact page found.',
            suggestion: null
        };
    }
    
    return {
        name: 'Contact Information',
        status: 'warning',
        score: 5,
        message: 'Some contact information found.',
        suggestion: 'Ensure you have a dedicated contact page with clear ways to reach you.'
    };
}

/**
 * Check footer
 */
function checkFooter(doc) {
    const footer = doc.querySelector('footer, .footer, [role="contentinfo"]');
    
    if (!footer) {
        return {
            name: 'Footer Section',
            status: 'warning',
            score: 2,
            message: 'No footer element detected.',
            suggestion: 'Add a footer with copyright, legal links, and branding. It signals a professional, complete website.'
        };
    }
    
    const footerLinks = footer.querySelectorAll('a');
    const hasCopyright = footer.textContent.includes('©') || 
                         footer.textContent.toLowerCase().includes('copyright');
    
    if (footerLinks.length < 2 && !hasCopyright) {
        return {
            name: 'Footer Section',
            status: 'warning',
            score: 3,
            message: 'Footer exists but appears minimal.',
            suggestion: 'Add links to legal pages and copyright notice.'
        };
    }
    
    return {
        name: 'Footer Section',
        status: 'pass',
        score: 5,
        message: 'Complete footer with links and/or copyright.',
        suggestion: null
    };
}

/**
 * Display results
 */
function displayResults(results) {
    const scoreCircle = document.getElementById('score-circle');
    const scoreNumber = document.getElementById('score-number');
    const scoreStatus = document.getElementById('score-status');
    const scoreSummary = document.getElementById('score-summary');
    const checkList = document.getElementById('check-list');
    const analyzedUrl = document.getElementById('analyzed-url');
    const platformInfo = document.getElementById('platform-info');
    
    if (analyzedUrl) {
        analyzedUrl.textContent = results.url;
        analyzedUrl.href = results.url;
    }
    
    if (platformInfo) {
        platformInfo.textContent = results.platform;
    }
    
    scoreNumber.textContent = results.score;
    
    scoreCircle.className = 'score-circle';
    if (results.score >= 80) {
        scoreCircle.classList.add('score-green');
        scoreStatus.textContent = 'Ready for AdSense';
        scoreStatus.className = 'score-status status-green';
        scoreSummary.textContent = 'Your static site meets key AdSense requirements. Address any remaining warnings before applying.';
    } else if (results.score >= 55) {
        scoreCircle.classList.add('score-yellow');
        scoreStatus.textContent = 'Almost Ready';
        scoreStatus.className = 'score-status status-yellow';
        scoreSummary.textContent = 'Your site has a good foundation but needs improvements before AdSense application.';
    } else {
        scoreCircle.classList.add('score-red');
        scoreStatus.textContent = 'Not Ready';
        scoreStatus.className = 'score-status status-red';
        scoreSummary.textContent = 'Significant issues found. Address these before applying for AdSense.';
    }
    
    checkList.innerHTML = '';
    results.checks.forEach(check => {
        const li = document.createElement('li');
        li.className = 'check-item';
        
        let iconSymbol = '✓';
        if (check.status === 'warning') iconSymbol = '!';
        if (check.status === 'fail') iconSymbol = '✗';
        
        li.innerHTML = `
            <div class="check-icon ${check.status === 'pass' ? 'pass' : (check.status === 'warning' ? 'warning' : 'fail')}">
                ${iconSymbol}
            </div>
            <div class="check-content">
                <div class="check-title">${check.name}</div>
                <div class="check-description">${check.message}</div>
                ${check.suggestion ? `<div class="check-suggestion">💡 ${check.suggestion}</div>` : ''}
            </div>
        `;
        
        checkList.appendChild(li);
    });
}
