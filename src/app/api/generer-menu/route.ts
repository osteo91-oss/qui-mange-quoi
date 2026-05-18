import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { Profile } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { guests, mealName }: { guests: Profile[], mealName: string } = await req.json()

  const guestSummaries = guests.map(g =>
    `- ${g.name}: allergies [${g.allergies.join(', ') || 'aucune'}], régimes [${g.diets.join(', ') || 'aucun'}], n'aime pas [${g.dislikes.join(', ') || 'rien'}], cuisines préférées [${g.cuisines.join(', ') || 'toutes'}]`
  ).join('\n')

  const allAllergies = [...new Set(guests.flatMap(g => g.allergies))]
  const allDislikes = [...new Set(guests.flatMap(g => g.dislikes))]
  const totalConstraints = allAllergies.length + allDislikes.length
  const score = Math.max(60, Math.round(100 - totalConstraints * 4))

  const prompt = `Tu es un chef cuisinier expert. Voici les profils alimentaires des invités pour le repas "${mealName}":

${guestSummaries}

Génère 3 menus complets (entrée, plat, dessert) qui conviennent à TOUS les invités.
Réponds UNIQUEMENT en JSON valide avec cette structure exacte, sans texte avant ou après:
{
  "menu": [
    {
      "course": "entrée",
      "name": "Nom du plat",
      "description": "Description courte et appétissante",
      "compatible_with": ["prénom1", "prénom2"],
      "warnings": []
    },
    {
      "course": "plat",
      "name": "Nom du plat",
      "description": "Description courte et appétissante",
      "compatible_with": ["prénom1", "prénom2"],
      "warnings": ["Attention: contient X"]
    },
    {
      "course": "dessert",
      "name": "Nom du plat",
      "description": "Description courte et appétissante",
      "compatible_with": ["prénom1", "prénom2"],
      "warnings": []
    }
  ],
  "shopping_list": [
    {
      "ingredient": "Nom de l'ingrédient",
      "quantity": "500g",
      "category": "légumes"
    }
  ]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  return NextResponse.json({ ...result, compatibility_score: score })
}