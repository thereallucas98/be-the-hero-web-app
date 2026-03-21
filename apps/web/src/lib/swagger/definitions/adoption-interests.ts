/**
 * @swagger
 * /api/me/interests:
 *   get:
 *     summary: List my adoption interests (guardian)
 *     description: Returns a paginated list of adoption interests submitted by the authenticated user.
 *     tags: [Me]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10, maximum: 20 }
 *     responses:
 *       '200':
 *         description: Paginated list of interests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       message: { type: string, nullable: true }
 *                       channel: { type: string, example: WHATSAPP }
 *                       createdAt: { type: string, format: date-time }
 *                       pet:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           name: { type: string }
 *                           species: { type: string }
 *                           sex: { type: string }
 *                           size: { type: string }
 *                           ageCategory: { type: string }
 *                           coverImage:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               url: { type: string }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 perPage: { type: integer }
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/pets/{id}/interests/{interestId}:
 *   delete:
 *     summary: Withdraw an adoption interest (guardian)
 *     description: Guardian withdraws their own adoption interest. Interest row is deleted permanently.
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Pet ID
 *       - in: path
 *         name: interestId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Interest ID
 *     responses:
 *       '204':
 *         description: Interest withdrawn
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/workspaces/{id}/interests/{interestId}/convert:
 *   post:
 *     summary: Convert interest to adoption (workspace OWNER/EDITOR)
 *     description: Workspace OWNER or EDITOR converts a guardian's adoption interest into a formal adoption. Re-validates pet status. Creates 3 follow-ups. Deletes the interest on success.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Workspace ID
 *       - in: path
 *         name: interestId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Interest ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string, maxLength: 1000 }
 *               adoptedAt: { type: string, format: date-time }
 *           example:
 *             notes: "Adoção confirmada presencialmente"
 *             adoptedAt: "2026-03-21T10:00:00.000Z"
 *     responses:
 *       '201':
 *         description: Adoption created; interest deleted
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Pet already adopted, not approved, or workspace inactive
 *         content:
 *           application/json:
 *             example: { message: "Pet has already been adopted" }
 */

/**
 * @swagger
 * /api/workspaces/{id}/interests/{interestId}:
 *   delete:
 *     summary: Dismiss an adoption interest (workspace OWNER/EDITOR)
 *     description: Workspace OWNER or EDITOR removes an interest without creating an adoption. Interest row is deleted permanently.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Workspace ID
 *       - in: path
 *         name: interestId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Interest ID
 *     responses:
 *       '204':
 *         description: Interest dismissed
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
