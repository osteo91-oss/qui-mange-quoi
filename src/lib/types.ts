export type Profile = {
  id: string
  name: string
  email: string
  allergies: string[]
  diets: string[]
  dislikes: string[]
  cuisines: string[]
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
}

export type MenuItem = {
  course: 'entrée' | 'plat' | 'dessert'
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