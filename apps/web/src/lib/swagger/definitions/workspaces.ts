/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a workspace
 *     description: PARTNER_MEMBER only. Creates a new organization.
 *     tags: [Workspaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, description]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [ONG, CLINIC, PETSHOP, INDEPENDENT] }
 *               description: { type: string }
 *               phone: { type: string }
 *               whatsapp: { type: string }
 *               emailPublic: { type: string, format: email }
 *               website: { type: string }
 *               instagram: { type: string }
 *           example:
 *             name: "Happy Paws ONG"
 *             type: "ONG"
 *             description: "Responsible pet adoption shelter"
 *             phone: "+5511999999999"
 *             whatsapp: "+5511999999999"
 *             emailPublic: "contact@happypaws.org"
 *     responses:
 *       '201':
 *         description: Workspace created
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/workspaces/my:
 *   get:
 *     summary: List my workspaces
 *     tags: [Workspaces]
 *     responses:
 *       '200':
 *         description: List of workspaces the user belongs to
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/workspaces/{id}:
 *   get:
 *     summary: Get workspace details
 *     description: RBAC — member, ADMIN with coverage, or SUPER_ADMIN.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: membersPage
 *         schema: { type: integer, default: 1 }
 *         example: 1
 *       - in: query
 *         name: membersPerPage
 *         schema: { type: integer, default: 20 }
 *         example: 20
 *     responses:
 *       '200':
 *         description: Workspace details
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *   patch:
 *     summary: Update workspace
 *     description: OWNER/EDITOR, ADMIN with coverage, or SUPER_ADMIN.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               phone: { type: string }
 *               whatsapp: { type: string }
 *               emailPublic: { type: string, format: email }
 *               website: { type: string }
 *               instagram: { type: string }
 *           example:
 *             name: "Happy Paws ONG"
 *             description: "Updated description"
 *             phone: "+5511999999999"
 *     responses:
 *       '200':
 *         description: Workspace updated
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Deactivate workspace
 *     description: >
 *       OWNER only. Soft-deletes the workspace (isActive = false).
 *       Blocked if workspace has active adoptions with pending follow-ups.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       '200':
 *         description: Workspace deactivated
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '409':
 *         description: Workspace has active adoptions with pending follow-ups
 *         content:
 *           application/json:
 *             example: { code: 'HAS_ACTIVE_ADOPTIONS' }
 */

/**
 * @swagger
 * /api/workspaces/{id}/location:
 *   patch:
 *     summary: Update workspace location
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cityPlaceId, lat, lng]
 *             properties:
 *               cityPlaceId: { type: string, format: uuid }
 *               addressLine: { type: string }
 *               neighborhood: { type: string }
 *               zipCode: { type: string }
 *               lat: { type: number }
 *               lng: { type: number }
 *           example:
 *             cityPlaceId: "550e8400-e29b-41d4-a716-446655440001"
 *             addressLine: "Rua das Flores, 123"
 *             neighborhood: "Centro"
 *             zipCode: "01310-100"
 *             lat: -23.5505
 *             lng: -46.6333
 *     responses:
 *       '200':
 *         description: Location updated
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/workspaces/{id}/members:
 *   post:
 *     summary: Add a member
 *     description: OWNER only. Invite by email with a role.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [OWNER, EDITOR, FINANCIAL] }
 *           example:
 *             email: "jane@example.com"
 *             role: "EDITOR"
 *     responses:
 *       '201':
 *         description: Member added
 *       '409':
 *         description: User is already a member
 *         content:
 *           application/json:
 *             example: { code: 'ALREADY_MEMBER' }
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/workspaces/{id}/members/{memberId}:
 *   patch:
 *     summary: Update member role
 *     description: OWNER only. Cannot update own role.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440002"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [OWNER, EDITOR, FINANCIAL] }
 *           example:
 *             role: "FINANCIAL"
 *     responses:
 *       '200':
 *         description: Role updated
 *       '400':
 *         description: Cannot update own role
 *         content:
 *           application/json:
 *             example: { code: 'CANNOT_UPDATE_OWN_ROLE' }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Remove a member
 *     description: OWNER only. Cannot remove the last OWNER.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       '204':
 *         description: Member removed
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/workspaces/{id}/city-coverage:
 *   get:
 *     summary: List city coverage
 *     description: OWNER or EDITOR can list cities the workspace covers.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       '200':
 *         description: Coverage list
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *   post:
 *     summary: Add city coverage
 *     description: OWNER only. Adds a city to the workspace's service area.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cityPlaceId]
 *             properties:
 *               cityPlaceId: { type: string, format: uuid }
 *           example:
 *             cityPlaceId: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       '201':
 *         description: City added
 *       '409':
 *         description: City already in coverage
 *         content:
 *           application/json:
 *             example: { code: 'ALREADY_EXISTS' }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/workspaces/{id}/city-coverage/{coverageId}:
 *   delete:
 *     summary: Remove city coverage
 *     description: OWNER only.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: coverageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440003"
 *     responses:
 *       '200':
 *         description: City removed
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/workspaces/{id}/interests:
 *   get:
 *     summary: List adoption interests
 *     description: OWNER/EDITOR, SUPER_ADMIN, or ADMIN with coverage.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         example: 1
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20 }
 *         example: 20
 *     responses:
 *       '200':
 *         description: Interest list
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/workspaces/{id}/pets:
 *   post:
 *     summary: Register a pet
 *     description: OWNER/EDITOR. Initial status is DRAFT.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, species, sex, size, ageCategory, description]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               species: { type: string, enum: [DOG, CAT, RABBIT, BIRD, HORSE, COW, GOAT, PIG, TURTLE, OTHER] }
 *               sex: { type: string, enum: [MALE, FEMALE] }
 *               size: { type: string, enum: [SMALL, MEDIUM, LARGE] }
 *               ageCategory: { type: string, enum: [PUPPY, YOUNG, ADULT, SENIOR] }
 *               energyLevel: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               independenceLevel: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               environment: { type: string, enum: [HOUSE, APARTMENT, BOTH] }
 *           example:
 *             name: "Buddy"
 *             description: "Friendly golden retriever looking for a loving home"
 *             species: "DOG"
 *             sex: "MALE"
 *             size: "LARGE"
 *             ageCategory: "ADULT"
 *             energyLevel: "HIGH"
 *             independenceLevel: "MEDIUM"
 *             environment: "HOUSE"
 *     responses:
 *       '201':
 *         description: Pet created
 *       '401':
 *       '403':
 *       '404':
 */
