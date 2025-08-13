import { validateDriver } from '../utils/validateDriver.db.ts';

/* --- Import Driver Methods ------------------------------------------------------------------- */

import { MockDBEntity } from '../schemas/MockEntity.schema.ts';
import { createSchemaModel } from '../utils/createSchemaModel.mock';

/* --- Driver Validation ----------------------------------------------------------------------- */

export const driver = validateDriver({
  createSchemaModel,
  // - Schema Helpers -
  DBEntity: MockDBEntity,
});
