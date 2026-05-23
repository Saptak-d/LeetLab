import { data } from "react-router-dom";
import { db } from "../libs/db.js"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { json } from "express";



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

        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map((res)=>res.token)
        const results = await pollBatchResults(tokens);
        
        for(let i  =  0  ;  i < results.length ; i++){
            const result = results[i];
            if(result.status.id !== 3){
                return res.status(400).json({
                    error :`Testcase ${i+1} failed for language ${language}`
                })
            }
        }

    }
        //save the problem to the DB
        const newProblem = await db.problem.create({
            data:{
                title,
                description,
                difficulty,
                tags,
                examples,
                constrains,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId : req.user.id,
            }
        })

        return res.status(201).json({
            success : true,
            message : "The new problem is Created successfully",
            problem : newProblem,
        })
    
 } catch (error) {
    
    console.error("Error in create-problem controlller -",error)
    res.status(400)
    json({
        error : "Error create-Problem user"
    })
 }
// 
//

}

export const getAllProblems = async(req,res)=>{}

export const getProblemById = async(req,res)=>{}

export const updateProblem = async(req,res)=>{}

export const deleteProblem = async(req,res)=>{}

export const getAllProblemsSolvedByUser = async(req,res)=>{} 