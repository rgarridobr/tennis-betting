# Inventário completo de textos — TennisPool

**Pergunta do cliente:** todas as possibilidades de textos que aparecem e podem aparecer?

**Resposta:** sim — abaixo está a lista completa dos textos de **interface** do sistema, em **Português (PT)** e **English (EN)**.

- **Total de strings:** 938
- **Fontes:** `messages/pt.json` e `messages/en.json`
- **Paridade:** cada texto existe nos dois idiomas

---

## Sumário por área

| Área | Código | Quantidade |
|------|--------|------------|
| Navegação | `nav` | 16 |
| Botões comuns | `buttons` | 17 |
| Termos de tênis | `tennis` | 24 |
| Chaveamento / palpites | `bracket` | 7 |
| Feedbacks de palpite | `feedback` | 7 |
| Seletor de idioma | `language` | 4 |
| Textos comuns | `common` | 25 |
| Status de torneio | `status` | 11 |
| Superfícies | `surfaces` | 4 |
| Página inicial (landing) | `home` | 33 |
| Login, cadastro e senha | `auth` | 58 |
| Dashboard do participante | `dashboard` | 24 |
| Torneios e inscrição | `tournaments` | 72 |
| Rankings | `ranking` | 28 |
| Regras | `rules` | 39 |
| Perfil | `profile` | 26 |
| Grupos / pools | `pools` | 85 |
| Seletores (país, estado, clube) | `shared` | 23 |
| Painel administrativo (UI) | `admin` | 296 |
| SEO (título e descrição) | `meta` | 8 |
| Componentes de UI (paginação, dialog) | `ui` | 12 |
| Mensagens de erro e sucesso do servidor | `errors` | 119 |
| **Total** | | **938** |

---

## O que entra nesta lista

Textos fixos de UI e mensagens do sistema:

- Menus, botões, títulos, subtítulos
- Labels de formulário e placeholders
- Status de torneio e superfícies
- Mensagens de sucesso e erro (login, palpites, admin, etc.)
- Regras, rankings, grupos, perfil
- SEO (title/description) e textos de acessibilidade

## O que NÃO entra (dinâmico / conteúdo)

Estes textos vêm do **banco de dados** ou do usuário, não do catálogo de tradução:

- Nomes de torneios (ex.: Australian Open 2026)
- Nomes de jogadores
- Nomes de clubes e usuários
- Descrições de prêmio cadastradas no admin
- Datas e números calculados em tempo real
- Conteúdo colado pelo admin em campos livres

Termos de tênis mantidos iguais em PT e EN (padrão do esporte): Qualifier, BYE, W/O, Wild Card, Grand Slam, Masters 1000, etc.

---

## Navegação (`nav`) — 16 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Início | Home |
| 2 | Chaves | Brackets |
| 3 | Torneios | Tournaments |
| 4 | Grupos | Groups |
| 5 | Meus Palpites | My Predictions |
| 6 | Ranking | Ranking |
| 7 | Ranking Geral | Overall Ranking |
| 8 | Ranking por Torneio | Tournament Ranking |
| 9 | Regras | Rules |
| 10 | Meu Perfil | My Profile |
| 11 | Sair | Log out |
| 12 | Entrar | Log in |
| 13 | Cadastrar | Sign up |
| 14 | Participante | Participant |
| 15 | Visitante | Guest |
| 16 | Número de inscritos no site | Registered users on the site |

## Botões comuns (`buttons`) — 17 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Salvar Palpite | Save Prediction |
| 2 | Editar | Edit |
| 3 | Confirmar | Confirm |
| 4 | Voltar | Back |
| 5 | Finalizar | Finalize |
| 6 | Salvando... | Saving... |
| 7 | Oficial | Official |
| 8 | Meu Palpite | My Prediction |
| 9 | Ver Palpite | View Prediction |
| 10 | Cancelar | Cancel |
| 11 | Excluir | Delete |
| 12 | Salvar | Save |
| 13 | Pesquisar | Search |
| 14 | Limpar | Clear |
| 15 | Ver todos | View all |
| 16 | Gerenciar | Manage |
| 17 | Fechar | Close |

## Termos de tênis (`tennis`) — 24 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Rodada | Round |
| 2 | 64-avos de final | Round of 64 |
| 3 | 32-avos de final | Round of 32 |
| 4 | Oitavas | Round of 16 |
| 5 | Quartas de Final | Quarterfinals |
| 6 | Semifinais | Semifinals |
| 7 | Final | Final |
| 8 | Vencedor | Winner |
| 9 | Jogador | Player |
| 10 | Set | Set |
| 11 | Tie-break | Tie-break |
| 12 | Qualifier | Qualifier |
| 13 | Qualifier 1 | Qualifier 1 |
| 14 | Qualifier 2 | Qualifier 2 |
| 15 | Wild Card | Wild Card |
| 16 | Lucky Loser | Lucky Loser |
| 17 | Next Gen | Next Gen |
| 18 | Alternate | Alternate |
| 19 | BYE | BYE |
| 20 | W/O | W/O |
| 21 | RET | RET |
| 22 | ANULADA | VOID |
| 23 | Campeão | Champion |
| 24 | Vice-Campeão | Runner-up |

## Chaveamento / palpites (`bracket`) — 7 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Confronto ausente | Missing match |
| 2 | ERRO DE CHAVEAMENTO | BRACKET ERROR |
| 3 | Aguardando resultados | Awaiting results |
| 4 | Sem palpite | Not predicted |
| 5 | A definir | TBD |
| 6 | Aguardando definição do Qualifier pela organização. | Waiting for the organization to assign the Qualifier. |
| 7 | Você tem palpites não salvos. Tem certeza que deseja sair? | You have unsaved predictions. Are you sure you want to leave? |

## Feedbacks de palpite (`feedback`) — 7 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Palpite salvo com sucesso! | Prediction saved successfully! |
| 2 | Erro ao salvar | Error saving prediction |
| 3 | Ocorreu um erro ao salvar seu palpite. Tente novamente. | Something went wrong while saving your prediction. Please try again. |
| 4 | Chaveamento ainda não disponível. | Bracket is not available yet. |
| 5 | Preencha todos os confrontos antes de finalizar. | Fill in all matches before finalizing. |
| 6 | Aguarde todos os jogadores da chave serem definidos antes de finalizar. | Wait until all bracket players are set before finalizing. |
| 7 | Revise a chave: há palpite em confronto sem jogador definido. | Review the bracket: a prediction points to an undefined matchup. |

## Seletor de idioma (`language`) — 4 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Idioma | Language |
| 2 | Português | Português |
| 3 | English | English |
| 4 | Mudar idioma | Switch language |

## Textos comuns (`common`) — 25 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Carregando... | Loading... |
| 2 | Erro | Error |
| 3 | Sucesso | Success |
| 4 | Cancelar | Cancel |
| 5 | Fechar | Close |
| 6 | Buscar | Search |
| 7 | Nenhum resultado encontrado | No results found |
| 8 | Pontos | Points |
| 9 | Acertos | Correct picks |
| 10 | Precisão | Accuracy |
| 11 | Você | You |
| 12 | VOCÊ | YOU |
| 13 | {count} participantes | {count} participants |
| 14 | 1 participante | 1 participant |
| 15 | torneio | tournament |
| 16 | torneios | tournaments |
| 17 | membro | member |
| 18 | membros | members |
| 19 | de {count} palpites | of {count} predictions |
| 20 | em andamento | in progress |
| 21 | Campos com * são obrigatórios | Fields marked with * are required |
| 22 | Atualizando... | Updating... |
| 23 | Buscando... | Searching... |
| 24 | Processando... | Processing... |
| 25 | TennisPool | TennisPool |

## Status de torneio (`status`) — 11 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Standby | Standby |
| 2 | Rascunho | Draft |
| 3 | Em breve | Coming up |
| 4 | Aberto para palpites | Open for predictions |
| 5 | Ativo | Active |
| 6 | Ativo | Active |
| 7 | Palpites fechados | Predictions closed |
| 8 | Em andamento | In progress |
| 9 | Finalizado | Finished |
| 10 | Agendado | Scheduled |
| 11 | Preparando chaveamento | Preparing bracket |

## Superfícies (`surfaces`) — 4 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Quadra dura | Hard court |
| 2 | Saibro | Clay |
| 3 | Grama | Grass |
| 4 | Quadra dura | Hard court |

