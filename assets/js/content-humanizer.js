/**
 * Mr360ai - AI Content Humanizer
 * Transforms text into different tones while maintaining natural readability
 * Helps content sound more authentic and human-written
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('humanizer-form');
    
    if (form) {
        form.addEventListener('submit', handleHumanize);
    }
    
    // Character counter
    const inputText = document.getElementById('input-text');
    const charCount = document.getElementById('char-count');
    
    if (inputText && charCount) {
        inputText.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count.toLocaleString();
        });
    }
});

/**
 * Main humanizer handler
 */
function handleHumanize(e) {
    e.preventDefault();
    
    const inputText = document.getElementById('input-text').value.trim();
    const toneSelect = document.getElementById('tone-select').value;
    const outputContainer = document.getElementById('output-container');
    const outputText = document.getElementById('output-text');
    const analyzeBtn = document.getElementById('humanize-btn');
    
    if (!inputText) {
        showError('Please enter some text to humanize.');
        return;
    }
    
    if (inputText.length < 50) {
        showError('Please enter at least 50 characters for meaningful humanization.');
        return;
    }
    
    // Show processing state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Humanizing...';
    hideError();
    
    // Simulate processing time for perceived value
    setTimeout(() => {
        try {
            const humanizedText = humanizeText(inputText, toneSelect);
            
            // Display results
            outputText.textContent = humanizedText;
            outputContainer.classList.remove('hidden');
            
            // Update statistics
            updateStats(inputText, humanizedText);
            
            outputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            showError('An error occurred during processing. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Humanize Content';
        }
    }, 800);
}

/**
 * Main humanization function
 */
function humanizeText(text, tone) {
    let result = text;
    
    // Step 1: Break into sentences
    let sentences = splitIntoSentences(result);
    
    // Step 2: Apply tone-specific transformations
    switch (tone) {
        case 'casual':
            sentences = applyCasualTone(sentences);
            break;
        case 'story':
            sentences = applyStoryTone(sentences);
            break;
        case 'professional':
            sentences = applyProfessionalTone(sentences);
            break;
    }
    
    // Step 3: Vary sentence structure
    sentences = varySentenceStructure(sentences);
    
    // Step 4: Add natural transitions
    sentences = addNaturalTransitions(sentences, tone);
    
    // Step 5: Remove repetitive patterns
    result = removeRepetition(sentences.join(' '));
    
    // Step 6: Add human touches
    result = addHumanTouches(result, tone);
    
    return result;
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text) {
    // Split by sentence-ending punctuation
    const rawSentences = text.split(/(?<=[.!?])\s+/);
    return rawSentences.filter(s => s.trim().length > 0);
}

/**
 * Apply casual tone transformations
 */
function applyCasualTone(sentences) {
    const casualReplacements = {
        'utilize': 'use',
        'utilize': 'use',
        'implement': 'put in place',
        'demonstrate': 'show',
        'facilitate': 'help with',
        'regarding': 'about',
        'concerning': 'about',
        'commence': 'start',
        'terminate': 'end',
        'endeavor': 'try',
        'sufficient': 'enough',
        'numerous': 'lots of',
        'approximately': 'about',
        'subsequently': 'then',
        'nevertheless': 'but still',
        'furthermore': 'also',
        'therefore': 'so',
        'however': 'but',
        'additionally': 'plus',
        'consequently': 'so',
        'In conclusion': 'So basically',
        'It is important to note that': 'Keep in mind that',
        'It should be noted that': 'Just so you know',
        'In order to': 'To',
        'Due to the fact that': 'Because',
        'For the purpose of': 'To',
        'In the event that': 'If',
        'At this point in time': 'Now',
        'In the near future': 'Soon',
        'In spite of the fact that': 'Even though'
    };
    
    return sentences.map(sentence => {
        let newSentence = sentence;
        for (const [formal, casual] of Object.entries(casualReplacements)) {
            const regex = new RegExp(formal, 'gi');
            newSentence = newSentence.replace(regex, casual);
        }
        return newSentence;
    });
}

/**
 * Apply storytelling tone transformations
 */
function applyStoryTone(sentences) {
    const storyReplacements = {
        'utilize': 'work with',
        'implement': 'bring to life',
        'demonstrate': 'show firsthand',
        'experience': 'journey through',
        'discover': 'stumble upon',
        'learn': 'come to realize',
        'understand': 'grasp',
        'important': 'crucial',
        'significant': 'remarkable',
        'interesting': 'fascinating'
    };
    
    return sentences.map((sentence, index) => {
        let newSentence = sentence;
        for (const [original, story] of Object.entries(storyReplacements)) {
            const regex = new RegExp(`\\b${original}\\b`, 'gi');
            newSentence = newSentence.replace(regex, story);
        }
        return newSentence;
    });
}

/**
 * Apply professional tone transformations
 */
function applyProfessionalTone(sentences) {
    const professionalReplacements = {
        'lots of': 'numerous',
        'a lot': 'significantly',
        'really': 'substantially',
        'very': 'considerably',
        'get': 'obtain',
        'got': 'obtained',
        'show': 'demonstrate',
        'use': 'utilize',
        'help': 'assist',
        'need': 'require',
        'want': 'desire',
        'think': 'believe',
        'know': 'understand',
        'good': 'beneficial',
        'bad': 'detrimental',
        'big': 'substantial',
        'small': 'minimal'
    };
    
    return sentences.map(sentence => {
        let newSentence = sentence;
        for (const [casual, professional] of Object.entries(professionalReplacements)) {
            const regex = new RegExp(`\\b${casual}\\b`, 'gi');
            newSentence = newSentence.replace(regex, professional);
        }
        return newSentence;
    });
}

/**
 * Vary sentence structure to avoid monotony
 */
function varySentenceStructure(sentences) {
    return sentences.map((sentence, index) => {
        // Don't modify every sentence
        if (index % 3 !== 0) return sentence;
        
        // Occasionally add introductory phrases
        const intros = [
            'Interestingly, ',
            'What\'s worth noting is that ',
            'Here\'s the thing: ',
            'The reality is, ',
            'Looking at this closely, '
        ];
        
        // Only add intro occasionally and if sentence doesn't start with one
        if (Math.random() > 0.7 && !sentence.match(/^(Interestingly|What's|Here's|The reality|Looking)/)) {
            const intro = intros[Math.floor(Math.random() * intros.length)];
            return intro + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
        
        return sentence;
    });
}

/**
 * Add natural transitions between sentences
 */
function addNaturalTransitions(sentences, tone) {
    const casualTransitions = ['Also, ', 'And ', 'Plus, ', 'So ', 'Now, '];
    const storyTransitions = ['Then, ', 'Next, ', 'Meanwhile, ', 'Eventually, ', 'As it turns out, '];
    const professionalTransitions = ['Furthermore, ', 'Additionally, ', 'Moreover, ', 'Subsequently, ', 'Consequently, '];
    
    let transitions;
    switch (tone) {
        case 'casual': transitions = casualTransitions; break;
        case 'story': transitions = storyTransitions; break;
        case 'professional': transitions = professionalTransitions; break;
        default: transitions = casualTransitions;
    }
    
    return sentences.map((sentence, index) => {
        // Add transitions occasionally (not first sentence)
        if (index > 0 && index % 4 === 0 && Math.random() > 0.5) {
            const transition = transitions[Math.floor(Math.random() * transitions.length)];
            if (!sentence.match(/^(Furthermore|Additionally|Moreover|Also|And|Plus|Then|Next)/)) {
                return transition + sentence.charAt(0).toLowerCase() + sentence.slice(1);
            }
        }
        return sentence;
    });
}

/**
 * Remove repetitive words and phrases
 */
function removeRepetition(text) {
    // Find and reduce repeated words
    const words = text.split(/\s+/);
    const result = [];
    let lastWord = '';
    
    for (const word of words) {
        // Avoid immediate word repetition (except common words)
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
        if (word.toLowerCase() === lastWord.toLowerCase() && !commonWords.includes(word.toLowerCase())) {
            continue;
        }
        result.push(word);
        lastWord = word;
    }
    
    return result.join(' ');
}

/**
 * Add subtle human touches
 */
function addHumanTouches(text, tone) {
    let result = text;
    
    // Add contractions for casual/story tones
    if (tone === 'casual' || tone === 'story') {
        result = result
            .replace(/\bdo not\b/gi, "don't")
            .replace(/\bcannot\b/gi, "can't")
            .replace(/\bwill not\b/gi, "won't")
            .replace(/\bshould not\b/gi, "shouldn't")
            .replace(/\bwould not\b/gi, "wouldn't")
            .replace(/\bcould not\b/gi, "couldn't")
            .replace(/\bit is\b/gi, "it's")
            .replace(/\bthat is\b/gi, "that's")
            .replace(/\bwhat is\b/gi, "what's")
            .replace(/\bthere is\b/gi, "there's")
            .replace(/\bI am\b/g, "I'm")
            .replace(/\byou are\b/gi, "you're")
            .replace(/\bthey are\b/gi, "they're")
            .replace(/\bwe are\b/gi, "we're");
    }
    
    // Expand contractions for professional tone
    if (tone === 'professional') {
        result = result
            .replace(/\bdon't\b/gi, "do not")
            .replace(/\bcan't\b/gi, "cannot")
            .replace(/\bwon't\b/gi, "will not")
            .replace(/\bshouldn't\b/gi, "should not")
            .replace(/\bwouldn't\b/gi, "would not")
            .replace(/\bcouldn't\b/gi, "could not")
            .replace(/\bit's\b/gi, "it is")
            .replace(/\bthat's\b/gi, "that is")
            .replace(/\bI'm\b/g, "I am");
    }
    
    return result;
}

/**
 * Update statistics display
 */
function updateStats(original, humanized) {
    const originalWords = original.split(/\s+/).length;
    const humanizedWords = humanized.split(/\s+/).length;
    const changePercent = Math.round(Math.abs(humanizedWords - originalWords) / originalWords * 100);
    
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Original Words</span>
                <span class="stat-value">${originalWords}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Humanized Words</span>
                <span class="stat-value">${humanizedWords}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Change</span>
                <span class="stat-value">${changePercent}%</span>
            </div>
        `;
        statsContainer.classList.remove('hidden');
    }
}

/**
 * Copy to clipboard
 */
function copyOutput() {
    const outputText = document.getElementById('output-text');
    
    if (outputText) {
        navigator.clipboard.writeText(outputText.textContent).then(() => {
            const copyBtn = document.getElementById('copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    }
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
    }
}

/**
 * Hide error message
 */
function hideError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
    }
}
