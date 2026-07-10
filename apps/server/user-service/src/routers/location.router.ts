import { z } from "zod";
import { publicProcedure, router } from "@neuralpay/config/trpc";
import { LocationService } from "../services/location.service";

export const locationRouter = router({
  countries: publicProcedure.query(() => LocationService.getAllCountries()),

  countryDetails: publicProcedure
    .input(z.object({ isoCode: z.string().length(2) }))
    .query(({ input }) => LocationService.getCountryByIso(input.isoCode)),

  states: publicProcedure
    .input(z.object({ countryIsoCode: z.string().length(2) }))
    .query(({ input }) =>
      LocationService.getStatesByCountry(input.countryIsoCode),
    ),

  cities: publicProcedure
    .input(
      z.object({
        countryIsoCode: z.string().length(2),
        stateIsoCode: z.string(),
      }),
    )
    .query(({ input }) =>
      LocationService.getCitiesByState(
        input.countryIsoCode,
        input.stateIsoCode,
      ),
    ),

  dialCodes: publicProcedure.query(() => LocationService.getDialCodes()),
});
