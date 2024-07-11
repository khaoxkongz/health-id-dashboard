import { PrismaClient as DbDriver } from '@prisma/client';

class BasePrismaSchemaDataLink {
  constructor(protected readonly db: DbDriver) {}
}

export { DbDriver, BasePrismaSchemaDataLink };

export default new DbDriver();
