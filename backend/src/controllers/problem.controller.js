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
    
    const problems = await db.problem.findMany();

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

export const getProblemById = async(req,res)=>{

  try {

    const {id} = req.params;

     const problem = await db.problem.findUnique({
      where : {
        id
      }
     })

     if(!problem){

         return res.status(404)
          .json({
            error : "No problem is found"
          })
     }

     return res
      .status(200)
      .json({
        success : true ,
        message : "problem fetched Successfully",
        problem 
      })
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error : "Error while  fetching problem"
    })
  }
}

export const updateProblem = async(req,res)=>{

  try {
    const {id} = req.params;
    const problem = await db.problem.findUnique({
      where : {
        id
      }
    })

    if(!problem){
      return res
         .status(404)
         .json({
          error : "Problem is not Found"
         })
    }
     const allowedFields = [
      "title",
      "description",
      "difficulty",
      "tags",
      "examples",
      "constraints",
      "testcases",
      "codeSnippets",
      "referenceSolutions",
      "hints",
      "editorial",
    ];

     const updateData = {};

   for(const field of allowedFields){
     if(req.body[field] !== undefined){
      updateData[field] = req.body[field]
     }
   }

   if(Object.keys(updateData).length === 0){
     return res.status(400).json({
      error : "No valid Fields provided for update"
     })
   }
    // decide whether validation is needed
  const testcasesChanged =
  req.body.testcases !== undefined &&
  JSON.stringify(req.body.testcases) !== JSON.stringify(problem.testcases);

const referenceSolutionsChanged =
  req.body.referenceSolutions !== undefined &&
  JSON.stringify(req.body.referenceSolutions) !== JSON.stringify(problem.referenceSolutions);

const shouldValidate = testcasesChanged || referenceSolutionsChanged;

   if(shouldValidate){
    
  const finalTestcases =
    req.body.testcases ?? problem.testcases;

   const finalReferenceSolution =
         req.body.referenceSolutions ??
         problem.referenceSolutions;

for (const [language, solutionCode] of Object.entries(finalReferenceSolution)) {

  for (const testcase of finalTestcases) {

    const result = await runCode(language, solutionCode,testcase.input);

    if (!result || result.error) {
      return res.status(400).json({
        success: false,
        error: `Code execution failed for ${language}`,
      });
    }

    const actualOutput = result.run.stdout.trim();

    const expectedOutput =
      testcase.output?.toString().trim();

    if (actualOutput !== expectedOutput) {
      return res.status(400).json({
        success: false,
        error: `Reference solution failed for ${language}`,
        language,
        testcase,
        expectedOutput,
        actualOutput,
      });
    }
  }
}
   }

   const updatedProblem = await db.problem.update({
        where : {id},
        data : updateData
       })

        return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (error) {
     console.error("UPDATE_PROBLEM_ERROR", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export const deleteProblem = async (req, res) => {
  try {

    const { id } = req.params;

    const problem = await db.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found",
      });
    }

    await db.problem.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });

  } catch (error) {

    console.error("DELETE_PROBLEM_ERROR", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getAllProblemsSolvedByUser = async(req,res)=>{
   try {
    const problems = await db.problem.findManny({
      where : {
        solvedBy : {
          some : {
            userId : req.user.id
          }
        }
      },
      include : {
        solvedBy : {
          where : {
            userId : req.user.id
          }
        }
      }
    })
    res.status(200)
       .json({
        success : true ,
        message : "problems fetched successfully",
        problems
       })
    
   } catch (error) {
    console.error("Error Fetching Problems :",error)
    res.status(500).json({error : "Faild to Fetched problems"})
   }
} 