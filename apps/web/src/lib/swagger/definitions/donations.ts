/**
 * @swagger
 * /api/campaigns/{id}/donations:
 *   post:
 *     summary: Register a donation
 *     description: Registers a donation for an APPROVED campaign. Any authenticated user can donate.
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, paymentMethod, proofUrl, storagePath, mimeType, fileSize]
 *             properties:
 *               amount: { type: number, minimum: 0 }
 *               currency: { type: string, default: BRL }
 *               paymentMethod: { type: string, enum: [PIX, TRANSFER, OTHER] }
 *               proofUrl: { type: string, format: uri }
 *               storagePath: { type: string }
 *               mimeType: { type: string }
 *               fileSize: { type: integer }
 *           example:
 *             amount: 100
 *             paymentMethod: "PIX"
 *             proofUrl: "https://storage.example.com/comprovante.jpg"
 *             storagePath: "/donations/comprovante.jpg"
 *             mimeType: "image/jpeg"
 *             fileSize: 2048
 *     responses:
 *       '201':
 *         description: Donation registered with PENDING_REVIEW status
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Campaign is not in APPROVED status
 *   get:
 *     summary: List campaign donations
 *     description: Lists donations for a campaign. Requires workspace membership (OWNER, EDITOR, FINANCIAL, ADMIN) or ADMIN/SUPER_ADMIN role.
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING_REVIEW, APPROVED, REJECTED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       '200':
 *         description: Paginated list of donations
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/admin/donations:
 *   get:
 *     summary: List all donations (admin)
 *     description: Returns all donations across all campaigns. ADMIN or SUPER_ADMIN only.
 *     tags: [Donations]
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: workspaceId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: userId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING_REVIEW, APPROVED, REJECTED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       '200':
 *         description: Paginated list of donations
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/donations/{id}/approve:
 *   post:
 *     summary: Approve a donation
 *     description: Transitions a PENDING_REVIEW donation to APPROVED and increments the campaign's currentAmount. ADMIN or SUPER_ADMIN only.
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Donation approved and campaign currentAmount updated
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Donation is not in PENDING_REVIEW status
 */

/**
 * @swagger
 * /api/admin/donations/{id}/reject:
 *   post:
 *     summary: Reject a donation
 *     description: Transitions a PENDING_REVIEW donation to REJECTED with a review note. ADMIN or SUPER_ADMIN only.
 *     tags: [Donations]
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
 *             reviewNote: "Comprovante ilegível. Envie novamente."
 *     responses:
 *       '200':
 *         description: Donation rejected
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Donation is not in PENDING_REVIEW status
 */
