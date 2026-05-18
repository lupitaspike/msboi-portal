// MS Boi - Base de conhecimento do chatbot de RH
// Fontes: CLT (Decreto-Lei 5.452/1943 com alterações), NR-36 (Portaria MTE 555/2013),
// e modelo de CCT (a ser substituído pela CCT vigente da MS Boi).
//
// COMO ATUALIZAR: adicione/edite entradas neste array. Cada entrada tem:
//   pergunta: como o usuário normalmente perguntaria
//   keywords: termos-chave para o matcher
//   resposta: texto de resposta (markdown simples)
//   categoria: férias | jornada | nr36 | salario | beneficios | rescisao | saude | cct
//   fonte: citação da norma de origem

module.exports = [
  // =====================================================================
  // FÉRIAS
  // =====================================================================
  {
    pergunta: 'Quantos dias de férias eu tenho direito?',
    keywords: ['ferias', 'direito', 'dias', 'descanso anual'],
    categoria: 'ferias',
    fonte: 'CLT, art. 130',
    resposta:
`📅 **Férias - duração**

Você tem direito a **30 dias corridos** de férias após cada 12 meses de trabalho (período aquisitivo), desde que tenha tido até 5 faltas injustificadas no período.

A escala completa por faltas (CLT, art. 130):
• Até 5 faltas: 30 dias de férias
• 6 a 14 faltas: 24 dias
• 15 a 23 faltas: 18 dias
• 24 a 32 faltas: 12 dias
• Acima de 32 faltas: você perde o direito ao descanso anual.`,
  },
  {
    pergunta: 'Posso vender minhas férias?',
    keywords: ['vender', 'abono', 'pecuniario', 'ferias dinheiro'],
    categoria: 'ferias',
    fonte: 'CLT, art. 143',
    resposta:
`💰 **Abono pecuniário (venda de férias)**

Sim. Você pode "vender" até **1/3 das férias** (10 dias) e receber em dinheiro. Os outros 20 dias você precisa descansar.

Para isso:
• Faça o pedido por escrito ao RH com **15 dias de antecedência** do fim do período aquisitivo.
• É um direito do trabalhador — a empresa não pode recusar se o prazo foi respeitado.
• O abono é pago **junto com as férias** e tem o mesmo adicional de 1/3.`,
  },
  {
    pergunta: 'Posso dividir minhas férias em mais de um período?',
    keywords: ['dividir', 'parcelar', 'fracionar ferias', 'partes'],
    categoria: 'ferias',
    fonte: 'CLT, art. 134, §1º (Reforma Trabalhista)',
    resposta:
`📆 **Parcelamento de férias**

Sim, desde a Reforma Trabalhista (Lei 13.467/2017), férias podem ser divididas em **até 3 períodos**, desde que:
• Um dos períodos tenha **no mínimo 14 dias corridos**.
• Os outros dois tenham **no mínimo 5 dias corridos cada**.
• Haja **concordância do trabalhador**.

Não é possível iniciar férias dois dias antes de feriados ou do descanso semanal.`,
  },
  {
    pergunta: 'Quando recebo o pagamento das férias?',
    keywords: ['pagamento ferias', 'quando recebo ferias', 'antecipa'],
    categoria: 'ferias',
    fonte: 'CLT, art. 145',
    resposta:
`💸 **Pagamento das férias**

O valor das férias (salário + 1/3 constitucional) deve ser pago **até 2 dias antes do início do descanso**.

Composição do pagamento:
• Salário do período (proporcional aos dias de férias)
• **Adicional de 1/3** sobre o salário (garantia constitucional)
• Médias de horas extras, adicional noturno, insalubridade etc., se houver.`,
  },

  // =====================================================================
  // JORNADA E HORAS EXTRAS
  // =====================================================================
  {
    pergunta: 'Qual é a jornada máxima de trabalho?',
    keywords: ['jornada', 'horas trabalho', 'maxima', 'limite horas'],
    categoria: 'jornada',
    fonte: 'CF/88 art. 7º, XIII e CLT art. 58',
    resposta:
`⏰ **Jornada de trabalho**

A jornada máxima legal é de:
• **8 horas diárias**
• **44 horas semanais**
• **220 horas mensais** (aproximadamente)

Acima disso é hora extra, com adicional de no mínimo 50% (dias úteis) ou 100% (domingos e feriados, conforme CCT).

⚠️ Em frigoríficos, a NR-36 traz regras específicas sobre pausas e ritmo de trabalho — veja a pergunta sobre pausas.`,
  },
  {
    pergunta: 'Como funciona a hora extra?',
    keywords: ['hora extra', 'adicional', 'extra', 'além da jornada'],
    categoria: 'jornada',
    fonte: 'CF/88 art. 7º, XVI e CLT art. 59',
    resposta:
`💼 **Hora extra**

Toda hora trabalhada além da jornada normal é hora extra, com adicional:
• **No mínimo 50%** sobre a hora normal em dias úteis (a CCT MS Boi pode definir percentual maior — confirme com o RH).
• **100%** em domingos e feriados, salvo compensação.

Limite legal: até **2 horas extras por dia**.

A hora extra pode ser compensada por banco de horas, conforme acordo coletivo e individual.`,
  },
  {
    pergunta: 'Como funciona o banco de horas?',
    keywords: ['banco de horas', 'compensacao', 'compensar'],
    categoria: 'jornada',
    fonte: 'CLT art. 59, §§ 2º a 6º',
    resposta:
`🕓 **Banco de horas**

O banco de horas permite trocar horas extras por folgas no futuro.

Regras gerais:
• **Acordo individual escrito**: compensação em até 6 meses.
• **Acordo coletivo (CCT MS Boi)**: compensação em até 1 ano.
• Se não compensar no prazo, as horas viram extras com adicional pago em dinheiro.
• Não é permitido em alguns regimes especiais — confirme com o RH se você está em jornada 12x36 ou similar.`,
  },
  {
    pergunta: 'Tenho direito a adicional noturno?',
    keywords: ['adicional noturno', 'noite', 'turno noturno'],
    categoria: 'jornada',
    fonte: 'CLT art. 73',
    resposta:
`🌙 **Adicional noturno**

Trabalho noturno (das **22h às 5h** para trabalhadores urbanos) gera adicional de **no mínimo 20%** sobre a hora normal.

Importante:
• A hora noturna é "reduzida": vale 52 minutos e 30 segundos.
• A CCT da MS Boi pode prever percentual maior — confirme.
• Se você é menor de 18 anos, **não pode** trabalhar à noite.`,
  },

  // =====================================================================
  // NR-36 - FRIGORÍFICO (regras específicas do setor)
  // =====================================================================
  {
    pergunta: 'Quais são as pausas a que tenho direito na NR-36?',
    keywords: ['pausa', 'nr36', 'descanso', 'parada', 'intervalo termico'],
    categoria: 'nr36',
    fonte: 'NR-36, item 36.13 (Pausas Psicofisiológicas)',
    resposta:
`🛑 **Pausas obrigatórias NR-36 (frigoríficos)**

A NR-36, item 36.13, garante **pausas psicofisiológicas** para quem trabalha em atividades de abate e processamento de carnes, considerando o ritmo intenso e o ambiente frio.

Tempo de pausa conforme jornada (NR-36, Quadro I):
• Jornada de 6h00 a 6h40 → **20 minutos** de pausa
• Jornada de 6h40 a 7h20 → **45 minutos** de pausa
• Jornada de 7h20 a 8h00 → **60 minutos** de pausa
• Jornada de 8h00 a 8h48 → **60 minutos** de pausa

Regras:
• **Não confundem** com o intervalo de almoço.
• Devem ser concedidas em **local apropriado** (área de descanso, sem ruído excessivo).
• São **remuneradas** e **contam como tempo de trabalho**.
• Devem ser fracionadas ao longo do turno (não juntar tudo no fim).`,
  },
  {
    pergunta: 'Tenho direito a adicional de insalubridade no frigorífico?',
    keywords: ['insalubridade', 'adicional', 'frio', 'umidade'],
    categoria: 'nr36',
    fonte: 'NR-15 (anexo 9 - Frio) + NR-36',
    resposta:
`❄️ **Insalubridade em frigorífico**

A atividade em câmaras frias e ambientes artificialmente refrigerados é considerada **insalubre em grau médio** pela NR-15 (Anexo 9), gerando adicional de **20% sobre o salário mínimo** (ou base prevista em CCT).

Pontos importantes:
• Depende do **laudo técnico (PCMSO/LTCAT)** da empresa.
• A MS Boi precisa fornecer EPIs (luvas térmicas, capuz, jaqueta) — sem isso, a insalubridade é devida; com EPIs adequados que neutralizem, pode ser descaracterizada.
• A CCT do setor pode estabelecer **base de cálculo diferente** (salário-base em vez de mínimo) — consulte o RH.

Para conferir o seu enquadramento, peça ao RH o **laudo de insalubridade do seu posto**.`,
  },
  {
    pergunta: 'A empresa precisa fornecer EPI?',
    keywords: ['epi', 'equipamento protecao', 'luva', 'bota', 'jaqueta'],
    categoria: 'nr36',
    fonte: 'NR-6 + NR-36 item 36.11',
    resposta:
`🦺 **EPI - Equipamento de Proteção Individual**

Sim. A MS Boi é obrigada a fornecer EPIs **gratuitamente**, em quantidade adequada, e a substituí-los quando estragarem.

Em frigoríficos a NR-36 reforça:
• Luvas resistentes a corte e ao frio
• Calçados de segurança antiderrapantes
• Avental, perneira e jaqueta térmica
• Protetor auricular para áreas com ruído acima de 85 dB
• Touca, máscara e proteção facial conforme o posto

Suas obrigações como trabalhador:
• Usar o EPI corretamente durante toda a jornada
• Cuidar da conservação
• Comunicar imediatamente qualquer dano
• A recusa injustificada pode gerar advertência.`,
  },
  {
    pergunta: 'Posso recusar trabalhar se a empresa não fornecer EPI?',
    keywords: ['recusar', 'epi', 'risco grave', 'iminente'],
    categoria: 'nr36',
    fonte: 'NR-1 item 1.4.3 + CLT art. 161',
    resposta:
`⚠️ **Direito de recusa (risco grave e iminente)**

Sim. Se houver **risco grave e iminente** à sua saúde ou segurança — incluindo falta de EPI essencial — você pode interromper as atividades e comunicar imediatamente ao superior.

Como agir:
1. Pare a atividade
2. Comunique o líder/encarregado **imediatamente**
3. Informe o **CIPA** (Comissão Interna de Prevenção de Acidentes)
4. Se persistir, procure o **SESMT** ou diretamente o RH

A empresa **não pode** retaliar por essa recusa. Em caso de retaliação, registre por escrito e procure o sindicato ou MPT.`,
  },
  {
    pergunta: 'Como funciona o revezamento em postos de trabalho repetitivos?',
    keywords: ['revezamento', 'repetitivo', 'rodizio', 'rotacao postos'],
    categoria: 'nr36',
    fonte: 'NR-36 item 36.5.3',
    resposta:
`🔄 **Revezamento entre postos**

A NR-36 prevê **rodízio entre postos com diferentes exigências** (físicas, posturais, cognitivas) para reduzir o risco de LER/DORT — comum em desossa, embalagem, evisceração etc.

Pontos chave:
• A organização do revezamento é responsabilidade da empresa, com base em análise ergonômica (NR-17 e NR-36).
• Não basta trocar de bancada se a atividade é praticamente igual — o rodízio precisa trazer **descarga muscular real**.
• Trabalhadores devem ser **treinados** antes de assumir cada posto.

Se você sentir dor recorrente, registre no posto de saúde da empresa e peça reavaliação do PCMSO.`,
  },

  // =====================================================================
  // SALÁRIO, FGTS, BENEFÍCIOS
  // =====================================================================
  {
    pergunta: 'Quando devo receber meu salário?',
    keywords: ['pagamento salario', 'data pagamento', 'quando recebo'],
    categoria: 'salario',
    fonte: 'CLT art. 459',
    resposta:
`💵 **Pagamento do salário**

O salário deve ser pago **no máximo até o 5º dia útil do mês seguinte** ao trabalhado.

Importante:
• Sábado conta como dia útil para esse prazo.
• Atraso reiterado pode gerar rescisão indireta (justa causa do empregador).
• A MS Boi pode pagar adiantamento (vale) na quinzena conforme prática/CCT.`,
  },
  {
    pergunta: 'O que é FGTS e quanto a empresa deposita?',
    keywords: ['fgts', 'fundo garantia', 'deposito 8%'],
    categoria: 'salario',
    fonte: 'Lei 8.036/1990',
    resposta:
`🏦 **FGTS - Fundo de Garantia do Tempo de Serviço**

A empresa deposita mensalmente **8% do seu salário bruto** em conta vinculada na Caixa Econômica, no seu nome.

Você pode sacar o FGTS em situações como:
• Demissão sem justa causa (+ multa de 40%)
• Aposentadoria
• Compra da casa própria (com regras)
• Doença grave (própria, cônjuge, filho)
• Saque-aniversário (modalidade opcional)

Confira seus depósitos no **app FGTS** da Caixa ou em [https://www.fgts.gov.br](https://www.fgts.gov.br). Se houver falha de depósito, procure o RH e, se persistir, o sindicato/MPT.`,
  },
  {
    pergunta: 'Como funciona o vale-transporte?',
    keywords: ['vale transporte', 'vt', 'passagem', 'desconto vt'],
    categoria: 'beneficios',
    fonte: 'Lei 7.418/1985',
    resposta:
`🚌 **Vale-transporte**

É **direito do trabalhador** que utiliza transporte público para ir e voltar do trabalho.

Como funciona:
• Você pede ao RH, indicando os meios de transporte que usa.
• A empresa desconta **no máximo 6% do salário básico** para custear o VT.
• Tudo acima desses 6% é por conta da empresa.

⚠️ Se você não utiliza transporte público (vem a pé, de moto/carro próprio, ou de fretado da empresa), não tem direito ao VT em dinheiro.`,
  },
  {
    pergunta: 'Tenho direito a vale-alimentação?',
    keywords: ['vale alimentacao', 'va', 'vr', 'refeicao', 'cesta basica'],
    categoria: 'beneficios',
    fonte: 'CCT do setor (variável)',
    resposta:
`🍽️ **Vale-alimentação / refeição / cesta básica**

Estes benefícios **não são obrigatórios pela CLT**, mas costumam estar previstos na **CCT do setor de frigoríficos**.

Na MS Boi, conforme a CCT vigente:
• Valor e forma de fornecimento (VA, VR, cesta básica) — consulte o RH.
• Costuma haver desconto simbólico (1% a 2% do salário, dependendo da CCT).
• Em afastamentos por doença ou acidente, o benefício pode ser mantido conforme a CCT.

⚠️ Esta é uma área onde a **CCT MS Boi** prevalece sobre a CLT. Quando você anexar o documento da CCT, atualizo esta resposta com os valores exatos.`,
  },

  // =====================================================================
  // ATESTADO, SAÚDE, AFASTAMENTO
  // =====================================================================
  {
    pergunta: 'Como funciona o atestado médico?',
    keywords: ['atestado', 'medico', 'falta justificada', 'doenca'],
    categoria: 'saude',
    fonte: 'CLT art. 6º, Lei 8.213/91',
    resposta:
`🏥 **Atestado médico**

O atestado é o documento que justifica sua falta por motivo de saúde.

Regras:
• **Até 15 dias** de afastamento: **a empresa paga** seu salário normalmente.
• **A partir do 16º dia**: o **INSS** assume (auxílio-doença ou auxílio-acidente).
• Entregue o atestado ao RH em **até 48 horas** após emissão, idealmente.
• Atestados devem conter: data, CID (se você autorizar), tempo de afastamento, CRM/registro do profissional e assinatura.

Atestados aceitos:
• Médicos e dentistas
• Profissional do convênio da empresa (se houver)
• Conforme CCT, outros profissionais (psicólogo, fisioterapeuta) em casos específicos.`,
  },
  {
    pergunta: 'Quantos dias posso faltar por doença em pessoa da família?',
    keywords: ['filho doente', 'familiar doente', 'acompanhante', 'consulta filho'],
    categoria: 'saude',
    fonte: 'CLT art. 473 + Lei 13.257/2016',
    resposta:
`👨‍👩‍👧 **Falta para acompanhar familiar**

A CLT (art. 473) permite faltas justificadas, sem desconto, em casos como:
• **Consultas e exames de filho até 6 anos**: até 1 dia/ano
• **Acompanhamento de gestante (companheira)**: até 2 dias para consultas pré-natais (e 1 dia para ultrassom)
• **Acompanhar filho até 6 anos em consulta**: 1 dia/ano

⚠️ A CCT MS Boi pode **ampliar esses direitos** (mais dias, mais idades, outros familiares). Quando a CCT for anexada, atualizo esta resposta.

Sempre traga o **comprovante** (atestado de acompanhamento, declaração da unidade de saúde).`,
  },
  {
    pergunta: 'Como funciona a licença-maternidade?',
    keywords: ['licenca maternidade', 'gravidez', 'parto', 'gestante'],
    categoria: 'saude',
    fonte: 'CF/88 art. 7º, XVIII e Lei 11.770/2008',
    resposta:
`🤰 **Licença-maternidade**

Duração: **120 dias** (cerca de 4 meses), com possibilidade de extensão para **180 dias** se a empresa for participante do Programa Empresa Cidadã.

Pontos importantes:
• Pode começar até **28 dias antes do parto**.
• Salário-maternidade pago pela empresa, com posterior compensação no INSS.
• **Estabilidade**: a gestante não pode ser demitida sem justa causa desde a confirmação da gravidez até **5 meses após o parto**.
• Adoção e guarda judicial dão os mesmos direitos.

A MS Boi participa do Programa Empresa Cidadã? Consulte o RH.`,
  },
  {
    pergunta: 'Como funciona a licença-paternidade?',
    keywords: ['licenca paternidade', 'pai', 'nascimento filho'],
    categoria: 'saude',
    fonte: 'CF/88 art. 7º, XIX e Lei 13.257/2016',
    resposta:
`👨‍👶 **Licença-paternidade**

O pai tem direito a **5 dias corridos** contados do nascimento do filho (CLT) — extensíveis a **20 dias** se a empresa aderiu ao Programa Empresa Cidadã.

Como solicitar:
• Comunique o RH antes da data prevista.
• Apresente a certidão de nascimento (ou declaração do hospital) em até 48h após o parto.`,
  },

  // =====================================================================
  // RESCISÃO
  // =====================================================================
  {
    pergunta: 'O que recebo se for demitido sem justa causa?',
    keywords: ['demissao', 'sem justa causa', 'rescisao', 'mandar embora'],
    categoria: 'rescisao',
    fonte: 'CLT art. 477 e Lei 8.036/90',
    resposta:
`📤 **Demissão sem justa causa**

Direitos do trabalhador:
• **Saldo de salário** dos dias trabalhados no mês
• **Aviso prévio**: 30 dias + 3 dias por ano de empresa (até 90 dias). Pode ser trabalhado ou indenizado.
• **Férias vencidas** (se houver) + 1/3 constitucional
• **Férias proporcionais** + 1/3
• **13º salário proporcional**
• **Saque do FGTS** + **multa de 40%** sobre o saldo
• **Seguro-desemprego** (3 a 5 parcelas, dependendo do tempo de trabalho)
• **Guia para sacar o FGTS** e **chave de conectividade** para seguro-desemprego

Prazo de pagamento: até **10 dias** do término do contrato (CLT art. 477, §6º).`,
  },
  {
    pergunta: 'O que perco se pedir demissão?',
    keywords: ['pedir demissao', 'sair voluntariamente', 'pedir conta'],
    categoria: 'rescisao',
    fonte: 'CLT art. 487 e 477',
    resposta:
`📥 **Pedido de demissão**

Você ainda tem direito a:
• Saldo de salário
• Férias vencidas + 1/3
• Férias proporcionais + 1/3
• 13º proporcional

Você **perde**:
• Multa de 40% do FGTS
• Direito de **sacar o FGTS** (fica retido na conta)
• **Seguro-desemprego**
• Aviso prévio (na verdade, **você cumpre** o aviso ou paga à empresa o valor equivalente)

Alternativa: **distrato (rescisão por acordo)** – CLT art. 484-A.
• Você recebe metade do aviso prévio
• Multa de 20% do FGTS
• Pode sacar até 80% do FGTS
• **Não** tem direito a seguro-desemprego`,
  },
  {
    pergunta: 'O que é rescisão indireta?',
    keywords: ['rescisao indireta', 'justa causa empregador', 'patrao errado'],
    categoria: 'rescisao',
    fonte: 'CLT art. 483',
    resposta:
`⚖️ **Rescisão indireta**

É quando **o empregador comete falta grave** e o trabalhador tem direito a romper o contrato como se fosse uma demissão sem justa causa.

Hipóteses (CLT art. 483):
• Exigir serviços além das forças, defesos por lei ou contrário aos bons costumes
• Tratar o empregado com rigor excessivo
• Risco manifesto de mal considerável
• Não cumprir as obrigações do contrato (ex: não pagar salário em dia, não recolher FGTS)
• Praticar ato lesivo à honra
• Reduzir o trabalho de forma a afetar o salário

Importante: a rescisão indireta deve ser **comprovada na Justiça do Trabalho**. Procure um advogado ou o sindicato antes de simplesmente parar de comparecer.`,
  },

  // =====================================================================
  // CCT MS BOI - placeholders
  // =====================================================================
  {
    pergunta: 'O que diz a CCT da MS Boi?',
    keywords: ['cct', 'convencao coletiva', 'sindicato', 'acordo coletivo'],
    categoria: 'cct',
    fonte: 'CCT MS Boi (a anexar)',
    resposta:
`📜 **CCT MS Boi**

A Convenção Coletiva de Trabalho (CCT) é o acordo entre o sindicato dos trabalhadores e o sindicato patronal do setor, e prevalece sobre a CLT em vários pontos, como:
• Reajustes salariais e pisos
• Adicional de hora extra (pode ser maior que 50%)
• Vale-alimentação / cesta básica
• Plano de saúde
• Auxílio-creche
• Estabilidades específicas
• Regras de banco de horas
• Folgas extras (aniversário, etc.)

⚠️ Esta base de conhecimento ainda **não tem a CCT MS Boi vigente** carregada. Assim que você anexar o documento, vou indexar e atualizar as respostas com os valores e regras específicos.

Por enquanto, para qualquer dúvida que dependa de CCT, **procure o RH** ou o sindicato.`,
  },

  // =====================================================================
  // GENÉRICAS DE NAVEGAÇÃO
  // =====================================================================
  {
    pergunta: 'Como acesso meu holerite?',
    keywords: ['acessar holerite', 'ver holerite', 'baixar contracheque', 'contracheque'],
    categoria: 'navegacao',
    fonte: 'Portal MS Boi',
    resposta:
`📄 **Acessar holerite**

No próprio app:
1. Faça login com sua matrícula, CPF e senha.
2. No menu, toque em **Holerites**.
3. Selecione o mês desejado e visualize ou baixe o PDF.

Disponível também:
• Histórico dos últimos 12 meses
• 13º salário e adiantamentos
• Em caso de dúvida sobre o valor, abra um recado para o RH.`,
  },
  {
    pergunta: 'Como faço para falar com o RH?',
    keywords: ['falar rh', 'contato rh', 'duvida rh', 'recursos humanos contato'],
    categoria: 'navegacao',
    fonte: 'Portal MS Boi',
    resposta:
`💬 **Falar com o RH**

Canais oficiais:
• Pelo app: aba **Recados** → criar nova mensagem para o RH.
• Presencialmente: setor de RH em horário comercial.
• Casos urgentes (acidente, risco): comunique imediatamente seu encarregado e o SESMT.

Para questões sensíveis (assédio, denúncia), use o canal de denúncia confidencial (se a empresa tiver) ou procure o sindicato.`,
  },
];
