# Funny Question & Quote Game

Money, materials, and motivation are things that limit your creative ability to learn.

That's why I created this project. By using the unlimited power that github action offers I can create an auto-bot that automatically generates questions every day and sends them to our group chat.

You can also create an auto-bot for yourself like me, such as: weather forecast bot, information update bot,... Don't limit your creativity!

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Random a question & a quote on 9AM (timezone +7)
- Return a answer after 5hours (github action limits the duration of a flow to 6 hours. But don't worry, we'll be looking to expand this limit in the future)
- Question & answer will be send to my chat room which i configured.

## Installation

Describe how to install your project. Include any prerequisites and step-by-step instructions.

```bash
npm install

# create .env file from command (linux | macos). U can create manual file if u do not like command
touch .env
echo AUTHOR_ID=<YOUR_AUTHOR_ID> >> .env
echo GOOGLE_SPACE_ID=<YOUR_GOOGLE_SPACE_ID> >> .env
echo GOOGLE_API_KEY=<YOUR_GOOGLE_API_KEY> >> .env
echo GOOGLE_TOKEN=<YOUR_GOOGLE_TOKEN> >> .env
echo QUESTION_ENDPOINT=<YOUR_QUESTION_ENDPOINT> >> .env
echo QUOTE_PREF_ID=<YOUR_QUOTE_PREF_ID> >> .env
cat .env

# starting to dev
npm run start

# send message to group chat
npm run schedule
