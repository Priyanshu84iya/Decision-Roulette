// Page Loader functionality
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('page-loader');
    
    // Show loader immediately
    loader.style.display = 'flex';
    loader.style.opacity = '1';
    loader.style.visibility = 'visible';
    
    // Hide loader after page loads (minimum 3 seconds for effect)
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500); // Wait for fade animation to complete
        }, 3000);
    });
    
    // Fallback: Hide loader after 5 seconds regardless
    setTimeout(() => {
        if (loader && !loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 5000);
});

class DecisionRoulette {
    constructor() {
        this.options = [];
        this.canvas = document.getElementById('roulette');
        this.ctx = this.canvas.getContext('2d');
        this.spinning = false;
        this.currentAngle = 0;
        this.spinSound = null;
        this.winSound = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupDarkMode();
        this.loadAudio();
        this.drawEmptyWheel();
    }

    initializeElements() {
        this.optionInput = document.getElementById('option-input');
        this.addBtn = document.getElementById('add-btn');
        this.autoSuggestBtn = document.getElementById('auto-suggest-btn');
        this.optionsList = document.getElementById('options-list');
        this.spinBtn = document.getElementById('spin-btn');
        this.resultBox = document.getElementById('result-box');
        this.winnerText = document.getElementById('winner-text');
        this.tryAgainBtn = document.getElementById('try-again-btn');
        this.shareResultBtn = document.getElementById('share-result-btn');
        this.resetBtn = document.querySelector('.comic-button');
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
    }

