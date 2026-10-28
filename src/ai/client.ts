import * as vscode from "vscode";
import { S } from "../strings";

const KEY_ACCESS = "roadmap.bedrock.accessKeyId";
const KEY_SECRET = "roadmap.bedrock.secretAccessKey";
const KEY_REGION = "roadmap.bedrock.region";

export async function getBedrockClient(
  ctx: vscode.ExtensionContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const accessKeyId = await ctx.secrets.get(KEY_ACCESS);
  const secretAccessKey = await ctx.secrets.get(KEY_SECRET);
  const region = (await ctx.secrets.get(KEY_REGION)) || "us-east-1";

  if (!accessKeyId || !secretAccessKey) {
    const configure = "Configure Now";
    const res = await vscode.window.showErrorMessage(
      S.BEDROCK_MISSING,
      configure
    );
    if (res === configure) {
      await configureBedrock(ctx);
      return getBedrockClient(ctx);
    }
    return null;
  }

  // Dynamic import to avoid issues in test environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: AnthropicBedrock } = require("@anthropic-ai/bedrock-sdk");
  return new AnthropicBedrock({
    awsAccessKey: accessKeyId,
    awsSecretKey: secretAccessKey,
    awsRegion: region,
  });
}

export async function configureBedrock(
  ctx: vscode.ExtensionContext
): Promise<void> {
  const accessKeyId = await vscode.window.showInputBox({
    prompt: S.BEDROCK_KEY_PROMPT,
    ignoreFocusOut: true,
    password: false,
  });
  if (!accessKeyId) return;

  const secretAccessKey = await vscode.window.showInputBox({
    prompt: S.BEDROCK_SECRET_PROMPT,
    ignoreFocusOut: true,
    password: true,
  });
  if (!secretAccessKey) return;

  const region = await vscode.window.showInputBox({
    prompt: S.BEDROCK_REGION_PROMPT,
    value: "us-east-1",
    ignoreFocusOut: true,
  });

  await ctx.secrets.store(KEY_ACCESS, accessKeyId);
  await ctx.secrets.store(KEY_SECRET, secretAccessKey);
  await ctx.secrets.store(KEY_REGION, region || "us-east-1");
  vscode.window.showInformationMessage(S.BEDROCK_SAVED);
}
