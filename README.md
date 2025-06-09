# essay_grader
front end: .html called essay_grader.html
back end: JavaScript called grade.js on Netlify with Environment Variables containing OpenAI API Key

To change ChatGPT models, please edit [essay-grader-backend/](https://github.com/kniph/essay-grader-backend/blob/main/netlify/functions/grade.js)
body: JSON.stringify({
        model: 'gpt-4o',

And also for other levels or details of AI assessment, edit the prompts for ChatGPT for optimized results.
