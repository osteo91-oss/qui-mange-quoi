import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { guestEmail, guestName, organizerName, mealName, inviteLink } = await req.json()

    const { data, error } = await resend.emails.send({
      from: 'Qui mange quoi <onboarding@resend.dev>',
      to: guestEmail,
      subject: `${organizerName} vous invite à "${mealName}" 🍽️`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #F0F7F0; padding: 24px; border-radius: 16px;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 900; margin: 0;">
              <span style="color: #2E7D32;">Qui mange </span>
              <span style="color: #F57C00;">quoi</span>
            </h1>
          </div>

          <div style="background: white; border-radius: 20px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
            <p style="font-size: 18px; font-weight: 800; color: #1B5E20; margin: 0 0 8px;">
              🎉 Vous êtes invité(e) !
            </p>
            <p style="font-size: 15px; color: #555; margin: 0 0 16px; line-height: 1.6;">
              <strong style="color: #43A047;">${organizerName}</strong> vous invite à rejoindre le repas <strong>"${mealName}"</strong>.
            </p>
            <p style="font-size: 14px; color: #888; margin: 0 0 24px; line-height: 1.6;">
              Rejoignez le repas pour indiquer vos disponibilités et vos préférences alimentaires. L'IA composera ensuite un menu compatible avec tous les invités !
            </p>
            
            <a href="${inviteLink}" style="display: block; text-align: center; background: #43A047; color: white; text-decoration: none; padding: 14px 24px; border-radius: 100px; font-size: 15px; font-weight: 700;">
              Rejoindre le repas →
            </a>
          </div>

          <div style="background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px;">
            <p style="font-size: 12px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">
              Comment ça marche ?
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">👤</span>
                <p style="font-size: 13px; color: #555; margin: 0;">Créez votre profil alimentaire (allergies, régimes...)</p>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🗳️</span>
                <p style="font-size: 13px; color: #555; margin: 0;">Indiquez vos disponibilités</p>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">✨</span>
                <p style="font-size: 13px; color: #555; margin: 0;">L'IA compose un menu compatible avec tous</p>
              </div>
            </div>
          </div>

          <p style="text-align: center; font-size: 11px; color: #AAA; margin: 0;">
            🔒 Vos données sont sécurisées et confidentielles · Qui mange quoi
          </p>
        </div>
      `
    })

    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}