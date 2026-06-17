import { getLanguageById, runCode, runCode2 } from "../libs/jdoodle.lib.js";
import { db } from "../libs/db.js";

export const executeCode = async(req,res)=>{
    try {
        const {source_code,language_id,stdin,expected_outputs,problemId} = req.body

        const userId = req.user.id;
        //validate test cases
        if(!Array.isArray(stdin) || 
        stdin.length === 0 ||
        !Array.isArray(expected_outputs) ||
         expected_outputs.length !== stdin.length ){
            return res.status(400).json({error : "Invalid or missing test cases"})
         }
         let finalResponse = [];
         const language = getLanguageById(language_id);

      for(let i = 0 ; i < stdin.length ; i++){
 
         let result  = await runCode2(language,source_code,stdin[i])
         console.log(result);

         finalResponse.push(result)
      }
 
       let allPassed = true;
         const detailedResults = finalResponse.map((result,i)=>{
            const stdout = result.output?.trim()
            const expected_output = expected_outputs[i]?.trim()
            const passed = stdout === expected_output

            if(!passed) allPassed = false;


            return{
                testCase: i + 1,
                  passed,
                  stdout,
                   expected: expected_output,
                   stderr: result.error || null,
                   compile_output: !result.isExecutionSuccess && result.output ? result.output : null,
                   status: !result.isExecutionSuccess? "Execution Error" : passed? "Accepted" : "Wrong Answer",
                   memory: result.memory ? `${result.memory} KB` : undefined,
                    time: result.cpuTime ? `${result.cpuTime} s` : "N/A",
            }
         })

         console.log("The detailed result is -----",detailedResults)

       // store submission summary
     const submission  = await db.submission.create({
  data: {
    user: {
      connect: {
        id: userId
      }
    },

    problem: {
      connect: {
        id: problemId
      }
    },

    sourceCode: source_code,
    language,
    stdin: stdin.join("\n"),
    stdout: JSON.stringify(detailedResults.map(r => r.stdout)),
    stderr: detailedResults.some((r) => r.stderr)
    ? JSON.stringify(detailedResults.map((r) => r.stderr))
    : null,
    compileOutput: detailedResults.some(r => r.compile_output)
      ? JSON.stringify(detailedResults.map(r => r.compile_output))
      : null,
    status: allPassed ? "Accepted" : "Wrong Answer",
    memory: detailedResults.some(r => r.memory)
      ? JSON.stringify(detailedResults.map(r => r.memory))
      : null,
    time: detailedResults.some(r => r.time)
      ? JSON.stringify(detailedResults.map(r => r.time))
      : null,
  }
});

         // If All passed = true mark problem as solved for the current user

         if(allPassed){
            await db.problemSolved.upsert({
               where: {
                  userId_problemId :{
                     userId,
                     problemId
                  },
               },
               update : {},
               create : {
                  userId,
                  problemId
               }
            })
         }

          // 8. Save individual test case results  using detailedResult
          const testCaseResults  = detailedResults.map((result)=>({
            submissionId : submission.id,
            testCase : result.testCase,
            passed : result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            status: result.status,
             memory: result.memory,
             time: result.time,
          }));

          await db.testCaseResult.createMany({
            data : testCaseResults
          })


          const  submissionWithTestCase = await db.submission.findUnique({
            where : {
               id : submission.id
            },
            include: {
             testCases: true,
           },
          })

          res.status(200).json({
            success : true ,
            message : "Code Executed Successfully",
            submission : submissionWithTestCase
          })

    } catch (error) {
        console.error("Error executing code:",error.message)
        res.status(500).json({error : "Failed to execute code"})
    }
}