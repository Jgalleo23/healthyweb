import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null) as any
  const ingredients: string[] = Array.isArray(body?.ingredients) ? body.ingredients : []
  const servings = body?.servings || 2
  const restrictions = body?.restrictions || ''

  if (!ingredients.length) {
    return new NextResponse('No ingredients provided', { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(mockRecipe(ingredients, servings, restrictions))
  }

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `You are a helpful chef and nutritionist. Create a healthy recipe given these inputs. Respond ONLY with JSON.` },
        { role: 'user', content: JSON.stringify({ ingredients, servings, restrictions }) }
      ]
    })
    const raw = resp.choices?.[0]?.message?.content || '{}'
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err:any) {
    console.error(err)
    return new NextResponse('AI generation failed', { status: 500 })
  }
}

function mockRecipe(ingredients: string[], servings: number, restrictions: string) {
  return {
    title: `Quick ${ingredients[0] || 'Healthy'} Bowl`,
    servings,
    ingredients: ingredients.map((n,i)=>({ name: n, quantity: `${i===0?servings*120:1}`, notes:'' })),
    steps: ["Prep ingredients", "Cook main ingredient", "Combine", "Serve"],
    nutrition_per_serving_estimate: { calories: 350, protein_g: 25, carbs_g: 20, fat_g: 12 }
  }
}
