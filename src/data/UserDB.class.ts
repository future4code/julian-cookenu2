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
  private static RELATION_TABLE = "CknUsersRelation";

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

    await BaseDB.destroyConnection();

    return result[0][0];
  };

  public getById = async (id: string): Promise<any> => {
    const result = await this.getConnection().raw(`
     SELECT *
     FROM ${UserDB.TABLE_NAME}
      WHERE id = "${id}";
    `);

    await BaseDB.destroyConnection();

    return result[0][0];
  };

  public follow = async (id: string, id_toFollow: string): Promise<void> => {
    await this.getConnection().raw(
      `
      INSERT INTO ${UserDB.RELATION_TABLE}(user_id, follows_id)
      VALUES ("${id}", "${id_toFollow}");
      `
    );

    await BaseDB.destroyConnection();
  };

  public unfollow = async (
    id: string,
    id_toUnfollow: string
  ): Promise<void> => {
    await this.getConnection().raw(
      `
      DELETE FROM ${UserDB.RELATION_TABLE}
      WHERE user_id = "${id}" 
      AND follows_id = "${id_toUnfollow}";
      `
    );

    await BaseDB.destroyConnection();
  };

  public getFeed = async (id: string): Promise<any> => {
    const result = await this.getConnection().raw(
      `
      SELECT r.id, r.title, r.description, r.date AS createdAt, r.creator_id AS userId, c.name AS userName 
      FROM CknUsersRelation ur  
      INNER JOIN CknRecipe r
      ON r.creator_id = ur.follows_id
      INNER JOIN CknUser u
      ON ur.user_id = u.id
      INNER JOIN CknUser c
      ON c.id = r.creator_id
      WHERE u.id = "${id}";
      `
    );

    await BaseDB.destroyConnection();

    return result[0];
  };
}
