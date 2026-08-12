import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import routeAuth from './routes/auth'
import routeProduct from './routes/product'
import routeUser from './routes/user'
import routeOrder from './routes/order'
import routerArticle from './routes/article'
import routerArticleComment from './routes/articleComment'
import middlewareError from './middlewares/error'
import './configs/passport'

const app = express()

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://aga80886.github.io',
].filter((origin): origin is string => Boolean(origin))

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman、curl、伺服器對伺服器請求通常不會帶 Origin。
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('CORS'))
    },
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.use('/auth', routeAuth)
app.use('/product', routeProduct)
app.use('/user', routeUser)
app.use('/order', routeOrder)
app.use('/article', routerArticle)
app.use('/article', routerArticleComment)
app.use(middlewareError)

async function startServer(): Promise<void> {
  const databaseUrl = process.env.DB_URL
  const port = Number(process.env.PORT) || 4000

  if (!databaseUrl) {
    console.error('缺少環境變數 DB_URL')
    process.exit(1)
  }

  try {
    await mongoose.connect(databaseUrl)
    console.log('資料庫連線成功')

    app.listen(port, () => {
      console.log(`伺服器啟動：http://localhost:${port}`)
    })
  } catch (error) {
    console.error(error)
    console.error('資料庫連線失敗')
    process.exit(1)
  }
}

void startServer()
