import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const GetRoom = query({
    args:{
        id: v.string('DiscussionRoom'),
    },
    handler: async(ctx,args)=>{
        const res= await ctx.db.get(args.id);
        return res; 
    }
})

export const Convo=mutation({
    args:{
        id:v.id('DisscussionRoom'),
        conversation:v.any()
    },
    handler:async(ctx,args)=>{
        awaitctx.db.patch(args.id,{
            conversation:args.conversation
        })
    }
})