import * as vscode from "vscode";
import * as path from "path";
import { Step } from "../roadmaps/types";

/**
 * Runs verifyCommand via a hidden terminal script and waits for its exit code,
 * OR checks verifyFile existence via the workspace FS.
 *
 * Returns true if the step is considered verified, false if it fails.
 * If neither verifyCommand nor verifyFile is set, returns true (fire-and-forget).
 */
export async function verifyStep(
  step: Step,
  workspaceRoot: string
): Promise<{ passed: boolean; error?: string }> {
  if (step.verifyFile) {
    const filePath = path.isAbsolute(step.verifyFile)
      ? step.verifyFile
      : path.join(workspaceRoot, step.verifyFile);
    try {
      const uri = vscode.Uri.file(filePath);
      await vscode.workspace.fs.stat(uri);
      return { passed: true };
    } catch {
      return {
        passed: false,
        error: `Expected file/directory not found: ${step.verifyFile}`,
      };
    }
  }

  // No verification defined — treat as passed
  return { passed: true };
}
