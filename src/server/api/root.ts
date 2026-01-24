import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { menuRouter } from "./routers/menu";
import { headerRouter } from "./routers/header";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { locationRouter } from "./routers/location";
import { galleryRouter } from "./routers/gallery";
import { exerciseRouter } from "./routers/exercise";
import { workoutLogRouter } from "./routers/workout-log";
import { programRouter } from "./routers/program";
import { progressRouter } from "./routers/progress";
import { analyticsRouter } from "./routers/analytics";
import { goalRouter } from "./routers/goal";
import { templateRouter } from "./routers/template";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  menu: menuRouter,
  header: headerRouter,
  auth: authRouter,
  user: userRouter,
  location: locationRouter,
  gallery: galleryRouter,
  exercise: exerciseRouter,
  workoutLog: workoutLogRouter,
  program: programRouter,
  progress: progressRouter,
  analytics: analyticsRouter,
  goal: goalRouter,
  template: templateRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
