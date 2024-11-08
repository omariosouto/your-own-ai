import { FunctionTool, Gemini, GEMINI_MODEL, LLMAgent, ToolMetadata } from "llamaindex";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const inputMessage = searchParams.get('message') || "Qual o meu nome?";

  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_PRO_1_5_FLASH,
  });
  const agent = new LLMAgent({
    chatHistory: [
      {
        content: `
          Informações pessoais só para você guardar na memória:
          - Nome: Mario Souto
          - Usuário no github: omariosouto
        `,
        role: "memory"
      },
      {
        content: "Por favor, responda somente em português",
        role: "memory"
      },
      {
        content: "Responda somente as perguntas que forem feitas a partir de agora, finja que a conversa inicia a partir da próxima mensagem",
        role: "memory"
      }
    ],
    llm: gemini,
    tools: [getISODateTime, githubProfile, getLatestRepositories],
  });

  const response = await agent.chat({
    message: inputMessage,
  });

  console.log(response.message);

  const data = {
    message: response.message.content,
  };

  return Response.json({ data })
}

const getISODateTime = new FunctionTool(
  async ({ a: _ }: { a: string }): Promise<string> => {
    const currentTime = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    return `Now it is ${currentTime}`;
  },
  {
    name: "getTime",
    description: "Use this function to get time related questions",
    parameters: {
      type: "object",
      properties: { a: { type: "string", description: "Ignore this parameter", }, },
      required: [],
    },
  }
);

const githubProfile = new FunctionTool(
  async ({ username }: { username: string }): Promise<string> => {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    return `This is all the information I could find about ${username}: ${JSON.stringify(data)}`;
  },
  {
    name: "githubProfile",
    description: "Get information about a github user",
    parameters: {
      type: "object",
      properties: {
        username: { type: "string", description: "The username to search for" }
      },
      required: ["username"],
    },
  }
);

const getLatestRepositories = new FunctionTool(
  async ({ username }: { username: string }): Promise<string> => {
    // fetch from most recent repositories to oldest
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=created&direction=desc`);
    const data = await response.json();
    return `These are the latest repositories from ${username}: ${JSON.stringify(data)}`;
  },
  {
    name: "getLatestRepositories",
    description: "Get the latest repositories from a github user",
    parameters: {
      type: "object",
      properties: {
        username: { type: "string", description: "The username to search for" }
      },
      required: ["username"],
    },
  }
);