const mysqlPool = require("../lib/mysqlPool");
const { extractValidFields } = require("../lib/validation");

/*
 * Schema describing required/optional fields of a comment object.
 */
const CommentSchema = {
  userid: { required: true },
  recipeid: { required: true },
  comment: { required: true },
  privateComment: { required: false}
};
exports.PhotoSchema = PhotoSchema;

/*
 * Executes a MySQL query to insert a new comment.
 */
// async function insertNewComment(comment) {
//     comment = extractValidFields(comment, CommentSchema);
//     const [result] = await mysqlPool.query("INSERT INTO comments SET ?", comment);
//     return result.insertId;
//   }
//   exports.insertNewComment = insertNewComment;

exports.saveCommentInfo = async function (comment) {
  const db = getDBReference();
  const collection = db.collection('comments');
  const result = await collection.insertOne(comment);
  result.insertedId;
};
exports.getCommentById = getCommentById;

/*
 * Executes a MySQL query to retreive a specified comment by comment ID.
 */
  // async function getCommentById(id) {
  //   const [results] = await mysqlPool.query("SELECT * FROM comments WHERE id = ?", [
  //     id,
  //   ]);
  //   return results[0];
  // }
  // exports.getCommentById = getCommentById;

  exports.getPhotoInfoById = async function (id) {
    const db = getDBReference();
    const collection = db.collection('comments');
    if(!ObjectId.isValid(id)) {
      return null;
    } else {
      const results = await collection.find({ _id: new ObjectId(id)})
        .toArray();
        return results[0];
    }
  };

/*
 * Executes a MySQL query to replace a specified comment with new data.
 */
  // async function replaceCommentById(id, comment) {
  //   comment = extractValidFields(comment, CommentSchema);
  //   const [result] = await mysqlPool.query("UPDATE comments SET ? WHERE id = ?", [
  //     comment,
  //     id,
  //   ]);
  //   return result.affectedRows > 0;
  // }
  // exports.replaceCommentById = replaceCommentById;

  async function replaceCommentById(id, comment) {
    const commentValues = {
      userid: comment.userid,
      recipeid: comment.recipeid,
      comment: comment.comment
    };
    const collection = db.collection('comments');
    const result = await collection.replaceOne(
      { _id: new ObjectID(id) },
      commentValues
    );
    return result.matchedCount > 0;
  }
  exports.replaceCommentById = replaceCommentById;

/*
 * Executes a MySQL query to delete a specified comment by comment ID.
 */
  // async function deleteCommentById(id) {
  //   const [result] = await mysqlPool.query("DELETE FROM comments WHERE id = ?", [
  //     id,
  //   ]);
  //   return result.affectedRows > 0;
  // }
  // exports.deleteCommentById = deleteCommentById;

  async function deleteCommentByID(id) {
    const collection = db.collection('comments');
    const result = await collection.deleteOne({
      _id: new ObjectID(id)
    });
    return result.deletedCount > 0;
  }
  exports.deleteCommentById = deleteCommentById;

// /*
//  * Executes a MySQL query to recieve all comment by recipe ID.
//  */
//   async function getCommentsByRecipeId(id) {
//     const [results] = await mysqlPool.query(
//       "SELECT * FROM comments WHERE recipeid = ?",
//       [id]
//     );
//     return results;
//   }
//   exports.getCommentsByRecipeId = getCommentsByRecipeId;