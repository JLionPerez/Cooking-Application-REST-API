/*
 * Recipoe schema and data accessor methods;
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const RecipeSchema = {
    cookNames: { required: true },
    title: { required: true },
    description: { required: true },
    ingredients: { required: true },
    instructions: { required: true },
    category: { required: true }
};
exports.RecipeSchema = RecipeSchema;

async function getRecipeCount() {
    const [results] = await mysqlPool.query(
        'SELECT COUNT(*) AS count FROM recipes'
    );
    return results[0].count;
}

async function getRecipesPage(page) {
    const numberOfRecipes = await getRecipeCount();
    const pageSize = 5;
    const lastPage = Math.ceil(numberOfRecipes / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;

    const [results] = await mysqlPool.query(
        'SELECT * FROM recipes ORDER BY id LIMIT ?,?',
        [offset, pageSize]
    );

    return {
        recipes: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: numberOfRecipes
    };

}
exports.getRecipesPage = getRecipesPage;


async function getRecipeById(id) {
    const [results] = await mysqlPool.query(
        'SELECT * FROM recipes WHERE id = ?',
        [id]
    );
    return results[0];
}
exports.getRecipeById = getRecipeById;

async function insertNewRecipe(recipe) {
    recipe = extractValidFields(recipe, RecipeSchema);
    const [result] = await mysqlPool.query(
        'INSERT INTO recipes SET ?',
        recipe
    );

    return result.insertId;
}
exports.insertNewRecipe = insertNewRecipe;

async function replaceRecipeById(id, recipe) {
    recipe = extractValidFields(recipe, RecipeSchema);
    const [result] = await mysqlPool.query(
        'UPDATE recipes SET ? WHERE id = ?',
        [recipe, id]
    );
    return result.affectedRows > 0;
}
exports.replaceRecipeById = replaceRecipeById;

async function deleteRecipeById(id) {
    const [result] = await mysqlPool.query(
        'DELETE FROM recipes WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}
exports.deleteRecipeById = deleteRecipeById;

