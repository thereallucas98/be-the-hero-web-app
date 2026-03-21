/**
 * @swagger
 * /api/geo/states:
 *   get:
 *     summary: List states
 *     description: Returns all STATE-type geo places, optionally filtered by parent country. No auth required.
 *     tags: [Geo]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: countryId
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Filter by parent country ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       '200':
 *         description: Array of states
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   name: { type: string }
 *                   code: { type: string, nullable: true }
 *                   slug: { type: string }
 *             example:
 *               - id: "550e8400-e29b-41d4-a716-446655440001"
 *                 name: "Paraíba"
 *                 code: "PB"
 *                 slug: "paraiba-pb"
 *       '400':
 *         description: Invalid countryId (not a UUID)
 */

/**
 * @swagger
 * /api/geo/cities:
 *   get:
 *     summary: List cities
 *     description: Returns all CITY-type geo places, optionally filtered by parent state. No auth required.
 *     tags: [Geo]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: stateId
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Filter by parent state ID
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       '200':
 *         description: Array of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   name: { type: string }
 *                   slug: { type: string }
 *             example:
 *               - id: "550e8400-e29b-41d4-a716-446655440010"
 *                 name: "João Pessoa"
 *                 slug: "joao-pessoa-pb"
 *               - id: "550e8400-e29b-41d4-a716-446655440011"
 *                 name: "Campina Grande"
 *                 slug: "campina-grande-pb"
 *       '400':
 *         description: Invalid stateId (not a UUID)
 */
