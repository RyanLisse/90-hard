import { createSchemaModel, validateDriverModel } from '@db/driver';
import { schema, z } from '@green-stack/schemas';

/* --- Schema ---------------------------------------------------------------------------------- */

export const Setting = schema('Setting', {
  key: z.string().addMeta({ isID: true }),
  value: z.any(),
});

/* --- Types ----------------------------------------------------------------------------------- */

export type Setting = z.infer<typeof Setting>;

/* --- Model ----------------------------------------------------------------------------------- */

export const SettingsModel = createSchemaModel(Setting);

/* --- Drivers --------------------------------------------------------------------------------- */

export const driverModel = validateDriverModel(SettingsModel.driver);
