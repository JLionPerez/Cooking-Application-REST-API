const router = require("express").Router();

const { requireAuthentication } = require("../lib/auth");
const { validateAgainstSchema } = require("../lib/validation");
const {
  CommentSchema,
  insertNewComment,
  getCommentById,
  replaceCommentById,
  deleteCommentById,
} = require("../models/comment");

/*
 * Route to create a new comment.
 */
router.post("/", requireAuthentication, async (req, res) => {
    if (validateAgainstSchema(req.body, CommentSchema)) {
      try {
        const id = await insertNewComment(req.body);
        res.status(201).send({
          id: id,
          userid: userid,
          recipeid: recipeid,
          comment: comment,
          links: {
            comments: `/comment/${id}`,
            recipe: `/recipes/${req.body.recipeid}`,
          },
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting comment into DB.  Please try again later.",
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid comment object",
      });
    }
  });

/*
 * Route to fetch info about a specific comment.
 */
  router.get("/:id", async (req, res, next) => {
    try {
      const comment = await getCommentById(parseInt(req.params.id));
      if (comment) {
        res.status(200).send(comment);
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch comment.  Please try again later.",
      });
    }
  });

/*
 * Route to update a comment.
 */
  router.put("/:id", requireAuthentication, async (req, res, next) => {
    if (validateAgainstSchema(req.body, commentSchema)) {
      try {
        /*
         * Make sure the updated comment has the same recipeID and userID as
         * the existing comment.  If it doesn't, respond with a 403 error.  If the
         * comment doesn't already exist, respond with a 404 error.
         */
        const id = parseInt(req.params.id);
        const existingcomment = await getCommentById(id);
        if (existingcomment) {
          if (
            req.body.recipeid === existingcomment.recipeid &&
            req.body.userid === existingcomment.userid
          ) {
            const updateSuccessful = await replaceCommentById(id, req.body);
            if (updateSuccessful) {
              res.status(200).send({
                links: {
                  recipe: `/recipes/${req.body.recipeid}`,
                  comments: `/comments/${id}`,
                },
              });
            } else {
              next();
            }
          } else {
            res.status(403).send({
              error: "Updated comment must have the same recipeID and userID",
            });
          }
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update comment.  Please try again later.",
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid comment object.",
      });
    }
  });

/*
 * Route to delete a comment.
 */
router.delete("/:id", requireAuthentication, async (req, res, next) => {
    try {
      const deleteSuccessful = await deleteCommentById(parseInt(req.params.id));
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to delete comment.  Please try again later.",
      });
    }
  });
  
  module.exports = router;
