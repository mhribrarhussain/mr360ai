/**
 * Mr360ai - Low-Value Content Analyzer
 * Analyzes text for content quality signals
 * Helps identify potential "low-value content" issues
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('analyzer-form');
    
    if (form) {
        form.addEventListener('submit', handleAnalysis);
    }
    
    // Word counter
    const inputText = document.getElementById('input-text');
    const wordCount = document.getElementById('word-count');
    
    if (inputText && wordCount) {
        inputText.addEventListener('input', function() {
            const words = this.value.trim().split(/\s+/).filter(w => w.length > 0);
            wordCount.textContent = words.length;
        });
    }
});

/**
 * Main analysis handler
 */
function handleAnalysis(e) {
    e.preventDefault();
    
    const inputText = document.getElementById('input-text').value.trim();
    const resultsContainer = document.getElementById('results-container');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    if (!inputText) {
        showError('Please enter some content to analyze.');
        return;
    }
    
    if (inputText.split(/\s+/).length < 100) {
        showError('Please enter at least 100 words for meaningful analysis.');
        return;
    }
    
    // Show processing state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    hideError();
    
    setTimeout(() => {
        try {
            const results = analyzeContent(inputText);
            displayResults(results);
            resultsContainer.classList.remove('hidden');
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            showError('An error occurred during analysis. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze Content Quality';
        }
    }, 1000);
}

/**
 * Comprehensive content analysis
 */
function analyzeContent(text) {
    const checks = [];
    let totalScore = 0;
    let maxScore = 0;
    
    // Check 1: Word Count (weight: 20)
    checks.push(checkWordCount(text));
    maxScore += 20;
    
    // Check 2: Sentence Variety (weight: 15)
    checks.push(checkSentenceVariety(text));
    maxScore += 15;
    
    // Check 3: Paragraph Structure (weight: 12)
    checks.push(checkParagraphs(text));
    maxScore += 12;
    
    // Check 4: Vocabulary Richness (weight: 15)
    checks.push(checkVocabulary(text));
    maxScore += 15;
    
    // Check 5: Repetition Issues (weight: 15)
    checks.push(checkRepetition(text));
    maxScore += 15;
    
    // Check 6: Filler Words (weight: 10)
    checks.push(checkFillerWords(text));
    maxScore += 10;
    
    // Check 7: Question/Engagement (weight: 8)
    checks.push(checkEngagement(text));
    maxScore += 8;
    
    // Check 8: Specificity Signals (weight: 5)
    checks.push(checkSpecificity(text));
    maxScore += 5;
    
    checks.forEach(check => totalScore += check.score);
    
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    return {
        score: finalScore,
        wordCount: text.split(/\s+/).length,
        checks: checks
    };
}

/**
 * Check word count depth
 */
function checkWordCount(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const count = words.length;
    
    if (count < 300) {
        return {
            name: 'Content Depth (Word Count)',
            status: 'fail',
            score: 5,
            message: `Very thin content (${count} words). Likely to be flagged as low-value.`,
            suggestion: 'Expand to at least 500-800 words with meaningful, helpful information.'
        };
    }
    
    if (count < 500) {
        return {
            name: 'Content Depth (Word Count)',
            status: 'warning',
            score: 10,
            message: `Light content (${count} words). May appear thin to Google.`,
            suggestion: 'Consider expanding to 600+ words with additional insights and examples.'
        };
    }
    
    if (count < 800) {
        return {
            name: 'Content Depth (Word Count)',
            status: 'warning',
            score: 15,
            message: `Moderate length (${count} words). Acceptable but not comprehensive.`,
            suggestion: 'For competitive topics, aim for 1000+ words of thorough coverage.'
        };
    }
    
    return {
        name: 'Content Depth (Word Count)',
        status: 'pass',
        score: 20,
        message: `Good content length (${count} words). Shows topical depth.`,
        suggestion: null
    };
}

/**
 * Check sentence variety
 */
function checkSentenceVariety(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 5) {
        return {
            name: 'Sentence Variety',
            status: 'warning',
            score: 7,
            message: 'Too few sentences to analyze variety properly.',
            suggestion: 'Add more sentences to create varied, engaging content.'
        };
    }
    
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    // Calculate standard deviation
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation (higher = more variety)
    const cv = stdDev / avgLength;
    
    if (cv < 0.2) {
        return {
            name: 'Sentence Variety',
            status: 'fail',
            score: 4,
            message: 'Very uniform sentence lengths. Reads robotically.',
            suggestion: 'Mix short, punchy sentences with longer, complex ones. Vary your rhythm.'
        };
    }
    
    if (cv < 0.4) {
        return {
            name: 'Sentence Variety',
            status: 'warning',
            score: 10,
            message: 'Moderate sentence variety. Could be more dynamic.',
            suggestion: 'Add more short sentences for emphasis and longer ones for depth.'
        };
    }
    
    return {
        name: 'Sentence Variety',
        status: 'pass',
        score: 15,
        message: 'Good sentence length variety. Natural reading flow.',
        suggestion: null
    };
}

