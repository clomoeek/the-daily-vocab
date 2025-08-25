document.addEventListener('DOMContentLoaded', () => {
    // HTML 요소들을 변수로 저장
    const wordCard = document.getElementById('word-card');
    const completionContainer = document.getElementById('completion-container');
    const restartBtn = document.getElementById('restart-btn');
    const wordPos = document.getElementById('word-pos');
    const wordMeaning1 = document.getElementById('word-meaning1');
    const wordMeaning2 = document.getElementById('word-meaning2');
    const wordMeaning3 = document.getElementById('word-meaning3');
    const exampleSentence = document.getElementById('example-sentence');
    const userInput = document.getElementById('user-input');
    const submitBtn = document.getElementById('submit-btn');
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const attemptsLeft = document.getElementById('attempts-left');
    const progressIndicator = document.getElementById('progress-indicator');

    const WORDS_PER_DAY = 50;
    let allWordsData = [];
    let vocabularyData = [];
    let totalWordsForSession = 0;
    let currentWordIndex = 0;
    let currentWord = null;
    let attempts = 3;

    async function loadData() {
        try {
            const response = await fetch('vocabulary.md');
            const text = await response.text();
            allWordsData = parseMarkdown(text);
            startStudy();
        } catch (error) {
            console.error('데이터 로딩 중 오류 발생:', error);
            feedback.textContent = "데이터를 불러오는 데 실패했습니다.";
        }
    }

    function startStudy() {
        // 단어 목록을 무작위로 섞은 후, 하루에 공부할 개수만큼 선택
        vocabularyData = [...allWordsData].sort(() => 0.5 - Math.random()).slice(0, WORDS_PER_DAY);
        totalWordsForSession = vocabularyData.length;
        currentWordIndex = 0;

        if (vocabularyData.length > 0) {
            wordCard.classList.remove('hidden');
            completionContainer.classList.add('hidden');
            setNewWord();
        } else {
            feedback.textContent = "단어 데이터가 없습니다.";
        }
    }

    // Markdown 파싱 함수는 그대로 유지
    function parseMarkdown(markdownText) {
        const lines = markdownText.split('\n');
        const data = [];
        let currentEntry = null;

        for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('## ')) {
                if (currentEntry) {
                    data.push(currentEntry);
                }
                currentEntry = {
                    word: line.substring(3).trim(),
                    meaning1: '',
                    meaning2: '',
                    meaning3: '',
                    example: '',
                    pos: ''
                };
            } else if (currentEntry) {
                if (line.startsWith('*')) {
                    currentEntry.pos = line.substring(1, line.length - 2);
                } else if (line.startsWith('1.')) {
                    currentEntry.meaning1 = line.substring(0).trim();
                } else if (line.startsWith('2.')) {
                    currentEntry.meaning2 = line.substring(0).trim();
                } else if (line.startsWith('3.')) {
                    currentEntry.meaning3 = line.substring(0).trim();
                } else if (line.startsWith('- example : ')) {
                    currentEntry.example = line.substring(12).trim();
                }
            }
        }
        if (currentEntry) {
            data.push(currentEntry);
        }
        return data;
    }

    // 새로운 문제 출제
    function setNewWord() {
        if (currentWordIndex >= totalWordsForSession) {
            wordCard.classList.add('hidden');
            completionContainer.classList.remove('hidden');
            return;
        }

        currentWord = vocabularyData[currentWordIndex];
        progressIndicator.textContent = `${currentWordIndex + 1} / ${totalWordsForSession}`;

        // 단어 대신 품사를 표시
        wordPos.textContent = currentWord.pos; 
        wordMeaning1.textContent = currentWord.meaning1;
        wordMeaning2.textContent = currentWord.meaning2;
        wordMeaning3.textContent = currentWord.meaning3;
        exampleSentence.textContent = currentWord.example;
        
        userInput.value = '';
        feedback.textContent = '';
        userInput.focus();
        submitBtn.style.display = 'block';
        nextBtn.style.display = 'none';
        attempts = 3;
        attemptsLeft.textContent = attempts;
    }

    function handleNextWord() {
        currentWordIndex++;
        setNewWord();
    }

    // 정답 확인 및 이벤트 리스너는 이전과 동일
    function checkAnswer() {
        const userAnswer = userInput.value.trim().toLowerCase();
        const correctAnswer = currentWord.word.toLowerCase();

        if (userAnswer === correctAnswer) {
            feedback.textContent = 'You got it!';
            feedback.className = 'correct';
            submitBtn.style.display = 'none';
            nextBtn.style.display = 'block';
        } else {
            attempts--;
            attemptsLeft.textContent = attempts;
            if (attempts > 0) {
                feedback.textContent = `That's wrong. Try again.`;
                feedback.className = 'incorrect';
            } else {
                feedback.textContent = `The answer was '${currentWord.word}'.`;
                feedback.className = 'incorrect';
                submitBtn.style.display = 'none';
                nextBtn.style.display = 'block';
            }
        }
    }

    submitBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', handleNextWord);
    restartBtn.addEventListener('click', startStudy);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (submitBtn.style.display !== 'none') {
                checkAnswer();
            } else if (nextBtn.style.display !== 'none') {
                handleNextWord();
            }
        }
    });

    loadData();
});
