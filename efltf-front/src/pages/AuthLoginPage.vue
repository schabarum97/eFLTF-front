<template>
  <q-page class="auth-page flex flex-center q-pa-md">
    <div class="auth-wrap">
      <q-card class="auth-card q-pa-lg">
        <!-- Branding -->
        <div class="row items-center justify-center q-mb-md">
          <q-avatar size="56px" color="primary" text-color="white">e</q-avatar>
        </div>
        <q-card-section class="q-pt-none q-pb-sm">
          <div class="text-h5 text-center text-weight-bold">Bem-vindo</div>
          <div class="text-caption text-center text-grey-7">
            Entre com suas credenciais para continuar
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleLogin" class="q-gutter-md">
            <q-input
              v-model="form.email"
              type="email"
              label="E-mail"
              dense
              outlined
              :rules="[val => !!val || 'Informe o e-mail']"
              autocomplete="username"
            >
              <template #prepend><q-icon name="mail" /></template>
            </q-input>

            <q-input
              v-model="form.senha"
              :type="showPass ? 'text' : 'password'"
              label="Senha"
              dense
              outlined
              :rules="[val => !!val || 'Informe a senha']"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="showPass ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPass = !showPass"
                />
              </template>
            </q-input>

            <q-btn
              label="Entrar"
              color="primary"
              class="full-width q-mt-sm"
              type="submit"
              :loading="loading.login"
              unelevated
              no-caps
            >
              <template #loading><q-spinner /></template>
            </q-btn>

            <div class="row items-center justify-between q-mt-xs">
              <q-btn
                flat
                dense
                color="secondary"
                label="Criar conta"
                icon="person_add"
                :to="signupTo"
                replace
                no-caps
              />
              <q-btn
                flat
                dense
                color="primary"
                label="Trocar senha"
                icon="key"
                @click="toggleChange = !toggleChange"
                no-caps
              />
            </div>

            <q-banner
              v-if="error.login"
              class="q-mt-md bg-red-2 text-red-10"
              rounded
              dense
            >
              {{ error.login }}
            </q-banner>
          </q-form>
        </q-card-section>

        <q-separator v-show="toggleChange" spaced />

        <!-- Troca de senha -->
        <q-slide-transition>
          <div v-show="toggleChange">
            <q-card-section class="q-pt-sm">
              <div class="text-subtitle2 q-mb-sm">Trocar senha</div>
              <q-form @submit.prevent="handleChangePassword" class="q-gutter-sm">
                <q-input
                  v-model="change.email"
                  type="email"
                  label="E-mail (o mesmo do cadastro)"
                  dense
                  outlined
                  :rules="[v => !!v || 'Informe o e-mail']"
                >
                  <template #prepend><q-icon name="mail" /></template>
                </q-input>

                <q-input
                  v-model="change.pass"
                  :type="showOld ? 'text' : 'password'"
                  label="Senha atual"
                  dense
                  outlined
                  :rules="[v => !!v || 'Informe a senha atual']"
                  autocomplete="current-password"
                >
                  <template #prepend><q-icon name="lock" /></template>
                  <template #append>
                    <q-icon
                      :name="showOld ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showOld = !showOld"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="change.newpass"
                  :type="showNew ? 'text' : 'password'"
                  label="Nova senha"
                  dense
                  outlined
                  :rules="[v => !!v || 'Informe a nova senha']"
                  autocomplete="new-password"
                >
                  <template #prepend><q-icon name="vpn_key" /></template>
                  <template #append>
                    <q-icon
                      :name="showNew ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showNew = !showNew"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="change.confirm"
                  :type="showNew ? 'text' : 'password'"
                  label="Confirmar nova senha"
                  dense
                  outlined
                  :rules="[v => v === change.newpass || 'Confirmação não confere']"
                >
                  <template #prepend><q-icon name="check_circle" /></template>
                </q-input>

                <q-btn
                  label="Confirmar troca"
                  color="secondary"
                  class="full-width"
                  type="submit"
                  :loading="loading.change"
                  unelevated
                  no-caps
                />

                <q-banner
                  v-if="error.change"
                  class="q-mt-md bg-red-2 text-red-10"
                  rounded
                  dense
                >
                  {{ error.change }}
                </q-banner>

                <q-banner
                  v-if="success.change"
                  class="q-mt-md bg-green-2 text-green-10"
                  rounded
                  dense
                >
                  {{ success.change }}
                </q-banner>
              </q-form>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>

      <!-- rodapé sutil -->
      <div class="text-white text-center text-caption q-mt-md opacity-70">
        © {{ new Date().getFullYear() }} eFLTF
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed  } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Auth } from 'src/services/AuthService'
import { Usuario } from 'src/services/UsuarioService'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const form = ref({ email: '', senha: '' })
const showPass = ref(false)

const toggleChange = ref(false)
const change = ref({ email: '', pass: '', newpass: '', confirm: '' })
const showOld = ref(false)
const showNew = ref(false)

const loading = ref({ login: false, change: false })
const error   = ref({ login: '', change: '' })
const success = ref({ change: '' })

function normalizeRedirect(v) {
  if (typeof v !== 'string' || !v.startsWith('/')) return '/'
  return v
}

const hasRoute = (name) => {
  try {
    return router.getRoutes().some(r => r.name === name)
  } catch {
    return false
  }
}

const signupTo = computed(() => (hasRoute('signup') ? { name: 'signup' } : '/signup'))

async function handleLogin () {
  error.value.login = ''
  loading.value.login = true
  try {
    await Auth.login({ email: form.value.email, senha: form.value.senha })
    $q.notify({ type: 'positive', message: 'Login realizado!' })
    const target = normalizeRedirect(route.query?.redirect)
    await router.replace(target || '/')
  } catch (e) {
    error.value.login = e?.response?.data || e.message || 'Erro ao autenticar'
  } finally {
    loading.value.login = false
  }
}

async function handleChangePassword () {
  error.value.change = ''
  success.value.change = ''
  loading.value.change = true
  try {
    if (change.value.newpass !== change.value.confirm) {
      error.value.change = 'Confirmação não confere'
      return
    }

    const all = await Usuario.getUsuariosAll()
    const found = all?.items?.find(u => (u.usu_email || u.email) === change.value.email)
    if (!found) {
      error.value.change = 'Usuário não encontrado para este e-mail'
      return
    }

    const id = found.usu_id || found.id
    const ret = await Usuario.updateUsuario({
      id,
      pass: change.value.pass,
      newpass: change.value.newpass
    })

    if (ret?.mensagem?.toLowerCase().includes('inválida')) {
      error.value.change = ret.mensagem
    } else {
      success.value.change = ret.mensagem || 'Senha alterada com sucesso!'
      change.value.pass = ''
      change.value.newpass = ''
      change.value.confirm = ''
    }
  } catch (e) {
    error.value.change = e?.response?.data || e.message || 'Erro ao trocar a senha'
  } finally {
    loading.value.change = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
}
.auth-wrap {
  width: 100%;
  max-width: 520px;
}
.auth-card {
  width: 100%;
  border-radius: 16px;
  /* efeito glass */
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.86);
  box-shadow: 0 10px 30px rgba(0,0,0,0.18);
}
:deep(body.body--dark) .auth-card {
  background: rgba(18, 22, 34, 0.72);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.opacity-70 { opacity: .7; }
</style>
