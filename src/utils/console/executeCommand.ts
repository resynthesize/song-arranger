/**
 * Cyclone - Command Execution Engine
 * Sandboxed JavaScript execution for live coding console
 */

import type { AppDispatch } from '@/store/store';
import type { RootState } from '@/types';
import { createReplApi } from './replApi';

export interface ExecutionResult {
  output?: string;
  error?: string;
}

/**
 * Execute a JavaScript command in a sandboxed environment
 *
 * @param command - The JavaScript code to execute
 * @param dispatch - Redux dispatch function
 * @param state - Redux state
 * @returns Execution result with output or error
 */
export function executeCommand(
  command: string,
  dispatch: AppDispatch,
  state: RootState
): ExecutionResult {
  try {
    // Trim whitespace
    const trimmedCommand = command.trim();

    if (!trimmedCommand) {
      return { output: '' };
    }

    // Create sandbox context with curated API
    const context = createSandboxContext(dispatch, state);

    // Execute in sandboxed environment
    // Using Function constructor for controlled eval
    // Context is passed as parameters to avoid direct access to outer scope

    // Try to execute as expression first, fall back to statement if that fails
    let result;
    try {
      // Try as expression: return (command)
      const expressionFunction = new Function(
        ...Object.keys(context),
        `"use strict"; return (${trimmedCommand});`
      );
      result = expressionFunction(...Object.values(context));
    } catch (expressionError) {
      // If expression fails, try as statement: command; return undefined
      const statementFunction = new Function(
        ...Object.keys(context),
        `"use strict"; ${trimmedCommand}`
      );
      result = statementFunction(...Object.values(context));
    }

    // Format result for display
    return {
      output: formatResult(result),
    };
  } catch (error) {
    // Catch and format errors
    return {
      error: formatError(error),
    };
  }
}

/**
 * Create sandbox context with curated API
 * This returns the full REPL API with all available functions
 */
function createSandboxContext(
  dispatch: AppDispatch,
  state: RootState
): Record<string, unknown> {
  // Get the full REPL API
  return createReplApi(dispatch, state);
}

/**
 * Format execution result for display
 */
function formatResult(result: unknown): string {
  if (result === undefined) {
    return '';
  }

  if (result === null) {
    return 'null';
  }

  if (typeof result === 'string') {
    return result;
  }

  if (typeof result === 'number' || typeof result === 'boolean') {
    return String(result);
  }

  if (typeof result === 'object') {
    try {
      return JSON.stringify(result, null, 2);
    } catch {
      return String(result);
    }
  }

  return String(result);
}

/**
 * Format error for display
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

/**
 * Validate command before execution
 * Returns error message if invalid, null if valid
 */
export function validateCommand(command: string): string | null {
  const trimmed = command.trim();

  if (!trimmed) {
    return null; // Empty commands are valid (just do nothing)
  }

  // Check for obviously dangerous patterns
  // Note: This is basic security - the Function sandbox provides the real protection
  const dangerousPatterns = [
    /import\s+/,
    /require\s*\(/,
    /eval\s*\(/,
    /Function\s*\(/,
    /constructor/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return 'Command contains restricted operations';
    }
  }

  return null;
}