## Página inicial (landing) (`home`) — 33 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Entrar | Log in |
| 2 | Começar Agora | Get started |
| 3 | Faça seus palpites e | Make your predictions and |
| 4 | ganhe pontos | earn points |
| 5 | Participe do grupo, dê seus palpites nos maiores torneios de tênis do mundo e dispute com seus amigos no ranking. | Join the pool, predict the biggest tennis tournaments in the world, and compete with your friends on the leaderboard. |
| 6 | Torneios em destaque | Featured tournaments |
| 7 | Inscreva-se e comece a fazer seus palpites agora mesmo | Sign up and start making your predictions right away |
| 8 | Ver todos | View all |
| 9 | Simples e rápido | Simple and fast |
| 10 | Como funciona | How it works |
| 11 | Crie sua conta | Create your account |
| 12 | Cadastre-se gratuitamente e entre na disputa. | Sign up for free and join the competition. |
| 13 | Escolha o torneio | Pick a tournament |
| 14 | Selecione um torneio ativo e escolha participar de um grupo ou criar o seu próprio. | Choose an active tournament and join a group or create your own. |
| 15 | Faça seus palpites | Make your predictions |
| 16 | Escolha, de uma vez, o vencedor de cada partida até o campeão e acumule pontos progressivos com seus acertos. | Pick the winner of every match up to the champion and earn progressive points for correct picks. |
| 17 | Suba no Ranking | Climb the ranking |
| 18 | Dispute o topo do ranking nacional e do seu estado com outros participantes. | Compete for the top of the national and state rankings with other participants. |
| 19 | Passo 0{n} | Step 0{n} |
| 20 | Depoimentos | Testimonials |
| 21 | O que dizem nossos participantes | What our participants say |
| 22 | Participante desde 2026 | Participant since 2026 |
| 23 | A plataforma é incrível! Interface intuitiva e acompanhar o ranking em tempo real dá um gás a mais na competição. | The platform is amazing! Intuitive interface and real-time ranking makes the competition even more exciting. |
| 24 | Adoro a facilidade de dar os palpites. O sistema de pontos é justo e muito divertido de competir com os amigos. | I love how easy it is to make predictions. The scoring system is fair and so much fun competing with friends. |
| 25 | Melhor grupo de tênis que já participei. Todo Grand Slam eu tô aqui firme e forte. Recomendo demais! | Best tennis pool I've ever joined. Every Grand Slam I'm here. Highly recommend! |
| 26 | Pronto para entrar no jogo? | Ready to join the game? |
| 27 | Cadastre-se agora e comece a pontuar nos maiores torneios do tênis mundial. | Sign up now and start scoring points at the biggest tennis tournaments in the world. |
| 28 | Quero me cadastrar | I want to sign up |
| 29 | Já tenho uma conta | I already have an account |
| 30 | © {year} TennisPool. Todos os direitos reservados. | © {year} TennisPool. All rights reserved. |
| 31 | Este site não é oficial e não é afiliado à ATP ou aos torneios citados. | This site is not official and is not affiliated with the ATP or the tournaments mentioned. |
| 32 | Criar minha conta | Create my account |
| 33 | Como funciona | How it works |

## Login, cadastro e senha (`auth`) — 58 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Viva o jogo | Live the game |
| 2 | Voltar à página inicial | Back to home |
| 3 | Bem-vindo de volta | Welcome back |
| 4 | Entre na sua conta para fazer seus palpites ou acompanhar os resultados. | Sign in to your account to make predictions or follow the results. |
| 5 | Ainda não tem uma conta? | Don't have an account yet? |
| 6 | Cadastre-se | Sign up |
| 7 | Entrar | Log in |
| 8 | Entrando... | Signing in... |
| 9 | Esqueci minha senha | Forgot password? |
| 10 | Criar sua conta | Create your account |
| 11 | Junte-se a milhares de fãs e comece a pontuar agora mesmo. | Join thousands of fans and start scoring right away. |
| 12 | Já tem uma conta? | Already have an account? |
| 13 | Entrar | Log in |
| 14 | Criar conta | Create account |
| 15 | Criando conta... | Creating account... |
| 16 | E-mail | Email |
| 17 | Senha | Password |
| 18 | Nome * | Name * |
| 19 | Apelido (visível no site) | Nickname (visible on the site) |
| 20 | E-mail * | Email * |
| 21 | Senha * | Password * |
| 22 | WhatsApp | WhatsApp |
| 23 | Apenas o primeiro nome | First name only |
| 24 | Seu nome real ficará privado, apenas este apelido será exibido publicamente | Your real name stays private; only this nickname is shown publicly |
| 25 | Mínimo de 6 caracteres | At least 6 characters |
| 26 | Campos com * são obrigatórios | Fields marked with * are required |
| 27 | Para outros países, estado e cidade não são necessários. | For other countries, state and city are not required. |
| 28 | Estado e cidade são obrigatórios para Brasil. | State and city are required for Brazil. |
| 29 | Por favor, insira um email válido. | Please enter a valid email. |
| 30 | A senha deve conter pelo menos 6 caracteres. | Password must be at least 6 characters. |
| 31 | Complete seu Cadastro | Complete your registration |
| 32 | Para continuarmos, precisamos que você informe seu clube e país. Estado e cidade são necessários apenas para Brasil. | To continue, we need your club and country. State and city are only required for Brazil. |
| 33 | Salvar e Continuar | Save and continue |
| 34 | Salvando... | Saving... |
| 35 | Perfil atualizado com sucesso! | Profile updated successfully! |
| 36 | Erro ao atualizar perfil | Error updating profile |
| 37 | Recuperar Senha | Reset password |
| 38 | Informe seu e-mail para receber o código de recuperação. | Enter your email to receive a recovery code. |
| 39 | Digite o código de 5 caracteres enviado para o seu e-mail. | Enter the 5-character code sent to your email. |
| 40 | Escolha sua nova senha de acesso. | Choose your new password. |
| 41 | exemplo@email.com | you@email.com |
| 42 | Enviar Código | Send code |
| 43 | Enviando... | Sending... |
| 44 | Verificar Código | Verify code |
| 45 | Verificando... | Verifying... |
| 46 | Nova Senha | New password |
| 47 | Mínimo 6 caracteres | At least 6 characters |
| 48 | Confirmar Nova Senha | Confirm new password |
| 49 | Alterar Senha e Entrar | Change password and sign in |
| 50 | Alterando... | Updating... |
| 51 | Senha alterada com sucesso! | Password changed successfully! |
| 52 | As senhas não coincidem. | Passwords do not match. |
| 53 | A senha deve ter pelo menos 6 caracteres. | Password must be at least 6 characters. |
| 54 | “No tênis, cada ponto conta uma história — de foco, coragem e paixão.” | “In tennis, every point tells a story — of focus, courage, and passion.” |
| 55 | “Entre linhas e silêncios, o tênis revela quem você é quando a bola volta.” | “Between lines and silence, tennis shows who you are when the ball comes back.” |
| 56 | “O jogo começa antes do saque.” | “The game starts before the serve.” |
| 57 | “No tênis, a mente é tão afiada quanto a raquete.” | “In tennis, the mind is as sharp as the racket.” |
| 58 | “Cada partida é uma nova chance de se reinventar.” | “Every match is a new chance to reinvent yourself.” |

## Dashboard do participante (`dashboard`) — 24 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Torneios disponíveis | Available tournaments |
| 2 | Alguns torneios estão acontecendo agora. Participe e mostre o quanto você entende de tênis! | Some tournaments are live now. Join in and show your skills! |
| 3 | Ver todos | View all |
| 4 | Nenhum torneio disponível no momento. | No tournaments available right now. |
| 5 | Faça seus palpites e | Make your predictions and |
| 6 | ganhe pontos | earn points |
| 7 | Participe do grupo, dê seus palpites nos jogos e dispute com seus amigos no ranking. | Join the pool, predict the matches, and compete with your friends on the leaderboard. |
| 8 | Bem-vindo, {name}. | Welcome, {name}. |
| 9 | Seus Pontos | Your points |
| 10 | Acertos | Correct picks |
| 11 | de {count} palpites | of {count} predictions |
| 12 | Precisão | Accuracy |
| 13 | Torneios | Tournaments |
| 14 | em andamento | in progress |
| 15 | Ranking Geral | Overall ranking |
| 16 | Top 5 | Top 5 |
| 17 | Nenhum participante ainda | No participants yet |
| 18 | Você | You |
| 19 | Pontos | Points |
| 20 | Abrir prêmio do torneio | Open tournament prize |
| 21 | Prêmio disponível | Prize available |
| 22 | Prêmio em jogo | Prize in play |
| 23 | O vencedor recebe | The winner receives |
| 24 | Ver torneio | View tournament |

