# UNIBIKE — Integração Firebase

## Visão geral

O painel administrativo da UNIBIKE utiliza o **Firebase** para:

| Serviço | Finalidade |
|---------|-----------|
| **Firebase Authentication** | Login/logout real com e-mail + senha |
| **Cloud Firestore** | Banco de dados para produtos, clientes e ordens de serviço |

A integração é compatível com **GitHub Pages** (puro HTML/JS, sem build) usando os SDKs Firebase via CDN com módulos ES.

---

## Arquivos criados / modificados

### Novos arquivos

| Arquivo | Descrição |
|---------|-----------|
| `admin/firebase.js` | Inicialização do Firebase App, Auth e Firestore. Referências às coleções. **Substitua as credenciais antes de publicar.** |
| `admin/auth.js` | Funções de login (`fazerLogin`), logout (`fazerLogout`) e proteção de rotas (`protegerRota`). Usa `onAuthStateChanged` para persistência de sessão. |

### Arquivos modificados

| Arquivo | O que foi alterado |
|---------|-------------------|
| `admin/login.html` | Formulário integrado com `fazerLogin()` via `<script type="module">`. Exibe erros do Firebase em português. |
| `admin/dashboard.html` | Proteção de rota (`protegerRota()`), sidebar footer com IDs dinâmicos, botão **Sair**. |
| `admin/produtos.html` | Idem acima. |
| `admin/categorias.html` | Idem acima. |
| `admin/configuracoes.html` | Idem acima. |
| `admin/adicionar-produto.html` | Idem acima. |
| `admin/editar-produto.html` | Idem acima. |
| `admin/admin.css` | Adicionado estilo `.adm-login-error` para mensagens de erro do Auth. |

---

## Como configurar as credenciais Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie ou selecione o projeto da UNIBIKE
3. **Authentication** → Ativar o provedor **E-mail/senha**
4. **Authentication → Usuários** → Adicionar o e-mail e senha do administrador
5. **Configurações do projeto → Seus aplicativos** → Copie o `firebaseConfig`
6. Abra `admin/firebase.js` e substitua os valores no objeto `firebaseConfig`:

```js
const firebaseConfig = {
    apiKey:            "sua-api-key",
    authDomain:        "seu-projeto.firebaseapp.com",
    projectId:         "seu-projeto",
    storageBucket:     "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId:             "1:123456789:web:abc123"
};
```

> ⚠️ **Nunca commite credenciais reais em repositórios públicos.**  
> Para repositórios públicos (GitHub Pages), configure as **Regras de domínio autorizado** no Firebase Console para aceitar apenas o domínio do seu site.

---

## Fluxo de autenticação

```
Usuário acessa página admin
        │
        ▼
protegerRota() → onAuthStateChanged
        │
        ├── Autenticado → exibe a página, preenche nome/e-mail na sidebar
        │
        └── Não autenticado → redireciona para login.html
                    │
                    ▼
            Preenche e-mail + senha
                    │
                    ▼
            fazerLogin() → signInWithEmailAndPassword (Firebase)
                    │
                    ├── Sucesso → redireciona para dashboard.html
                    │
                    └── Erro → exibe mensagem em português na tela

Botão "Sair" (sidebar) → fazerLogout() → signOut() → redireciona para login.html
```

---

## Estrutura do Firestore (preparada para uso futuro)

As referências às coleções estão definidas em `admin/firebase.js` e prontas para uso:

```js
import { db, colecoes } from "./firebase.js";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "...";

// Exemplo: listar produtos
const snap = await getDocs(colecoes.produtos);
snap.forEach(d => console.log(d.id, d.data()));
```

### Coleções planejadas

| Coleção | Campos sugeridos |
|---------|-----------------|
| `produtos` | `nome`, `marca`, `modelo`, `categoria`, `condicao`, `preco`, `descricao`, `ativo`, `destaque`, `disponivel`, `imagem`, `criadoEm` |
| `usuarios` | `nome`, `email`, `papel` (`admin`\|`editor`), `criadoEm` |
| `clientes` | `nome`, `telefone`, `email`, `endereco`, `criadoEm` |
| `ordensServico` | `clienteId`, `descricao`, `status`, `valor`, `criadoEm`, `atualizadoEm` |

---

## Regras de segurança Firestore (recomendadas)

No Firebase Console → **Firestore → Regras**, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Isso garante que somente usuários autenticados possam ler/gravar dados.

---

## Compatibilidade

- ✅ GitHub Pages (arquivos estáticos, sem servidor)
- ✅ Firebase SDK via CDN (sem npm/build necessário)
- ✅ Módulos ES (`type="module"`) — suportado em todos os navegadores modernos
- ✅ Não afeta o site público (`index.html`, `catalogo.html`, `produto.html`)
