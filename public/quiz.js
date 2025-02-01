class QuizApp {
  constructor() {
    this.startButton = document.getElementById('start-btn');
    this.quizContainer = document.getElementById('question-container');
    this.resultContainer = document.getElementById('result');
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.questions = [];
    this.hasAnswered = false;

    this.initialize();
  }

  initialize() {
    this.startButton.addEventListener('click', () => this.startQuiz());
  }

  async startQuiz() {
    this.showLoading(true);
    try {
      await this.fetchQuestions();
      if (this.questions.length > 0) {
        this.startButton.style.display = 'none';
        this.quizContainer.classList.remove('hidden');
        this.showQuestion();
      } else {
        throw new Error('No questions available');
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoading(false);
    }
  }

  async fetchQuestions() {
    try {
      const response = await fetch('/api/quiz');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      this.questions = data.questions || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  showQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.showResult();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    this.quizContainer.innerHTML = `
      <div class="question">
        <h2>Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</h2>
        <p>${question.description}</p>
        <div class="options">
          ${question.options.map((option, index) => `
            <button class="option-btn" data-index="${index}" data-correct="${option.is_correct}">
              ${option.description}
            </button>
          `).join('')}
        </div>
        <p class="score">Score: ${this.score}</p>
      </div>
    `;

    // Add event listeners to options
    const options = this.quizContainer.querySelectorAll('.option-btn');
    options.forEach(button => {
      button.addEventListener('click', (e) => this.handleAnswer(e));
    });
  }

  handleAnswer(event) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const button = event.target;
    const isCorrect = button.dataset.correct === 'true';
    const options = this.quizContainer.querySelectorAll('.option-btn');

    // Disable all buttons
    options.forEach(opt => opt.disabled = true);

    // Update score
    if (isCorrect) {
      this.score += 4;
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
    } else {
      this.score = Math.max(0, this.score - 1);
      button.style.backgroundColor = '#ff4444';
      button.style.color = 'white';

      // Show correct answer
      options.forEach(opt => {
        if (opt.dataset.correct === 'true') {
          opt.style.backgroundColor = '#4CAF50';
          opt.style.color = 'white';
        }
      });
    }

    // Move to next question after delay
    setTimeout(() => {
      this.hasAnswered = false;
      this.currentQuestionIndex++;
      this.showQuestion();
    }, 1500);
  }

  showResult() {
    this.quizContainer.innerHTML = '';
    this.resultContainer.classList.remove('hidden');
    this.resultContainer.innerHTML = `
        <div class="result">
            <h2>Quiz Complete!</h2>
            <p>Your final score: ${this.score}</p>
            <button class="btn-primary" onclick="location.reload()">Try Again</button>
        </div>
        <div class="confetti-container"></div>
    `;

    this.startConfetti();
  }

  startConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDuration = `${Math.random() * 5 + 5}s`; // Increased duration (5-10s)
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

      confettiContainer.appendChild(confetti);

      setTimeout(() => confetti.remove(), 10000); // Confetti lasts longer before removal
    }
  }



  showLoading(show) {
    if (show) {
      this.startButton.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          Loading...
        </div>
      `;
      this.startButton.disabled = true;
    } else {
      this.startButton.textContent = 'Start Quiz';
      this.startButton.disabled = false;
    }
  }

  handleError(error) {
    this.startButton.innerHTML = 'Error loading quiz. Try again.';
    this.startButton.disabled = false;
    console.error(error);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuizApp();
});