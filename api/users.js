const router = require('express').Router();

const { UserSchema, insertNewUser, validateUser, getUserById, userIsAdmin, replaceUserById, deleteUserById } = require('../models/user');
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

/*
 * Route for users to login
 */
router.post('/login', async (req, res) => {
    if (req.body && req.body.email && req.body.password) {
        try {
            const userId = await validateUser(req.body.email, req.body.password);
            const token = await generateAuthToken(userId)
            console.log("token: ", token)
            console.log("authenticated: ", userId);
            if (userId > -1) {
                res.status(200).send({
                    token: token
                });
            } else {
                res.status(401).send({
                    error: "Invalid authentication credentials."
                });
            }
        } catch (error) {
            console.error("  -- error:", error);
            res.status(500).send({
                error: "Error logging in.  Try again later."
            });
        }

    } else {
        res.status(400).send({
            error: "Request body needs `email` and `password`."
        });
    }
});

/*
 * Route to insert a new user into the db.
 */
router.post('/', async (req, res) => {
    if (validateAgainstSchema(req.body, UserSchema)) {
        try {
            const id = await insertNewUser(req.body);
            res.status(201).send({
                _id: id
            });
        } catch (error) {
            console.error("Error message: ", error);
            res.status(500).send({
                error: "Error inserting new user"
            });
        }
    } else {
        res.status(400).send({
            error: "Request body does not contain a valid User."
        });
    }
});

/*
 * Route to replace data for a user. Replaces the information with whoever is logged in
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
    var admin = await userIsAdmin(req.user);
    if (parseInt(req.user) !== parseInt(req.params.id) && admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    }
    else {
        if (validateAgainstSchema(req.body, UserSchema)) {
            try {
                const userId = parseInt(req.params.id)
                const updateSuccessful = await replaceUserById(userId, req.body);
                if (updateSuccessful) {
                    res.status(200).send("success");
                } else {
                    next();
                }
            } catch (err) {
                console.error(err);
                res.status(500).send({
                    error: "Unable to update user.  Please try again later."
                });
            }

        }
        else {
            res.status(400).send({
                error: "Request body is not a valid user object"
            });
        }
    }
});

/*
 * Route to delete a user. Only an admin can do so.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    var admin = await userIsAdmin(req.user);
    if (admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    } else {
        try {
            const deleteSuccessful = await deleteUserById(parseInt(req.params.id));
            if (deleteSuccessful) {
                res.status(204).end();
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({
                error: "Unable to delete user.  Please try again later."
            });
        }
    }
});

module.exports = router;