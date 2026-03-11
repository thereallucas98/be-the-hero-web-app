/**
 * @swagger
 * /api/adoptions:
 *   post:
 *     summary: Register an adoption
 *     description: OWNER/EDITOR, SUPER_ADMIN, or ADMIN with coverage. Pet must be APPROVED.
 *     tags: [Adoptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [petId, guardianUserId, workspaceId, adoptedAt]
 *             properties:
 *               petId: { type: string, format: uuid }
 *               guardianUserId: { type: string, format: uuid }
 *               workspaceId: { type: string, format: uuid }
 *               adoptedAt: { type: string, format: date-time }
 *               notes: { type: string }
 *           example:
 *             petId: "550e8400-e29b-41d4-a716-446655440010"
 *             guardianUserId: "550e8400-e29b-41d4-a716-446655440030"
 *             workspaceId: "550e8400-e29b-41d4-a716-446655440000"
 *             adoptedAt: "2026-03-11T10:00:00.000Z"
 *             notes: "Adopted at shelter event"
 *     responses:
 *       '201':
 *         description: Adoption registered
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         description: Pet or guardian not found
 *       '409':
 *         description: Pet already adopted or inactive
 */

/**
 * @swagger
 * /api/adoptions/{id}:
 *   get:
 *     summary: Get adoption details
 *     description: Guardian, OWNER/EDITOR of the workspace, SUPER_ADMIN, or ADMIN with coverage.
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440040"
 *     responses:
 *       '200':
 *         description: Adoption details (pet, guardian, workspace, follow-ups)
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