## Torneios e inscrição (`tournaments`) — 72 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Torneios | Tournaments |
| 2 | Participe dos maiores torneios do tênis mundial | Join the biggest tennis tournaments in the world |
| 3 | Disponíveis | Available |
| 4 | Torneios ativos | Active tournaments |
| 5 | Torneios finalizados | Finished tournaments |
| 6 | O que vem por aí | Coming up |
| 7 | Nenhum torneio ativo no momento | No active tournaments right now |
| 8 | Assim que um torneio for aberto para palpites, ele aparecerá aqui. Enquanto isso, veja os próximos torneios já agendados. | As soon as a tournament opens for predictions, it will show up here. Meanwhile, check the upcoming scheduled tournaments. |
| 9 | Ver o que vem por aí | See what's coming |
| 10 | Nenhum torneio encontrado | No tournaments found |
| 11 | Não encontramos torneios que correspondam aos filtros selecionados. | We couldn't find tournaments matching the selected filters. |
| 12 | Visualizando Chave | Viewing bracket |
| 13 | Chaveamento | Bracket |
| 14 | Inscrito - Faça seus palpites! | Enrolled — make your predictions! |
| 15 | Regras do Torneio | Tournament rules |
| 16 | Voltar ao Ranking | Back to ranking |
| 17 | Você está visualizando os palpites de | You are viewing predictions by |
| 18 | Usuário | User |
| 19 | Inscrição confirmada! | Enrollment confirmed! |
| 20 | Aguardando divulgação do chaveamento por parte da ATP. 🎾 | Waiting for the ATP to publish the draw. 🎾 |
| 21 | inscrito | enrolled |
| 22 | inscritos | enrolled |
| 23 | no Torneio | in the tournament |
| 24 | ✅ Os palpites serão liberados assim que a chave inicial sair. | ✅ Predictions open as soon as the initial draw is published. |
| 25 | ⌛ A chave completa será finalizada após o Qualifying, geralmente um dia antes do torneio. | ⌛ The full draw is finalized after Qualifying, usually one day before the tournament. |
| 26 | Volte aqui por volta de: | Check back around: |
| 27 | Palpite do usuário não foi registrado | No prediction submitted |
| 28 | Este usuário não registrou palpites para este torneio. | This user did not submit predictions for this tournament. |
| 29 | Buscar torneios | Search tournaments |
| 30 | Ex: Roland Garros, Wimbledon... | E.g. Roland Garros, Wimbledon... |
| 31 | Categoria | Category |
| 32 | Todas as categorias | All categories |
| 33 | Limpar | Clear |
| 34 | Ativos | Active |
| 35 | O que vem por aí | Coming up |
| 36 | Próximos | Upcoming |
| 37 | Finalizados | Finished |
| 38 | Atualizando... | Updating... |
| 39 | Participe do Grupo! | Join the pool! |
| 40 | Inscreva-se para fazer seus palpites no chaveamento completo do {name}. | Sign up to predict the full bracket of {name}. |
| 41 | Inscrever-se | Enroll |
| 42 | Erro ao realizar inscrição | Error enrolling |
| 43 | Erro de conexão ao realizar inscrição | Connection error while enrolling |
| 44 | Participar do Grupo | Join the pool |
| 45 | Inscreva-se no grupo de {name} e dispute com outros participantes! | Join the {name} pool and compete with other participants! |
| 46 | Confirme sua inscrição no botão abaixo para entrar na disputa deste torneio. | Confirm your enrollment below to enter this tournament. |
| 47 | Após a inscrição, você poderá iniciar os palpites nos jogos já confirmados. | Once enrolled, you can start predicting confirmed matches. |
| 48 | Assim que os classificados do qualifying forem inseridos na chave principal, você poderá completar os palpites restantes. | When qualifiers are placed in the main draw, you can complete the remaining predictions. |
| 49 | Ver regras completas de pontuação | View full scoring rules |
| 50 | Processando inscrição... | Processing enrollment... |
| 51 | Inscrição confirmada! | Enrollment confirmed! |
| 52 | Agora você pode fazer seus palpites. | You can now make your predictions. |
| 53 | Início às | Starts at |
| 54 | Categoria | Category |
| 55 | Inscritos | Enrolled |
| 56 | Prêmio | Prize |
| 57 | Pódio do Torneio | Tournament podium |
| 58 | Liderança Atual | Current leaders |
| 59 | Nenhum palpite ainda | No predictions yet |
| 60 | As classificações aparecerão assim que os resultados forem lançados. | Standings will appear as soon as results are entered. |
| 61 | Classificação Completa | Full standings |
| 62 | {count} participantes | {count} participants |
| 63 | Acertou o campeão e o vice | Picked champion and runner-up |
| 64 | Acertou o Campeão | Picked the champion |
| 65 | ACERTOS | CORRECT |
| 66 | PRECISÃO | ACCURACY |
| 67 | Placar da Final | Final score |
| 68 | Defina quantos sets cada jogador vencerá na final. | Set how many sets each player will win in the final. |
| 69 | O campeão deve ter {n} sets. | The champion must have {n} sets. |
| 70 | Confirmar Placar | Confirm score |
| 71 | Jogador 1 | Player 1 |
| 72 | Jogador 2 | Player 2 |

## Rankings (`ranking`) — 28 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Ranking Estadual - {state} | State ranking - {state} |
| 2 | Ranking Nacional | National ranking |
| 3 | Veja os líderes do estado {state} | See the leaders in {state} |
| 4 | Veja quem está liderando a temporada nacional | See who is leading the national season |
| 5 | Pódio Estadual | State podium |
| 6 | Pódio Geral | Overall podium |
| 7 | Nacional | National |
| 8 | Estadual | State |
| 9 | Você precisa definir seu estado no seu perfil para visualizar o Ranking Estadual. | You need to set your state in your profile to view the state ranking. |
| 10 | Nenhum participante ainda | No participants yet |
| 11 | Seja o primeiro a participar de um torneio! | Be the first to join a tournament! |
| 12 | Classificação Completa | Full standings |
| 13 | {count} participantes | {count} participants |
| 14 | Você | You |
| 15 | acertos | correct picks |
| 16 | % de precisão | % accuracy |
| 17 | Pontos | Points |
| 18 | Ranking por Torneio | Ranking by tournament |
| 19 | Selecione um torneio para ver a classificação detalhada | Select a tournament to see the detailed standings |
| 20 | Total | Total |
| 21 | Rankings: Finalizados | Rankings: Finished |
| 22 | Rankings: Ativos | Rankings: Active |
| 23 | Nenhum ranking encontrado | No rankings found |
| 24 | Não encontramos torneios com rankings disponíveis para os filtros selecionados. | We couldn't find tournaments with rankings for the selected filters. |
| 25 | Ranking: {name} | Ranking: {name} |
| 26 | Veja a classificação dos participantes neste torneio | See participant standings in this tournament |
| 27 | Sua posição no torneio | Your position in the tournament |
| 28 | {n} pontos | {n} points |

