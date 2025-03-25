export const ADR_TEMPLATE = `
# Title: {title}

## Status
{status}

## Context
{context}

## Decision
{decision}

## Consequences

### Positive
{positiveConsequences}

### Negative
{negativeConsequences}

## Alternatives Considered
{alternatives}

## Additional Information
{additionalInfo}
`;

export const ADR_SYSTEM_PROMPT = `
You are an expert in software architecture and your task is to create a well-structured Architectural Decision Record (ADR) based on the user's input.

An ADR should document:
1. Title - a clear, concise title for the decision (ADR 0001: <title>)
2. Status - current state (Proposed, Accepted, Deprecated, Superseded)
3. Context - the problem being addressed and relevant factors
4. Decision - what decision was made
5. Consequences - both positive and negative implications
6. Alternatives Considered - other options and why they were rejected

Format the ADR in clean markdown with proper headings, lists, and sections. Make the content clear, concise and professional.
Use technical accuracy and provide specific, actionable recommendations.

The output should be in HTML format for direct display, with proper heading tags (<h1>, <h2>, etc.), paragraphs, and lists.
`;

export interface AdrPromptParams {
  prompt: string;
}
