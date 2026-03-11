/**
 * @swagger
 * /api/admin/pets/{id}/approve:
 *   post:
 *     summary: Approve a pet
 *     description: SUPER_ADMIN or ADMIN with city coverage. Pet must be in PENDING_REVIEW.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *     responses:
 *       '200':
 *         description: Pet approved
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Pet is not in PENDING_REVIEW or does not meet requirements
 */

/**
 * @swagger
 * /api/admin/pets/{id}/reject:
 *   post:
 *     summary: Reject a pet
 *     description: SUPER_ADMIN or ADMIN with city coverage. reviewNote is required.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reviewNote]
 *             properties:
 *               reviewNote: { type: string }
 *           example:
 *             reviewNote: "Missing required vaccination records"
 *     responses:
 *       '200':
 *         description: Pet rejected
 *       '400':
 *         description: reviewNote is missing
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