/**
 * Check paragraph structure
 */
function checkParagraphs(text) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const wordCount = text.split(/\s+/).length;
    
    if (paragraphs.length <= 1 && wordCount > 200) {
        return {
            name: 'Paragraph Structure',
            status: 'fail',
            score: 2,
            message: 'Content is one giant block of text. Very hard to read.',
            suggestion: 'Break content into paragraphs of 3-5 sentences each.'
        };
    }
    
    const avgParaLength = wordCount / paragraphs.length;
    
    if (avgParaLength > 150) {
        return {
            name: 'Paragraph Structure',
            status: 'warning',
            score: 6,
            message: `Paragraphs are too long (~${Math.round(avgParaLength)} words avg).`,
            suggestion: 'Break long paragraphs into shorter, scannable chunks.'
        };
    }
    
    if (paragraphs.length < 3 && wordCount > 300) {
        return {
            name: 'Paragraph Structure',
            status: 'warning',
            score: 8,
            message: 'Very few paragraph breaks for the content length.',
            suggestion: 'Add more paragraph breaks to improve readability.'
        };
    }
    
    return {
        name: 'Paragraph Structure',
        status: 'pass',
        score: 12,
        message: `Well-structured paragraphs (${paragraphs.length} paragraphs).`,
        suggestion: null
    };
}

/**
 * Check vocabulary richness
 */
function checkVocabulary(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = new Set(words);
    
    if (words.length < 50) {
        return {
            name: 'Vocabulary Richness',
            status: 'warning',
            score: 7,
            message: 'Not enough text to assess vocabulary properly.',
            suggestion: 'Add more content for a meaningful vocabulary analysis.'
        };
    }
    
    const lexicalDensity = uniqueWords.size / words.length;
    
    if (lexicalDensity < 0.3) {
        return {
            name: 'Vocabulary Richness',
            status: 'fail',
            score: 4,
            message: 'Very repetitive vocabulary. Content feels redundant.',
            suggestion: 'Use synonyms and varied phrasing. Expand your word choices.'
        };
    }
    
    if (lexicalDensity < 0.45) {
        return {
            name: 'Vocabulary Richness',
            status: 'warning',
            score: 10,
            message: 'Moderate vocabulary variety. Some repetition detected.',
            suggestion: 'Try using more diverse word choices throughout your content.'
        };
    }
    
    return {
        name: 'Vocabulary Richness',
        status: 'pass',
        score: 15,
        message: 'Rich vocabulary with good word variety.',
        suggestion: null
    };
}

/**
 * Check for excessive repetition
 */
function checkRepetition(text) {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Find overused words (appearing more than 3% of total)
    const threshold = Math.max(3, words.length * 0.03);
    const overused = Object.entries(wordFreq)
        .filter(([word, count]) => count > threshold)
        .filter(([word]) => !['this', 'that', 'with', 'from', 'have', 'been', 'more', 'their', 'when', 'which', 'about', 'would', 'there', 'some', 'what', 'your', 'other', 'into', 'also', 'than', 'only', 'these', 'very', 'just', 'over', 'such', 'most', 'even', 'after', 'make', 'like', 'them', 'each', 'will', 'they', 'many', 'were', 'being', 'could', 'much', 'does', 'well', 'before', 'should'].includes(word));
    
    if (overused.length > 5) {
        return {
            name: 'Keyword/Word Repetition',
            status: 'fail',
            score: 3,
            message: `Many overused words detected: ${overused.slice(0, 5).map(([w]) => w).join(', ')}`,
            suggestion: 'Reduce repetition by using synonyms and restructuring sentences.'
        };
    }
    
    if (overused.length > 2) {
        return {
            name: 'Keyword/Word Repetition',
            status: 'warning',
            score: 10,
            message: `Some word repetition: ${overused.map(([w]) => w).join(', ')}`,
            suggestion: 'Consider using synonyms for frequently repeated terms.'
        };
    }
    
    return {
        name: 'Keyword/Word Repetition',
        status: 'pass',
        score: 15,
        message: 'No excessive word repetition detected.',
        suggestion: null
    };
}

/**
 * Check for filler words
 */
