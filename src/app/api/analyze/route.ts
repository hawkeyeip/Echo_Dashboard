import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Initialize Gemini client. It will use process.env.GEMINI_API_KEY
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(req: NextRequest) {
  if (!genAI) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set in environment variables." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { action, code, answer, originalCode } = body;

    if (!code && !originalCode) {
      return NextResponse.json({ error: "Code snippet is required" }, { status: 400 });
    }

    let systemInstruction = "";
    let userPrompt = "";
    let responseSchema: any = null;

    switch (action) {
      case "audit":
        systemInstruction = "You are a senior enterprise security and architecture auditor. Highlight the most vulnerable point of failure (e.g., memory leak, state mutation, security flaw). Ensure your explanations and code snippets adhere strictly to professional industry standards and precise technical terminology.";
        userPrompt = `Analyze this code:\n\n${code}`;
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            lineByLine: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  line: { type: SchemaType.NUMBER },
                  code: { type: SchemaType.STRING },
                  explanation: { type: SchemaType.STRING }
                },
                required: ["line", "code", "explanation"]
              }
            },
            vulnerability: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                severity: { type: SchemaType.STRING, description: "high, medium, or low" }
              },
              required: ["title", "description", "severity"]
            }
          },
          required: ["lineByLine"]
        };
        break;

      case "translate":
        systemInstruction = "You are an elite enterprise software architect. Translate the provided code into formal computer science terminology. Explain the concepts used (e.g., 'unidirectional data flow', 'memoization', 'idempotency').";
        userPrompt = `Translate this code:\n\n${code}`;
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },
            concepts: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  term: { type: SchemaType.STRING },
                  definition: { type: SchemaType.STRING },
                  context: { type: SchemaType.STRING }
                },
                required: ["term", "definition", "context"]
              }
            }
          },
          required: ["summary", "concepts"]
        };
        break;

      case "break":
        systemInstruction = "You are a chaotic chaos-monkey code injector. Take the provided working code and intentionally inject a single, realistic junior-level bug. Examples: infinite render loop in useEffect, unhandled promise rejection, mutating state directly.";
        userPrompt = `Break this code:\n\n${code}`;
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            brokenCode: { type: SchemaType.STRING },
            simulatedError: { type: SchemaType.STRING },
            bugType: { type: SchemaType.STRING }
          },
          required: ["brokenCode", "simulatedError", "bugType"]
        };
        break;

      case "verify":
        systemInstruction = "You are an expert code reviewer evaluating a junior developer's fix. The user will provide their explanation of how to fix a bug that was injected into the code.";
        userPrompt = `Original working code:\n${originalCode}\n\nBroken code:\n${code}\n\nUser's proposed fix explanation:\n${answer}`;
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            correct: { type: SchemaType.BOOLEAN },
            feedback: { type: SchemaType.STRING }
          },
          required: ["correct", "feedback"]
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0,
      }
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    const parsedResult = JSON.parse(responseText);

    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
