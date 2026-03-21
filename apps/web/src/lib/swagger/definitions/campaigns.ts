/**
 * @swagger
 * /api/workspaces/{id}/campaigns:
 *   post:
 *     summary: Create a campaign
 *     description: Creates a new fundraising campaign for a workspace. Requires OWNER or EDITOR role in the workspace, or SUPER_ADMIN.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, goalAmount]
 *             properties:
 *               title: { type: string, minLength: 3, maxLength: 200 }
 *               description: { type: string, minLength: 10, maxLength: 2000 }
 *               goalAmount: { type: number, minimum: 0 }
 *               currency: { type: string, default: BRL }
 *               petId: { type: string, format: uuid }
 *           example:
 *             title: "Cirurgia do Rex"
 *             description: "Campanha para custear a cirurgia do Rex, labrador de 3 anos."
 *             goalAmount: 1500
 *     responses:
 *       '201':
 *         description: Campaign created
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Workspace is not active or not approved
 *   get:
 *     summary: List workspace campaigns
 *     description: Lists campaigns for a workspace. Requires OWNER, EDITOR, FINANCIAL, ADMIN membership, or ADMIN/SUPER_ADMIN role.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PENDING_REVIEW, APPROVED, REJECTED, CLOSED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       '200':
 *         description: Paginated list of campaigns
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     description: Returns campaign details. APPROVED campaigns are public. Others require workspace membership or ADMIN role.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Campaign detail
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *   patch:
 *     summary: Update a campaign
 *     description: Updates a DRAFT campaign. Requires OWNER or EDITOR role in the workspace, or SUPER_ADMIN.
 *     tags: [Campaigns]
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
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               goalAmount: { type: number }
 *               coverImageUrl: { type: string, format: uri, nullable: true }
 *     responses:
 *       '200':
 *         description: Updated campaign
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Campaign is not in DRAFT status
 */

/**
 * @swagger
 * /api/campaigns/{id}/submit-for-review:
 *   post:
 *     summary: Submit campaign for review
 *     description: Transitions a DRAFT campaign to PENDING_REVIEW. Requires at least one document. OWNER or EDITOR role required.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Campaign submitted for review
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Campaign is not in DRAFT status, or has no documents
 */

/**
 * @swagger
 * /api/campaigns/{id}/documents:
 *   post:
 *     summary: Add document to campaign
 *     description: Adds a supporting document to a DRAFT campaign. Requires OWNER or EDITOR role.
 *     tags: [Campaigns]
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
 *             required: [type, title, description, fileUrl, storagePath, mimeType, fileSize]
 *             properties:
 *               type: { type: string, enum: [MEDICAL_REPORT, COST_ESTIMATE, INVOICE, PHOTO_EVIDENCE, OTHER] }
 *               title: { type: string }
 *               description: { type: string }
 *               fileUrl: { type: string, format: uri }
 *               storagePath: { type: string }
 *               mimeType: { type: string }
 *               fileSize: { type: integer }
 *     responses:
 *       '201':
 *         description: Document added
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Campaign is not in DRAFT status
 */

/**
 * @swagger
 * /api/campaigns/{id}/documents/{docId}:
 *   delete:
 *     summary: Remove document from campaign
 *     description: Removes a document from a DRAFT campaign. Requires OWNER or EDITOR role.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: docId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '204':
 *         description: Document removed
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Campaign is not in DRAFT status
 */

/**
 * @swagger
 * /api/admin/campaigns:
 *   get:
 *     summary: List all campaigns (admin)
 *     description: Returns all campaigns across all workspaces. ADMIN or SUPER_ADMIN only.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PENDING_REVIEW, APPROVED, REJECTED, CLOSED] }
 *       - in: query
 *         name: workspaceId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       '200':
 *         description: Paginated list of campaigns
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/campaigns/{id}/approve:
 *   post:
 *     summary: Approve a campaign
 *     description: Transitions a PENDING_REVIEW campaign to APPROVED. ADMIN or SUPER_ADMIN only.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Campaign approved
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Campaign is not in PENDING_REVIEW status
 */

/**
 * @swagger
 * /api/admin/campaigns/{id}/reject:
 *   post:
 *     summary: Reject a campaign
 *     description: Transitions a PENDING_REVIEW campaign to REJECTED with a review note. ADMIN or SUPER_ADMIN only.
 *     tags: [Campaigns]
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
 *               reviewNote: { type: string, minLength: 1, maxLength: 1000 }
 *           example:
 *             reviewNote: "Documentação insuficiente para análise."
 *     responses:
 *       '200':
 *         description: Campaign rejected
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Campaign is not in PENDING_REVIEW status
 */
