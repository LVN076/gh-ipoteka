import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { SITE_CONFIG } from '@/lib/config'

const cormorant = Cormorant_Garamond({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Калькулятор ипотеки на дом — Good House',
  description: 'Рассчитайте ежемесячный платёж по льготной ипотечной программе за 1 минуту',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ymId = SITE_CONFIG.yandexMetrikaId

  return (
    <html lang="ru">
      <head>
        {ymId && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  ym(${ymId}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
  `,
              }}
            />
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${ymId}`}
                  style={{ position: 'absolute', left: '-9999px' }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}
      </head>
      <body className={`${cormorant.variable} ${jost.variable} font-body bg-stone-50 text-stone-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
