// Categories from the provided JSON data
var categories = [
    "Entertainment: Japanese Anime & Manga",
    "Entertainment: Video Games",
    "Entertainment: Music",
    "General Knowledge",
    "Science: Mathematics",
    "Science & Nature",
    "Politics",
    "History",
    "Science: Computers",
    "Entertainment: Television",
    "Entertainment: Film",
    "Entertainment: Board Games",
    "Sports"
];

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and populate categories on page load
    fetchCategories();
});

function fetchCategories() {
    var categorySelect = document.getElementById('category');

    // Fetch the categories from the trivia API
    fetch('https://opentdb.com/api_category.php')
        .then(response => response.json())
        .then(data => {
            // Populate the category dropdown
            data.trivia_categories.forEach(category => {
                var option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
}


function startTrivia() {
    // Retrieve user selections
    var numberOfQuestions = document.getElementById('numberOfQuestions').value;

    // Validate if the input is a valid number
    if (isNaN(numberOfQuestions) || numberOfQuestions < 1) {
        alert('Please enter a valid number of questions.');
        return;
    }

    var category = document.getElementById('category').value;
    var difficulty = document.getElementById('difficulty').value;
    var type = document.getElementById('type').value;

    // Construct the API URL based on user selections
    var apiUrl = `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${category}&difficulty=${difficulty}&type=${type}`;

    // Fetch the trivia questions
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Process the retrieved trivia questions
            displayQuestions(data.results);
        })
        .catch(error => {
            console.error('Error fetching trivia questions:', error);
        });

    // Start the timer for all questions
    startTimer(numberOfQuestions);

    // Delay execution by 2 seconds and then set the top position of the footer to 0
    setTimeout(function () {
        var footer = document.querySelector('footer');
        footer.style.top = '0';
    }, 500);
}

function displayQuestions(questions) {
    var triviaContainer = document.getElementById('triviaContainer');
    var questionsContainer = document.getElementById('questions');

    triviaContainer.style.display = 'block'; // Show the trivia container
    questionsContainer.innerHTML = ''; // Clear previous questions

    questions.forEach((question, index) => {
        var questionElement = document.createElement('div');
        questionElement.innerHTML = `<p>${index + 1}. ${question.question}</p>`;

        var optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        if (question.type === 'multiple') {
            // Shuffle the answer choices
            var shuffledOptions = shuffleArray(question.incorrect_answers.concat(question.correct_answer));

            // Display shuffled options for multiple-choice questions
            shuffledOptions.forEach((option, i) => {
                var isCorrect = (option === question.correct_answer);
                var optionElement = createOption(option, index, isCorrect);
                optionsContainer.appendChild(optionElement);
            });
        } else if (question.type === 'boolean') {
            // Display options for true/false questions
            ['True', 'False'].forEach(option => {
                var isCorrect = (option === question.correct_answer);
                var booleanOption = createOption(option, index, isCorrect);
                optionsContainer.appendChild(booleanOption);
            });
        }

        questionElement.appendChild(optionsContainer);
        questionsContainer.appendChild(questionElement);
    });
}

function createOption(text, questionIndex, isCorrect = false) {
    var option = document.createElement('div');
    option.className = 'option';
    if (isCorrect) {
        // Add 'correct' class only if the option is correct
        option.classList.add('correct');
    }
    option.textContent = text;
    option.onclick = function () {
        handleOptionClick(this, questionIndex, isCorrect);
    };
    return option;
}

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createOption(text, questionIndex, isCorrect = false) {
    var option = document.createElement('div');
    option.className = 'option';
    if (isCorrect) {
        option.classList.add('correct');
    }
    option.textContent = text;
    option.onclick = function () {
        handleOptionClick(this, questionIndex, isCorrect);
    };
    return option;
}

function handleOptionClick(option, questionIndex, isCorrect) {
    // Toggle the 'clicked' class on the clicked option
    option.classList.toggle('clicked');

    // Ensure that the clicked option is the only one with the 'clicked' class in its group
    var options = option.parentNode.getElementsByClassName('option');
    for (var i = 0; i < options.length; i++) {
        if (options[i] !== option) {
            options[i].classList.remove('clicked');
        }
    }
}

function submitAnswers() {
    var questions = document.getElementById('questions').querySelectorAll('.option');
    var numberOfQuestions = document.getElementById('numberOfQuestions').value;
    var answeredQuestions = document.getElementById('questions').querySelectorAll('.option.clicked');

    if (answeredQuestions.length < numberOfQuestions) {
        // If not all questions are answered, show an alert
        alert('Please answer all questions before submitting.');
        return;
    }

    var score = 0;

    // Disable further clicking on options
    questions.forEach((question) => {
        question.onclick = null;
    });

    answeredQuestions.forEach((question, index) => {
        // Check if the clicked option is correct and update styles
        if (question.classList.contains('correct')) {
            // If correct, add 'correct' class and increment the score
            question.classList.add('correctShow');
            score++;
        } else {
            // If incorrect, add 'incorrect' class
            question.classList.add('incorrect');
        }
    });

    questions.forEach((question, index) => {
        if (question.classList.contains('correct')) {
            question.classList.add('correctShow');
        }
    })

    // Display the score to the user
    alert('Your Score: ' + score + ' out of ' + numberOfQuestions);

    stopTimer(); // Stop the timer when answers are submitted
}

function resetTrivia() {
    // Reload the page
    location.reload();
}

function startTimer(numberOfQuestions) {
    totalSeconds = numberOfQuestions * 8;

    timer = setInterval(function () {
        document.getElementById('countdown').textContent = totalSeconds;

        if (totalSeconds === 0) {
            clearInterval(timer);
            // Call a function or perform actions when the timer reaches 0
            alert('Time is up! You ran out of time. Your score: ' + calculateScore() + '/' + numberOfQuestions);
            // Optionally, move to the next question or perform other actions
        } else {
            totalSeconds--;
        }
    }, 1000);
}

// Add a function to calculate the score based on answered questions
function calculateScore() {
    var questions = document.getElementById('questions').querySelectorAll('.option');
    var answeredQuestions = document.getElementById('questions').querySelectorAll('.option.clicked');
    var score = 0;

    questions.forEach((question) => {
        question.onclick = null;
    });

    answeredQuestions.forEach((question) => {
        if (question.classList.contains('correct')) {
            question.classList.add('correctShow');
            score++;
        } else {
            question.classList.add('incorrect');
        }
    });

    questions.forEach((question, index) => {
        if (question.classList.contains('correct')) {
            question.classList.add('correctShowEndTime');
        }
    })

    return score;
}

function stopTimer() {
    clearInterval(timer);
}