## Regras (`rules`) — 39 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Regras do Grupo | Pool rules |
| 2 | Entenda como funciona a pontuação e as participações | Understand how scoring and participation work |
| 3 | Início e Prazos | Start and deadlines |
| 4 | As inscrições nos torneios ficam disponíveis assim que eles entram no status “O que vem por aí”. Já os palpites podem ser enviados a partir da publicação da chave no TennisPool até o horário de início da primeira partida da chave principal. | Tournament enrollment opens when status is “Coming up”. Predictions can be submitted from the moment the draw is published on TennisPool until the start of the first main-draw match. |
| 5 | Alteração de Palpites | Changing predictions |
| 6 | Você pode alterar seus palpites quantas vezes quiser até o momento do bloqueio (início do torneio). Após o início das partidas, os palpites são congelados e não podem mais ser modificados. | You can change your predictions as often as you like until lock time (tournament start). After matches begin, predictions are frozen and can no longer be edited. |
| 7 | Como Pontuar | How scoring works |
| 8 | Você ganha pontos a cada acerto de vencedor. A pontuação é progressiva: rodadas finais valem mais. A última partida (Final) premia exclusivamente quem acerta o Campeão do torneio. | You earn points for every correct winner. Scoring is progressive: later rounds are worth more. The Final awards points only to those who pick the tournament Champion. |
| 9 | Chaveamento e Ranking | Bracket and ranking |
| 10 | Escolha quem avança em cada fase, palpitando no chaveamento até a final, e conquiste pontos progressivos para se destacar no ranking. | Pick who advances through every stage, predicting the bracket all the way to the final, and earn progressive points to climb the rankings. |
| 11 | Ver palpites dos adversários | View opponents' predictions |
| 12 | Para visualizar os palpites dos adversários, basta clicar em "Ranking", depois em "Ranking por Torneio" e, ao acessar o torneio, escolher um adversário. | To view opponents' predictions, go to "Ranking", then "Tournament Ranking", open a tournament and pick an opponent. |
| 13 | Observação Importante | Important note |
| 14 | Sempre que um tenista com o status de Lucky Loser (LL) vencer uma partida, ou em caso de vitória por W/O (Walkover), não haverá pontuação. | Whenever a player with Lucky Loser (LL) status wins a match, or in case of a W/O (Walkover) win, no points are awarded. |
| 15 | Sistema de Pontuação | Scoring system |
| 16 | pontos | points |
| 17 | Campeão | Champion |
| 18 | Final | Final |
| 19 | Critérios de Desempate | Tie-break criteria |
| 20 | Caso dois ou mais participantes terminem com a mesma pontuação total, os seguintes critérios serão aplicados nesta ordem: | If two or more participants finish with the same total points, the following criteria apply in order: |
| 21 | Acertou o Campeão do Torneio; | Picked the tournament Champion; |
| 22 | Acertou o Campeão e o Vice-Campeão; | Picked both Champion and Runner-up; |
| 23 | Maior número total de acertos (vencedores de partidas); | Highest total number of correct match winners; |
| 24 | Maior pontuação no Ranking Geral (pontuação acumulada nas etapas); | Highest overall ranking score (points accumulated across stages); |
| 25 | Regras do Ranking Geral | Overall ranking rules |
| 26 | O Ranking Geral será composto por <bold>29 torneios oficiais</bold>, distribuídos da seguinte forma: | The overall ranking is made up of <bold>29 official tournaments</bold>, distributed as follows: |
| 27 | 4 Grand Slams | 4 Grand Slams |
| 28 | 9 Masters 1000 | 9 Masters 1000 |
| 29 | 16 ATPs 500 | 16 ATP 500s |
| 30 | 29 torneios válidos para pontuação | 29 tournaments count for scoring |
| 31 | Sistema de Pontuação | Scoring system |
| 32 | Cada torneio tem sua própria tabela de pontuação conforme a categoria. | Each tournament has its own scoring table by category. |
| 33 | Os pontos de todos os torneios são somados no Ranking Geral. | Points from all tournaments add up in the overall ranking. |
| 34 | Não há descarte de piores resultados — todos os torneios contam. | Worst results are not dropped — every tournament counts. |
| 35 | O ranking é atualizado em tempo real conforme os resultados oficiais. | The ranking updates in real time as official results come in. |
| 36 | Validade dos Pontos | Point validity |
| 37 | Os pontos permanecem válidos durante toda a temporada. | Points remain valid for the entire season. |
| 38 | Ao final da temporada, o ranking é zerado para o novo ciclo. | At the end of the season, the ranking resets for the new cycle. |
| 39 | Premiações especiais podem ser definidas pela organização do grupo. | Special prizes may be defined by the pool organizers. |

## Perfil (`profile`) — 26 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Meu Perfil | My profile |
| 2 | Gerencie suas informações e veja suas estatísticas | Manage your information and view your stats |
| 3 | Administrador | Administrator |
| 4 | {days} dias de conta | {days} days on the site |
| 5 | Posição no Ranking | Ranking position |
| 6 | Editar Perfil | Edit profile |
| 7 | Alterar Senha | Change password |
| 8 | Nome * | Name * |
| 9 | E-mail * | Email * |
| 10 | O email não pode ser alterado | Email cannot be changed |
| 11 | Apelido (visível no site) | Nickname (visible on the site) |
| 12 | Apenas o apelido será exibido publicamente | Only the nickname is shown publicly |
| 13 | Usar 1º nome | Use first name |
| 14 | Para outros países, estado e cidade não são necessários. | For other countries, state and city are not required. |
| 15 | Salvar Alterações | Save changes |
| 16 | Perfil atualizado com sucesso! | Profile updated successfully! |
| 17 | Erro ao atualizar perfil | Error updating profile |
| 18 | As senhas não coincidem | Passwords do not match |
| 19 | A senha deve ter pelo menos 6 caracteres | Password must be at least 6 characters |
| 20 | Senha atualizada com sucesso! | Password updated successfully! |
| 21 | Erro ao atualizar senha | Error updating password |
| 22 | Senha Atual | Current password |
| 23 | Nova Senha | New password |
| 24 | Confirmar Nova Senha | Confirm new password |
| 25 | Atualizando... | Updating... |
| 26 | Alterar Senha | Change password |

## Grupos / pools (`pools`) — 85 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Grupos | Groups |
| 2 | Crie ou participe de grupos privados para competir com seus amigos. | Create or join private groups to compete with your friends. |
| 3 | Torneio: {name} | Tournament: {name} |
| 4 | Grupo para disputar com amigos | Group to compete with friends |
| 5 | {count} participantes | {count} participants |
| 6 | Grupo Oficial | Official group |
| 7 | Grupo WhatsApp | WhatsApp group |
| 8 | Palpites Pendentes! | Pending predictions! |
| 9 | O torneio {name} ainda não começou. Garanta seus pontos palpitando no chaveamento! | Tournament {name} has not started yet. Lock in points by predicting the bracket! |
| 10 | Palpitar Agora | Predict now |
| 11 | Ranking do Grupo | Group ranking |
| 12 | Encontrar grupos | Find groups |
| 13 | Busque pelo nome do grupo para encontrar competições criadas por seus amigos. | Search by group name to find competitions created by your friends. |
| 14 | Ex: Grupo dos amigos... | E.g. Friends group... |
| 15 | Pesquisar | Search |
| 16 | Buscando... | Searching... |
| 17 | Resultados da busca | Search results |
| 18 | Meus Grupos | My groups |
| 19 | Grupos que você já participa. | Groups you already joined. |
| 20 | Criar Novo Grupo | Create new group |
| 21 | Nenhum grupo ativo | No active groups |
| 22 | Você ainda não participa de nenhum grupo. Crie o seu próprio grupo ou busque por um grupo de amigos acima. | You are not in any group yet. Create your own or search for a friends group above. |
| 23 | Grupos Gerais | General groups |
| 24 | Competições públicas abertas a todos os usuários. | Public competitions open to all users. |
| 25 | Criar Grupo | Create group |
| 26 | Personalize seu grupo e convide amigos para competir. | Customize your group and invite friends to compete. |
| 27 | Requer senha | Requires password |
| 28 | Sem descrição disponível para este grupo. | No description available for this group. |
| 29 | Ver Ranking | View ranking |
| 30 | Entrar | Join |
| 31 | Torneio | Tournament |
| 32 | Selecione um torneio | Select a tournament |
| 33 | Nome do Grupo | Group name |
| 34 | Ex: Amigos do Tênis, Grupo da Firma... | E.g. Tennis friends, Office pool... |
| 35 | Descrição (Opcional) | Description (optional) |
| 36 | Descreva o objetivo ou as regras do seu grupo... | Describe the goal or rules of your group... |
| 37 | Link do Grupo de WhatsApp (Opcional) | WhatsApp group link (optional) |
| 38 | Grupo Privado | Private group |
| 39 | Exigir senha para novos membros | Require a password for new members |
| 40 | Senha de Acesso | Access password |
| 41 | Digite a senha que seus amigos usarão | Enter the password your friends will use |
| 42 | Grupo Geral | General group |
| 43 | Visível para todos os usuários | Visible to all users |
| 44 | Ocultar sem palpites | Hide without predictions |
| 45 | Esconder participantes que não enviaram palpites | Hide participants who have not submitted predictions |
| 46 | Criando... | Creating... |
| 47 | Criar Grupo | Create group |
| 48 | Editar Grupo | Edit group |
| 49 | Altere as informações do seu grupo ou mude o torneio atual. | Update your group info or change the linked tournament. |
| 50 | Torneio Vinculado | Linked tournament |
| 51 | Nova Senha (Opcional) | New password (optional) |
| 52 | Deixe em branco para manter a senha atual | Leave blank to keep the current password |
| 53 | Salvar Alterações | Save changes |
| 54 | Você entrou no grupo {name}. | You joined {name}. |
| 55 | Você não faz mais parte do grupo {name}. | You are no longer a member of {name}. |
| 56 | Ocorreu um erro ao sair do grupo. | An error occurred while leaving the group. |
| 57 | O link deste grupo foi copiado para sua área de transferência. | This group's link was copied to your clipboard. |
| 58 | Editar Grupo | Edit group |
| 59 | Compartilhar Convite | Share invite |
| 60 | Sair do Grupo | Leave group |
| 61 | Entrar com Senha | Join with password |
| 62 | Entrar no Grupo | Join group |
| 63 | Senha de Acesso | Access password |
| 64 | Este grupo é privado. Digite a senha para entrar e participar do ranking. | This group is private. Enter the password to join and appear on the leaderboard. |
| 65 | Digite a senha | Enter the password |
| 66 | Validando... | Validating... |
| 67 | Entrar | Join |
| 68 | Sair do Grupo? | Leave group? |
| 69 | Tem certeza que deseja sair de {name}? Seu progresso no ranking deste grupo será perdido. | Are you sure you want to leave {name}? Your ranking progress in this group will be lost. |
| 70 | Saindo... | Leaving... |
| 71 | Grupo Privado | Private group |
| 72 | Este grupo é protegido. Digite a senha de acesso para participar de {name}. | This group is protected. Enter the access password to join {name}. |
| 73 | Digite a senha do grupo | Enter the group password |
| 74 | Entrando... | Joining... |
| 75 | Participar do Grupo | Join group |
| 76 | Nenhum palpite foi enviado ainda | No predictions submitted yet |
| 77 | Convide amigos para começar a disputa! | Invite friends to start the competition! |
| 78 | Classificação Completa | Full standings |
| 79 | Nenhum participante enviou palpites ainda. | No participant has submitted predictions yet. |
| 80 | Nenhum dado disponível. | No data available. |
| 81 | {correct}/{total} ACERTOS | {correct}/{total} CORRECT |
| 82 | {n}% PRECISÃO | {n}% ACCURACY |
| 83 | Não completou seus palpites | Has not completed predictions |
| 84 | Filtrar por Torneio | Filter by tournament |
| 85 | Pontuação Geral | Overall score |

