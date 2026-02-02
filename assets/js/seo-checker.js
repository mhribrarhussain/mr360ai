/**
 * Mr360ai - SEO Health Checker
 * URL-based SEO analysis tool
 * Analyzes on-page SEO factors for website optimization
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('seo-checker-form');
    
    if (form) {
        form.addEventListener('submit', handleSEOAnalysis);
    }
});

// CORS proxy options
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

/**
 * Main SEO analysis handler
 */
async function handleSEOAnalysis(e) {
    e.preventDefault();
    
    const urlInput = document.getElementById('website-url');
    const resultsContainer = document.getElementById('results-container');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a website URL to analyze.');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL (e.g., https://example.com)');
        return;
    }
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing SEO...';
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    hideError();
    
    try {
        const html = await fetchWebsiteContent(url);
        
        if (!html) {
            throw new Error('Could not fetch website content');
        }
        
        const results = analyzeSEO(html, url);
        displaySEOResults(results);
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        showError(`Unable to analyze the website. ${error.message || 'Please check the URL and try again.'}`);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze SEO Health';
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
    
    throw new Error('Could not access the website. The site may be blocking requests or unavailable.');
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
 * Comprehensive SEO Analysis
 */
function analyzeSEO(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const checks = [];
    let totalScore = 0;
    let maxScore = 0;
    
    // Check 1: Title Tag (weight: 15)
    checks.push(checkTitle(doc));
    maxScore += 15;
    
    // Check 2: Meta Description (weight: 12)
    checks.push(checkMetaDescription(doc));
    maxScore += 12;
    
    // Check 3: H1 Tags (weight: 12)
    checks.push(checkH1Tags(doc));
    maxScore += 12;
    
    // Check 4: Heading Hierarchy (weight: 10)
    checks.push(checkHeadingHierarchy(doc));
    maxScore += 10;
    
    // Check 5: Image Alt Attributes (weight: 10)
    checks.push(checkImageAlts(doc));
    maxScore += 10;
    
    // Check 6: Internal Links (weight: 10)
    checks.push(checkInternalLinks(doc, url));
    maxScore += 10;
    
    // Check 7: External Links (weight: 8)
    checks.push(checkExternalLinks(doc, url));
    maxScore += 8;
    
    // Check 8: HTTPS Security (weight: 10)
    checks.push(checkHTTPS(url));
    maxScore += 10;
    
    // Check 9: Meta Viewport (Mobile) (weight: 8)
    checks.push(checkViewport(doc));
    maxScore += 8;
    
    // Check 10: Canonical Tag (weight: 5)
    checks.push(checkCanonical(doc));
    maxScore += 5;
    
    checks.forEach(check => totalScore += check.score);
    
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    return { score: finalScore, url: url, checks: checks };
}

function checkTitle(doc) {
    const title = doc.querySelector('title');
    const titleText = title ? title.textContent.trim() : '';
    const length = titleText.length;
    
    if (!title || length === 0) {
        return {
            name: 'Title Tag',
            status: 'fail',
            score: 0,
            message: 'Missing title tag - critical SEO element not found.',
            suggestion: 'Add a unique, descriptive title tag (50-60 characters) that includes your primary keyword.'
        };
    }
    
    if (length < 30) {
        return {
            name: 'Title Tag',
            status: 'warning',
            score: 8,
            message: `Title too short (${length} chars). May not fully describe page content.`,
            suggestion: 'Expand to 50-60 characters. Include primary keyword near the beginning.'
        };
    }
    
    if (length > 70) {
        return {
            name: 'Title Tag',
            status: 'warning',
            score: 10,
            message: `Title too long (${length} chars). Will be truncated in search results.`,
            suggestion: 'Shorten to 50-60 characters for optimal display in SERPs.'
        };
    }
    
    return {
        name: 'Title Tag',
        status: 'pass',
        score: 15,
        message: `Well-optimized title (${length} characters).`,
        suggestion: null
    };
}

function checkMetaDescription(doc) {
    const meta = doc.querySelector('meta[name="description"]');
    const content = meta ? meta.getAttribute('content')?.trim() : '';
    const length = content.length;
    
    if (!meta || length === 0) {
        return {
            name: 'Meta Description',
            status: 'fail',
            score: 0,
            message: 'Missing meta description - important for click-through rates.',
            suggestion: 'Add a compelling meta description (150-160 chars) that summarizes page content and includes target keywords.'
        };
    }
    
    if (length < 100) {
        return {
            name: 'Meta Description',
            status: 'warning',
            score: 6,
            message: `Meta description short (${length} chars). Not using full SERP space.`,
            suggestion: 'Expand to 150-160 characters to maximize visibility in search results.'
        };
    }
    
    if (length > 170) {
        return {
            name: 'Meta Description',
            status: 'warning',
            score: 9,
            message: `Meta description long (${length} chars). Will be truncated.`,
            suggestion: 'Trim to 150-160 characters to prevent truncation in search results.'
        };
    }
    
    return {
        name: 'Meta Description',
        status: 'pass',
        score: 12,
        message: `Well-optimized meta description (${length} characters).`,
        suggestion: null
    };
}

function checkH1Tags(doc) {
    const h1Tags = doc.querySelectorAll('h1');
    const count = h1Tags.length;
    
    if (count === 0) {
        return {
            name: 'H1 Heading',
            status: 'fail',
            score: 0,
            message: 'No H1 heading found - main topic unclear to search engines.',
            suggestion: 'Add exactly one H1 tag that clearly describes your page\'s main topic.'
        };
    }
    
    if (count > 1) {
        return {
            name: 'H1 Heading',
            status: 'warning',
            score: 8,
            message: `Multiple H1 tags found (${count}). Dilutes topic focus.`,
            suggestion: 'Use only one H1 per page. Convert others to H2 or H3 tags.'
        };
    }
    
    const h1Text = h1Tags[0].textContent.trim();
    if (h1Text.length < 10) {
        return {
            name: 'H1 Heading',
            status: 'warning',
            score: 8,
            message: 'H1 heading appears too short or generic.',
            suggestion: 'Make H1 more descriptive with relevant keywords (20-70 characters ideal).'
        };
    }
    
    return {
        name: 'H1 Heading',
        status: 'pass',
        score: 12,
        message: 'Single, well-structured H1 heading present.',
        suggestion: null
    };
}

function checkHeadingHierarchy(doc) {
    const h1 = doc.querySelectorAll('h1').length;
    const h2 = doc.querySelectorAll('h2').length;
    const h3 = doc.querySelectorAll('h3').length;
    
    if (h1 === 0) {
        return {
            name: 'Heading Structure',
            status: 'fail',
            score: 0,
            message: 'No heading hierarchy established.',
            suggestion: 'Create proper heading structure: H1 for main topic, H2 for sections, H3 for subsections.'
        };
    }
    
    if (h2 === 0) {
        return {
            name: 'Heading Structure',
            status: 'warning',
            score: 5,
            message: 'No H2 headings found. Content may lack structure.',
            suggestion: 'Add H2 headings to break content into logical sections.'
        };
    }
    
    if (h2 >= 2 && (h3 >= 1 || h2 >= 4)) {
        return {
            name: 'Heading Structure',
            status: 'pass',
            score: 10,
            message: `Good heading hierarchy (${h1} H1, ${h2} H2, ${h3} H3).`,
            suggestion: null
        };
    }
    
    return {
        name: 'Heading Structure',
        status: 'warning',
        score: 7,
        message: `Basic heading structure (${h1} H1, ${h2} H2).`,
        suggestion: 'Consider adding more H2/H3 headings to improve content organization.'
    };
}

function checkImageAlts(doc) {
    const images = doc.querySelectorAll('img');
    const total = images.length;
    
    if (total === 0) {
        return {
            name: 'Image Alt Attributes',
            status: 'warning',
            score: 5,
            message: 'No images found. Consider adding relevant visuals.',
            suggestion: 'Add images with descriptive alt text to enhance user engagement and SEO.'
        };
    }
    
    let withAlt = 0;
    images.forEach(img => {
        const alt = img.getAttribute('alt');
        if (alt && alt.trim().length > 0) withAlt++;
    });
    
    const percentage = Math.round((withAlt / total) * 100);
    
    if (percentage < 50) {
        return {
            name: 'Image Alt Attributes',
            status: 'fail',
            score: 2,
            message: `Only ${percentage}% of images have alt text (${withAlt}/${total}).`,
            suggestion: 'Add descriptive alt text to all images for accessibility and SEO.'
        };
    }
    
    if (percentage < 90) {
        return {
            name: 'Image Alt Attributes',
            status: 'warning',
            score: 6,
            message: `${percentage}% of images have alt text (${withAlt}/${total}).`,
            suggestion: 'Add alt text to remaining images without descriptions.'
        };
    }
    
    return {
        name: 'Image Alt Attributes',
        status: 'pass',
        score: 10,
        message: `Excellent! ${percentage}% of images have alt text.`,
        suggestion: null
    };
}

function checkInternalLinks(doc, url) {
    const allLinks = doc.querySelectorAll('a[href]');
    let internal = 0;
    
    let baseDomain = '';
    try {
        baseDomain = new URL(url).hostname;
    } catch (e) {}
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('/') || href.startsWith('#') || 
            href.startsWith('./') || !href.startsWith('http') ||
            (baseDomain && href.includes(baseDomain)))) {
            internal++;
        }
    });
    
    if (internal < 3) {
        return {
            name: 'Internal Links',
            status: 'fail',
            score: 2,
            message: `Very few internal links (${internal}). Poor site structure signal.`,
            suggestion: 'Add more internal links to connect related content and improve crawlability.'
        };
    }
    
    if (internal < 10) {
        return {
            name: 'Internal Links',
            status: 'warning',
            score: 6,
            message: `Moderate internal linking (${internal} links).`,
            suggestion: 'Consider adding more contextual internal links to related pages.'
        };
    }
    
    return {
        name: 'Internal Links',
        status: 'pass',
        score: 10,
        message: `Good internal linking structure (${internal} links).`,
        suggestion: null
    };
}

