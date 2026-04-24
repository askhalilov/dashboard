import http from 'node:http'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, 'data', 'db.json')
const PORT = process.env.PORT || 3001

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf8')
  return JSON.parse(raw)
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}

function send(res, status, payload) {
  res.writeHead(status, jsonHeaders)
  res.end(JSON.stringify(payload))
}

function notFound(res) {
  send(res, 404, { error: 'Маршрут API не найден' })
}

async function getBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function makeId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1
}

function cleanAd(payload) {
  return {
    category: String(payload.category || 'study'),
    title: String(payload.title || '').trim().slice(0, 120),
    price: String(payload.price || 'Договоримся').trim().slice(0, 40),
    time: String(payload.time || 'Только что'),
    responses: Number(payload.responses || 0),
    views: Number(payload.views || 0),
    place: String(payload.place || 'Кампус').trim().slice(0, 80),
    contacts: String(payload.contacts || 'Контакты не указаны').trim().slice(0, 80),
    iconKey: String(payload.iconKey || payload.category || 'study'),
    description: String(payload.description || 'Описание пока не добавлено.').trim().slice(0, 1000),
    custom: Boolean(payload.custom ?? true),
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, jsonHeaders)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      send(res, 200, { ok: true, app: 'СтудДоска backend', time: new Date().toISOString() })
      return
    }

    if (req.method === 'GET' && pathname === '/api/ads') {
      const db = await readDb()
      send(res, 200, { ads: db.ads })
      return
    }

    if (req.method === 'POST' && pathname === '/api/ads') {
      const db = await readDb()
      const body = await getBody(req)
      const ad = { id: makeId(db.ads), ...cleanAd(body), createdAt: new Date().toISOString() }
      if (!ad.title) {
        send(res, 400, { error: 'Название объявления обязательно' })
        return
      }
      db.ads.unshift(ad)
      await writeDb(db)
      send(res, 201, { ad })
      return
    }

    const adMatch = pathname.match(/^\/api\/ads\/(\d+)(?:\/(view|respond))?$/)
    if (adMatch) {
      const id = Number(adMatch[1])
      const action = adMatch[2]
      const db = await readDb()
      const index = db.ads.findIndex((ad) => Number(ad.id) === id)
      if (index === -1) {
        send(res, 404, { error: 'Объявление не найдено' })
        return
      }

      if (req.method === 'PATCH' && action === 'view') {
        db.ads[index].views = Number(db.ads[index].views || 0) + 1
        await writeDb(db)
        send(res, 200, { ad: db.ads[index] })
        return
      }

      if (req.method === 'PATCH' && action === 'respond') {
        db.ads[index].responses = Number(db.ads[index].responses || 0) + 1
        await writeDb(db)
        send(res, 200, { ad: db.ads[index] })
        return
      }

      if (req.method === 'DELETE' && !action) {
        const [removed] = db.ads.splice(index, 1)
        await writeDb(db)
        send(res, 200, { removed })
        return
      }
    }

    if (req.method === 'GET' && pathname === '/api/stats') {
      const db = await readDb()
      send(res, 200, {
        totalAds: db.ads.length,
        responses: db.ads.reduce((sum, ad) => sum + Number(ad.responses || 0), 0),
        views: db.ads.reduce((sum, ad) => sum + Number(ad.views || 0), 0),
        feedback: db.feedback.length,
      })
      return
    }

    if (req.method === 'GET' && pathname === '/api/ideas') {
      const db = await readDb()
      send(res, 200, { ideas: db.ideas })
      return
    }

    if (req.method === 'POST' && pathname === '/api/ideas') {
      const db = await readDb()
      const body = await getBody(req)
      const text = String(body.text || '').trim().slice(0, 180)
      if (!text) {
        send(res, 400, { error: 'Текст идеи обязателен' })
        return
      }
      db.ideas.push(text)
      await writeDb(db)
      send(res, 201, { ideas: db.ideas })
      return
    }

    if (req.method === 'POST' && pathname === '/api/feedback') {
      const db = await readDb()
      const body = await getBody(req)
      const item = {
        id: makeId(db.feedback),
        name: String(body.name || 'Студент').trim().slice(0, 80),
        message: String(body.message || '').trim().slice(0, 600),
        createdAt: new Date().toISOString(),
      }
      if (!item.message) {
        send(res, 400, { error: 'Сообщение обязательно' })
        return
      }
      db.feedback.push(item)
      await writeDb(db)
      send(res, 201, { feedback: item })
      return
    }

    notFound(res)
  } catch (error) {
    send(res, 500, { error: 'Ошибка сервера', detail: error.message })
  }
})

server.listen(PORT, () => {
  console.log(`Backend запущен: http://localhost:${PORT}`)
})