## Seletores (país, estado, clube) (`shared`) — 23 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | País | Country |
| 2 | Carregando países... | Loading countries... |
| 3 | Selecione o país... | Select country... |
| 4 | Brasil | Brazil |
| 5 | Não foi possível carregar a lista de países. Informe o país manualmente. | Could not load the country list. Enter the country manually. |
| 6 | Buscar país... | Search country... |
| 7 | Nenhum país encontrado. | No country found. |
| 8 | Estado | State |
| 9 | Selecione o estado... | Select state... |
| 10 | Buscar estado... | Search state... |
| 11 | Nenhum estado encontrado. | No state found. |
| 12 | Cidade | City |
| 13 | Selecione um estado | Select a state |
| 14 | Selecione a cidade... | Select city... |
| 15 | Buscar cidade... | Search city... |
| 16 | Nenhuma cidade encontrada. | No city found. |
| 17 | Clube em que joga tênis * | Tennis club * |
| 18 | Outro clube | Other club |
| 19 | Selecione seu clube | Select your club |
| 20 | Digite para buscar o clube... | Type to search for a club... |
| 21 | Nenhum clube encontrado. | No club found. |
| 22 | Não joga em nenhum clube | Does not play at a club |
| 23 | Digite o nome do clube | Enter the club name |

