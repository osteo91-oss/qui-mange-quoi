import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { organizerEmail, organizerName, mealName, guestsWhoVoted, totalGuests, mealLink } = await req.json()

    const { data, error } = await resend.emails.send({
      from: 'Qui mange quoi ? <onboarding@resend.dev>',
      to: organizerEmail,
      subject: `${guestsWhoVoted}/${totalGuests} invités ont voté pour "${mealName}" 🗳️`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #F0F7F0; padding: 24px; border-radius: 16px;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 900; margin: 0;">
              <span style="color: #2E7D32;">Qui mange </span>
              <span style="color: #F57C00;">quoi ?</span>
            </h1>
          </div>

          <div style="background: white; border-radius: 20px; padding: 24px; margin-bottom: 16px;">
            <p style="font-size: 18px; font-weight: 800; color: #1B5E20; margin: 0 0 8px;">
              🗳️ Mise à jour du sondage
            </p>
            <p style="font-size: 15px; color: #555; margin: 0 0 16px; line-height: 1.6;">
              Bonjour <strong style="color: #43A047;">${organizerName}</strong> !<br/>
              <strong>${guestsWhoVoted} sur ${totalGuests}</strong> invités ont répondu au sondage de dates pour <strong>"${mealName}"</strong>.
            </p>

            ${guestsWhoVoted === totalGuests ? `
            <div style="background: #E8F5E9; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; border: 1px solid #A5D6A7;">
              <p style="font-size: 14px; font-weight: 700; color: #2E7D32; margin: 0;">
                ✅ Tous vos invités ont voté ! Vous pouvez maintenant choisir la meilleure date.
              </p>
            </div>
            ` : `
            <div style="background: #FFF3E0; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; border: 1px solid #FFE0B2;">
              <p style="font-size: 14px; color: #F57C00; margin: 0;">
                ⏳ ${totalGuests - guestsWhoVoted} invité(s) n'ont pas encore répondu.
              </p>
            </div>
            `}
            
            <a href="${mealLink}" style="display: block; text-align: center; background: #43A047; color: white; text-decoration: none; padding: 14px 24px; border-radius: 100px; font-size: 15px; font-weight: 700;">
              Voir le sondage →
            </a>
          </div>

          <p style="text-align: center; font-size: 11px; color: #AAA; margin: 0;">
            🔒 Qui mange quoi ? · Vos données sont sécurisées
          </p>
        </div>
      `
    })

    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}