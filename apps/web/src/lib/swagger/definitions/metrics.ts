/**
 * @swagger
 * /api/workspaces/{id}/metrics:
 *   get:
 *     summary: Get workspace metrics
 *     description: Returns aggregated metrics for a workspace — pet counts by status, views, WhatsApp clicks, interests, adoptions, and donations raised. RBAC: workspace members (OWNER/EDITOR/FINANCIAL) or ADMIN/SUPER_ADMIN.
 *     tags: [Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Workspace metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPets: { type: integer }
 *                 petsByStatus:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                   description: Count of pets per status (DRAFT, APPROVED, REJECTED, etc.)
 *                 totalViews: { type: integer }
 *                 totalWhatsappClicks: { type: integer }
 *                 totalInterests: { type: integer }
 *                 totalAdoptions: { type: integer }
 *                 totalDonationsRaised: { type: string, description: "Sum of approved donations (serialized Decimal)" }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/pets/{id}/metrics:
 *   get:
 *     summary: Get pet metrics
 *     description: Returns per-pet metrics — views, WhatsApp clicks, interest count, and adoption info. RBAC: workspace members or ADMIN/SUPER_ADMIN.
 *     tags: [Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Pet metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views: { type: integer }
 *                 whatsappClicks: { type: integer }
 *                 interestCount: { type: integer }
 *                 petStatus: { type: string }
 *                 adoptionId: { type: string, format: uuid, nullable: true }
 *                 adoptedAt: { type: string, format: date-time, nullable: true }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/admin/metrics:
 *   get:
 *     summary: Get platform metrics
 *     description: Platform-wide aggregated metrics. Filters by cityId (workspace location) and date range. RBAC: ADMIN or SUPER_ADMIN.
 *     tags: [Metrics]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         schema: { type: string, format: uuid }
 *         description: Scope metrics to workspaces located in this city
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *     responses:
 *       '200':
 *         description: Platform metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPets: { type: integer }
 *                 petsByStatus:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                 totalAdoptions: { type: integer }
 *                 totalCampaigns: { type: integer }
 *                 campaignsByStatus:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                 totalDonationsRaised: { type: string, description: "Sum of approved donations (serialized Decimal)" }
 *                 totalActiveWorkspaces: { type: integer }
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 */
