'use client'

import Script from 'next/script'

export default function ChatWidget() {
  return (
    <>
      {/* Tawk.to Live Chat */}
      <Script id="tawk-to" strategy="lazyOnload">
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a71e30ffb30501d470ea917/1jv6dttjg';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}
      </Script>

      {/* Nút Chat Zalo */}
      <a
        href="https://zalo.me/0389839161"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="white">
          <path d="M24 0C10.745 0 0 10.745 0 24s10.745 24 24 24 24-10.745 24-24S37.255 0 24 0zm11.2 31.6c-.4.8-2.4 1.6-3.2 1.6-.8 0-1.6-.4-4.4-1.6-3.2-1.6-5.2-4-6-4.8-.8-.8-2.4-3.2-2.4-5.2s1.2-3.2 1.6-3.6c.4-.4 1.2-.8 1.6-.8s.8 0 1.2.4c.4.4 1.2 2.8 1.2 3.2.4.4.4 1.2 0 1.6-.4.4-.8 1.2-1.2 1.2-.4.4-.4.8 0 1.2.8 1.2 2 2.4 3.2 3.2 1.2.8 2.4 1.2 2.8.8.4-.4 1.2-1.2 1.6-1.6.4-.4.8-.4 1.2 0l2.8 2c.4.4.8.4 1.2.8 0 .4 0 1.6-.4 2.4z"/>
        </svg>
        <span className="text-sm font-semibold hidden sm:inline">Chat Zalo</span>
      </a>
    </>
  )
}
