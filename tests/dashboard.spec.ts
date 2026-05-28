import { test, expect } from '@playwright/test'

test.describe('Dashboard Carol dos Cílios', () => {

  test('1. Página carrega sem erro', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('text=KPIS PRINCIPAIS')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Erro ao carregar dados')).not.toBeVisible()
  })

  test('2. KPIs Meta têm valores reais', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=R$ 0,00').first()).not.toBeVisible()
  })

  test('3. Bloco Kiwify aparece na coluna direita', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('text=KIWIFY')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Vendas Totais')).toBeVisible()
    await expect(page.locator('text=Faturamento Bruto')).toBeVisible()
    await expect(page.locator('text=PIXEL VS REAL')).toBeVisible()
    await expect(page.locator('text=ORIGEM DAS VENDAS')).toBeVisible()
  })

  test('4. Layout responsivo mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000')
    await expect(page.locator('text=KPIS PRINCIPAIS')).toBeVisible({ timeout: 15000 })
    // Sidebar deve estar oculta em mobile
    const sidebar = page.locator('aside')
    await expect(sidebar).not.toBeVisible()
  })

  test('5. Layout responsivo monitor grande', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 })
    await page.goto('http://localhost:3000')
    await expect(page.locator('text=KPIS PRINCIPAIS')).toBeVisible({ timeout: 15000 })
    // Não deve ter espaço vazio — conteúdo centralizado
    const main = page.locator('main')
    const box = await main.boundingBox()
    expect(box?.width).toBeGreaterThan(1200)
  })

  test('6. Campanhas só mostra AL-MAI-2026', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.click('text=Campanhas')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=AL-MAI-2026').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=EExpress')).not.toBeVisible()
  })

  test('7. Criativos mostra ativos E pausados', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.click('text=Criativos')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Ativo').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Pausado').first()).toBeVisible({ timeout: 10000 })
  })

  test('8. CTR correto (link clicks, não total)', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    // CTR deve ser menor que 2% (link click CTR, não total CTR)
    const ctrText = await page.locator('text=CTR').first().locator('..').textContent()
    const ctrValue = parseFloat(ctrText?.match(/[\d,]+%/)?.[0]?.replace(',', '.') ?? '99')
    expect(ctrValue).toBeLessThan(2)
  })

})
