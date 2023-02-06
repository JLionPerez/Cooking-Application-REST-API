/*
 * API sub-router for recipes collection endpoints.
 */

const router = require("express").Router();

const { requireAuthentication } = require("../lib/auth");
const { validateAgainstSchema } = require("../lib/validation");
const { RecipeSchema,
    getRecipesPage,
    getRecipeById,
    insertNewRecipe,
    deleteRecipeById,
    replaceRecipeById } = require("../models/recipe");
const { userIsAdmin } = require('../models/user');

/*
 * Route to fetch info about a specific recipe. Must be a cooking app subscribed user.
 */
router.get("/:id", requireAuthentication, async (req, res, next) => {
    try {
        const recipe = await getRecipeById(parseInt(req.params.id));
        if (recipe) {
            res.status(200).send(recipe);
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Unable to fetch recipe.  Please try again later.",
        });
    }
});

/*
 * Route to fetch all recipes. Must be a cooking app subscribed user.
 */
router.get("/", requireAuthentication, async (req, res, next) => {
    try {
        const recipePage = await getRecipesPage(parseInt(req.query.page) || 1);
        res.status(200).send(recipePage);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Error fetching recipes list.  Please try again later."
        });
    }
});

/*
 * Route to create a new recipe. Must be an admin.
 */
router.post('/', requireAuthentication, async (req, res) => {
    var admin = await userIsAdmin(req.user);
    if (admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    }
    else {
        if (validateAgainstSchema(req.body, RecipeSchema)) {

            try {
                const id = await insertNewRecipe(req.body);
                res.status(201).send({
                    id: id,
                    links: {
                        recipe: `/recipes/${id}`
                    }
                });
            } catch (error) {
                console.error(error);
                res.status(500).send({
                    error: "Error inserting recipe into DB.  Please try again later."
                });
            }
        }
        else {
            res.status(400).send({
                error: "Request body is not a valid recipe object."
            });
        }
    }

});

/*
 * Route to replace data for a recipe. Must be an admin.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
    var admin = await userIsAdmin(req.user);
    if (admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    }
    else {
        if (validateAgainstSchema(req.body, RecipeSchema)) {
            try {
                const id = parseInt(req.params.id)
                const updateSuccessful = await replaceRecipeById(id, req.body);
                if (updateSuccessful) {
                    res.status(200).send({
                        links: {
                            recipe: `/recipes/${id}`
                        }
                    });
                } else {
                    next();
                }
            } catch (err) {
                console.error(err);
                res.status(500).send({
                    error: "Unable to update specified recipe.  Please try again later."
                });
            }

        }
        else {
            res.status(400).send({
                error: "Request body is not a valid recipe object"
            });
        }
    }
});

/*
 * Route to delete a recipe. Must be an admin.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    var admin = await userIsAdmin(req.user);
    if (admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    }
    else {
        try {
            const deleteSuccessful = await deleteRecipeById(parseInt(req.params.id));
            if (deleteSuccessful) {
                res.status(204).end();
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({
                error: "Unable to delete recipe.  Please try again later."
            });
        }
    }

});


module.exports = router;