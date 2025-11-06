import { z } from 'zod';
import { createToolCallAccuracyScorerCode } from '@mastra/evals/scorers/code';
import { createCompletenessScorer } from '@mastra/evals/scorers/code';
import { createScorer } from '@mastra/core/scores';

export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: 'nbaTool',
  strictMode: false,
});

export const completenessScorer = createCompletenessScorer();

// Custom LLM-judged scorer: evaluates if NBA data is provided in a useful format
export const dataQualityScorer = createScorer({
  name: 'NBA Data Quality',
  description:
    'Checks that NBA data is presented in a clear, informative manner with relevant context',
  type: 'agent',
  judge: {
    model: 'google/gemini-2.5-pro',
    instructions:
      'You are an expert evaluator of sports data presentation quality. ' +
      'Determine whether the assistant provides NBA data in a clear, structured format with relevant context. ' +
      'Check that the assistant explains key stats and provides appropriate insights. ' +
      'Return only the structured JSON matching the provided schema.',
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || '';
    const assistantText = (run.output?.[0]?.content as string) || '';
    return { userText, assistantText };
  })
  .analyze({
    description:
      'Evaluate the quality of NBA data presentation and contextual information',
    outputSchema: z.object({
      containsNbaData: z.boolean(),
      wellStructured: z.boolean(),
      providesContext: z.boolean(),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
      You are evaluating if an NBA assistant properly presents basketball data.
      User text:
      """
      ${results.preprocessStepResult.userText}
      """
      Assistant response:
      """
      ${results.preprocessStepResult.assistantText}
      """
      Tasks:
      1) Identify if the assistant presents NBA-related data in response to the user's query.
      2) Check if the data is well-structured and easy to understand.
      3) Determine if the assistant provides relevant context or insights about the data.
      Return JSON with fields:
      {
        "containsNbaData": boolean,
        "wellStructured": boolean,
        "providesContext": boolean,
        "confidence": number, // 0-1
        "explanation": string
      }
    `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    if (!r.containsNbaData) return 0.5; // If no NBA data provided
    
    let score = 0;
    if (r.wellStructured) score += 0.5;
    if (r.providesContext) score += 0.5;
    
    return Math.min(1, score * (r.confidence ?? 1));
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `NBA Data Quality scoring: containsNbaData=${r.containsNbaData ?? false}, wellStructured=${r.wellStructured ?? false}, providesContext=${r.providesContext ?? false}, confidence=${r.confidence ?? 0}. Score=${score}. ${r.explanation ?? ''}`;
  });

export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  dataQualityScorer,
};
