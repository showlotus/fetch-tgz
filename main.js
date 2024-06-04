import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { fetchTgz } from './version.js'

document.querySelector('#app').innerHTML = /* html */ `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>

    <div id="root">
      
    </div>
  </div>
`

setupCounter(document.querySelector('#counter'))

console.time('fetch tgz')
fetchTgz('vue').then(files => {
  console.log(files)
  const js = files['package/dist/vue.min.js']
  console.timeEnd('fetch tgz')

  const script = document.createElement('script')
  script.textContent = js
  document.head.appendChild(script)
  setTimeout(() => {
    new Vue({
      el: '#root',
      template: /* html */ `
        <h1>{{ msg }}</h1>
        <input v-model="msg" />
      `,
      data: {
        msg: 'hello world',
      },
    })
  })
})
