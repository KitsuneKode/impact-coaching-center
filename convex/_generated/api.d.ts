/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as auth from "../auth.js";
import type * as authz from "../authz.js";
import type * as blog from "../blog.js";
import type * as blogAdmin from "../blogAdmin.js";
import type * as calendar from "../calendar.js";
import type * as calendarAdmin from "../calendarAdmin.js";
import type * as carts from "../carts.js";
import type * as catalog from "../catalog.js";
import type * as catalogAdmin from "../catalogAdmin.js";
import type * as checkout from "../checkout.js";
import type * as devSeed from "../devSeed.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as orders from "../orders.js";
import type * as otp from "../otp.js";
import type * as people from "../people.js";
import type * as persons from "../persons.js";
import type * as profile from "../profile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  auth: typeof auth;
  authz: typeof authz;
  blog: typeof blog;
  blogAdmin: typeof blogAdmin;
  calendar: typeof calendar;
  calendarAdmin: typeof calendarAdmin;
  carts: typeof carts;
  catalog: typeof catalog;
  catalogAdmin: typeof catalogAdmin;
  checkout: typeof checkout;
  devSeed: typeof devSeed;
  http: typeof http;
  leads: typeof leads;
  orders: typeof orders;
  otp: typeof otp;
  people: typeof people;
  persons: typeof persons;
  profile: typeof profile;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
