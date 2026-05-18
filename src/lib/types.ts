export type Profile = {
  id: string
  name: string
  email: string
  allergies: string[]
  diets: string[]
  dislikes: string[]
  cuisines: string[]
  avatar_url?: string | null
}

export type Meal = {
  id: string
  name: string
  date: string
  organizer_id: string
  invite_token: string
  ai_menu: MenuItem[] | null
  shopping_list: ShoppingItem[] | null
  compatibility_score: number | null
  photo_url?: string | null
  meal_type?: string | null
  place?: string | null
  time?: string | null
}

export type MenuItem = {
course: 'entrée' | 'plat' | 'dessert' | 'apéro'
  name: string
  description: string
  compatible_with: string[]
  warnings: string[]
}

export type ShoppingItem = {
  ingredient: string
  quantity: string
  category: string
}