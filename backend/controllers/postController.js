import { Response } from "../utils/response.js";
import { message } from "../utils/message.js";
import cloudinary from "cloudinary";
import Post from "../models/postModel.js";
import User from "../models/userModel.js"


export const createPost = async (req, res) => {
    try {
        //Parsing body data
        const{image,caption,location}=req.body;

        //Checking body data
        if(!caption){
            return Response(res,400,false,message.missingFieldsMessage);
        }
        //Check image
        if(!image){
            return Response(res,400,false,message.imageMissingMessage);
        }
        //Upload image to cloudinary
        let imageUpload=await cloudinary.v2.uploader(image,{
            folder:'posts'
        })
        //create post
        let post=await Post.create({
            image:{
            public_id:imageUpload.public_id,
            url: imageUpload.url
            },
            caption,
            location
        })
        //set owner details
        post.owner=req.user._id;
        await post.save();

        //set post in user
        let user=await User.findById(req.user._id);
        user.posts.unshift(post._id);
        await user.save();

        //send response
        Response(res,201,true,message.postCreateMessage,post)
        
    } catch (error) {
        Response(res, 500, false, error.message);
    }
}