declare const router: import("@types/express-serve-static-core").Router;
/**
 * @swagger
 * /api/notes/{id}/collaborators/{collaboratorId}:
 *   delete:
 *     summary: Remove a collaborator from a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: collaboratorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaborator removed successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Note not found
 */
export default router;
