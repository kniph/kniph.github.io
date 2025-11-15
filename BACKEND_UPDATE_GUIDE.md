# Backend Code Update for Model Selector

Update your Railway backend to handle the `model` parameter sent from the frontend.

## Node.js/Express Example:

```javascript
// Your existing endpoint: /grade-fine-tuned
app.post('/grade-fine-tuned', async (req, res) => {
    try {
        const { essay, model } = req.body;  // ← Add model parameter

        // Map frontend model values to OpenAI model names
        const modelMap = {
            'fine-tuned': process.env.FINE_TUNED_MODEL_ID,  // Your fine-tuned model ID
            'gpt-4o': 'gpt-4o',
            'gpt-4o-mini': 'gpt-4o-mini'
        };

        const selectedModel = modelMap[model] || modelMap['fine-tuned'];
        console.log('Using model:', selectedModel);

        // Call OpenAI API with selected model
        const response = await openai.chat.completions.create({
            model: selectedModel,

            // IMPORTANT: Add JSON mode for gpt-4o and gpt-4o-mini
            ...(model !== 'fine-tuned' && {
                response_format: { type: "json_object" }
            }),

            messages: [
                {
                    role: "system",
                    content: `You are an English essay grader for GEPT Elementary level.
                    ${model !== 'fine-tuned' ? 'ALWAYS respond with valid JSON matching this schema:' : ''}
                    {
                        "error_statistics": {"critical": 0, "medium": 0, "minor": 0},
                        "sentence_error_analysis": [...],
                        "revised_versions": {
                            "basic_correction": "...",
                            "advanced_model_answer": "..."
                        },
                        "gept_rating": {"score": 0, "comment": "..."},
                        "improvement_suggestions": {...},
                        "main_error_types_statistics": {...}
                    }`
                },
                {
                    role: "user",
                    content: essay
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const result = response.choices[0].message.content;

        res.json({
            success: true,
            result: result,
            model_used: selectedModel  // Return which model was used
        });

    } catch (error) {
        console.error('Grading error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

## Key Points:

1. **Extract model parameter**: Get `model` from `req.body`

2. **Model mapping**: Map frontend values to OpenAI model IDs
   - `fine-tuned` → Your fine-tuned model ID (e.g., `ft:gpt-4o-2024-08-06:...`)
   - `gpt-4o` → `gpt-4o`
   - `gpt-4o-mini` → `gpt-4o-mini`

3. **JSON Mode**: For non-fine-tuned models, use `response_format: { type: "json_object" }`
   - This GUARANTEES valid JSON output
   - Fine-tuned models don't support JSON mode (yet)

4. **System Prompt**:
   - For fine-tuned: use your existing prompt
   - For gpt-4o/mini: explicitly request JSON format in system message

## Environment Variables:

Add to your Railway environment variables:
```
FINE_TUNED_MODEL_ID=ft:gpt-4o-2024-08-06:your-org:your-model:abcd1234
OPENAI_API_KEY=sk-...
```

## Testing:

1. Deploy updated backend to Railway
2. Test each model from the frontend dropdown
3. Check console logs to verify correct model is being used
4. Compare quality and response times

## Cost Comparison (per 1M tokens):

| Model | Input | Output | vs Fine-tuned |
|-------|-------|--------|---------------|
| Fine-tuned GPT-4o | $3.75 | $15.00 | Baseline |
| GPT-4o | $2.50 | $10.00 | **-33%** |
| GPT-4o-mini | $0.15 | $0.60 | **-94%** |

## Expected Behavior:

- Fine-tuned model: Best quality for GEPT, but most expensive
- GPT-4o: Very high quality, 33% cheaper, JSON mode ensures reliability
- GPT-4o-mini: Good quality, 94% cheaper, fastest responses

The robust JSON parser in the frontend will handle any edge cases! 🚀
