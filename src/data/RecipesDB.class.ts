import knex from "knex";
import BaseDB from "./BaseDB.class";

export interface Recipe {
  id: string,
  title: string,
  description: string,
  creator_id: string
}

export default class RecipesDB extends BaseDB {

  private static TABLE_NAME = "CknRecipe";

  public createRecipe = async(recipe: Recipe): Promise<void> =>{
    await this.getConnection().raw(
      `
      INSERT INTO ${RecipesDB.TABLE_NAME}(id, title, description, creator_id, date)
      VALUES ("${recipe.id}", "${recipe.title}", "${recipe.description}", "${recipe.creator_id}", CURDATE());
      `
    );
  }
}
