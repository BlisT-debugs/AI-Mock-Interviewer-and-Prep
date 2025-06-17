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
        Conversation: v.optional(v.any())
    })
})