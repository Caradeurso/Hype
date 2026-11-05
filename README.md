# HYPE – versão Web (PWA) com Firebase

Funciona no navegador de qualquer celular/PC e pode ser instalada na tela inicial (PWA). Mesma regra de negócio do app Android:
salas públicas ou com senha, duração definida pelo dono (1 a 720 h) com exclusão automática, só o dono exclui antes do prazo, sala secreta de 2h (estender pagando), convite por link.

## Publicar (uma vez)
1. console.firebase.google.com → **Criar projeto**.
2. Engrenagem → *Configurações do projeto* → **Seus apps → Web (</>)** → copie a config para `public/firebase-config.js`.
3. **Authentication → Método de login → Anônimo → Ativar.**  **Firestore Database → Criar banco.**
4. Mude para o plano **Blaze** (as funções exigem; tem cota gratuita).
5. No computador (Node 20+):
   ```
   npm i -g firebase-tools
   firebase login
   firebase use --add          # escolha o projeto
   cd functions && npm i && cd ..
   firebase deploy             # publica site, regras e funções
   ```
6. O site fica em `https://SEU-PROJETO.web.app`. Domínio próprio: Hosting → *Adicionar domínio personalizado*.

## Antes de abrir para todo mundo
- **Pagamento:** a função `extendSecret` ainda estende sem cobrar. Integre Pix/cartão (Mercado Pago, Stripe ou Pagar.me) e só estenda após o webhook confirmar o pagamento.
- **Login:** anônimo serve para começar; depois adicione Google/telefone.
- **Abuso:** ative o Firebase **App Check**, defina orçamento/alertas no Blaze, e inclua botão de denúncia + política de privacidade e termos (chat público).
- **Play Store depois:** esta PWA pode virar app Android via TWA (PWABuilder.com ou Bubblewrap), sem reescrever nada.
