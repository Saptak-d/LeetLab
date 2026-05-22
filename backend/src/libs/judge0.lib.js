import axios from "axios"
export const getJudge0LanguageId = (language)=>{
    const languageMap = {
        "PYTHON" : 71,
        "JAVA" : 62,
        "JAVASCRIPT" : 63,
    }

    return languageMap[language.toUpperCase()]
}


export const submitBatch = async(submissions)=>{
   const {data} = await axios.post(`${process.env.JUDE0_API_URL}/submission/batch?base64_encoded=false`,{
    submissions
   })
   console.log("submition Result",data)

   return data
}