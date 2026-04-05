# TODO: F1.4 Pet Detail

**Date**: 2026-04-05
**Status**: IN_PROGRESS

## Checklist

### Step 1: PetDetailClient
- [ ] 1.1 Create `pet-detail-client.tsx` with VIEW_PET useEffect
- [ ] 1.2 WhatsApp <a> with CLICK_WHATSAPP onClick tracker
- [ ] 1.3 "Quero adotar" button — unauthenticated redirect
- [ ] 1.4 "Quero adotar" button — guardian API call + toast + submitted state
- [ ] 1.5 "Quero adotar" button — non-guardian disabled + title

### Step 2: Page updates
- [ ] 2.1 Add getServerPrincipal() to Promise.all
- [ ] 2.2 Add independenceLevel, ageCategory, sex label maps
- [ ] 2.3 Render second attribute card row
- [ ] 2.4 Replace static WhatsApp CTA with <PetDetailClient>

### Step 3: Validation
- [ ] 3.1 pnpm lint passes
- [ ] 3.2 pnpm build succeeds
