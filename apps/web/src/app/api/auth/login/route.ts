import { NextResponse } from 'next/server'
import { z } from 'zod'
import { signAccessToken, verifyPassword } from '~/lib/auth'
import { prisma } from '~/lib/db'

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = LoginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  })

  // Evita enumerar emails: mesma mensagem para user inexistente ou senha errada
  if (!user || !user.isActive) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 },
    )
  }

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 },
    )
  }

  const token = signAccessToken({ sub: user.id, role: user.role })

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    },
    { status: 200 },
  )

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
