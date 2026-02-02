/**
 * Mr360ai - Google AdSense Readiness Checker
 * URL-based website analysis tool
 * Fetches and analyzes websites for AdSense readiness factors
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adsense-checker-form');
    
    if (form) {
        form.addEventListener('submit', handleAnalysis);
    }
});

// CORS proxy options (we'll try multiple in case one fails)
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

let currentProxyIndex = 0;

/**
 * Main analysis handler
 * @param {Event} e - Form submit event
 */
async function handleAnalysis(e) {
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
    
    // Validate URL format
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL (e.g., https://example.com)');
        return;
    }
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    resultsContainer.classList.add('hidden');
    
    try {
        // Fetch the website content
        const html = await fetchWebsiteContent(url);
        
        if (!html) {
            throw new Error('Could not fetch website content');
        }
        
        // Perform analysis
        const results = analyzeHTML(html, url);
        
        // Display results
        displayResults(results);
        
        // Show results container
        resultsContainer.classList.remove('hidden');
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        showError(`Unable to analyze the website. ${error.message || 'Please check the URL and try again.'}`);
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Website';
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

/**
 * Fetch website content using CORS proxy
 */
async function fetchWebsiteContent(url) {
    // Ensure URL has protocol
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
    }
    
    // Try each proxy until one works
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        try {
            const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(targetUrl);
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml'
                }
            });
            
            if (response.ok) {
                const html = await response.text();
                if (html && html.length > 100) {
                    return html;
                }
            }
        } catch (error) {
            console.log(`Proxy ${i + 1} failed, trying next...`);
        }
    }
    
    throw new Error('Could not access the website. The site may be blocking requests or unavailable.');
}

/**
 * Show error message
 */
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 10000);
    } else {
        alert(message);
    }
}

/**
 * Analyze HTML content for AdSense readiness
 * @param {string} html - HTML source code
 * @param {string} url - Website URL
 * @returns {Object} Analysis results
 */
function analyzeHTML(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const checks = [];
    let totalScore = 0;
    let maxScore = 0;
    
    // Check 1: Title Tag (weight: 10)
    checks.push(checkTitleTag(doc));
    maxScore += 10;
    
    // Check 2: Meta Description (weight: 10)
    checks.push(checkMetaDescription(doc));
    maxScore += 10;
    
    // Check 3: H1 Tag (weight: 10)
    checks.push(checkH1Tag(doc));
    maxScore += 10;
    
    // Check 4: Content Word Count (weight: 15)
    checks.push(checkWordCount(doc));
    maxScore += 15;
    
    // Check 5: Image Alt Attributes (weight: 10)
    checks.push(checkImageAlts(doc));
    maxScore += 10;
    
    // Check 6: HTTPS (weight: 10)
    checks.push(checkHTTPS(url));
    maxScore += 10;
    
    // Check 7: Navigation Structure (weight: 10)
    checks.push(checkNavigation(doc));
    maxScore += 10;
    
    // Check 8: Internal Links (weight: 10)
    checks.push(checkInternalLinks(doc, url));
    maxScore += 10;
    
    // Check 9: Privacy Policy Link (weight: 10)
    checks.push(checkPrivacyPolicy(doc));
    maxScore += 10;
    
    // Check 10: Footer Presence (weight: 5)
    checks.push(checkFooter(doc));
    maxScore += 5;
    
    // Calculate total score
    checks.forEach(check => {
        totalScore += check.score;
    });
    
    // Normalize to 0-100
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    return {
        score: finalScore,
        url: url,
        checks: checks
    };
}

/**
 * Check Title Tag presence and length
 */
function checkTitleTag(doc) {
    const title = doc.querySelector('title');
    const titleText = title ? title.textContent.trim() : '';
    const titleLength = titleText.length;
    
    if (!title || titleLength === 0) {
        return {
            name: 'Title Tag',
            status: 'fail',
            score: 0,
            message: 'No title tag found on your page.',
            suggestion: 'Add a descriptive title tag between 50-60 characters that describes your page content.'
        };
    }
    
    if (titleLength < 30) {
        return {
            name: 'Title Tag',
            status: 'warning',
            score: 5,
            message: `Title tag found but too short (${titleLength} characters).`,
            suggestion: 'Expand your title to 50-60 characters for optimal SEO. Include your main topic and site name.'
        };
    }
    
    if (titleLength > 70) {
        return {
            name: 'Title Tag',
            status: 'warning',
            score: 7,
            message: `Title tag found but too long (${titleLength} characters).`,
            suggestion: 'Shorten your title to 50-60 characters. Search engines may truncate longer titles.'
        };
    }
    
    return {
        name: 'Title Tag',
        status: 'pass',
        score: 10,
        message: `Title tag is well-optimized (${titleLength} characters).`,
        suggestion: null
    };
}

