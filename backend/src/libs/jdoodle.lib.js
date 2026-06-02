import axios from "axios";

const JDOODLE_API = process.env.JDOODLE_API;

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
  console.log("language in the func runCode",language)
  console.log("called thr funcn of runCode")
  const runtime = jdoodleRuntime[language];
  console.log("the runtime -",runtime)

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
  console.log(data)

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
export const runCode2 = async (language, sourceCode, input) => {
  console.log("language in the func runCode",language)
  console.log("called thr funcn of runCode")
  const runtime = jdoodleRuntime[language];
  console.log("the runtime -",runtime)

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
 

   return data;
};


export const getLanguageById = (language_id)=>{
const LANGUAGE_NAMES = {
        63: "javascript",
        71: "python",
        62: "java",
    }
    return LANGUAGE_NAMES[language_id] || "Unknown"
}