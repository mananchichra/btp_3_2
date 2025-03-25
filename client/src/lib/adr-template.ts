// Define various ADR templates

// Standard format template (default)
export const STANDARD_TEMPLATE = `
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

// MADR (Markdown Architectural Decision Records) template
export const MADR_TEMPLATE = `
# {title}

* Status: {status}
* Deciders: {deciders}
* Date: {date}
* Technical Story: {technicalStory}

## Context and Problem Statement

{context}

## Decision Drivers

* {driver1}
* {driver2}
* {driver3}

## Considered Options

* {option1}
* {option2}
* {option3}

## Decision Outcome

Chosen option: "{chosenOption}", because {justification}.

### Positive Consequences

* {positiveConsequence1}
* {positiveConsequence2}

### Negative Consequences

* {negativeConsequence1}
* {negativeConsequence2}

## Links

* {link1}
* {link2}
`;

// Nygard template (the original)
export const NYGARD_TEMPLATE = `
# {title}

## Status
{status}

## Context
{context}

## Decision
{decision}

## Consequences
{consequences}
`;

// Y-Statements template
export const Y_STATEMENTS_TEMPLATE = `
# {title}

In the context of {context},
facing {concern},
we decided for {decision}
to achieve {rationale},
accepting {consequence}.
`;

// Template system prompts
export const ADR_SYSTEM_PROMPTS = {
  standard: `
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

Your response should be formatted in markdown.
`,

  madr: `
You are an expert in software architecture and your task is to create a Markdown Architectural Decision Record (MADR) based on the user's input.

The MADR format follows this structure:
1. Title - a clear, concise title for the decision
2. Metadata - status, deciders, date, and related technical story
3. Context and Problem Statement - the issue that is motivating this decision
4. Decision Drivers - key forces influencing the decision
5. Considered Options - a list of all options considered
6. Decision Outcome - chosen option with justification
7. Positive and Negative Consequences - impacts of the decision
8. Links - references and related decisions

Format the ADR in clean markdown with proper headings, bullet points, and sections. Make the content clear, concise and professional.
Ensure technical accuracy and provide specific, actionable recommendations.

Your response should be formatted in markdown.
`,

  nygard: `
You are an expert in software architecture and your task is to create an Architectural Decision Record (ADR) following Michael Nygard's original template.

An ADR in Nygard's format should document:
1. Title - a clear, concise title for the decision
2. Status - current state (Proposed, Accepted, Deprecated, Superseded)
3. Context - the problem being addressed and relevant factors
4. Decision - what decision was made
5. Consequences - all implications (both positive and negative)

Keep the format simple and direct. Focus on clearly communicating the architectural decision.
Format the ADR in clean markdown with proper headings, lists, and sections.

Your response should be formatted in markdown.
`,

  yStatements: `
You are an expert in software architecture and your task is to create an Architectural Decision Record (ADR) using the Y-Statements format.

A Y-Statement ADR follows this structure:
"In the context of <use case/user story u>, facing <concern c>, we decided for <option o> to achieve <quality q>, accepting <downside d>."

Expand on each of these components in your response:
1. Title - a clear, concise title for the decision
2. Context - the use case or user story this decision applies to
3. Concern - the issue that is motivating this decision
4. Decision - what option was chosen
5. Rationale - what quality attribute this achieves
6. Consequence - what downside or trade-off this accepts

Keep the format simple and emphasize the cause-and-effect relationships.
Format the ADR in clean markdown with a heading for the title and then the Y-statement.
Then provide additional detail for each component of the Y-statement.

Your response should be formatted in markdown.
`
};

// Legacy exports for backward compatibility
export const ADR_TEMPLATE = STANDARD_TEMPLATE;
export const ADR_SYSTEM_PROMPT = ADR_SYSTEM_PROMPTS.standard;

// Define available templates with descriptions
export const AVAILABLE_TEMPLATES = [
  {
    id: "standard",
    name: "Standard",
    description: "Comprehensive template with positive/negative consequences and alternatives",
    systemPrompt: ADR_SYSTEM_PROMPTS.standard
  },
  {
    id: "madr",
    name: "MADR",
    description: "Markdown ADR format with decision drivers and detailed metadata",
    systemPrompt: ADR_SYSTEM_PROMPTS.madr
  },
  {
    id: "nygard",
    name: "Nygard",
    description: "Original simplified ADR template by Michael Nygard",
    systemPrompt: ADR_SYSTEM_PROMPTS.nygard
  },
  {
    id: "yStatements",
    name: "Y-Statements",
    description: "Concise format focusing on context, decision and consequences",
    systemPrompt: ADR_SYSTEM_PROMPTS.yStatements
  }
];

export interface AdrPromptParams {
  prompt: string;
  templateId?: string;
}
