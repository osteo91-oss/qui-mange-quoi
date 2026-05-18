import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { Profile } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { guests, mealName, courses }: {
      guests: Profile[],
      mealName: string,
      courses: { apero: boolean, entree: boolean, plat: boolean, dessert: boolean }
    } = await req.json()

    const guestSummaries = guests.map(g =>
      `- ${g.name}: allergies [${g.allergies.join(', ') || 'aucune'}], régimes [${g.diets.join(', ') || 'aucun'}], n'aime pas [${g.dislikes.join(', ') || 'rien'}], cuisines préférées [${g.cuisines.join(', ') || 'toutes'}]`
    ).join('\n')

    const allAllergies = [...new Set(guests.flatMap(g => g.allergies))]
    const allDislikes = [...new Set(guests.flatMap(g => g.dislikes))]
    const totalConstraints = allAllergies.length + allDislikes.length
    const score = Math.max(60, Math.round(100 - totalConstraints * 4))
    const nbPersonnes = guests.length

    const coursesSelected = []
    if (courses.apero) coursesSelected.push('apéro')
    if (courses.entree) coursesSelected.push('entrée')
    if (courses.plat) coursesSelected.push('plat')
    if (courses.dessert) coursesSelected.push('dessert')

    const prompt = `Tu es un chef cuisinier expert. Voici les profils alimentaires des ${nbPersonnes} invités pour le repas "${mealName}":

${guestSummaries}

Génère 3 propositions pour CHACUN de ces cours : ${coursesSelected.join(', ')}.
Tous les plats doivent convenir à TOUS les invités.
Les quantités doivent être calculées pour ${nbPersonnes} personnes.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "suggestions": {
    ${coursesSelected.map(c => `"${c}": [
      {
        "name": "Nom du plat",
        "description": "Description courte et appétissante",
        "warnings": [],
        "ingredients": [
          { "ingredient": "Nom", "quantity": "500g pour ${nbPersonnes} pers.", "category": "légumes" }
        ]
      },
      {
        "name": "Nom du plat 2",
        "description": "Description courte",
        "warnings": [],
        "ingredients": [
          { "ingredient": "Nom", "quantity": "300g pour ${nbPersonnes} pers.", "category": "viandes" }
        ]
      },
      {
        "name": "Nom du plat 3",
        "description": "Description courte",
        "warnings": [],
        "ingredients": [
          { "ingredient": "Nom", "quantity": "200g pour ${nbPersonnes} pers.", "category": "épicerie" }
        ]
      }
    ]`).join(',\n')}
  }
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return NextResponse.json({ error: 'Réponse vide de OpenAI' }, { status: 500 })
    }

    const result = JSON.parse(content)
    return NextResponse.json({ ...result, compatibility_score: score })

  } catch (error: any) {
    console.error('Erreur API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}