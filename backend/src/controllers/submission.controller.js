import { db } from "../libs/db.js"

export const getAllSubmission = async(req,res)=>{
try {
    const userId = req.user.userIdconst 
    const  submission = await db.submission.findMany({
        Where:{
            userId : userId
        }
    })
    res.status(200).json({
        success : true,
        message: "Submission fetched successfully"
    })

} catch (error) {
    console.error("Fetch Submission Error:",error)
    res.status(500).json({error : "Faild to fetch submissions"})
}
}

export const getAllSubmissionForProblems = async(req,res)=>{}

export const getAllTheSubmissionsForProblem = async(req,res)>{}