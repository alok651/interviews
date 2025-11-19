import {inngest} from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";


export const inngest=new Inngest({id:"interviews"});

const syncUser=inngest.createFunction(
    {id:"sync-user"},
    {events:"clerk/user.created"},
    async({event})=>{
            await connectDB()

            const{id,email_address,first_name,last_name,image_url}=event.data

            const newUser={
                clerkId:id,
                email:email_address[0]?.email_address,
                name:`${first_name} ${last_name}`,
                profileImage:image_url
            }
            await User.create(newUser)

            //todo:do something
    }
)

const deleteUserFromDB=inngest.createFunction(
    {id:"delete-user-from-db"},
    {events:"clerk/user.deleted"},
    async({event})=>{
            await connectDB()

            const{id}=event.data
            await User.deleteOne({clerkId:id});

      //todo: do someting else            
           
    }
);



export const functions=[syncUser, deleteUserFromDB];
