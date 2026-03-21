/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: List public pets
 *     description: Lists APPROVED active pets. Public — no auth required.
 *     tags: [Pets]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: cityPlaceId
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *       - in: query
 *         name: species
 *         schema: { type: string, enum: [DOG, CAT, RABBIT, BIRD, HORSE, COW, GOAT, PIG, TURTLE, OTHER] }
 *         example: "DOG"
 *       - in: query
 *         name: sex
 *         schema: { type: string, enum: [MALE, FEMALE] }
 *         example: "MALE"
 *       - in: query
 *         name: size
 *         schema: { type: string, enum: [SMALL, MEDIUM, LARGE] }
 *         example: "MEDIUM"
 *       - in: query
 *         name: ageCategory
 *         schema: { type: string, enum: [PUPPY, YOUNG, ADULT, SENIOR] }
 *         example: "ADULT"
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
 *         description: Paginated pet list
 */

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     summary: Get public pet detail
 *     description: Returns full pet detail for APPROVED active pets. Public — no auth required.
 *     tags: [Pets]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *     responses:
 *       '200':
 *         description: Pet detail including images, requirements, and workspace
 *       '400':
 *         description: Invalid UUID
 *       '404':
 *         description: Pet not found or not APPROVED
 *   patch:
 *     summary: Update pet
 *     description: OWNER/EDITOR. Blocked if pet status is ADOPTED.
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *             name: "Buddy Updated"
 *             description: "Even friendlier now"
 *             ageCategory: "SENIOR"
 *     responses:
 *       '200':
 *         description: Pet updated
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/pets/{id}/submit-for-review:
 *   post:
 *     summary: Submit pet for review
 *     description: Transitions DRAFT → PENDING_REVIEW. Requires 1–5 images with 1 cover.
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *     responses:
 *       '200':
 *         description: Pet submitted for review
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 *       '409':
 */

/**
 * @swagger
 * /api/pets/{id}/images:
 *   post:
 *     summary: Add image to pet
 *     description: Max 5 images. Position 1–5. One must be isCover.
 *     tags: [Pets]
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
 *             required: [url, storagePath, position]
 *             properties:
 *               url: { type: string }
 *               storagePath: { type: string }
 *               position: { type: integer, minimum: 1, maximum: 5 }
 *               isCover: { type: boolean }
 *           example:
 *             url: "https://storage.example.com/pets/abc123/photo1.jpg"
 *             storagePath: "pets/abc123/photo1.jpg"
 *             position: 1
 *             isCover: true
 *     responses:
 *       '201':
 *         description: Image added
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/pets/{id}/images/{imageId}:
 *   patch:
 *     summary: Update image position or cover flag
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440020"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position: { type: integer, minimum: 1, maximum: 5 }
 *               isCover: { type: boolean }
 *           example:
 *             position: 2
 *             isCover: false
 *     responses:
 *       '200':
 *         description: Image updated
 *       '401':
 *       '403':
 *       '404':
 *   delete:
 *     summary: Remove image
 *     description: If cover is removed, the next image becomes cover. Cannot remove last image when PENDING_REVIEW.
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440020"
 *     responses:
 *       '204':
 *         description: Image removed
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/pets/{id}/interests:
 *   post:
 *     summary: Register adoption interest
 *     description: GUARDIAN only. Optional message.
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string }
 *           example:
 *             message: "I would love to adopt Buddy! I have a big yard."
 *     responses:
 *       '201':
 *         description: Interest registered
 *       '401':
 *       '403':
 *       '404':
 *       '409':
 */

/**
 * @swagger
 * /api/pets/{id}/requirements:
 *   post:
 *     summary: Add adoption requirement to pet
 *     description: OWNER or EDITOR of the pet's workspace.
 *     tags: [Pets]
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
 *             required: [category, title, order]
 *             properties:
 *               category: { type: string, enum: [HOME, EXPERIENCE, TIME_AVAILABILITY, FINANCIAL, SAFETY, HEALTH_CARE, OTHER] }
 *               title: { type: string, minLength: 3, maxLength: 100 }
 *               description: { type: string, maxLength: 500 }
 *               isMandatory: { type: boolean, default: true }
 *               order: { type: integer, minimum: 1 }
 *           example:
 *             category: "HOME"
 *             title: "Ter espaço ao ar livre"
 *             description: "O adotante precisa ter quintal ou acesso a área verde."
 *             isMandatory: true
 *             order: 1
 *     responses:
 *       '201':
 *         description: Requirement created
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 *       '409':
 *         description: Order conflict — order already taken for this pet
 */

/**
 * @swagger
 * /api/pets/{id}/requirements/{reqId}:
 *   patch:
 *     summary: Update adoption requirement
 *     description: OWNER or EDITOR of the pet's workspace.
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *       - in: path
 *         name: reqId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440030"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category: { type: string, enum: [HOME, EXPERIENCE, TIME_AVAILABILITY, FINANCIAL, SAFETY, HEALTH_CARE, OTHER] }
 *               title: { type: string }
 *               description: { type: string }
 *               isMandatory: { type: boolean }
 *               order: { type: integer, minimum: 1 }
 *           example:
 *             isMandatory: false
 *             order: 2
 *     responses:
 *       '200':
 *         description: Requirement updated
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 *       '409':
 *   delete:
 *     summary: Remove adoption requirement
 *     description: OWNER or EDITOR of the pet's workspace.
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *       - in: path
 *         name: reqId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "550e8400-e29b-41d4-a716-446655440030"
 *     responses:
 *       '204':
 *         description: Requirement removed
 *       '401':
 *       '403':
 *       '404':
 */

/**
 * @swagger
 * /api/pets/{id}/track:
 *   post:
 *     summary: Track metric event on a pet
 *     description: Records a metric event (VIEW_PET, CLICK_WHATSAPP, REGISTER_INTEREST). No auth required. Only works for APPROVED pets.
 *     tags: [Pets]
 *     security: []
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
 *             required: [type]
 *             properties:
 *               type: { type: string, enum: [VIEW_PET, CLICK_WHATSAPP, REGISTER_INTEREST] }
 *           example:
 *             type: "VIEW_PET"
 *     responses:
 *       '204':
 *         description: Event recorded
 *       '400':
 *       '404':
 *         description: Pet not found or not APPROVED
 */
