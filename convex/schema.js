import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    users:defineTable({
        name:v.string(),
        email:v.string(),
        createdAt:v.number()
    }),
    DiscussionRoom:defineTable({
        Option: v.string(),
        Topic: v.string(),
        Assistant: v.string(),
        conversation: v.optional(v.any()),
        userId: v.union(v.string(), v.null()),        
        completed: v.optional(v.boolean()),    
        lastUpdated: v.optional(v.number())
    }),
    UserLectures: defineTable({
    userId: v.string(),
    roomId: v.id('DiscussionRoom'),
    completedAt: v.number(),
    topic: v.string(),
    assistant: v.string(),
  }).index('by_user', ['userId']),
})