/**
 * Check Meta Description presence and length
 */
function checkMetaDescription(doc) {
    const metaDesc = doc.querySelector('meta[name="description"]');
    const content = metaDesc ? metaDesc.getAttribute('content')?.trim() : '';
    const length = content.length;
    
    if (!metaDesc || length === 0) {
        return {
            name: 'Meta Description',
            status: 'fail',
            score: 0,
            message: 'No meta description found on your page.',
            suggestion: 'Add a meta description tag with 150-160 characters summarizing your page content.'
        };
    }
    
    if (length < 100) {
        return {
            name: 'Meta Description',
            status: 'warning',
            score: 5,
            message: `Meta description found but too short (${length} characters).`,
            suggestion: 'Expand your meta description to 150-160 characters to maximize visibility in search results.'
        };
    }
    
    if (length > 170) {
        return {
            name: 'Meta Description',
            status: 'warning',
            score: 7,
            message: `Meta description found but too long (${length} characters).`,
            suggestion: 'Shorten your meta description to 150-160 characters to prevent truncation in search results.'
        };
    }
    
    return {
        name: 'Meta Description',
        status: 'pass',
        score: 10,
        message: `Meta description is well-optimized (${length} characters).`,
        suggestion: null
    };
}

/**
 * Check H1 Tag presence
 */
function checkH1Tag(doc) {
    const h1Tags = doc.querySelectorAll('h1');
    const count = h1Tags.length;
    
    if (count === 0) {
        return {
            name: 'H1 Heading',
            status: 'fail',
            score: 0,
            message: 'No H1 heading found on your page.',
            suggestion: 'Add exactly one H1 heading that clearly describes your main content topic.'
        };
    }
    
    if (count > 1) {
        return {
            name: 'H1 Heading',
            status: 'warning',
            score: 7,
            message: `Multiple H1 tags found (${count}). Best practice is to have exactly one.`,
            suggestion: 'Use only one H1 tag per page. Use H2-H6 for subheadings.'
        };
    }
    
    const h1Content = h1Tags[0].textContent.trim();
    if (h1Content.length < 10) {
        return {
            name: 'H1 Heading',
            status: 'warning',
            score: 7,
            message: 'H1 heading found but may be too short or generic.',
            suggestion: 'Make your H1 more descriptive and relevant to your page content.'
        };
    }
    
    return {
        name: 'H1 Heading',
        status: 'pass',
        score: 10,
        message: 'H1 heading is properly implemented.',
        suggestion: null
    };
}

/**
 * Check content word count
 */
function checkWordCount(doc) {
    // Remove script and style elements
    const clone = doc.body.cloneNode(true);
    const scripts = clone.querySelectorAll('script, style, noscript');
    scripts.forEach(el => el.remove());
    
    // Get text content
    const text = clone.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    if (wordCount < 300) {
        return {
            name: 'Content Word Count',
            status: 'fail',
            score: 0,
            message: `Very thin content detected (~${wordCount} words).`,
            suggestion: 'Add substantial, valuable content. Aim for at least 500-1000 words of unique, helpful content per page.'
        };
    }
    
    if (wordCount < 500) {
        return {
            name: 'Content Word Count',
            status: 'warning',
            score: 7,
            message: `Content may be thin (~${wordCount} words).`,
            suggestion: 'Consider expanding your content to at least 500-1000 words for better AdSense approval chances.'
        };
    }
    
    if (wordCount < 800) {
        return {
            name: 'Content Word Count',
            status: 'warning',
            score: 12,
            message: `Moderate content length (~${wordCount} words).`,
            suggestion: 'Good start! For best results, aim for 800+ words of comprehensive content.'
        };
    }
    
    return {
        name: 'Content Word Count',
        status: 'pass',
        score: 15,
        message: `Good content length (~${wordCount} words).`,
        suggestion: null
    };
}

