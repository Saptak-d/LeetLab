import { db } from "../libs/db.js"

export const getAllSubmission = async(req,res)=>{
try {
    const userId = req.user.userIdconst 
    const  submissions = await db.submission.findMany({
        Where:{
            userId : userId
        }
    })
    res.status(200).json({
        success : true,
        message: "Submission fetched successfully",
        submissions
    })

} catch (error) {
    console.error("Fetch Submission Error:",error)
    res.status(500).json({error : "Faild to fetch submissions"})
}
}

export const getAllSubmissionForProblem = async(req,res)=>{
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId
         const submissions = await db.submission.findMany({
        Where :{
            userId : userId ,
            problemId : problemId
        }
    })
    res.status(200).json({
        success : true ,
        message : "Submission fetched successfully",
        submissions
    })
    } catch (error) {
        console.error("Fetched Submission Error -",error)
        res.status(500).json({error : "Faild to fetch submissions"})
    }
}

export const getAllTheSubmissionsForProblem = async(req,res)>{}