    setupEventListeners() {
        // Add option functionality
        this.addBtn.addEventListener('click', () => this.addOption());
        this.optionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addOption();
        });

        // Auto-suggest functionality
        this.autoSuggestBtn.addEventListener('click', () => this.addRandomSuggestions());

        // Spin functionality
        this.spinBtn.addEventListener('click', () => this.spin());

        // Result actions
        this.tryAgainBtn.addEventListener('click', () => this.hideResult());
        this.shareResultBtn.addEventListener('click', () => this.shareResult());

        // Reset functionality
        this.resetBtn.addEventListener('click', () => this.reset());

        // Stop sounds when page is about to unload
        window.addEventListener('beforeunload', () => this.stopAllSounds());
        
        // Stop sounds when page loses focus (user switches tabs)
        window.addEventListener('blur', () => {
            if (this.spinning) {
                // Don't stop if currently spinning, but reduce volume
                if (this.spinSound) this.spinSound.volume = 0.2;
            }
        });
        
        // Restore volume when page gains focus
        window.addEventListener('focus', () => {
            if (this.spinSound) this.spinSound.volume = 0.5;
        });
    }

    setupDarkMode() {
        // Check for saved dark mode preference
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            this.darkModeToggle.checked = true;
        }

        this.darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            this.drawWheel(); // Redraw wheel for theme change
        });
    }

    loadAudio() {
        try {
            this.spinSound = new Audio('assets/spin.wav');
            this.winSound = new Audio('assets/win.wav');
            
            // Set volume and loop for spin sound
            if (this.spinSound) {
                this.spinSound.volume = 0.5;
                this.spinSound.loop = true; // Loop the spin sound
            }
            if (this.winSound) this.winSound.volume = 0.7;
        } catch (error) {
            console.log('Audio files not found - continuing without sound');
        }
    }

    addOption() {
        const optionText = this.optionInput.value.trim();
        if (optionText && !this.options.includes(optionText)) {
            this.options.push(optionText);
            this.optionInput.value = '';
            this.updateOptionsList();
            this.drawWheel();
        }
    }

    addRandomSuggestions() {
        const suggestions = [
            // Food & Drinks
            'Pizza', 'Sushi', 'Burger', 'Tacos', 'Pasta', 'Ice Cream',
            'Chinese Food', 'Thai Food', 'Indian Food', 'Mexican Food', 'Italian Food',
            'Chicken Wings', 'BBQ', 'Seafood', 'Steak', 'Salad', 'Sandwich',
            'Ramen', 'Pho', 'Dim Sum', 'Falafel', 'Kebab', 'Curry',
            'Chocolate', 'Cake', 'Cookies', 'Donuts', 'Pancakes', 'Waffles',
            'Coffee', 'Tea', 'Smoothie', 'Water', 'Juice', 'Soda',
            'Wine', 'Beer', 'Cocktail', 'Hot Chocolate', 'Milkshake', 'Boba Tea',
            
            // Activities & Entertainment
            'Movie Night', 'Go for a Walk', 'Read a Book', 'Play Games',
            'Call a Friend', 'Learn Something New', 'Exercise', 'Cook',
            'Listen to Music', 'Watch TV Series', 'Go Shopping', 'Take Photos',
            'Draw or Paint', 'Write in Journal', 'Meditate', 'Yoga',
            'Dance', 'Sing Karaoke', 'Play Sports', 'Go Swimming',
            'Board Games', 'Video Games', 'Puzzle', 'Crafting',
            'Gardening', 'Clean House', 'Organize Room', 'Decorate',
            'Go to Museum', 'Visit Park', 'Attend Concert', 'Watch Theater',
            'Go Bowling', 'Mini Golf', 'Arcade Games', 'Escape Room',
            'Hiking', 'Camping', 'Fishing', 'Biking', 'Picnic',
            
            // Colors
            'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange',
            'Pink', 'Black', 'White', 'Gray', 'Brown', 'Turquoise',
            'Magenta', 'Cyan', 'Lime', 'Navy', 'Maroon', 'Gold',
            'Silver', 'Coral', 'Lavender', 'Mint', 'Peach', 'Teal',
            
            // Places to Visit
            'Beach', 'Mountains', 'City', 'Forest', 'Desert', 'Lake',
            'Library', 'Cafe', 'Restaurant', 'Mall', 'Park', 'Zoo',
            'Aquarium', 'Museum', 'Art Gallery', 'Bookstore', 'Cinema',
            'Gym', 'Spa', 'Temple', 'Church', 'Market', 'Festival',
            'Amusement Park', 'Water Park', 'Botanical Garden', 'Observatory',
            
            // Transportation
            'Walk', 'Bike', 'Car', 'Bus', 'Train', 'Subway',
            'Taxi', 'Uber', 'Scooter', 'Skateboard', 'Motorcycle',
            
            // Weather Activities
            'Stay Inside', 'Go Outside', 'Rainy Day Activity', 'Sunny Day Fun',
            'Winter Sports', 'Summer Activity', 'Spring Adventure', 'Fall Exploration',
            
            // Learning & Skills
            'Learn Language', 'Take Online Course', 'Watch Tutorial', 'Practice Instrument',
            'Learn Coding', 'Study Art', 'Research Topic', 'Practice Writing',
            'Learn Photography', 'Study History', 'Explore Science', 'Math Practice',
            
            // Social Activities
            'Meet Friends', 'Video Call Family', 'Join Club', 'Attend Event',
            'Volunteer', 'Help Neighbor', 'Make New Friends', 'Network',
            'Team Building', 'Group Study', 'Potluck Dinner', 'Game Night',
            
            // Self Care & Wellness
            'Take Bath', 'Face Mask', 'Massage', 'Stretch', 'Deep Breathing',
            'Early Sleep', 'Drink Water', 'Healthy Snack', 'Walk in Nature',
            'Digital Detox', 'Gratitude Journal', 'Affirmations', 'Mindfulness',
            
            // Creative Activities
            'Photography', 'Writing', 'Drawing', 'Painting', 'Sculpting',
            'Poetry', 'Music Composition', 'Dancing', 'Acting', 'Singing',
            'Origami', 'Knitting', 'Sewing', 'Woodworking', 'Pottery',
            
            // Technology & Digital
            'Browse Internet', 'Social Media', 'Online Shopping', 'Gaming',
            'Streaming', 'Podcast', 'YouTube', 'Virtual Tour', 'App Development',
            
            // Seasons & Holidays
            'Christmas Activity', 'Halloween Fun', 'Easter Celebration', 'New Year Plan',
            'Summer Vacation', 'Winter Holiday', 'Spring Break', 'Thanksgiving Prep',
            
            // Random Fun Choices
            'Yes', 'No', 'Maybe', 'Later', 'Now', 'Tomorrow',
            'Left', 'Right', 'Up', 'Down', 'Forward', 'Backward',
            'Option A', 'Option B', 'Option C', 'Choice 1', 'Choice 2', 'Choice 3',
            'Rock', 'Paper', 'Scissors', 'Heads', 'Tails', 'Odd', 'Even'
        ];

        // Add 3-5 random suggestions that aren't already in the list
        const numSuggestions = Math.floor(Math.random() * 3) + 3;
        const availableSuggestions = suggestions.filter(s => !this.options.includes(s));
        
        for (let i = 0; i < numSuggestions && availableSuggestions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableSuggestions.length);
            const suggestion = availableSuggestions.splice(randomIndex, 1)[0];
            this.options.push(suggestion);
        }

        this.updateOptionsList();
        this.drawWheel();
    }

    updateOptionsList() {
        this.optionsList.innerHTML = '';
        this.options.forEach((option, index) => {
            const li = document.createElement('li');
            li.className = 'option-item';
            li.innerHTML = `
                <span>${option}</span>
                <button class="remove-option" onclick="roulette.removeOption(${index})">×</button>
            `;
            this.optionsList.appendChild(li);
        });
    }

    removeOption(index) {
        this.options.splice(index, 1);
        this.updateOptionsList();
        this.drawWheel();
    }

    drawEmptyWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw empty wheel
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw center text
        this.ctx.fillStyle = '#666';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Add options to spin!', centerX, centerY);
    }

    drawWheel() {
        if (this.options.length === 0) {
            this.drawEmptyWheel();
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;
        const anglePerSection = (2 * Math.PI) / this.options.length;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Color palette
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
            '#10AC84', '#EE5A24', '#0ABDE3', '#FFC312', '#C44569'
        ];

        // Draw wheel sections
        this.options.forEach((option, index) => {
            const startAngle = index * anglePerSection + this.currentAngle;
            const endAngle = (index + 1) * anglePerSection + this.currentAngle;

            // Draw section
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Draw text
            const textAngle = startAngle + anglePerSection / 2;
            const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
            const textY = centerY + Math.sin(textAngle) * (radius * 0.7);

            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(option, 0, 0);
            this.ctx.restore();
        });

        // Draw pointer
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + radius - 10, centerY);
        this.ctx.lineTo(centerX + radius + 20, centerY - 15);
        this.ctx.lineTo(centerX + radius + 20, centerY + 15);
        this.ctx.closePath();
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    spin() {
        if (this.spinning || this.options.length === 0) return;

        this.spinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.textContent = 'Spinning...';

        // Stop any currently playing sounds first
        if (this.spinSound) {
            this.spinSound.pause();
            this.spinSound.currentTime = 0;
        }
        if (this.winSound) {
            this.winSound.pause();
            this.winSound.currentTime = 0;
        }

        // Play spin sound (looped)
        if (this.spinSound) {
            this.spinSound.currentTime = 0;
            this.spinSound.play().catch(() => {});
        }

        // Random spin parameters
        const minSpins = 5;
        const maxSpins = 8;
        const spins = Math.random() * (maxSpins - minSpins) + minSpins;
        const finalAngle = spins * 2 * Math.PI;

        const startTime = Date.now();
        const duration = 3000; // 3 seconds

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentAngle = finalAngle * easeOut;
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.finishSpin();
            }
        };

        animate();
    }

    finishSpin() {
        this.spinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = 'Spin';

        // Stop spin sound immediately when spin finishes
        if (this.spinSound) {
            this.spinSound.pause();
            this.spinSound.currentTime = 0;
        }

        // Calculate winner
        const normalizedAngle = (2 * Math.PI - (this.currentAngle % (2 * Math.PI))) % (2 * Math.PI);
        const sectionAngle = (2 * Math.PI) / this.options.length;
        const winnerIndex = Math.floor(normalizedAngle / sectionAngle) % this.options.length;
        const winner = this.options[winnerIndex];

        // Show result
        this.showResult(winner);

        // Play win sound
        if (this.winSound) {
            setTimeout(() => {
                this.winSound.currentTime = 0;
                this.winSound.play().catch(() => {});
            }, 500);
        }

        // Add glow effect
        this.canvas.classList.add('winner-glow');
        setTimeout(() => {
            this.canvas.classList.remove('winner-glow');
        }, 2000);

        // Create confetti
        this.createConfetti();
    }

    showResult(winner) {
        this.winnerText.textContent = winner;
        this.resultBox.classList.remove('hidden');
    }

    hideResult() {
        this.resultBox.classList.add('hidden');
    }

    shareResult() {
        const winner = this.winnerText.textContent;
        const shareData = {
            title: 'My Decision',
            text: `I let the wheel choose and it said: ${winner}!`,
            url: window.location.href
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            // Use Web Share API if available
            navigator.share(shareData)
                .then(() => console.log('Shared successfully'))
                .catch((error) => {
                    console.log('Error sharing:', error);
                    this.fallbackCopyToClipboard(winner);
                });
        } else {
            // Fallback: copy to clipboard
            this.fallbackCopyToClipboard(winner);
        }
    }

    fallbackCopyToClipboard(winner) {
        const text = `I let the wheel choose and it said: ${winner}!`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.showCopyFeedback('Result copied to clipboard!');
                })
                .catch(() => {
                    this.legacyCopyToClipboard(text);
                });
        } else {
            this.legacyCopyToClipboard(text);
        }
    }

    legacyCopyToClipboard(text) {
        // Legacy fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyFeedback('Result copied to clipboard!');
        } catch (err) {
            this.showCopyFeedback(`Result: ${this.winnerText.textContent}`);
        }
        
        document.body.removeChild(textArea);
    }

    showCopyFeedback(message) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2aabee;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 8px 25px rgba(42, 171, 238, 0.3);
            animation: feedbackSlide 2s ease-in-out forwards;
        `;
        
        // Add keyframe animation
        if (!document.querySelector('#feedback-style')) {
            const style = document.createElement('style');
            style.id = 'feedback-style';
            style.textContent = `
                @keyframes feedbackSlide {
                    0% { opacity: 0; transform: translate(-50%, -50%) translateY(20px); }
                    20%, 80% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
                    100% { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.animationDelay = Math.random() * 1 + 's';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 4000);
            }, i * 100);
        }
    }

    reset() {
        // Stop all sounds
        this.stopAllSounds();
        
        this.options = [];
        this.currentAngle = 0;
        this.spinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = 'Spin';
        this.updateOptionsList();
        this.drawEmptyWheel();
        this.hideResult();
        this.optionInput.value = '';
    }

    stopAllSounds() {
        // Stop spin sound
        if (this.spinSound) {
            this.spinSound.pause();
            this.spinSound.currentTime = 0;
        }
        // Stop win sound
        if (this.winSound) {
            this.winSound.pause();
            this.winSound.currentTime = 0;
        }
    }
}

// Initialize the roulette when the page loads
let roulette;
document.addEventListener('DOMContentLoaded', () => {
    roulette = new DecisionRoulette();
});
