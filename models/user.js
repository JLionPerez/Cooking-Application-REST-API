/*
 * User schema and data accessor methods.
 */
const bcrypt = require('bcryptjs');
const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema for a User.
 */
const UserSchema = {
    email: { required: true },
    password: { required: true },
    admin: { required: true },
};
exports.UserSchema = UserSchema;

/*
 * Insert a new User into the DB.
 */
async function insertNewUser(user) {
    const userToInsert = extractValidFields(user, UserSchema);
    userToInsert.password = await bcrypt.hash(userToInsert.password, 8);

    const [result] = await mysqlPool.query("INSERT INTO users SET ?", userToInsert);
    return result.insertId;
};
exports.insertNewUser = insertNewUser;

/*
 * Fetch a user from the DB based on email.
 */
async function getUserByEmail(email) {
    const [results] = await mysqlPool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return results;
};
exports.getUserByEmail = getUserByEmail;

/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserById(id) {
    const [results] = await mysqlPool.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
    );
    results[0].password = null;
    return results;
};
exports.getUserById = getUserById;

/*
 * Validate user exists.
 */
async function validateUser(email, password) {
    const user = await getUserByEmail(email);
    console.log("USER: ", user);
    console.log("USER password: ", user[0].password);
    if (user && await bcrypt.compare(password, user[0].password)) {
        return user[0].id;
    }
    else {
        return -1;
    }
}
exports.validateUser = validateUser;

/*
 * Check if user is an admin. If user is an admin, then return 1 otherwise return 0
 */
async function userIsAdmin(id) {
    const user = await getUserById(id);
    console.log("USER: ", user);
    console.log("user[0].admin: ", user[0].admin);
    return parseInt(user[0].admin);
}
exports.userIsAdmin = userIsAdmin;

/*
 * Function to update a users info
 */
async function replaceUserById(id, user) {
    user = extractValidFields(user, UserSchema);
    console.log("user pass before = ", user.password);
    user.password = await bcrypt.hash(user.password, 8);
    console.log("user pass after = ", user.password);
    console.log("id = ", id);
    const [result] = await mysqlPool.query(
        'UPDATE users SET ? WHERE id = ?',
        [user, id]
    );
    //return result.affectedRows > 0;
    return 1;
}
exports.replaceUserById = replaceUserById;

/*
 * Function delete a user from the DB by their ID
 */
async function deleteUserById(id) {
    const [result] = await mysqlPool.query(
        'DELETE FROM users WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}
exports.deleteUserById = deleteUserById;