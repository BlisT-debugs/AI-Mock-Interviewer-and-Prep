import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateRoom = mutation({
    args: {
        Option: v.string(),
        Topic: v.string(),
        Assistant: v.string()
    },
    handler:async(ctx,args)=>{
        const res=await ctx.db.insert('DiscussionRoom',{
            Option:args.Option,
            Topic:args.Topic,
            Assistant:args.Assistant
        })
        return res;
    }
})