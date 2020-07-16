import knex from "knex";
import BaseDB from "./BaseDB.class";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export default class UserDB extends BaseDB {
  private static TABLE_NAME = "CknUser";

  public createUser = async (user: User): Promise<void> => {
    await this.getConnection().raw(
      `
      INSERT INTO ${UserDB.TABLE_NAME}(id, email, name, password)
      VALUES ("${user.id}", "${user.email}", "${user.name}", "${user.password}");
      `
    );

    await BaseDB.destroyConnection();
  };

  public getByEmail = async (email: string): Promise<any> => {
    const result = await this.getConnection().raw(
      `
      SELECT *
      FROM CknUser
      WHERE email = "${email}";
      `
    );

    return result[0][0];
  };

  public getById = async (id: string): Promise<any> => {
    const result = await this.getConnection().raw(`
     SELECT *
     FROM CknUser
      WHERE id = "${id}";
    `);

    return result[0][0];
  };
}
