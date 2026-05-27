import { db } from "../libs/db.js"
import { runCode } from "../libs/jdoodle.lib.js";


export const createProblem = async(req , res)=>{
 const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if(req.user.role != "ADMIN"){
    return res.status(403).json({
        error : "You are not allowed create the a problem"
    })
  }
//loop through each and every  solution for different languages 
 try {
    for(const [language , solutionCode] of Object.entries(referenceSolutions)){
         for(let i = 0 ; i < testcases.length ; i++){
            const {input , output} = testcases[i];

                const result = await runCode(language,solutionCode,input)

                if(result.run.code !== 0){
                    return res.status(400).json({
                           error: `Runtime/Compile error for language ${language}`,
                           testcase: i + 1,
                           stderr: result.run.stderr,
                    })
                }

                  const actualOutput = result.run.stdout.trim();
                  const expectedOutput = output.trim();

                 if (actualOutput !== expectedOutput) {
                   return res.status(400).json({
                     error: `Testcase ${i + 1} failed for language ${language}`,
                      expected: expectedOutput,
                      got: actualOutput,
                      });
                   }
            }
         }

         const newProblem = await db.problem.create({
            data:{
                title ,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId : req.user?.id
            }
         })
         
          return res.status(201).json({
      success: true,
      message: "The new problem is created successfully",
      problem: newProblem,
    }); 

 } catch (error) {
      console.log(error)
     if (error.response?.status === 429) {
       res.status(500)
       .json({
        error : "THe JDOODLE limit is expired try tomorrow"
       })
     }
    return res.status(500).json({
      error : "Error while Creating Problem"
    })
 }
}

export const getAllProblems = async(req,res)=>{

  try {
    
    const problems = await db.problem.findManny()

    if(!problems){
        return res.status(404).json({
          error : "No problems found"
        })
    }
    
    return res
     .status(200)
     .json({
       success : true ,
       message : "Message Fetched successfully",
       problems
     })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error : "Error while Creating fetching problem"
    })
  }

}

export const getProblemById = async(req,res)=>{}

export const updateProblem = async(req,res)=>{}

export const deleteProblem = async(req,res)=>{}

export const getAllProblemsSolvedByUser = async(req,res)=>{} 