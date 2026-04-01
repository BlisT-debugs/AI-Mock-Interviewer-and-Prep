import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        createdAt: v.number()
    }),
    DiscussionRoom: defineTable({
        Option: v.string(),
        Assistant: v.string(),
        userId: v.union(v.string(), v.null()),
        Topic: v.optional(v.string()), 
        
        // Context Fields
        resumeText: v.optional(v.string()),
        jdText: v.optional(v.string()),
        role: v.optional(v.string()),
        industry: v.optional(v.string()),
        
        // Session Data
        conversation: v.optional(v.any()),
        completed: v.optional(v.boolean()),    
        lastUpdated: v.optional(v.number()),

        // The AI Performance Analysis 
        feedbackReport: v.optional(v.any()),
    }),
});