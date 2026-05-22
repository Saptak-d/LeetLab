import { db } from "../libs/db.js"
import { getJudge0LanguageId } from "../libs/judge0.lib.js";



export const createProblem = async(req , res)=>{
//going to get all the data from the request body
const {title,description,difficulty,tags,examples,constrains,testcases,codeSnippets,referenceSolutions} = req.body ;
//going to check the user role once again
  if(req.user.role != "Admin"){
    return res.status(403).json({
        error : "You are not allowed create the a problem"
    })
  }
//loop through each and every  solution for different languages 

 try {
    for(const [language , solutionCode] of Object.entries(referenceSolutions)){
        const languageId = getJudge0LanguageId(language);
        if(!languageId){
            return res.status(400).json({error : `The Language ${language} is not supported`})
        }

        const submissions = testcases.map(({input , output})=>({
            source_code : solutionCode ,
            language_id : languageId,
            stdin : input,
            expected_output : output

        }))

        const submissionResult = await submitBatch(submissions)
    }

    
 } catch (error) {
    
 }
// 
//

}

export const getAllProblems = async(req,res)=>{}

export const getProblemById = async(req,res)=>{}

export const updateProblem = async(req,res)=>{}

export const deleteProblem = async(req,res)=>{}

export const getAllProblemsSolvedByUser = async(req,res)=>{} 