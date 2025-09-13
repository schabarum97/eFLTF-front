<template>
  <q-page class="q-pa-md column">
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="text-h6">Chat de Teste (Mock)</div>
      <q-space />
      <q-input v-model="de" dense outlined style="max-width: 320px" label="ID remetente (de)" />
      <q-input v-model="nome" dense outlined style="max-width: 220px" label="Nome" />
    </div>

    <div class="chat-box scroll q-pa-md">
      <div v-for="(m, i) in mensagens" :key="i" class="msg" :class="m.de === 'eu' ? 'eu' : 'bot'">
        <div class="bubble">{{ m.texto }}</div>
        <div class="meta">{{ m.meta }}</div>
      </div>
    </div>

    <div class="row q-gutter-sm q-mt-md">
      <q-input v-model="input" dense filled class="col" label="Digite sua mensagem..." @keyup.enter="enviar" />
      <q-btn color="primary" label="Enviar" @click="enviar" />
      <q-btn flat label="Menu" @click="enviarMenu" />
      <q-btn flat label="Limpar" @click="limpar" />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { ChatTeste } from 'src/services/ChatMockService'

const de = ref('5511999999999@c.us') 
const nome = ref('Teste')
const input = ref('')
const mensagens = ref([])

function pushEu(texto){ mensagens.value.push({ de:'eu', texto, meta: dayjs().format('HH:mm') }) }
function pushBot(texto){ mensagens.value.push({ de:'bot', texto, meta: dayjs().format('HH:mm') }) }

async function enviar(){
  const texto = input.value?.trim()
  if (!texto) return
  pushEu(texto); input.value = ''
  try {
    const { respostas = [] } = await ChatTeste.enviar({ de: de.value, nome: nome.value, texto })
    respostas.forEach(pushBot)
  } catch (e) {
    pushBot('⚠️ Erro ao falar com o bot de teste.')
  }
  requestAnimationFrame(() => {
    const el = document.querySelector('.chat-box')
    if (el) el.scrollTop = el.scrollHeight
  })
}
function enviarMenu(){ input.value = 'menu'; enviar() }
function limpar(){ mensagens.value = [] }
</script>

<style scoped>
.chat-box { min-height: 360px; max-height: 60vh; background: #fff; border-radius: 12px; box-shadow: var(--q-shadow-2); overflow: auto; }
.msg { display:flex; margin:6px 0; }
.msg.eu { justify-content:flex-end; }
.msg.bot { justify-content:flex-start; }
.bubble { max-width:70%; padding:8px 12px; border-radius:14px; line-height:1.3; word-break:break-word; }
.msg.eu .bubble { background:#e3f2fd; border-top-right-radius:4px; }
.msg.bot .bubble { background:#f1f3f4; border-top-left-radius:4px; }
.meta { font-size:11px; color:#888; margin:2px 8px; align-self:flex-end; }
.bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 14px;
  line-height: 1.3;
  word-break: break-word;
  white-space: pre-line;
}
</style>
