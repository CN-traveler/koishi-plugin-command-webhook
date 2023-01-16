import { Context, Schema } from 'koishi'

export const name = 'command-webhook'

export interface Webhook {
  url: string,
  method: string,
  headers: { [key: string]: string }
  body: string
  response: boolean
}

export interface Config {
  [key: string]: Webhook
}

export const Config = Schema.dict(Schema.object({
  url: Schema.string().required().description('请求 URL'),
  method: Schema.union(['GET', 'DELETE', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'PURGE', 'LINK', 'UNLINK']).default('GET').description('请求方式'),
  headers: Schema.dict(Schema.string()).description('请求头'),
  body: Schema.string().description('请求体'),
  response: Schema.boolean().default(false).description('是否返回响应')
}))

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger(name)
  for (const name in config) {
    ctx.command(`command.webhook.${name}`).action(async () => {
      try {
        const response = await ctx.http.axios(config[name])
        return config[name].response ? `成功 ${JSON.stringify(response.status)}\n响应头\n${JSON.stringify(response.headers)}\n响应体\n${JSON.stringify(response.data)}` : '成功'
      }
      catch (error) {
        logger.error(`${name}: ${error.message}`)
        return '失败'
      }
    })
  }
}
