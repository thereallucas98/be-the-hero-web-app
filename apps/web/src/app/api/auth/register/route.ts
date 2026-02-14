import { PUBLIC_REGISTRABLE_ROLES, roleSchema } from '@bethehero/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, signAccessToken } from '~/lib/auth'
import { prisma } from '~/lib/db'

const RegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  role: roleSchema.default('GUARDIAN'),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = RegisterSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const { fullName, email, password, role } = parsed.data

  // MVP: por segurança, não permita criar ADMIN/SUPER_ADMIN publicamente
  if (!PUBLIC_REGISTRABLE_ROLES.includes(role)) {
    return NextResponse.json({ message: 'Not allowed' }, { status: 403 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { message: 'Email already in use' },
      { status: 409 },
    )
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role,
    },
    select: { id: true, role: true, fullName: true, email: true },
  })

  const token = signAccessToken({ sub: user.id, role: user.role })

  const res = NextResponse.json({ user }, { status: 201 })

  res.cookies.set({
    name: 'bth_access',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  })

  return res
}
