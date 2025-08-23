// Chromakopia Font Generator App - FULLY FIXED VERSION
class ChromakopiaFontGenerator {
    constructor() {
        this.canvas = document.getElementById('preview-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textInput = document.getElementById('text-input');
        this.colorPicker = document.getElementById('text-color');
        this.fontSizeSlider = document.getElementById('font-size');
        this.sizeValue = document.getElementById('size-value');
        this.downloadBtn = document.getElementById('download-btn');
        this.authenticGreenCheckbox = document.getElementById('use-authentic-green');
        this.bgUploadInput = document.getElementById('bg-upload');
        this.eyedropperBtn = document.getElementById('eyedropper-btn');
        this.recentColorsList = document.getElementById('recent-colors-list');

        
        // State
        this.currentText = 'CHROMAKOPIA';
        this.currentColor = '#01823f';
        this.currentFontSize = 100; 
        this.currentBackground = 'transparent';
        this.canvasWidth = 1200;
        this.canvasHeight = 1200;
        this.uploadedImage = null;
        this.fontsLoaded = false;
        this.letterSpacing = 62;
        this.recentColors = this.loadRecentColors(); 
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.bindEvents();
        this.initFAQ();
        
        // Set initial values
        this.textInput.value = this.currentText;
        this.colorPicker.value = this.currentColor;
        this.fontSizeSlider.value = this.currentFontSize;
        this.sizeValue.textContent = `${this.currentFontSize}px`;
        
        // Initialize recent colors display
        this.updateRecentColorsDisplay();
        
        // Defer first render until fonts are loaded for authenticity
        this.loadFonts().then(() => {
            this.fontsLoaded = true;
            this.renderPreview();
        }).catch(() => {
            // If fonts fail to load, still render with system fallback
            this.renderPreview();
        });
    }
    
    setupCanvas() {
        // Set canvas actual size (square by default)
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Set display size via CSS
        this.canvas.style.width = '100%';
        this.canvas.style.height = '300px';
        this.canvas.style.objectFit = 'contain';
    }
    
    bindEvents() {
        // Text input events with immediate update
        this.textInput.addEventListener('input', (e) => {
            this.currentText = e.target.value || 'CHROMAKOPIA';
            console.log('Text updated:', this.currentText);
            this.renderPreview();
        });
        
        this.textInput.addEventListener('keyup', (e) => {
            this.currentText = e.target.value || 'CHROMAKOPIA';
            this.renderPreview();
        });
        
        this.textInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                this.currentText = e.target.value || 'CHROMAKOPIA';
                this.renderPreview();
            }, 10);
        });
        
        // Color picker events - FIXED with better event handling
        this.colorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.addToRecentColors(this.currentColor);
            console.log('Color updated:', this.currentColor);
            this.renderPreview();
        });
        
        this.colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
            console.log('Color changed:', this.currentColor);
            this.renderPreview();
        });
        
        // Font size slider
        this.fontSizeSlider.addEventListener('input', (e) => {
            this.currentFontSize = parseInt(e.target.value);
            this.sizeValue.textContent = `${this.currentFontSize}px`;
            console.log('Font size updated:', this.currentFontSize);
            this.renderPreview();
        });
        

        
        // Authentic green checkbox
        if (this.authenticGreenCheckbox) {
            this.authenticGreenCheckbox.addEventListener('change', () => {
                if (this.authenticGreenCheckbox.checked) {
                    this.currentColor = '#01823f';
                    this.colorPicker.value = '#01823f';
                    this.colorPicker.setAttribute('disabled', 'disabled');
                } else {
                    this.colorPicker.removeAttribute('disabled');
                }
                this.renderPreview();
            });
        }
        
        // Background image upload with validation
        if (this.bgUploadInput) {
            this.bgUploadInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    e.target.value = '';
                    return;
                }
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select a valid image file');
                    e.target.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                        this.uploadedImage = img;
                        // Clear any active background option
                        document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('active'));
                        this.currentBackground = 'image';
                        this.renderPreview();
                    };
                    img.onerror = () => {
                        alert('Failed to load image. Please try another file.');
                        e.target.value = '';
                    };
                    img.src = ev.target.result;
                };
                reader.onerror = () => {
                    alert('Failed to read file. Please try again.');
                    e.target.value = '';
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Eyedropper functionality
        if (this.eyedropperBtn) {
            this.eyedropperBtn.addEventListener('click', () => {
                this.useEyedropper();
            });
            
            // Check if EyeDropper API is supported
            if (!('EyeDropper' in window)) {
                this.eyedropperBtn.disabled = true;
                this.eyedropperBtn.title = 'Eyedropper not supported in this browser';
            }
        }
        
        // Color presets - FIXED
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const color = preset.dataset.color;
                console.log('Color preset clicked:', color);
                this.currentColor = color;
                this.colorPicker.value = color;
                this.addToRecentColors(color);
                this.updateActiveColorPreset(preset);
                this.renderPreview();
            });
        });
        
        // Background options - FIXED
        document.querySelectorAll('.bg-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const bg = option.dataset.bg;
                console.log('Background option clicked:', bg);
                this.currentBackground = bg;
                // Clear uploaded image when selecting other backgrounds
                if (bg !== 'image') {
                    this.uploadedImage = null;
                    if (this.bgUploadInput) {
                        this.bgUploadInput.value = '';
                    }
                }
                this.updateActiveBackground(option);
                this.renderPreview();
            });
        });
        
        // Download button
        this.downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadImage();
        });
        
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.setupCanvas();
            this.renderPreview();
        }, 250));
    }
    
    renderPreview() {
        if (!this.currentText || this.currentText.trim() === '') {
            this.currentText = 'CHROMAKOPIA';
        }
        const baseSize = Math.max(24, Math.min(this.currentFontSize, 160));
        const fontsize2 = baseSize;
        const fontsize1 = Math.round(fontsize2 * 2.5);
        const fontsize3 = Math.round(fontsize2 * 2.5);
        
        // Calculate dynamic text width using actual fonts
        const metrics = this.calculateThreeFontMetrics(this.currentText.toUpperCase(), fontsize1, fontsize2, fontsize3);
        const horizontalPadding = Math.max(64, Math.round(fontsize2 * 1.0)); // More generous padding
        const verticalPadding = Math.max(64, Math.round(fontsize1 * 0.5)); // Vertical padding for better centering
        const requiredWidth = metrics.totalWidth + horizontalPadding * 2;
        const requiredHeight = Math.max(fontsize1, fontsize3) + verticalPadding * 2; // Better height calculation
        const squareSize = Math.max(requiredWidth, requiredHeight, 800); // Minimum 800px for quality
        
        if (squareSize !== this.canvasWidth || squareSize !== this.canvasHeight) {
            this.canvasWidth = squareSize;
            this.canvasHeight = squareSize;
            this.canvas.width = squareSize;
            this.canvas.height = squareSize;
        }
        
        // Clear and draw background (image or color/transparent)
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.setBackground();
        
        // Apply tint overlay if an image exists
        if (this.uploadedImage) {
            this.drawTintOverlay(this.currentColor, 0.7);
        }
        
        // Perfect centering - both horizontal and vertical
        // Calculate precise vertical center based on font metrics
        const textHeight = Math.max(fontsize1, fontsize3); // Height of the tallest characters
        const verticalCenter = this.canvas.height / 2;
        const y = Math.round(verticalCenter + (textHeight * 0.15)); // Slight offset for visual balance
        
        // Perfect horizontal centering
        const startX = Math.round((this.canvas.width - metrics.totalWidth) / 2);
        
        this.drawThreeFontText(this.currentText.toUpperCase(), startX, y, fontsize1, fontsize2, fontsize3, metrics);
        
        this.updateResolutionLabel();
    }

    loadFonts() {
        if (typeof FontFaceObserver === 'undefined') {
            return Promise.resolve();
        }
        const font1 = new FontFaceObserver('ChromakopiaType1');
        const font2 = new FontFaceObserver('ChromakopiaType2');
        const font3 = new FontFaceObserver('ChromakopiaType3');
        return Promise.all([font1.load(), font2.load(), font3.load()]);
    }

    updateResolutionLabel() {
        const el = document.querySelector('.preview-resolution');
        if (el) {
            el.textContent = `${this.canvas.width}×${this.canvas.height}`;
        }
    }

    getContextFont(size, which) {
        const family = which === 1 ? 'ChromakopiaType1' : (which === 2 ? 'ChromakopiaType2' : 'ChromakopiaType3');
        return `${size}px "${family}", sans-serif`;
    }

    calculateThreeFontMetrics(text, fontsize1, fontsize2, fontsize3) {
        const ctx = this.ctx;
        if (!text || text.length === 0) {
            return { totalWidth: 0, firstWidth: 0, middleWidth: 0, lastWidth: 0, spacingOffset: 0, middleText: '' };
        }
        const letters = text.split('');
        const first = letters[0];
        const last = letters[letters.length - 1];
        const middleText = letters.slice(1, letters.length - 1).join('');
        
        // Simple, reliable approach: measure each part and use fixed proportional spacing
        ctx.font = this.getContextFont(fontsize1, 1);
        const firstWidth = ctx.measureText(first).width;
        
        ctx.font = this.getContextFont(fontsize2, 2);
        const middleWidth = middleText.length ? ctx.measureText(middleText).width : 0;
        
        ctx.font = this.getContextFont(fontsize3, 3);
        const lastWidth = ctx.measureText(last).width;
        
        // Dynamic spacing based on slider (20-100% maps to 0.2-1.0 multiplier)
        const spacingMultiplier = this.letterSpacing / 100;
        const spacingOffset = Math.round(fontsize2 * spacingMultiplier);
        const totalWidth = firstWidth + spacingOffset + middleWidth + lastWidth;
        return { totalWidth, firstWidth, middleWidth, lastWidth, spacingOffset, middleText };
    }

    drawThreeFontText(text, startX, y, fontsize1, fontsize2, fontsize3, metrics) {
        const ctx = this.ctx;
        const letters = text.split('');
        if (letters.length === 0) return;
        let x = startX;
        
        // First letter
        ctx.font = this.getContextFont(fontsize1, 1);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
        ctx.fillStyle = this.currentColor;
        ctx.fillText(letters[0], x, y);
        x += metrics.firstWidth + metrics.spacingOffset;
        
        // Middle substring (preserves kerning)
        ctx.font = this.getContextFont(fontsize2, 2);
        if (metrics.middleText && metrics.middleText.length) {
            ctx.fillText(metrics.middleText, x, y);
            x += metrics.middleWidth;
        }
        
        // Last letter
        ctx.font = this.getContextFont(fontsize3, 3);
        if (letters.length > 1) {
            ctx.fillText(letters[letters.length - 1], x, y);
        }
    }

    drawTintOverlay(hexColor, alpha) {
        const { r, g, b } = this.hexToRgb(hexColor);
        this.ctx.save();
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    getFirstLetterSafetyGap(first, fontsize1, fontsize2, metrics) {
        const aggressiveRightLetters = 'CGSTYQJURVWXZHK';
        const base = Math.round(fontsize2 * 0.12);
        if (aggressiveRightLetters.includes(first)) {
            const ext = typeof metrics.actualBoundingBoxRight === 'number' ? metrics.actualBoundingBoxRight : metrics.width;
            return Math.max(base, Math.round(ext * 0.18));
        }
        // Subtle extra gap for default
        return Math.round(fontsize2 * 0.06);
    }

    hexToRgb(hex) {
        let c = hex.replace('#', '');
        if (c.length === 3) {
            c = c.split('').map(s => s + s).join('');
        }
        const num = parseInt(c, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }
    
    measureGlyphAdvance(char, size, which) {
        // Draw the glyph on an offscreen canvas and find the rightmost non-empty pixel
        const off = document.createElement('canvas');
        const pad = Math.ceil(size * 0.5);
        off.width = size * 3;
        off.height = size * 3;
        const octx = off.getContext('2d');
        octx.clearRect(0, 0, off.width, off.height);
        octx.fillStyle = '#000';
        octx.textBaseline = 'alphabetic';
        octx.textAlign = 'left';
        octx.font = this.getContextFont(size, which);
        const baselineY = Math.round(off.height / 2);
        octx.fillText(char, pad, baselineY);
        const img = octx.getImageData(0, 0, off.width, off.height).data;
        let right = 0;
        for (let y = 0; y < off.height; y++) {
            for (let x = off.width - 1; x >= 0; x--) {
                const idx = (y * off.width + x) * 4 + 3;
                if (img[idx] !== 0) {
                    right = Math.max(right, x);
                break;
                }
            }
        }
        // Subtract left pad to get advance width from origin
        return Math.max(0, right - pad);
    }

    measureTextLeftExtent(text, size, which) {
        // Find left-most painted pixel of the text block to estimate left sidebearing/overhang
        const off = document.createElement('canvas');
        const pad = Math.ceil(size * 0.5);
        off.width = size * 6;
        off.height = size * 3;
        const octx = off.getContext('2d');
        octx.clearRect(0, 0, off.width, off.height);
        octx.fillStyle = '#000';
        octx.textBaseline = 'alphabetic';
        octx.textAlign = 'left';
        octx.font = this.getContextFont(size, which);
        const baselineY = Math.round(off.height / 2);
        octx.fillText(text, pad, baselineY);
        const img = octx.getImageData(0, 0, off.width, off.height).data;
        let left = off.width;
        for (let y = 0; y < off.height; y++) {
            for (let x = 0; x < off.width; x++) {
                const idx = (y * off.width + x) * 4 + 3;
                if (img[idx] !== 0) {
                    left = Math.min(left, x);
                    break;
                }
            }
        }
        return Math.max(0, left - pad);
    }
    
    // legacy methods kept for compatibility with feature cards; not used in three-font pipeline
    renderChromakopiaText(text, centerX, centerY, fontSize) {}
    
    renderChromakopiaLetter(letter, x, y, size, color, index, totalLetters) {}
    
    addChromakopiaEffects() {}
    
    drawChromakopiaHorns() {}
    
    drawAngularSpike() {}
    
    addCornerDetails() {}
    
    drawTriangleDetail() {}
    
    calculateTextWidth(letters, fontSize, letterSpacing) {
        let totalWidth = 0;
        letters.forEach(letter => {
            if (letter === ' ') {
                totalWidth += fontSize * 0.4;
            } else {
                totalWidth += this.getLetterWidth(letter, fontSize) + letterSpacing;
            }
        });
        return totalWidth - letterSpacing;
    }
    
    getLetterWidth(letter, fontSize) {
        const wideLetters = 'MWQO';
        const narrowLetters = 'ILT';
        const mediumLetters = 'FJPRY';
        
        if (wideLetters.includes(letter)) {
            return fontSize * 0.75;
        } else if (narrowLetters.includes(letter)) {
            return fontSize * 0.35;
        } else if (mediumLetters.includes(letter)) {
            return fontSize * 0.5;
        } else {
            return fontSize * 0.6;
        }
    }
    
    setBackground() {
        if (this.uploadedImage) {
            // Draw uploaded image cropped to square, cover style
            const img = this.uploadedImage;
            const s = Math.min(img.width, img.height);
            const sx = Math.floor((img.width - s) / 2);
            const sy = Math.floor((img.height - s) / 2);
            this.ctx.drawImage(img, sx, sy, s, s, 0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        if (this.currentBackground === 'transparent') {
            // Transparent export support: don't draw checkerboard to the actual canvas; only in preview.
            // For preview, we can simulate checkerboard by CSS; here keep transparent.
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        } else if (this.currentBackground && this.currentBackground.startsWith('linear-gradient')) {
            this.applyGradient();
        } else if (this.currentBackground && this.currentBackground.startsWith('#')) {
            this.ctx.fillStyle = this.currentBackground;
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        } else {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
    }
    
    drawCheckerboard() {
        // No-op: we keep transparency in canvas; checkerboard is handled by CSS in preview
    }
    
    applyGradient() {
        if (this.currentBackground.includes('#01823f')) {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
            gradient.addColorStop(0, '#01823f');
            gradient.addColorStop(1, '#2d5016');
            this.ctx.fillStyle = gradient;
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#0a0a0a');
            this.ctx.fillStyle = gradient;
        }
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    updateActiveColorPreset(activePreset) {
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        activePreset.classList.add('active');
    }
    
    updateActiveBackground(activeOption) {
        document.querySelectorAll('.bg-option').forEach(option => {
            option.classList.remove('active');
        });
        activeOption.classList.add('active');
    }
    
    downloadImage() {
        try {
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            
            const scale = 4;
            downloadCanvas.width = this.canvasWidth * scale;
            downloadCanvas.height = this.canvasHeight * scale;
            downloadCtx.scale(scale, scale);
            
            const originalCtx = this.ctx;
            this.ctx = downloadCtx;
            
            this.renderPreview();
            
            this.ctx = originalCtx;
            
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            const cleanText = this.currentText.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
            link.download = `chromakopia-${cleanText}-${timestamp}.png`;
            
            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                link.href = url;
                
                this.downloadBtn.classList.add('loading');
                this.downloadBtn.textContent = 'Downloading...';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    this.downloadBtn.classList.remove('loading');
                    this.downloadBtn.innerHTML = '<i data-lucide="download-cloud"></i><span>Download High Quality PNG</span>';
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }, 1000);
                
            }, 'image/png', 1.0);
            
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
            this.downloadBtn.classList.remove('loading');
            this.downloadBtn.innerHTML = '<i data-lucide="download-cloud"></i><span>Download High Quality PNG</span>';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    
    initFAQ() {
        document.querySelectorAll('.faq-item__question').forEach(question => {
            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                const answer = question.nextElementSibling;
                
                document.querySelectorAll('.faq-item__question').forEach(q => {
                    if (q !== question) {
                        q.setAttribute('aria-expanded', 'false');
                        q.nextElementSibling.classList.remove('active');
                    }
                });
                
                question.setAttribute('aria-expanded', !isExpanded);
                answer.classList.toggle('active', !isExpanded);
            });
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Eyedropper functionality
    async useEyedropper() {
        if (!('EyeDropper' in window)) {
            alert('Eyedropper is not supported in this browser. Try using Chrome, Edge, or another Chromium-based browser.');
            return;
        }
        
        try {
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            
            if (result && result.sRGBHex) {
                this.currentColor = result.sRGBHex;
                this.colorPicker.value = result.sRGBHex;
                this.addToRecentColors(result.sRGBHex);
                this.renderPreview();
                console.log('Color picked:', result.sRGBHex);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Eyedropper error:', error);
                alert('Failed to use eyedropper. Please try again.');
            }
        }
    }
    
    // Recent colors management
    loadRecentColors() {
        try {
            const stored = localStorage.getItem('chromakopia-recent-colors');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load recent colors:', error);
            return [];
        }
    }
    
    saveRecentColors() {
        try {
            localStorage.setItem('chromakopia-recent-colors', JSON.stringify(this.recentColors));
        } catch (error) {
            console.error('Failed to save recent colors:', error);
        }
    }
    
    addToRecentColors(color) {
        if (!color || color === this.recentColors[0]) return;
        
        // Remove if already exists
        const index = this.recentColors.indexOf(color);
        if (index > -1) {
            this.recentColors.splice(index, 1);
        }
        
        // Add to beginning
        this.recentColors.unshift(color);
        
        // Keep only last 8 colors
        if (this.recentColors.length > 8) {
            this.recentColors = this.recentColors.slice(0, 8);
        }
        
        this.saveRecentColors();
        this.updateRecentColorsDisplay();
    }
    
    updateRecentColorsDisplay() {
        if (!this.recentColorsList) return;
        
        this.recentColorsList.innerHTML = '';
        
        if (this.recentColors.length === 0) {
            this.recentColorsList.innerHTML = '<span style="color: var(--color-text-secondary); font-size: var(--font-size-xs);">No recent colors</span>';
            return;
        }
        
        this.recentColors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'recent-color';
            colorBtn.style.backgroundColor = color;
            colorBtn.title = color;
            colorBtn.addEventListener('click', () => {
                this.currentColor = color;
                this.colorPicker.value = color;
                this.renderPreview();
            });
            this.recentColorsList.appendChild(colorBtn);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new ChromakopiaFontGenerator();
        console.log('Chromakopia Font Generator FULLY FIXED VERSION loaded successfully');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
    
    // Global error handling
    window.addEventListener('error', (e) => {
        console.error('Application error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault();
    });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChromakopiaFontGenerator };
}