import { protectedProcedure, publicProcedure, router } from "../index";
import { driverRouter } from "./driver.router";
import { vehicleRouter } from "./vehicle.router";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  vehicle: vehicleRouter,
  driver: driverRouter,
});
export type AppRouter = typeof appRouter;
