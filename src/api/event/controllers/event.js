"use strict";

/**
 * event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  // Create event with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.entityService.create("api::event.event", {
        data: data,
        files,
      });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.entityService.create("api::event.event", {
        data: { ...ctx.request.body },
      });
    }
    return await this.sanitizeOutput(entity, ctx);
  },
  // Update a user event
  async update(ctx) {
    const { id } = ctx.params;
    let entity;
    console.log(0, id, ctx.state.user);
    const [events] = await strapi.entityService.findMany("api::event.event", {
      filters: { id: ctx.params.id, user: ctx.state.user },
    });
    if (!events) {
      return ctx.unauthorized("You can't update this entry");
    }
    if (ctx.is("multipart")) {
      console.log(1);
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.entityService.update("api::event.event", id, {
        data: data,
        files,
      });
    } else {
      console.log(2);
      entity = await strapi.entityService.update("api::event.event", id, {
        data: { ...ctx.request.body },
      });
    }
    return await this.sanitizeOutput(entity, ctx);
  },
  // Delete a user event
  async delete(ctx) {
    const { id } = ctx.params;
    const [events] = await strapi.entityService.findMany("api::event.event", {
      filters: { id: ctx.params.id, user: ctx.state.user },
    });
    if (!events) {
      return ctx.unauthorized("You can't update this entry");
    }
    const entity = await strapi.entityService.update("api::event.event", id);
    return await this.sanitizeOutput(entity, ctx);
  },
  // Get logged in users
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        {
          messages: [{ id: "No authorization header was found" }],
        },
      ]);
    }

    const data = await strapi.entityService.findMany("api::event.event", {
      filters: { user: user },
    });

    if (!data) {
      return ctx.notFound();
    }

    return await this.sanitizeOutput(data, ctx);
  },
}));
