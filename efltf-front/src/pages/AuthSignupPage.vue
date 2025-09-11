<template>
  <q-page class="auth-page flex flex-center q-pa-md">
    <div class="auth-wrap">
      <q-card class="auth-card q-pa-lg">
        <!-- Branding -->
        <div class="row items-center justify-center q-mb-md">
          <q-avatar size="56px" color="primary" text-color="white">e</q-avatar>
        </div>

        <q-card-section class="q-pt-none q-pb-sm">
          <div class="text-h5 text-center text-weight-bold">Criar conta</div>
          <div class="text-caption text-center text-grey-7">
            Preencha os dados para começar a usar o sistema
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleSignup" class="q-gutter-md">
            <q-input
              v-model="form.nome"
              label="Nome"
              dense
              outlined
              :rules="[v => !!v || 'Informe o nome']"
              autocomplete="name"
            >
              <template #prepend><q-icon name="badge" /></template>
            </q-input>

            <q-input
              v-model="form.email"
              type="email"
              label="E-mail"
              dense
              outlined
              :rules="[v => !!v || 'Informe o e-mail']"
              autocomplete="email"
            >
              <template #prepend><q-icon name="mail" /></template>
            </q-input>

            <q-input
              v-model="form.senha"
              :type="showPass ? 'text' : 'password'"
              label="Senha"
              dense
              outlined
              :rules="[v => !!v || 'Informe a senha']"
              autocomplete="new-password"
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

            <q-input
              v-model="form.confirm"
              :type="showPass ? 'text' : 'password'"
              label="Confirmar senha"
              dense
              outlined
              :rules="[v => v === form.senha || 'Confirmação não confere']"
            >
              <template #prepend><q-icon name="check_circle" /></template>
            </q-input>

            <q-btn
              label="Criar conta"
              color="primary"
              class="full-width q-mt-sm"
              type="submit"
              :loading="loading"
              unelevated
              no-caps
            />

            <div class="row items-center justify-end q-mt-xs">
              <q-btn
                flat
                dense
                color="secondary"
                label="Já tenho conta"
                icon="login"
                :to="loginTo"
                replace
                no-caps
              />
            </div>

            <q-banner
              v-if="error"
              class="q-mt-md bg-red-2 text-red-10"
              rounded
              dense
            >
              {{ error }}
            </q-banner>

            <q-banner
              v-if="success"
              class="q-mt-md bg-green-2 text-green-10"
              rounded
              dense
            >
              {{ success }}
            </q-banner>
          </q-form>
        </q-card-section>
      </q-card>

      <div class="text-white text-center text-caption q-mt-md opacity-70">
        © {{ new Date().getFullYear() }} eFLTF
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { Usuario } from 'src/services/UsuarioService'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const form = ref({ nome: '', email: '', senha: '', confirm: '' })
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const hasRoute = (name) => {
  try {
    return router.getRoutes().some(r => r.name === name)
  } catch {
    return false
  }
}

const loginTo = computed(() => (hasRoute('login') ? { name: 'login' } : '/login'));

async function  handleSignup () {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    if (!form.value.nome || !form.value.email || !form.value.senha) {
      error.value = 'Preencha todos os campos'
      return
    }
    if (form.value.senha !== form.value.confirm) {
      error.value = 'Confirmação não confere'
      return
    }
    const ret = await Usuario.createUsuario({
      nome: form.value.nome,
      email: form.value.email,
      senha: form.value.senha
    })
    success.value = ret?.mensagem || 'Usuário criado com sucesso!'
    $q.notify({ type: 'positive', message: 'Conta criada!' })
    await router.replace(loginTo.value) ;
  } catch (e) {
    error.value = e?.response?.data || e.message || 'Erro ao criar usuário'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
}
.auth-wrap {
  width: 100%;
  max-width: 560px;
}
.auth-card {
  width: 100%;
  border-radius: 16px;
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
