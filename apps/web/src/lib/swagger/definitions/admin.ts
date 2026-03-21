/**
 * @swagger
 * /api/admin/coverage:
 *   get:
 *     summary: List admin city coverage
 *     description: ADMIN sees own coverage. SUPER_ADMIN can filter by adminUserId.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: adminUserId
 *         schema: { type: string, format: uuid }
 *         description: Filter by admin user (SUPER_ADMIN only)
 *     responses:
 *       '200':
 *         description: List of coverage entries
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     summary: Add city coverage to an admin user
 *     description: SUPER_ADMIN only. Target user must have ADMIN role and city must exist.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adminUserId, cityId]
 *             properties:
 *               adminUserId: { type: string, format: uuid }
 *               cityId: { type: string, format: uuid }
 *           example:
 *             adminUserId: "550e8400-e29b-41d4-a716-446655440001"
 *             cityId: "550e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       '201':
 *         description: Coverage entry created
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         description: Admin user or city not found
 *       '409':
 *         description: Coverage already exists for this admin/city combination
 */

/**
 * @swagger
 * /api/admin/coverage/{id}:
 *   delete:
 *     summary: Remove admin city coverage
 *     description: SUPER_ADMIN only.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '204':
 *         description: Coverage removed
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/admin/workspaces:
 *   get:
 *     summary: List workspaces for admin review
 *     description: ADMIN or SUPER_ADMIN. Filter by verificationStatus.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: verificationStatus
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       '200':
 *         description: Paginated workspace list
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/workspaces/{id}/approve:
 *   post:
 *     summary: Approve a workspace
 *     description: ADMIN or SUPER_ADMIN. Workspace must be in PENDING status.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Workspace approved
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Workspace is not in PENDING status
 */

/**
 * @swagger
 * /api/admin/workspaces/{id}/reject:
 *   post:
 *     summary: Reject a workspace
 *     description: ADMIN or SUPER_ADMIN. reviewNote is required. Workspace must be in PENDING status.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reviewNote]
 *             properties:
 *               reviewNote: { type: string, maxLength: 1000 }
 *           example:
 *             reviewNote: "Documentação incompleta"
 *     responses:
 *       '200':
 *         description: Workspace rejected
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Workspace is not in PENDING status
 */

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: List audit logs
 *     description: SUPER_ADMIN only. Supports filtering by actorId, entityType, action, and date range.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: actorId
 *         schema: { type: string, format: uuid }
 *         description: Filter by the user who performed the action
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [PARTNER_WORKSPACE, PET, PET_IMAGE, ADOPTION_INTEREST, CAMPAIGN, CAMPAIGN_DOCUMENT, DONATION, ADOPTION, FOLLOW_UP, FOLLOW_UP_SUBMISSION, USER]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, SUBMIT_FOR_REVIEW, APPROVE, REJECT, STATUS_CHANGE]
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *         description: ISO 8601 date-time lower bound (inclusive)
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *         description: ISO 8601 date-time upper bound (inclusive)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       '200':
 *         description: Paginated audit log entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       actorUserId: { type: string, format: uuid }
 *                       action: { type: string }
 *                       entityType: { type: string }
 *                       entityId: { type: string }
 *                       metadata: { type: object, nullable: true }
 *                       createdAt: { type: string, format: date-time }
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