/**
 * Check image alt attributes
 */
function checkImageAlts(doc) {
    const images = doc.querySelectorAll('img');
    const totalImages = images.length;
    
    if (totalImages === 0) {
        return {
            name: 'Image Alt Attributes',
            status: 'warning',
            score: 5,
            message: 'No images found on the page.',
            suggestion: 'Consider adding relevant images to enhance user engagement. When you do, include descriptive alt text.'
        };
    }
    
    let imagesWithAlt = 0;
    images.forEach(img => {
        const alt = img.getAttribute('alt');
        if (alt && alt.trim().length > 0) {
            imagesWithAlt++;
        }
    });
    
    const percentage = Math.round((imagesWithAlt / totalImages) * 100);
    
    if (percentage < 50) {
        return {
            name: 'Image Alt Attributes',
            status: 'fail',
            score: 2,
            message: `Only ${percentage}% of images have alt attributes (${imagesWithAlt}/${totalImages}).`,
            suggestion: 'Add descriptive alt text to all images for accessibility and SEO. This is important for AdSense approval.'
        };
    }
    
    if (percentage < 90) {
        return {
            name: 'Image Alt Attributes',
            status: 'warning',
            score: 6,
            message: `${percentage}% of images have alt attributes (${imagesWithAlt}/${totalImages}).`,
            suggestion: 'Add alt text to the remaining images without it.'
        };
    }
    
    return {
        name: 'Image Alt Attributes',
        status: 'pass',
        score: 10,
        message: `All or most images have alt attributes (${imagesWithAlt}/${totalImages}).`,
        suggestion: null
    };
}

/**
 * Check if URL uses HTTPS
 */
function checkHTTPS(url) {
    if (!url) {
        return {
            name: 'HTTPS Security',
            status: 'warning',
            score: 5,
            message: 'Could not determine if your site uses HTTPS.',
            suggestion: 'Ensure your website uses HTTPS. Most hosting providers offer free SSL certificates.'
        };
    }
    
    if (url.toLowerCase().startsWith('https://')) {
        return {
            name: 'HTTPS Security',
            status: 'pass',
            score: 10,
            message: 'Your website uses HTTPS (secure connection).',
            suggestion: null
        };
    }
    
    return {
        name: 'HTTPS Security',
        status: 'fail',
        score: 0,
        message: 'Your website does not use HTTPS.',
        suggestion: 'Migrate to HTTPS immediately. This is essential for user trust and SEO. Most hosts offer free SSL certificates.'
    };
}

/**
 * Check navigation structure
 */
function checkNavigation(doc) {
    const navElements = doc.querySelectorAll('nav, [role="navigation"]');
    const headerNav = doc.querySelector('header nav, header ul, .nav, .navbar, .menu');
    
    if (navElements.length === 0 && !headerNav) {
        return {
            name: 'Navigation Structure',
            status: 'fail',
            score: 0,
            message: 'No clear navigation structure detected.',
            suggestion: 'Add a proper navigation menu using the <nav> element. Include links to your main pages.'
        };
    }
    
    // Check for navigation links
    const navLinks = doc.querySelectorAll('nav a, header a, .nav a, .menu a');
    
    if (navLinks.length < 3) {
        return {
            name: 'Navigation Structure',
            status: 'warning',
            score: 5,
            message: 'Navigation found but appears limited.',
            suggestion: 'Add more navigation links to help users find content (Home, About, Contact, Categories, etc.).'
        };
    }
    
    return {
        name: 'Navigation Structure',
        status: 'pass',
        score: 10,
        message: 'Good navigation structure detected with multiple links.',
        suggestion: null
    };
}

/**
 * Check for internal links
 */
