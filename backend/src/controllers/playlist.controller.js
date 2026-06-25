import { db } from "../libs/db.js";

export const createPlaylist = async(req,res)=>{

    try {
        const {name ,description} = req.body;
        const userId = req.user.id;
        const playlist = await db.playlist.create({
            data : {
                name,
                description,
                userId
            }
        }) 

        res.status(200).json({
            success : true ,
            message :"New playlist is created successfully",
            playlist
        })

    } catch (error) {
        console.error("Error creating playlist",error)
        res.status(500).json({error : "failed to create playlist"})
    }
}
export const getAllListDetails = async(req,res)=>{
    try {
        
        const playlists = await db.playlist.findMany({
            where :{
                userId : req.user.id
            },
            include :{
                problems : {
                    include:{
                        problem : true
                    }
                }
            }
        })
        res.status(200)
           .json({
            success : true ,
            message : "Playlist fetched successfully",
            playlists
           })

    } catch (error) {
        console.error("Error fetching playlist",error)
        res.status(500).json({error : "faild to fetch playlist"})
    }
}

export const  getPlayListDetails = async(req,res)=>{}

export const  addProblemToPlaylist = async(req,res)=>{}

export const  deletePlaylist = async(req,res)=>{}

export const removeProblemFromPlaylist = async(req,res)=>{}