function checkExternalLinks(doc, url) {
    const allLinks = doc.querySelectorAll('a[href]');
    let external = 0;
    
    let baseDomain = '';
    try {
        baseDomain = new URL(url).hostname;
    } catch (e) {}
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('http') && baseDomain && !href.includes(baseDomain)) {
            external++;
        }
    });
    
    if (external === 0) {
        return {
            name: 'External Links',
            status: 'warning',
            score: 4,
            message: 'No external links found.',
            suggestion: 'Consider linking to authoritative external sources to build trust.'
        };
    }
    
    if (external > 20) {
        return {
            name: 'External Links',
            status: 'warning',
            score: 5,
            message: `Many external links (${external}). May dilute page authority.`,
            suggestion: 'Review external links and keep only the most valuable ones.'
        };
    }
    
    return {
        name: 'External Links',
        status: 'pass',
        score: 8,
        message: `Balanced external linking (${external} links).`,
        suggestion: null
    };
}

function checkHTTPS(url) {
    if (!url) {
        return {
            name: 'HTTPS Security',
            status: 'warning',
            score: 5,
            message: 'Could not verify HTTPS status.',
            suggestion: 'Ensure your site uses HTTPS for security and SEO benefits.'
        };
    }
    
    if (url.toLowerCase().startsWith('https://')) {
        return {
            name: 'HTTPS Security',
            status: 'pass',
            score: 10,
            message: 'Site uses secure HTTPS connection.',
            suggestion: null
        };
    }
    
    return {
        name: 'HTTPS Security',
        status: 'fail',
        score: 0,
        message: 'Site not using HTTPS - major security and ranking issue.',
        suggestion: 'Migrate to HTTPS immediately. Most hosts offer free SSL certificates.'
    };
}