## Painel administrativo (UI) (`admin`) — 296 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Home | Home |
| 2 | Torneios | Tournaments |
| 3 | Usuários | Users |
| 4 | Clubes | Clubs |
| 5 | Grupos | Groups |
| 6 | Administrador | Administrator |
| 7 | Painel Administrativo | Admin panel |
| 8 | Gerencie torneios, jogadores e participantes do grupo com ferramentas exclusivas. | Manage tournaments, players, and pool participants with exclusive tools. |
| 9 | Torneios Ativos | Active tournaments |
| 10 | Novos Usuários | New users |
| 11 | nos últimos 7 dias | in the last 7 days |
| 12 | Total de Palpites | Total predictions |
| 13 | desde o início | since the beginning |
| 14 | Torneios Recentes | Recent tournaments |
| 15 | Gerenciar todos | Manage all |
| 16 | Torneios Populares | Popular tournaments |
| 17 | Inscritos | Enrolled |
| 18 | Participantes | Participants |
| 19 | Todos | All |
| 20 | Sem apelido | No nickname |
| 21 | {n} palpites | {n} predictions |
| 22 | Gerenciar Grupos | Manage groups |
| 23 | Acompanhe, crie e edite os grupos da plataforma e seus participantes | Track, create, and edit platform groups and their members |
| 24 | Gerenciar Usuários | Manage users |
| 25 | Administre os participantes do grupo | Administer pool participants |
| 26 | Lista de Usuários | User list |
| 27 | Gerencie o acesso e permissões dos participantes | Manage participant access and permissions |
| 28 | Nenhum usuário cadastrado | No users registered |
| 29 | Convide participantes para começar o grupo. | Invite participants to start the pool. |
| 30 | Todos os Usuários ({n}) | All users ({n}) |
| 31 | Admin | Admin |
| 32 | Inativo | Inactive |
| 33 | Ativo | Active |
| 34 | Você | You |
| 35 | Clubes Oficiais | Official clubs |
| 36 | Cadastre, edite e exclua os clubes oficiais do sistema | Add, edit, and delete official clubs |
| 37 | Gerenciar Torneios | Manage tournaments |
| 38 | Acompanhe o calendário e gerencie os campeonatos | Follow the calendar and manage championships |
| 39 | Lista de Torneios | Tournament list |
| 40 | Acompanhe e edite seus campeonatos | Track and edit your championships |
| 41 | Novo Torneio | New tournament |
| 42 | Filtrar por mês | Filter by month |
| 43 | Nenhum torneio este ano. | No tournaments this year. |
| 44 | evento | event |
| 45 | eventos | events |
| 46 | Nenhum torneio neste mês | No tournaments this month |
| 47 | Não há torneios cadastrados para este período. | There are no tournaments for this period. |
| 48 | Em Andamento / Bloqueados | In progress / Locked |
| 49 | Abertos para palpites | Open for predictions |
| 50 | Próximos (Visíveis) | Upcoming (visible) |
| 51 | Calendário (Standby) | Calendar (Standby) |
| 52 | Finalizados | Finished |
| 53 | {n} jogadores | {n} players |
| 54 | Criar Torneio | Create tournament |
| 55 | Preencha as informações abaixo: | Fill in the information below: |
| 56 | Configure um novo campeonato na plataforma | Set up a new championship on the platform |
| 57 | Modo Em Breve | Coming up mode |
| 58 | Modo Standby | Standby mode |
| 59 | O chaveamento está publicado e visível para os participantes. | The bracket is published and visible to participants. |
| 60 | Use Preparar Chaveamento para tornar o torneio visível. | Use Prepare bracket to make the tournament visible. |
| 61 | Chaveamento | Bracket |
| 62 | CHAVE FIXA | FIXED BRACKET |
| 63 | O chaveamento ainda não foi gerado. | The bracket has not been generated yet. |
| 64 | Gerenciar Jogo {position} | Manage Match {position} |
| 65 | Definir Confronto | Set Matchup |
| 66 | Configure os jogadores para esta partida. | Configure the players for this match. |
| 67 | Substituir / LL / Definir Q | Replace / LL / Set Q |
| 68 | Substitua um jogador, preencha um Qualifier ou adicione um LL. | Replace a player, fill a Qualifier, or add an LL. |
| 69 | Alterar Resultado | Change Result |
| 70 | Registrar Resultado | Record Result |
| 71 | Corrija o vencedor ou o placar desta partida. | Correct the winner or score of this match. |
| 72 | Defina o vencedor e o placar da partida. | Set the winner and score of the match. |
| 73 | Nenhuma ação disponível | No actions available |
| 74 | Esta partida já foi concluída ou o torneio está finalizado. | This match is already completed or the tournament is finished. |
| 75 | Configurar Jogo {position} | Configure Match {position} |
| 76 | Lado A | Side A |
| 77 | Lado B | Side B |
| 78 | Jogador (Opcional) | Player (Optional) |
| 79 | Selecionar Jogador | Select Player |
| 80 | Remover | Remove |
| 81 | Selecione o jogador... | Select the player... |
| 82 | Número do Seed | Seed Number |
| 83 | Jogador Específico | Specific Player |
| 84 | Seed / Cabeça de Chave | Seed |
| 85 | Qualifier (Q) | Qualifier (Q) |
| 86 | Wild Card (WC) | Wild Card (WC) |
| 87 | Lucky Loser (LL) | Lucky Loser (LL) |
| 88 | Next Gen (NG) | Next Gen (NG) |
| 89 | Alternate (ALT) | Alternate (ALT) |
| 90 | BYE | BYE |
| 91 | Confirmar Confronto | Confirm Matchup |
| 92 | Definir Jogador | Set Player |
| 93 | Substituir Jogador | Replace Player |
| 94 | Selecione qual lado do confronto deseja alterar. | Select which side of the matchup to change. |
| 95 | Novo Jogador | New Player |
| 96 | Este jogador está entrando como Lucky Loser (LL) | This player is entering as Lucky Loser (LL) |
| 97 | Substituir por Lucky Loser (LL) | Replace with Lucky Loser (LL) |
| 98 | Ao marcar como LL, a pontuação desta partida será anulada apenas se o Lucky Loser vencer. Se ele perder, a pontuação será creditada normalmente. | When marked as LL, this match's points are voided only if the Lucky Loser wins. If they lose, points are awarded normally. |
| 99 | Confirmar Jogador | Confirm Player |
| 100 | Confirmar Substituição | Confirm Replacement |
| 101 | Jogador A | Player A |
| 102 | Jogador B | Player B |
| 103 | Selecione o Vencedor | Select the Winner |
| 104 | VENCEDOR | WINNER |
| 105 | Placar Final | Final Score |
| 106 | Normal | Normal |
| 107 | Placar parcial obrigatório | Partial score required |
| 108 | Sem placar | No score |
| 109 | Sets separados por espaço (6-4 3-6 7-6) | Sets separated by space (6-4 3-6 7-6) |
| 110 | Ex: 6-4 3-2 | E.g.: 6-4 3-2 |
| 111 | W/O sem placar | W/O without score |
| 112 | Confirmar Resultado | Confirm Result |
| 113 | Sucesso! | Success! |
| 114 | Reativar Pontos | Reactivate Points |
| 115 | Anular Pontos | Void Points |
| 116 | Limpar | Clear |
| 117 | Reativar Pontuação? | Reactivate Points? |
| 118 | Anular Pontuação? | Void Points? |
| 119 | Deseja reativar a pontuação para esta partida? Os pontos serão recalculados ao salvar o resultado novamente. | Do you want to reactivate points for this match? Points will be recalculated when you save the result again. |
| 120 | Tem certeza que deseja anular a pontuação desta partida? Nenhum usuário ganhará pontos por este confronto. | Are you sure you want to void points for this match? No user will earn points from this matchup. |
| 121 | Limpar Resultado? | Clear Result? |
| 122 | Tem certeza que deseja limpar o resultado desta partida? Isso removerá o vencedor das rodadas seguintes. | Are you sure you want to clear this match result? This will remove the winner from later rounds. |
| 123 | Sim | Yes |
| 124 | Resultado salvo! Vencedor avançado. | Result saved! Winner advanced. |
| 125 | Alterar | Change |
| 126 | Resultado | Result |
| 127 | Defina o Seed do Jogador 1 | Set Player 1 seed |
| 128 | Defina o Seed do Jogador 2 | Set Player 2 seed |
| 129 | Bye não pode enfrentar Bye | Bye cannot face Bye |
| 130 | Erro ao salvar confronto | Error saving matchup |
| 131 | Ocorreu um erro inesperado | An unexpected error occurred |
| 132 | Erro ao limpar resultado | Error clearing result |
| 133 | Erro ao alterar pontuação | Error updating points |
| 134 | Selecione o vencedor | Select the winner |
| 135 | Informe o placar parcial do RET | Enter the partial RET score |
| 136 | Selecione o placar ou marque W/O/RET | Select the score or mark W/O/RET |
| 137 | Erro ao salvar | Error saving result |
| 138 | Preparar Chaveamento (Tornar Visível) | Prepare Bracket (Make Visible) |
| 139 | Ocultar (Voltar para Standby) | Hide (Back to Standby) |
| 140 | Voltar para Standby? | Back to Standby? |
| 141 | Esta ação irá <strong>EXCLUIR</strong> permanentemente o chaveamento atual e todos os palpites já realizados. | This action will permanently <strong>DELETE</strong> the current bracket and all predictions already made. |
| 142 | Sim, Resetar | Yes, Reset |
| 143 | Finalizar Torneio | Finish Tournament |
| 144 | Chaveamento excluído e torneio em Standby | Bracket deleted and tournament set to Standby |
| 145 | Erro ao resetar torneio | Error resetting tournament |
| 146 | Chaveamento gerado e torneio visível! | Bracket generated and tournament visible! |
| 147 | Erro ao preparar torneio | Error preparing tournament |
| 148 | Torneio finalizado com sucesso! | Tournament finished successfully! |
| 149 | Erro ao finalizar torneio | Error finishing tournament |
| 150 | Excluir Torneio? | Delete Tournament? |
| 151 | Você está prestes a excluir o torneio "{name}". Esta ação não pode ser desfeita. | You are about to delete the tournament "{name}". This action cannot be undone. |
| 152 | Sim, Excluir | Yes, Delete |
| 153 | Excluir Torneio | Delete Tournament |
| 154 | Torneio excluído com sucesso! | Tournament deleted successfully! |
| 155 | Erro ao excluir torneio | Error deleting tournament |
| 156 | Sincronizar ATP | Sync ATP |
| 157 | Disponível em {time} | Available in {time} |
| 158 | Última sincronização: {time} | Last sync: {time} |
| 159 | Sincronização concluída! Criados: {created}, Atualizados: {updated} | Sync complete! Created: {created}, Updated: {updated} |
| 160 | Erro ao sincronizar | Error syncing |
| 161 | Erro ao sincronizar com ATP | Error syncing with ATP |
| 162 | Sincronizar Chaveamento ATP | Sync ATP Bracket |
| 163 | Sincronizar Chaveamento? | Sync Bracket? |
| 164 | Deseja sincronizar o chaveamento com a ATP? Isso substituirá os jogadores da Rodada 1. | Do you want to sync the bracket with ATP? This will replace Round 1 players. |
| 165 | Sim, Sincronizar | Yes, Sync |
| 166 | Sincronizado com sucesso! {count} partidas atualizadas. | Synced successfully! {count} matches updated. |
| 167 | Erro ao sincronizar chaveamento | Error syncing bracket |
| 168 | Erro ao conectar com o servidor | Error connecting to the server |
| 169 | Publicando... | Publishing... |
| 170 | Publicar Chaveamento | Publish Bracket |
| 171 | Preencha toda a 1ª rodada | Fill the entire 1st round |
| 172 | Confirmar Publicação? | Confirm Publication? |
| 173 | Ao publicar, o chaveamento será bloqueado para mudanças estruturais e o torneio ficará <strong>ATIVO</strong> para palpites e resultados. | Once published, the bracket will be locked for structural changes and the tournament will be <strong>ACTIVE</strong> for predictions and results. |
| 174 | Sim, Publicar! | Yes, Publish! |
| 175 | Chaveamento publicado com sucesso! | Bracket published successfully! |
| 176 | Erro ao publicar chaveamento | Error publishing bracket |
| 177 | Alterar data e hora | Change date and time |
| 178 | Data e hora de início | Start Date and Time |
| 179 | Salvar Alterações | Save Changes |
| 180 | Data e hora do torneio atualizadas com sucesso! | Tournament date and time updated successfully! |
| 181 | Ocorreu um erro ao atualizar a data do torneio. | An error occurred while updating the tournament date. |
| 182 | Editar prêmio | Edit prize |
| 183 | Adicionar prêmio | Add prize |
| 184 | Prêmio do torneio | Tournament prize |
| 185 | Descrição | Description |
| 186 | Descreva o que o ganhador vai receber | Describe what the winner will receive |
| 187 | Salvar alterações | Save changes |
| 188 | Prêmio atualizado com sucesso! | Prize updated successfully! |
| 189 | Ocorreu um erro ao atualizar o prêmio. | An error occurred while updating the prize. |
| 190 | Torneio agora está visível | Tournament is now visible |
| 191 | Torneio agora está oculto | Tournament is now hidden |
| 192 | Erro ao atualizar visibilidade | Error updating visibility |
| 193 | Excluir Usuário? | Delete User? |
| 194 | Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não poderá ser desfeita. | Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone. |
| 195 | Excluindo... | Deleting... |
| 196 | Confirmar Exclusão | Confirm Deletion |
| 197 | Usuário excluído com sucesso! | User deleted successfully! |
| 198 | Erro ao excluir usuário | Error deleting user |
| 199 | Usuário ativado! | User activated! |
| 200 | Usuário desativado! | User deactivated! |
| 201 | Erro ao alterar status do usuário | Error changing user status |
| 202 | Nome do Torneio | Tournament Name |
| 203 | Selecione o torneio | Select the tournament |
| 204 | Categoria | Category |
| 205 | Selecione a categoria | Select the category |
| 206 | Prêmio | Prize |
| 207 | Descreva o que o ganhador vai receber | Describe what the winner will receive |
| 208 | Superfície | Surface |
| 209 | Selecione | Select |
| 210 | Quadra dura | Hard Court |
| 211 | Saibro | Clay |
| 212 | Grama | Grass |
| 213 | Local | Location |
| 214 | Selecione o local | Select the location |
| 215 | Data e hora de início | Start Date and Time |
| 216 | Data de término | End Date |
| 217 | Formato | Format |
| 218 | Simples | Singles |
| 219 | Duplas (Em breve) | Doubles (Coming soon) |
| 220 | Sets | Sets |
| 221 | Melhor de 3 | Best of 3 |
| 222 | Melhor de 5 | Best of 5 |
| 223 | Tamanho da Chave | Bracket Size |
| 224 | {n} jogadores ({r} rodadas) | {n} players ({r} rounds) |
| 225 | Recursos do Chaveamento | Bracket Features |
| 226 | Seeds | Seeds |
| 227 | Qualifiers | Qualifiers |
| 228 | Wild Cards | Wild Cards |
| 229 | Byes | Byes |
| 230 | O sistema gerará todas as rodadas e partidas vazias. Você poderá definir manualmente cada confronto da 1ª rodada na próxima etapa. | The system will generate all rounds and empty matches. You can manually set each 1st-round matchup in the next step. |
| 231 | Gerando chaveamento... | Generating bracket... |
| 232 | Criar Torneio | Create Tournament |
| 233 | Torneio | Tournament |
| 234 | Local | Location |
| 235 | Jogadores Cadastrados | Registered Players |
| 236 | {n} jogadores no sistema | {n} players in the system |
| 237 | Recolher busca de jogadores | Collapse player search |
| 238 | Expandir busca de jogadores | Expand player search |
| 239 | Recolher | Collapse |
| 240 | Expandir | Expand |
| 241 | Buscar jogador... | Search player... |
| 242 | Nenhum jogador cadastrado. Adicione jogadores para começar. | No {title}s registered yet. |
| 243 | Nenhum jogador encontrado. | No players found. |
| 244 | Adicionar | Add |
| 245 | Adicionar Jogadores | Add Players |
| 246 | Individual | Individual |
| 247 | Importar em Lote | Bulk Import |
| 248 | Jogador cadastrado! | Player registered! |
| 249 | Nome do Jogador * | Player Name * |
| 250 | Ex: Carlos Alcaraz | E.g.: Carlos Alcaraz |
| 251 | Nome de Exibição (Chaveamento) | Display Name (Bracket) |
| 252 | Como o nome aparecerá no chaveamento. Se vazio, usa o nome completo. | How the name will appear on the bracket. If empty, the full name is used. |
| 253 | Sigla do País | Country Code |
| 254 | Ex: ESP | E.g.: ESP |
| 255 | Cadastrar Jogador | Register Player |
| 256 | Editar Jogador | Edit Player |
| 257 | Altere as informações do jogador conforme necessário. | Update the player information as needed. |
| 258 | Jogador atualizado com sucesso | Player updated successfully |
| 259 | Erro ao atualizar | Error updating |
| 260 | Erro ao cadastrar | Error registering |
| 261 | Salvar Alterações | Save Changes |
| 262 | Excluir Jogador | Delete Player |
| 263 | Tem certeza de que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita. | Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone. |
| 264 | Excluir Jogador | Delete Player |
| 265 | Excluindo... | Deleting... |
| 266 | Jogador excluído com sucesso | Player deleted successfully |
| 267 | Erro ao excluir jogador | Error deleting player |
| 268 | Lista de Jogadores | Player List |
| 269 | Cole a lista no formato: Carlos Alcaraz (ESP) [Car. Alcaraz] Jannik Sinner (ITA) [J. Sinner] Novak Djokovic (SRB) ...  Ou apenas nomes: Carlos Alcaraz Jannik Sinner Novak Djokovic | Paste the list in the format: Carlos Alcaraz (ESP) [Car. Alcaraz] Jannik Sinner (ITA) [J. Sinner] Novak Djokovic (SRB) ...  Or just names: Carlos Alcaraz Jannik Sinner Novak Djokovic |
| 270 | Formatos aceitos: "Nome (País) [Nome de exibição]", "Nome (País)" ou apenas "Nome". Um jogador por linha. O sistema ignora a numeração, se houver. | Accepted formats: "Name (Country) [Display Name]", "Name (Country)", or just "Name". One player per line. Numbering is ignored if present. |
| 271 | Importando... | Importing... |
| 272 | Importar Jogadores | Import Players |
| 273 | Cole a lista de jogadores | Paste the player list |
| 274 | {count} jogadores importados com sucesso! | {count} players imported successfully! |
| 275 | Erro ao importar | Error importing |
| 276 | Gerenciar {title}s | Manage {title}s |
| 277 | {count} {title}s cadastrados | {count} {title}s registered |
| 278 | Adicionar Novo {title} | Add New {title} |
| 279 | Lista de {title}s | List of {title}s |
| 280 | Nenhum {title} cadastrado ainda. | No {title}s registered yet. |
| 281 | Fechar Gerenciador | Close Manager |
| 282 | {title} adicionado! | {title} added! |
| 283 | {title} atualizado! | {title} updated! |
| 284 | {title} excluído! | {title} deleted! |
| 285 | Erro ao excluir | Error deleting |
| 286 | Sair | Exit |
| 287 | Australian Open | Australian Open |
| 288 | Melbourne | Melbourne |
| 289 | Inscritos | Enrolled |
| 290 | Inscritos no torneio | Tournament enrollments |
| 291 | 1 pessoa está inscrita neste torneio. | 1 person is enrolled in this tournament. |
| 292 | {count} pessoas estão inscritas neste torneio. | {count} people are enrolled in this tournament. |
| 293 | Buscar por nome, email, clube ou WhatsApp | Search by name, email, club, or WhatsApp |
| 294 | Nenhum inscrito neste torneio. | No enrollments in this tournament. |
| 295 | Nenhum inscrito encontrado para essa busca. | No enrollments found for this search. |
| 296 | Inscrito em {date} | Enrolled on {date} |

