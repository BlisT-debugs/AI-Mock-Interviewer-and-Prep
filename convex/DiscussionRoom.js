import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateRoom = mutation({
    args: {
        Option: v.string(),
        Topic: v.string(),
        Assistant: v.string(),
        userId: v.optional(v.string()),
        conversation: v.optional(v.array(v.any())),
        completed: v.optional(v.boolean()),
        lastUpdated: v.optional(v.number())
    },
    handler: async(ctx, args) => {
        const res = await ctx.db.insert('DiscussionRoom', {
            Option: args.Option,
            Topic: args.Topic,
            Assistant: args.Assistant,
            userId: args.userId || null,
            conversation: args.conversation || [],
            lastUpdated: args.lastUpdated || Date.now(),
            completed: args.completed || false
        });
        return res;
    }
});

export const GetRoom = query({
    args: {
        id: v.id('DiscussionRoom'),
    },
    handler: async(ctx, args) => {
        return await ctx.db.get(args.id);
    }
});

export const GetUserRooms = query({
    args: {
        userId: v.string()
    },
    handler: async(ctx, args) => {
        return await ctx.db
            .query('DiscussionRoom')
            .filter(q => q.eq(q.field('userId'), args.userId))
            .order('desc')
            .collect();
    }
});

export const UpdateConversation = mutation({
    args: {
        id: v.id('DiscussionRoom'),
        conversation: v.array(v.any()),
        completed: v.optional(v.boolean()),
        lastUpdated: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            conversation: args.conversation,
            lastUpdated: args.lastUpdated || Date.now(),
            ...(args.completed !== undefined && { completed: args.completed })
        });
    }
});

export const markAsCompleted = mutation({
  args: { roomId: v.id('DiscussionRoom') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    
    await ctx.db.insert('UserLectures', {
      userId: "temp-user", // Replace with actual user ID later
      roomId: args.roomId,
      completedAt: Date.now(),
      topic: room.Topic,
      assistant: room.Assistant
    });
    
    return await ctx.db.patch(args.roomId, { completed: true });
  }
});