function checkViewport(doc) {
    const viewport = doc.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
        return {
            name: 'Mobile Viewport',
            status: 'fail',
            score: 0,
            message: 'Missing viewport meta tag - likely not mobile-friendly.',
            suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
        };
    }
    
    const content = viewport.getAttribute('content') || '';
    if (content.includes('width=device-width')) {
        return {
            name: 'Mobile Viewport',
            status: 'pass',
            score: 8,
            message: 'Mobile-responsive viewport configured.',
            suggestion: null
        };
    }
    
    return {
        name: 'Mobile Viewport',
        status: 'warning',
        score: 5,
        message: 'Viewport present but may not be optimally configured.',
        suggestion: 'Use "width=device-width, initial-scale=1.0" for best mobile experience.'
    };
}

function checkCanonical(doc) {
    const canonical = doc.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
        return {
            name: 'Canonical Tag',
            status: 'warning',
            score: 2,
            message: 'No canonical tag found.',
            suggestion: 'Add a canonical tag to prevent duplicate content issues.'
        };
    }
    
    const href = canonical.getAttribute('href');
    if (href && href.length > 0) {
        return {
            name: 'Canonical Tag',
            status: 'pass',
            score: 5,
            message: 'Canonical tag properly implemented.',
            suggestion: null
        };
    }
    
    return {
        name: 'Canonical Tag',
        status: 'warning',
        score: 2,
        message: 'Canonical tag present but empty.',
        suggestion: 'Set the canonical URL to the preferred version of this page.'
    };
}

/**
 * Display SEO Results
 */
function displaySEOResults(results) {
    const scoreCircle = document.getElementById('score-circle');
    const scoreNumber = document.getElementById('score-number');
    const scoreStatus = document.getElementById('score-status');
    const scoreSummary = document.getElementById('score-summary');
    const checkList = document.getElementById('check-list');
    const analyzedUrl = document.getElementById('analyzed-url');
    
    if (analyzedUrl) {
        analyzedUrl.textContent = results.url;
        analyzedUrl.href = results.url;
    }
    
    scoreNumber.textContent = results.score;
    
    scoreCircle.className = 'score-circle';
    if (results.score >= 80) {
        scoreCircle.classList.add('score-green');
        scoreStatus.textContent = 'Excellent SEO Health';
        scoreStatus.className = 'score-status status-green';
        scoreSummary.textContent = 'Your page has strong on-page SEO fundamentals. Review any minor issues below for further optimization.';
    } else if (results.score >= 60) {
        scoreCircle.classList.add('score-yellow');
        scoreStatus.textContent = 'Good - Needs Improvement';
        scoreStatus.className = 'score-status status-yellow';
        scoreSummary.textContent = 'Solid SEO foundation with room for improvement. Address the issues below to boost rankings.';
    } else {
        scoreCircle.classList.add('score-red');
        scoreStatus.textContent = 'Needs Significant Work';
        scoreStatus.className = 'score-status status-red';
        scoreSummary.textContent = 'Critical SEO issues detected. Address the problems below before expecting good search rankings.';
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
