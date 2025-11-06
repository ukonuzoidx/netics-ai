import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const storeGoogleTokens = mutation({
  args: {
    userId: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_service", (q) =>
        q.eq("userId", args.userId).eq("service", "google")
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("integrations", {
        userId: args.userId,
        service: "google",
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        scopes: ["calendar", "calendar.events"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getGoogleTokens = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_service", (q) =>
        q.eq("userId", args.userId).eq("service", "google")
      )
      .first();
  },
});

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const remove = mutation({
  args: {
    userId: v.string(),
    service: v.string(),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_service", (q) =>
        q.eq("userId", args.userId).eq("service", args.service)
      )
      .first();

    if (integration) {
      await ctx.db.delete(integration._id);
      return true;
    }
    return false;
  },
});
