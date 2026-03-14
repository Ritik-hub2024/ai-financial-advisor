/**
 * Utility functions to split AI-generated text into structured sections.
 */

export interface Section {
  title: string;
  content: string;
}

/**
 * Splits lengthy AI responses into separate sections based on predefined headers.
 */
export function splitAdviceSections(text: string): Section[] {
  // Pattern based on the headers used in getFinancialAdvice prompt
  const pattern = /(Current Financial Health:|Existing Savings Utilization:|Monthly Savings Strategy:|Debt Plan:|Investment Advice:|Goal Guidance:|Budgeting & Savings:)/g;
  
  const splits = text.split(pattern);
  const sections: Section[] = [];

  // The first element might be empty or preamble text
  for (let i = 1; i < splits.length; i += 2) {
    const title = splits[i].replace(':', '').trim();
    const content = splits[i + 1]?.trim() || '';
    if (title && content) {
      sections.push({ title, content });
    }
  }

  return sections;
}

/**
 * Splits goal-oriented strategies into structured sections.
 */
export function splitGoalSections(text: string): Section[] {
  // Pattern based on the headers used in generateGoalPlan prompt
  const pattern = /(Instruction Implementation Strategy:|Financial Impact Analysis:|Revised Goal Timeline:|Monthly Action Plan:|Resource Allocation Strategy:|Risk Assessment & Mitigation:|Progress Tracking Framework:|Contingency Planning:|Key Success Metrics:|Next Immediate Actions:)/g;
  
  const splits = text.split(pattern);
  const sections: Section[] = [];

  for (let i = 1; i < splits.length; i += 2) {
    const title = splits[i].replace(':', '').trim();
    const content = splits[i + 1]?.trim() || '';
    if (title && content) {
      sections.push({ title, content });
    }
  }

  return sections;
}
