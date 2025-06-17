import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        //if user already exists
        const userData = await ctx.db.query('users').filter(q => q.eq(q.field('email'), args.email)).collect();
        if (userData.length > 0) {
            console.log("User already exists");
        }
        //create user
        if(userData?.length === 0) {
            const user = {
                name: args.name,
                email: args.email,
                createdAt: Date.now(),
            };
            await ctx.db.insert('users', user);
            return user;
        }
        return userData[0];

    },
})