## SEO (título e descrição) (`meta`) — 8 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | TennisPool – Grupos de Tênis Online | TennisPool – Online Tennis Pools |
| 2 | TennisPool: participe de grupos de tênis, faça palpites nos jogos e dispute no ranking com seus amigos. | TennisPool: join tennis pools, predict matches, and compete on the leaderboard with your friends. |
| 3 | TennisPool,grupo de tênis,palpites,ranking,torneios de tênis | TennisPool,tennis pool,predictions,ranking,tennis tournaments |
| 4 | TennisPool – Grupos de Tênis Online | TennisPool – Online Tennis Pools |
| 5 | Participe de grupos de tênis com pontos por palpites e dispute com seus amigos. | Join tennis pools with prediction points and compete with your friends. |
| 6 | Logo do TennisPool | TennisPool logo |
| 7 | TennisPool – Grupos de Tênis | TennisPool – Tennis Pools |
| 8 | TennisPool: faça palpites, acumule pontos e veja seu nome no topo do ranking. | TennisPool: make predictions, earn points, and climb the rankings. |

## Componentes de UI (paginação, dialog) (`ui`) — 12 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Anterior | Previous |
| 2 | Próxima | Next |
| 3 | Ir para a página anterior | Go to previous page |
| 4 | Ir para a próxima página | Go to next page |
| 5 | Mais páginas | More pages |
| 6 | Selecione... | Select... |
| 7 | Buscar... | Search... |
| 8 | Nenhum resultado encontrado. | No results found. |
| 9 | Fechar | Close |
| 10 | Ex: {example} | e.g. {example} |
| 11 | Paginação | Pagination |
| 12 | Profissional de tênis | Tennis professional |

## Mensagens de erro e sucesso do servidor (`errors`) — 119 textos

