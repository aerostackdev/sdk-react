import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    apiVersion: '2024-02-01',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_VISION || 'gpt-4o',
});

const SPEC_PATH = path.join(__dirname, '../spec/openapi.yaml');

async function generateSDK(target: 'flutter' | 'react-native') {
    console.log(`🤖 Starting AI Generation for ${target} SDK (via Azure GPT-4o)...`);

    if (!process.env.AZURE_OPENAI_API_KEY) {
        console.error('❌ Error: AZURE_OPENAI_API_KEY is not set in environment.');
        process.exit(1);
    }

    const outputDir = path.join(__dirname, `../packages/${target}`);
    const specContent = fs.readFileSync(SPEC_PATH, 'utf8');

    const prompts = {
        'flutter': `
You are an expert Flutter/Dart developer. Generate a production-ready Flutter/Dart SDK for "Aerostack".
Requirements: 'dio' for HTTP, 'json_serializable' for models.
Structure: 
- lib/aerostack.dart (Main class)
- lib/src/services/*.dart (Auth, Db, AI, Cache, Storage, Queue)
- lib/src/models/*.dart (Request/Response models)
- pubspec.yaml
Return as JSON: { "files": [ { "path": "lib/aerostack.dart", "content": "..." }, ... ] }
`,
        'react-native': `
You are an expert React Native/TypeScript developer. Generate a production-ready React Native SDK for "Aerostack".
Requirements: 
1. Use 'axios' for HTTP.
2. Written in TypeScript.
3. Structure: 
   - src/index.ts (Main class)
   - src/services/*.ts
   - src/models/*.ts
   - package.json
   - tsconfig.json
Return as JSON: { "files": [ { "path": "src/index.ts", "content": "..." }, ... ] }
`
    };

    const prompt = `
${prompts[target]}

### OpenAPI Spec:
${specContent}

IMPORTANT: Provide EXHAUSTIVE implementations for all endpoints in the spec. Ensure the JSON is complete and not truncated.
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a professional SDK architect. Output only valid JSON with the requested structure." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096 // Increase limit
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');

        if (!result.files) {
            console.error('❌ AI returned invalid format.');
            process.exit(1);
        }

        for (const file of result.files) {
            const fullPath = path.join(outputDir, file.path);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, file.content);
            console.log(`  - Written: ${file.path}`);
        }

        console.log(`🎉 ${target} SDK generated successfully!`);
    } catch (error) {
        console.error('❌ Generation failed:', error);
    }
}

async function main() {
    const target = process.argv[2] as 'flutter' | 'react-native';
    if (target === 'flutter' || target === 'react-native') {
        await generateSDK(target);
    } else {
        console.log('Usage: npx tsx scripts/generate_ai.ts [flutter|react-native]');
    }
}

main();
