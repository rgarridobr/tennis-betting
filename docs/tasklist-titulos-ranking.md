# Tasklist: títulos nos rankings

## Decisões do produto

- [ ] Confirmar o modelo de disputa: um ranking único por torneio, sem separar participantes em grupos.
- [ ] Confirmar a regra de elegibilidade: menos de 20 inscritos não concede título; a partir de 20, premiar `floor(inscritos / 20)` colocações (20–39: 1; 40–59: 2; 60–79: 3; e assim por diante).
- [ ] Definir qual total de inscritos determina a faixa e quando ele fica congelado. Sugestão: inscrições válidas no início do torneio, para a premiação não mudar no meio da disputa.
- [ ] Definir os empates na última colocação premiada. Sugestão: todos os empatados recebem o título, mesmo se o total concedido superar a quantidade da faixa.
- [ ] Definir as categorias elegíveis e o tratamento de torneios especiais, cancelados ou sem resultado final: Grand Slam, Masters 1000 e ATP 500.
- [ ] Aprovar os ícones: identidade visual própria para Grand Slams; bolinha de tênis para Masters 1000; ícone/bolinha de outra cor para ATP 500.

## Dados e regras

- [ ] Revisar o modelo atual de torneios, inscrições e ranking em `lib/data.ts` e no schema do banco.
- [ ] Criar uma forma persistente de registrar títulos concedidos por participante e torneio, incluindo categoria, colocação e nome exibido do torneio.
- [ ] Implementar a concessão idempotente dos títulos após o encerramento e fechamento do resultado do torneio.
- [ ] Usar o ranking final já calculado pelo app e aplicar de forma consistente a regra de corte e empate.
- [ ] Definir como corrigir/recalcular títulos caso o administrador altere um resultado ou reabra um torneio.
- [ ] Excluir participantes sem inscrição válida e torneios que não atinjam os critérios definidos.

## Interface

- [ ] Exibir os títulos junto ao nome do participante no ranking geral e nas outras listas de ranking escolhidas para a primeira entrega.
- [ ] Mostrar os selos sem deslocar pontos, posição, acertos ou precisão; em listas longas, limitar a prévia e indicar quantos títulos adicionais existem.
- [ ] Exibir nome do torneio e categoria no hover e também por foco/teclado e toque, com rótulo acessível para leitores de tela.
- [ ] Permitir consultar a coleção completa de títulos no perfil do participante.
- [ ] Criar estados vazios e adaptar o layout para nomes longos, muitos títulos e telas pequenas.
- [ ] Adicionar textos traduzidos em português e inglês para categorias, nomes acessíveis e informações dos títulos.

## Validação e lançamento

- [ ] Conferir cenários de 0, 19, 20, 39, 40, 59, 60 e 80 inscritos.
- [ ] Conferir empate antes, na e depois da última colocação premiada.
- [ ] Conferir que reprocessar o fechamento não duplica títulos e que uma correção de resultado atualiza a premiação corretamente.
- [ ] Validar navegação por teclado, leitura acessível dos selos e comportamento em celular.
- [ ] Preparar a migração de banco e aplicar em ambiente de homologação.
- [ ] Fazer uma simulação com um torneio já encerrado antes de ativar a concessão para o Australian Open.
- [ ] Publicar a regra de premiação na página de regras e comunicar a mudança aos participantes.