function checkFillerWords(text) {
    const fillerWords = ['very', 'really', 'actually', 'basically', 'literally', 'just', 'simply', 'quite', 'rather', 'somewhat', 'perhaps', 'maybe', 'probably', 'certainly', 'definitely', 'absolutely', 'extremely', 'incredibly', 'amazingly', 'essentially'];
    
    const words = text.toLowerCase().split(/\s+/);
    let fillerCount = 0;
    
    words.forEach(word => {
        if (fillerWords.includes(word.replace(/[^a-z]/g, ''))) {
            fillerCount++;
        }
    });
    
    const fillerRatio = fillerCount / words.length;
    
    if (fillerRatio > 0.05) {
        return {
            name: 'Filler Words',
            status: 'fail',
            score: 2,
            message: `High filler word usage (${fillerCount} filler words, ${(fillerRatio * 100).toFixed(1)}%).`,
            suggestion: 'Remove unnecessary filler words like "very," "really," "actually."'
        };
    }
    
    if (fillerRatio > 0.025) {
        return {
            name: 'Filler Words',
            status: 'warning',
            score: 6,
            message: `Moderate filler word usage (${fillerCount} filler words).`,
            suggestion: 'Consider reducing filler words for more direct writing.'
        };
    }
    
    return {
        name: 'Filler Words',
        status: 'pass',
        score: 10,
        message: 'Low filler word usage. Direct, purposeful writing.',
        suggestion: null
    };
}

/**
 * Check for engagement signals
 */
function checkEngagement(text) {
    const hasQuestions = /\?/.test(text);
    const hasExclamations = /!/.test(text);
    const hasQuotes = /"[^"]+"|'[^']+'/.test(text);
    const hasNumbers = /\b\d+\b/.test(text);
    const hasLists = /^\s*[-*•]\s|\d+\.\s/m.test(text);
    
    let signals = 0;
    if (hasQuestions) signals++;
    if (hasExclamations) signals++;
    if (hasQuotes) signals++;
    if (hasNumbers) signals++;
    if (hasLists) signals++;
    
    if (signals === 0) {
        return {
            name: 'Engagement Elements',
            status: 'fail',
            score: 1,
            message: 'No engagement elements detected. Content may feel flat.',
            suggestion: 'Add questions, examples with numbers, quotes, or lists to engage readers.'
        };
    }
    
    if (signals < 3) {
        return {
            name: 'Engagement Elements',
            status: 'warning',
            score: 5,
            message: 'Some engagement elements present but could use more variety.',
            suggestion: 'Consider adding rhetorical questions, data points, or expert quotes.'
        };
    }
    
    return {
        name: 'Engagement Elements',
        status: 'pass',
        score: 8,
        message: 'Good variety of engagement elements throughout content.',
        suggestion: null
    };
}

/**
 * Check for specificity signals
 */
function checkSpecificity(text) {
    // Look for specific indicators: numbers, percentages, years, proper nouns
    const specificPatterns = [
        /\b\d+%/g,           // Percentages
        /\b(19|20)\d{2}\b/g, // Years
        /\$[\d,]+/g,         // Money amounts
        /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/g, // Proper nouns
    ];
    
    let specificityScore = 0;
    
    specificPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) specificityScore += Math.min(matches.length, 3);
    });
    
    if (specificityScore === 0) {
        return {
            name: 'Specificity & Details',
            status: 'warning',
            score: 1,
            message: 'No specific data, dates, or names detected.',
            suggestion: 'Add statistics, years, names, or other specific details to add credibility.'
        };
    }
    
    if (specificityScore < 4) {
        return {
            name: 'Specificity & Details',
            status: 'warning',
            score: 3,
            message: 'Some specific details present but light on data.',
            suggestion: 'Consider adding more concrete examples and statistics.'
        };
    }
    
    return {
        name: 'Specificity & Details',
        status: 'pass',
        score: 5,
        message: 'Good use of specific details and data points.',
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
    
    scoreNumber.textContent = results.score;
    
    scoreCircle.className = 'score-circle';
    if (results.score >= 75) {
        scoreCircle.classList.add('score-green');
        scoreStatus.textContent = 'High-Quality Content';
        scoreStatus.className = 'score-status status-green';
        scoreSummary.textContent = 'Your content shows strong quality signals. It should be well-received by both readers and search engines.';
    } else if (results.score >= 50) {
        scoreCircle.classList.add('score-yellow');
        scoreStatus.textContent = 'Needs Improvement';
        scoreStatus.className = 'score-status status-yellow';
        scoreSummary.textContent = 'Your content has potential but may be flagged for quality issues. Address the items below.';
    } else {
        scoreCircle.classList.add('score-red');
        scoreStatus.textContent = 'Low-Value Content Risk';
        scoreStatus.className = 'score-status status-red';
        scoreSummary.textContent = 'This content shows multiple low-value signals. Major revisions recommended before publishing.';
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

/**
 * Show/hide error messages
 */
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
