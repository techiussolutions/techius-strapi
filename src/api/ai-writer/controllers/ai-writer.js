'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are an expert content writer for Techius Solutions, a premium digital agency based in London.
Write concise, professional, and compelling copy in British English.
Avoid clichés. Be specific and results-focused.
Return ONLY the requested content — no preamble, no labels, no quotes.`;

const FIELD_PROMPTS = {
  'blog-post': {
    title: (ctx) => `Write a compelling blog post title about: ${ctx}. Under 70 characters.`,
    excerpt: (ctx) => `Write a 1–2 sentence blog post excerpt for an article titled: "${ctx}". Around 150 characters.`,
    body: (ctx) => `Write a full blog post article about: "${ctx}". Use markdown. 400–600 words. Include an intro, 3 key points with subheadings, and a conclusion.`,
    tag: (ctx) => `Suggest a single short category tag (2–3 words max) for a blog post about: ${ctx}`,
  },
  'case-study': {
    title: (ctx) => `Write a concise project/client name for a case study about: ${ctx}`,
    subtitle: (ctx) => `Write a one-sentence subtitle for a case study about: ${ctx}. Under 100 characters.`,
    description: (ctx) => `Write a 2-sentence project description for a case study about: ${ctx}`,
    lead: (ctx) => `Write a compelling 2–3 sentence lead paragraph for a case study about: ${ctx}`,
    challenge: (ctx) => `Write the "Challenge" section for a case study about: ${ctx}. Include a heading and 2 paragraphs describing the client's problem. Format: HEADING\n\nParagraph 1\n\nParagraph 2`,
    solution: (ctx) => `Write the "Solution" section for a case study about: ${ctx}. Include a heading and 2 paragraphs describing what was built. Format: HEADING\n\nParagraph 1\n\nParagraph 2`,
    body3: (ctx) => `Write the "Impact/Results" section for a case study about: ${ctx}. Include a heading and 2 paragraphs. Format: HEADING\n\nParagraph 1\n\nParagraph 2`,
  },
  'testimonial': {
    quote: (ctx) => `Write a realistic, specific client testimonial quote about a digital agency project involving: ${ctx}. 2–3 sentences, first person.`,
    authorName: (ctx) => `Suggest a realistic full name for a client from: ${ctx}`,
    authorRole: (ctx) => `Suggest a realistic job title for a client at: ${ctx}`,
  },
  'faq-item': {
    question: (ctx) => `Write a natural FAQ question a potential client would ask about: ${ctx}`,
    answer: (ctx) => `Write a concise, helpful answer (3–5 sentences) to the FAQ question: "${ctx}"`,
  },
};

module.exports = {
  async generate(ctx) {
    const { contentType, field, context, prompt } = ctx.request.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return ctx.badRequest('ANTHROPIC_API_KEY not set on the server.');
    }

    const userPrompt = prompt || (FIELD_PROMPTS[contentType]?.[field]?.(context || '') ?? `Write content for the "${field}" field of a ${contentType}. Context: ${context}`);

    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });

      ctx.body = { content: message.content[0].text };
    } catch (err) {
      strapi.log.error('AI Writer error:', err.message);
      ctx.internalServerError('Failed to generate content.');
    }
  },
};
