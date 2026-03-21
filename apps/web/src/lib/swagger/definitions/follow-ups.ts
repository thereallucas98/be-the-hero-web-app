/**
 * @swagger
 * /api/adoptions/{id}/follow-ups:
 *   get:
 *     summary: List follow-ups for an adoption
 *     description: Guardian, workspace OWNER/EDITOR, or ADMIN/SUPER_ADMIN with coverage.
 *     tags: [Follow-ups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Adoption ID
 *     responses:
 *       '200':
 *         description: List of follow-ups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   type: { type: string, enum: [DAYS_30, MONTHS_6, YEAR_1] }
 *                   scheduledAt: { type: string, format: date-time }
 *                   status: { type: string, enum: [PENDING, SUBMITTED, APPROVED] }
 *                   currentSubmission:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       status: { type: string }
 *                       submittedAt: { type: string, format: date-time }
 *                       photoUrl: { type: string }
 *                       message: { type: string, nullable: true }
 *                       reviewNote: { type: string, nullable: true }
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
 * /api/follow-ups/{id}/submissions:
 *   post:
 *     summary: Submit a follow-up (guardian only)
 *     description: Guardian submits photo evidence for a due follow-up. Follow-up must not be APPROVED and must be past scheduledAt.
 *     tags: [Follow-ups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Follow-up ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [photoUrl, storagePath, mimeType, fileSize]
 *             properties:
 *               photoUrl: { type: string, format: uri }
 *               storagePath: { type: string }
 *               mimeType: { type: string }
 *               fileSize: { type: integer, minimum: 1 }
 *               message: { type: string, maxLength: 1000 }
 *           example:
 *             photoUrl: "https://storage.example.com/follow-ups/buddy-30d.jpg"
 *             storagePath: "follow-ups/buddy-30d.jpg"
 *             mimeType: "image/jpeg"
 *             fileSize: 204800
 *             message: "Buddy está ótimo e muito feliz!"
 *     responses:
 *       '201':
 *         description: Submission created
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Follow-up already approved
 *         content:
 *           application/json:
 *             example: { message: "Follow-up is already approved" }
 *       '422':
 *         description: Follow-up is not yet due
 *         content:
 *           application/json:
 *             example: { message: "Follow-up is not yet due" }
 */

/**
 * @swagger
 * /api/admin/follow-up-submissions:
 *   get:
 *     summary: List follow-up submissions (admin)
 *     description: ADMIN or SUPER_ADMIN only. Optionally filter by status or workspaceId.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [SUBMITTED, APPROVED, REJECTED] }
 *       - in: query
 *         name: workspaceId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       '200':
 *         description: Paginated list of submissions
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
 *                       status: { type: string }
 *                       submittedAt: { type: string, format: date-time }
 *                       photoUrl: { type: string }
 *                       message: { type: string, nullable: true }
 *                       followUp:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           type: { type: string }
 *                           scheduledAt: { type: string, format: date-time }
 *                           adoption:
 *                             type: object
 *                             properties:
 *                               id: { type: string, format: uuid }
 *                               workspaceId: { type: string, format: uuid }
 *                               pet:
 *                                 type: object
 *                                 properties:
 *                                   id: { type: string, format: uuid }
 *                                   name: { type: string }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 perPage: { type: integer }
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/follow-up-submissions/{id}/approve:
 *   post:
 *     summary: Approve a follow-up submission (admin)
 *     description: ADMIN or SUPER_ADMIN only. Submission must be in SUBMITTED status.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Submission ID
 *     responses:
 *       '200':
 *         description: Submission approved
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Submission has already been reviewed
 *         content:
 *           application/json:
 *             example: { message: "Submission has already been reviewed" }
 */

/**
 * @swagger
 * /api/admin/follow-up-submissions/{id}/reject:
 *   post:
 *     summary: Reject a follow-up submission (admin)
 *     description: ADMIN or SUPER_ADMIN only. Requires a review note. Guardian may resubmit.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reviewNote]
 *             properties:
 *               reviewNote: { type: string, minLength: 1, maxLength: 1000 }
 *           example:
 *             reviewNote: "Foto muito escura, por favor reenviar com melhor iluminação."
 *     responses:
 *       '200':
 *         description: Submission rejected; follow-up returns to PENDING
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Submission has already been reviewed
 *         content:
 *           application/json:
 *             example: { message: "Submission has already been reviewed" }
 */

/**
 * @swagger
 * /api/me/adoptions:
 *   get:
 *     summary: List my adoptions (guardian)
 *     description: Returns paginated adoptions for the authenticated guardian, with pet info and follow-up statuses.
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
 *         description: Paginated list of adoptions
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
 *                       adoptedAt: { type: string, format: date-time }
 *                       status: { type: string }
 *                       notes: { type: string, nullable: true }
 *                       pet:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           name: { type: string }
 *                           species: { type: string }
 *                           coverImage:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               url: { type: string }
 *                       followUps:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id: { type: string, format: uuid }
 *                             type: { type: string }
 *                             scheduledAt: { type: string, format: date-time }
 *                             status: { type: string }
 *                             currentSubmission:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 status: { type: string }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 perPage: { type: integer }
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