| # | Português (PT) | English (EN) |
|---:|----------------|--------------|
| 1 | Todos os campos obrigatórios devem ser preenchidos | All required fields must be filled in |
| 2 | A senha deve ter pelo menos 6 caracteres | Password must be at least 6 characters |
| 3 | Este e-mail já está cadastrado | This email is already registered |
| 4 | Erro ao criar conta. Tente novamente. | Could not create account. Please try again. |
| 5 | E-mail e senha são obrigatórios | Email and password are required |
| 6 | E-mail ou senha incorretos | Incorrect email or password |
| 7 | Sua conta está inativa. Entre em contato com o administrador. | Your account is inactive. Contact an administrator. |
| 8 | O e-mail é obrigatório. | Email is required. |
| 9 | Se o e-mail estiver cadastrado, você receberá um código em instantes. | If the email is registered, you will receive a code shortly. |
| 10 | Limite de tentativas excedido. Aguarde {n} minuto(s). | Too many attempts. Wait {n} minute(s). |
| 11 | Um código já foi enviado e ainda é válido. Verifique seu e-mail. | A code was already sent and is still valid. Check your email. |
| 12 | Código enviado com sucesso! | Code sent successfully! |
| 13 | Ocorreu um erro ao enviar o e-mail. Tente novamente. | Could not send the email. Please try again. |
| 14 | E-mail e código são obrigatórios. | Email and code are required. |
| 15 | Solicitação de recuperação não encontrada ou expirada. | Recovery request not found or expired. |
| 16 | O código expirou. Solicite um novo. | The code has expired. Request a new one. |
| 17 | Limite de tentativas excedido. O código foi invalidado. | Too many attempts. The code was invalidated. |
| 18 | Código incorreto. Você tem mais {n} tentativa(s). | Incorrect code. You have {n} attempt(s) left. |
| 19 | Todos os campos são obrigatórios. | All fields are required. |
| 20 | Erro ao realizar login automático. | Could not sign you in automatically. |
| 21 | Não autorizado | Unauthorized |
| 22 | Dados inválidos | Invalid data |
| 23 | Já inscrito neste torneio | Already enrolled in this tournament |
| 24 | Inscrição realizada com sucesso! | Enrollment successful! |
| 25 | Erro ao processar inscrição | Could not process enrollment |
| 26 | O nome do grupo é obrigatório | Group name is required |
| 27 | Ocorreu um erro ao criar o grupo | Could not create the group |
| 28 | Grupo não encontrado | Group not found |
| 29 | Este grupo requer senha | This group requires a password |
| 30 | Senha incorreta | Incorrect password |
| 31 | Ocorreu um erro ao entrar no grupo | Could not join the group |
| 32 | Ocorreu um erro ao sair do grupo | Could not leave the group |
| 33 | Ocorreu um erro ao atualizar o grupo | Could not update the group |
| 34 | Ocorreu um erro ao excluir o grupo | Could not delete the group |
| 35 | Nome é obrigatório | Name is required |
| 36 | Clube em que joga tênis é obrigatório | Tennis club is required |
| 37 | Estado e cidade são obrigatórios para Brasil | State and city are required for Brazil |
| 38 | Nome deve ter pelo menos 2 caracteres | Name must be at least 2 characters |
| 39 | Erro ao atualizar perfil | Could not update profile |
| 40 | Você precisa estar logado para alterar a senha | You must be signed in to change your password |
| 41 | Digite sua senha atual | Enter your current password |
| 42 | Digite a nova senha | Enter the new password |
| 43 | A nova senha deve ser diferente da atual | New password must be different from the current one |
| 44 | Usuário não encontrado | User not found |
| 45 | Senha atual incorreta | Current password is incorrect |
| 46 | Senha alterada com sucesso! | Password changed successfully! |
| 47 | Erro interno ao atualizar senha | Could not update password |
| 48 | Chaveamento ainda não disponível. | Bracket is not available yet. |
| 49 | Palpite inválido. | Invalid prediction. |
| 50 | Palpite inválido para este torneio. | Invalid prediction for this tournament. |
| 51 | Preencha todos os confrontos antes de finalizar. | Fill in all matches before finalizing. |
| 52 | Aguarde todos os jogadores da chave serem definidos antes de finalizar. | Wait until all bracket players are set before finalizing. |
| 53 | Revise a chave: há palpite em confronto sem jogador definido. | Review the bracket: a prediction points to an undefined matchup. |
| 54 | Você precisa estar inscrito no torneio para fazer palpites | You must be enrolled in the tournament to make predictions |
| 55 | O torneio já começou e não é mais possível fazer palpites | The tournament has started; predictions are closed |
| 56 | O torneio já começou e não é mais possível alterar os palpites | The tournament has started; predictions can no longer be changed |
| 57 | Ocorreu um erro. Tente novamente. | Something went wrong. Please try again. |
| 58 | Todos os campos são obrigatórios | All fields are required |
| 59 | Preencha todos os campos obrigatórios | Required fields are missing |
| 60 | Faltam campos obrigatórios | Required fields are missing |
| 61 | Nome obrigatório | Name is required |
| 62 | Nenhum jogador encontrado | No players found |
| 63 | Erro ao preparar torneio | Could not prepare tournament |
| 64 | Erro ao resetar torneio | Could not reset tournament |
| 65 | Erro ao publicar torneio | Could not publish tournament |
| 66 | Erro ao cancelar pontuação | Could not void points |
| 67 | Erro ao atualizar o prêmio do torneio | Could not update tournament prize |
| 68 | Erro ao atualizar a data do torneio | Could not update tournament date |
| 69 | Erro ao atualizar usuário | Could not update user |
| 70 | Nome do clube é obrigatório | Club name is required |
| 71 | Erro ao cadastrar clube | Could not create club |
| 72 | ID e nome do clube são obrigatórios | Club ID and name are required |
| 73 | Clube não encontrado | Club not found |
| 74 | Erro ao atualizar clube | Could not update club |
| 75 | ID do clube é obrigatório | Club ID is required |
| 76 | Erro ao excluir clube | Could not delete club |
| 77 | Torneio não encontrado | Tournament not found |
| 78 | ID da API ATP não configurado para este torneio | ATP API ID is not configured for this tournament |
| 79 | Chaveamento ainda não foi gerado no sistema | Bracket has not been generated yet |
| 80 | Erro ao excluir. O item pode estar em uso. | Could not delete. The item may be in use. |
| 81 | Erro ao sincronizar com ATP. Tente novamente mais tarde. | Could not sync with ATP. Try again later. |
| 82 | Final não encontrada para este torneio. | Final match not found for this tournament. |
| 83 | Cadastre o resultado da final antes de finalizar o torneio. | Enter the final result before finishing the tournament. |
| 84 | Não foi possível identificar o vice-campeão. | Could not identify the runner-up. |
| 85 | Erro ao finalizar torneio | Could not finish tournament |
| 86 | Apenas torneios em rascunho ou em breve podem ser excluídos. | Only draft or upcoming tournaments can be deleted. |
| 87 | Erro ao excluir torneio. Verifique se existem dependências. | Could not delete tournament. Check for dependencies. |
| 88 | Torneio já está preparado ou em outro status | Tournament is already prepared or in another status |
| 89 | Chaveamento não gerado | Bracket not generated |
| 90 | Nenhum jogador cadastrado | No players registered |
| 91 | Chaveamento já foi gerado para este torneio | Bracket already generated for this tournament |
| 92 | Não é possível excluir o jogador, pois ele já possui partidas ou palpites vinculados. | Cannot delete player: they already have matches or predictions linked. |
| 93 | Erro ao atualizar jogador. Verifique se o nome já existe. | Could not update player. The name may already exist. |
| 94 | Games não podem ser negativos | Games cannot be negative |
| 95 | Sets extras após o vencedor ser definido | Extra sets after the winner was decided |
| 96 | Partida não encontrada | Match not found |
| 97 | O torneio já foi finalizado e os resultados não podem ser alterados. | Tournament is finished; results cannot be changed. |
| 98 | O torneio ainda não foi publicado. Publique-o antes de lançar resultados. | Tournament is not published yet. Publish it before entering results. |
| 99 | O vencedor selecionado não faz parte deste confronto. | Selected winner is not part of this match. |
| 100 | Erro ao salvar resultado | Could not save result |
| 101 | Erro ao limpar resultado | Could not clear result |
| 102 | Erro ao criar torneio | Could not create tournament |
| 103 | Sincronização permitida apenas uma vez a cada 24 horas. Tente novamente em {hours}h {minutes}min. | Sync is allowed only once every 24 hours. Try again in {hours}h {minutes}min. |
| 104 | Um torneio com este nome para o ano de {year} já existe (slug: {slug}). | A tournament with this name for year {year} already exists (slug: {slug}). |
| 105 | Placar de set inválido: {set} | Invalid set score: {set} |
| 106 | Set incompleto ou inválido: {set} | Incomplete or invalid set: {set} |
| 107 | Placar impossível: {set} | Impossible score: {set} |
| 108 | Placar inválido: {set} | Invalid score: {set} |
| 109 | Partida incompleta. São necessários {setsToWin} sets para vencer. | Incomplete match. {setsToWin} sets are required to win. |
| 110 | Nenhuma partida encontrada no chaveamento da ATP. | No matches found in the ATP draw. |
| 111 | Erro ao sincronizar chaveamento: {message} | Could not sync bracket: {message} |
| 112 | O vencedor selecionado não coincide com o placar dos sets | Selected winner does not match the set score |
| 113 | Erro ao gerar chaves aleatórias | Could not generate random draw |
| 114 | Nome truncado no PDF não pôde ser associado com segurança: {name} ({country}) | Truncated PDF name could not be safely matched: {name} ({country}) |
| 115 | sem país | no country |
| 116 | Erro ao carregar países | Could not load countries |
| 117 | Erro ao carregar estados | Could not load states |
| 118 | Erro ao carregar cidades | Could not load cities |
| 119 | Estado inválido | Invalid state |

## Observações para o cliente

1. **Troca de idioma:** o usuário escolhe PT ou EN no seletor (globo) do site.
2. **Cobertura:** interface do participante + painel admin + erros de formulário/API.
3. **E-mail de recuperação de senha:** também existe em PT e EN (código bilíngue no servidor).
4. **Novos textos:** se forem criadas telas ou mensagens novas, devem entrar neste catálogo para manter os dois idiomas.

---

*Documento gerado automaticamente a partir dos arquivos de tradução do projeto.*
