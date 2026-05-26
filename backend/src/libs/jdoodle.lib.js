import axios from "axios";

const JDOODLE_API = "https://api.jdoodle.com/v1/execute";

const jdoodleRuntime = {
  javascript: {
    language: "nodejs",
    versionIndex: "4",
  },
  python: {
    language: "python3",
    versionIndex: "4",
  },
  java: {
    language: "java",
    versionIndex: "4",
  },
};

export const runCode = async (language, sourceCode, input) => {
  const runtime = jdoodleRuntime[language];

  if (!runtime) {
    throw new Error(`Language ${language} is not supported`);
  }

  const { data } = await axios.post(JDOODLE_API, {
    clientId: process.env.JDOODLE_CLIENT_ID,
    clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    script: sourceCode,
    stdin: input,
    language: runtime.language,
    versionIndex: runtime.versionIndex,
  });

  const hasError =
    data.error ||
    data.statusCode === 400 ||
    data.statusCode === 401 ||
    data.output?.toLowerCase().includes("error");

  return {
    run: {
      code: hasError ? 1 : 0,
      stdout: hasError ? "" : data.output || "",
      stderr: hasError ? data.error || data.output || "Execution error" : "",
    },
  };
};