function checkInternalLinks(doc, url) {
    const allLinks = doc.querySelectorAll('a[href]');
    let internalLinks = 0;
    
    // Get base domain from URL
    let baseDomain = '';
    try {
        const urlObj = new URL(url);
        baseDomain = urlObj.hostname;
    } catch (e) {
        // URL parsing failed
    }
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            // Count relative links and same-domain links as internal
            if (href.startsWith('/') || 
                href.startsWith('#') || 
                href.startsWith('./') ||
                !href.startsWith('http') ||
                (baseDomain && href.includes(baseDomain))) {
                internalLinks++;
            }
        }
    });
    
    if (internalLinks < 3) {
        return {
            name: 'Internal Links',
            status: 'fail',
            score: 0,
            message: `Very few internal links detected (${internalLinks}).`,
            suggestion: 'Add more internal links to connect your pages. This helps users and search engines navigate your site.'
        };
    }
    
    if (internalLinks < 8) {
        return {
            name: 'Internal Links',
            status: 'warning',
            score: 6,
            message: `Some internal links present (${internalLinks}).`,
            suggestion: 'Consider adding more internal links to related content throughout your pages.'
        };
    }
    
    return {
        name: 'Internal Links',
        status: 'pass',
        score: 10,
        message: `Good internal linking structure (${internalLinks} internal links).`,
        suggestion: null
    };
}

/**
 * Check for Privacy Policy link
 */
function checkPrivacyPolicy(doc) {
    const allLinks = doc.querySelectorAll('a');
    let hasPrivacyPolicy = false;
    
    const privacyTerms = ['privacy', 'privacy-policy', 'privacy_policy', 'privacypolicy'];
    
    allLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const text = (link.textContent || '').toLowerCase();
        
        privacyTerms.forEach(term => {
            if (href.includes(term) || text.includes('privacy')) {
                hasPrivacyPolicy = true;
            }
        });
    });
    
    if (!hasPrivacyPolicy) {
        return {
            name: 'Privacy Policy Link',
            status: 'fail',
            score: 0,
            message: 'No Privacy Policy link detected.',
            suggestion: 'Add a Privacy Policy page and link to it from your navigation or footer. This is MANDATORY for AdSense approval.'
        };
    }
    
    return {
        name: 'Privacy Policy Link',
        status: 'pass',
        score: 10,
        message: 'Privacy Policy link detected.',
        suggestion: null
    };
}

/**
 * Check for footer presence
 */
function checkFooter(doc) {
    const footer = doc.querySelector('footer, [role="contentinfo"], .footer');
    
    if (!footer) {
        return {
            name: 'Footer Section',
            status: 'warning',
            score: 2,
            message: 'No footer section detected.',
            suggestion: 'Add a footer with copyright, legal links, and navigation. Footers are expected on professional websites.'
        };
    }
    
    const footerLinks = footer.querySelectorAll('a');
    
    if (footerLinks.length < 2) {
        return {
            name: 'Footer Section',
            status: 'warning',
            score: 3,
            message: 'Footer found but appears minimal.',
            suggestion: 'Enhance your footer with links to important pages (About, Contact, Privacy Policy, Terms).'
        };
    }
    
    return {
        name: 'Footer Section',
        status: 'pass',
        score: 5,
        message: 'Proper footer section detected with navigation links.',
        suggestion: null
    };
}

/**
 * Display analysis results
 */
function displayResults(results) {
    const scoreCircle = document.getElementById('score-circle');
    const scoreNumber = document.getElementById('score-number');
    const scoreStatus = document.getElementById('score-status');
    const scoreSummary = document.getElementById('score-summary');
    const checkList = document.getElementById('check-list');
    const analyzedUrl = document.getElementById('analyzed-url');
    
    // Show analyzed URL
    if (analyzedUrl) {
        analyzedUrl.textContent = results.url;
        analyzedUrl.href = results.url;
    }
    
    // Update score display
    scoreNumber.textContent = results.score;
    
    // Set score color and status
    scoreCircle.className = 'score-circle';
    if (results.score >= 80) {
        scoreCircle.classList.add('score-green');
        scoreStatus.textContent = 'Ready for Application';
        scoreStatus.className = 'score-status status-green';
        scoreSummary.textContent = 'Your page meets most key AdSense requirements. Review any warnings below and consider applying.';
    } else if (results.score >= 50) {
        scoreCircle.classList.add('score-yellow');
        scoreStatus.textContent = 'Needs Improvement';
        scoreStatus.className = 'score-status status-yellow';
        scoreSummary.textContent = 'Your page has some issues that should be addressed before applying for AdSense.';
    } else {
        scoreCircle.classList.add('score-red');
        scoreStatus.textContent = 'Not Ready';
        scoreStatus.className = 'score-status status-red';
        scoreSummary.textContent = 'Significant improvements are needed. Address the issues below before applying.';
    }
    
    // Build check list
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
