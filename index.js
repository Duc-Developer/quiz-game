const sanitizeHtml = require('sanitize-html');
const fetch = require('node-fetch');

const endpoint = process.env.QUESTION_ENDPOINT;
const authorId = process.env.AUTHOR_ID;
const spaceId = process.env.GOOGLE_SPACE_ID;
const apiKey = process.env.GOOGLE_API_KEY;
const token = process.env.GOOGLE_TOKEN;

const categories = {
    // 'Any': 'any',
    // 'Knowledge': '9',
    // 'Books': '10',
    // 'Film': '11',
    // 'Music': '12',
    // 'Musicals & Theatres': '13',
    // 'Television': '14',
    // 'Video Games': '15',
    // 'Board Games': '16',
    // 'Nature': '17',
    'Computers': '18',
    'Mathematics': '19',
    Mythology: '20',
    // Sports: '21',
    Geography: '22',
    // History: '23',
    // Politics: '24',
    // Art: '25',
    // Celebrities: '26',
    Animals: '27',
    Vehicles: '28',
    // 'Entertainment: Comics': '29',
    'Science: Gadgets': '30',
    // 'Entertainment: Japanese Anime & Manga': '31',
    // 'Entertainment: Cartoon & Animations': '32'
};
const answerCountDown = 5*60*60*1000;

const difficulty = {
    'Easy': 'easy',
    'Medium': 'medium',
    'Hard': 'hard'
}

function generateStar(count) {
    return '★'.repeat(count);
  }

function getRandomValue(obj) {
    const values = Object.values(obj);
    const randomIndex = Math.floor(Math.random() * values.length);
    return {value: values[randomIndex], level: randomIndex + 1};
}

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + "h" + minutes + "p" + seconds + "s";
}

async function generateQuestion() {
    try {
        const {value:category} = getRandomValue(categories);
        const {value:difficult ,level: difficultLevel} = getRandomValue(difficulty);
        const stars = generateStar(difficultLevel);
        const url = `${endpoint}?amount=1&category=${category}&difficulty=${difficult}&type=multiple`;
        const response = await fetch(url,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        if (data.response_code !== 0) throw new Error('API fail!');

        const title = sanitizeHtml(data.results[0].category);
        const question = sanitizeHtml(data.results[0].question);
        const answer = sanitizeHtml(data.results[0].correct_answer);
        const countDown = msToTime(answerCountDown);

        const quizContent = `Good morning everyone!\nI am a GITHUB AI created by master <users/${authorId}>.\nEvery day I will create a random puzzle to help you start a productive day.\n------------------ Today's Question ---------------------\n+ Category: ${title}\n+ Difficulty: ${stars}\n${question}\n------------------- AUTO-BOT 1.0.1 ----------------------\nThe answer will be returned after ${countDown}`;
        sendMessageToGoogleChat(quizContent, 'question', '', answer);
    } catch (error) {
        process.exit(1);
    }
}

async function sendMessageToGoogleChat(message, type, threadId, answer) {
    try {
        let webhookUrl = `https://chat.googleapis.com/v1/spaces/${spaceId}/messages?key=${apiKey}&token=${token}`;
        const requestBody = {
            text: message,
        };
        if (threadId) {
            webhookUrl += `&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD`;
            requestBody.thread = {
                name: threadId,
                retentionSettings: { 'state': 'PERMANENT' }
            }
        }
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error();
        if (type === 'question') {
            const data = await response.json();
            const threadKey = data.thread.name;
            setTimeout(() => {
                sendMessageToGoogleChat(`Answer of this question is:\n${answer}`, 'answer', threadKey);
            }, answerCountDown);
        }
        if (type === 'question') {
            console.log('Question sent successfully to Google Chat');
        } else {
            console.log('Answer is reply successfully to Google Chat');
        }
    } catch (error) {
        console.log('Failed to send message to Google Chat')
        process.exit(1);
    }
}

generateQuestion();