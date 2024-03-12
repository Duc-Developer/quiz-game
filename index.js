const sanitizeHtml = require('sanitize-html');
const fetch = require('node-fetch');

const endpoint = process.env.QUESTION_ENDPOINT;
const authorId = process.env.AUTHOR_ID;
const spaceId = process.env.GOOGLE_SPACE_ID;
const apiKey = process.env.GOOGLE_API_KEY;
const token = process.env.GOOGLE_TOKEN;
const quotePrefId = process.env.QUOTE_PREF_ID;
const botAvatar = 'https://lh3.googleusercontent.com/proxy/f-tTJOGAyxQXLNPnwqiYV7HD5YxgCvuzlM9j3jIQVT4G23SDdeq7OHeSCEIRiis_PwsXPa_JNYyN9e0B8sNASMWUtsN3AoapVxBw2W72WIOlrPffuYmRpk1iSiowHelj4F8MJGr5ksd-w4VTnCLxTlDS';
const quoteEndpoint = `https://external-api.netlify.app/api/widgets/quote/fetch-image?quotePrefsId=${quotePrefId}&fetchNew=true`;
const myGithub = 'https://github.com/Duc-Developer/quiz-game';

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
const answerCountDown = 5 * 60 * 60 * 1000;

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
    return { value: values[randomIndex], level: randomIndex + 1 };
}

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + "h" + minutes + "p";
}

async function generateQuestion() {
    try {
        const { value: category } = getRandomValue(categories);
        const { value: difficult, level: difficultLevel } = getRandomValue(difficulty);
        const stars = generateStar(difficultLevel);
        const url = `${endpoint}?amount=1&category=${category}&difficulty=${difficult}&type=multiple`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        if (data.response_code !== 0) throw new Error('API fail!');

        const categoryTitle = sanitizeHtml(data.results[0].category);
        const question = sanitizeHtml(data.results[0].question);
        const answer = sanitizeHtml(data.results[0].correct_answer);
        const countDown = msToTime(answerCountDown);

        //<users/${authorId}> use it if u wanna mention on chat
        const questionObj = {
            category: categoryTitle,
            question,
            countDown,
            difficulty: stars
        };
        sendMessageToGoogleChat(questionObj, 'question', '', answer);
    } catch (error) {
        process.exit(1);
    }
}

function generateUniqueId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // Combine date and time components to create a unique ID
    const uniqueId = `${year}${month}${day}_${hours}${minutes}${seconds}${milliseconds}`;

    return uniqueId;
}

async function randomQuote() {
    return fetch(quoteEndpoint)
        .then(function (response) {
            return response.json();
        })
}

async function sendMessageToGoogleChat(messages, type, threadId, answer) {
    try {
        let webhookUrl = `https://chat.googleapis.com/v1/spaces/${spaceId}/messages?key=${apiKey}&token=${token}`;
        const requestBody = {};

        if (type === 'question') {
            const { category, question, countDown, difficulty } = messages;
            const quote = await randomQuote();
            const cardContent = {
                "header": {
                    "title": "AUTO_BOT",
                    "subtitle": "v1.0.1",
                    "imageUrl": botAvatar,
                    "imageType": "CIRCLE"
                },
                "sections": [
                    {
                        "header": "Good morning Everyone!",
                        "collapsible": true,
                        "uncollapsibleWidgetsCount": 3,
                        "widgets": [
                            {
                                "textParagraph": {
                                    "text": question
                                }
                            },
                            {
                                "divider": {}
                            },
                            {
                                "image": {
                                    "imageUrl": sanitizeHtml(quote.imageSrc),
                                    "altText": "Nature"
                                }
                            },
                            {
                                "decoratedText": {
                                    "icon": {
                                        "knownIcon": "BOOKMARK"
                                    },
                                    "topLabel": `Category: ${category}`,
                                    "text": `Difficulty: ${difficulty}`,
                                    "bottomLabel": `The answer will be returned after ${countDown}`
                                }
                            },
                            {
                                "decoratedText": {
                                    "startIcon": {
                                        "knownIcon": "STAR"
                                    },
                                    "text": `<a color=\"#f0a858\" href=\"${myGithub}\" target=\"_blank\">Contribute with me</a>`,
                                }
                            },
                            {
                                "decoratedText": {
                                    "startIcon": {
                                        "knownIcon": "PERSON"
                                    },
                                    "text": `<font color=\"#f0a858\">ductt2@vmogroup.com</font>`,
                                }
                            }
                        ]
                    }
                ]
            }
            requestBody.cardsV2 = [{
                cardId: generateUniqueId(),
                card: {
                    name: 'Avatar Card',
                    ...cardContent
                }
            }];
            requestBody.text = '';
        } else {
            requestBody.text = messages;
        }

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
            // setTimeout(() => {
            //     sendMessageToGoogleChat(`Answer of this question is:\n${answer}`, 'answer', threadKey);
            // }, answerCountDown);
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