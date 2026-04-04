import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateRoom = mutation({
    args: {
        Option: v.string(),
        Assistant: v.string(),
        userId: v.optional(v.string()),
        conversation: v.optional(v.array(v.any())),
        completed: v.optional(v.boolean()),
        lastUpdated: v.optional(v.number()),
        
        // --- MODIFIED & NEW FIELDS ---
        Topic: v.optional(v.string()), // Made optional
        resumeText: v.optional(v.string()),
        jdText: v.optional(v.string()),
        role: v.optional(v.string()),
        industry: v.optional(v.string()),
    },
    handler: async(ctx, args) => {
        const res = await ctx.db.insert('DiscussionRoom', {
            Option: args.Option,
            Topic: args.Topic,
            Assistant: args.Assistant,
            userId: args.userId || null,
            conversation: args.conversation || [],
            lastUpdated: args.lastUpdated || Date.now(),
            completed: args.completed || false,
            
            // --- SAVE NEW FIELDS TO DB ---
            resumeText: args.resumeText,
            jdText: args.jdText,
            role: args.role,
            industry: args.industry,
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
        conversation: v.optional(v.array(v.any())),
        completed: v.optional(v.boolean()),
        lastUpdated: v.optional(v.number()),
        
        feedbackReport: v.optional(v.any()),
        studyGuide: v.optional(v.any())
    },
    handler: async (ctx, args) => {
        // Build the update object dynamically
        const updateData = {
            lastUpdated: args.lastUpdated || Date.now(),
        };

        if (args.conversation !== undefined) updateData.conversation = args.conversation;
        if (args.completed !== undefined) updateData.completed = args.completed;
        
        // THIS IS THE CRITICAL LINE THAT WAS MISSING OR FAILING!
        if (args.feedbackReport !== undefined) updateData.feedbackReport = args.feedbackReport;

        if (args.studyGuide !== undefined) updateData.studyGuide = args.studyGuide;

        // Force the database to patch it
        await ctx.db.patch(args.id, updateData);
    }
});