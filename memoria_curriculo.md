# Memória de Projeto — Currículo Fácil
<!-- Developer Signature: [Jordan Araujo / Google DeepMind AAC Senior Full-Stack & CyberSecurity Architect] -->

**Data de Início/Registro:** 2026-09-18 18:34:47 (-03:00)  
**Arquiteto Responsável:** Jordan Ronald  
**Ecossistema:** Plataforma InnovPlay / Utilitários Web  
**Repositório Oficial:** `https://github.com/RONALDJORDAN/curriculo.git`

---

## 1. Visão Geral do Sistema
O **Currículo Fácil** é uma plataforma web cliente-side projetada para geração, visualização instantânea em tempo real e exportação em formato PDF A4 de currículos de alta conversão para o mercado corporativo e de tecnologia.

### Princípios Norteadores:
1. **Zero Fricção:** Sem cadastro, sem banco de dados remoto obrigatório, privacidade garantida (dados permanecem 100% no navegador do usuário via `localStorage`).
2. **Alta Conversão (ATS-Friendly):** O modelo principal é desenhado especificamente para aprovação em triagens de inteligência artificial / sistemas ATS e recrutadores humanos, com base no consagrado padrão de 8 entrevistas.
3. **Fidelidade de Impressão:** Renderização milimétrica para saída em folha A4 monocromática ou colorida sem perda de formatação.

---

## 2. Decisões Arquiteturais

### 2.1 Modelo Principal ('ATS Tech / 8 Entrevistas')
- **Estrutura:** Coluna única centralizada, eliminando tabelas pesadas ou colunas laterais que quebram o parsing de softwares ATS (Applicant Tracking Systems).
- **Cabeçalho:** Nome em caixa alta centralizado, com contatos unificados em linha e link para o perfil profissional (LinkedIn / GitHub).
- **Linhas Divisórias:** Divisores horizontais finos na cor azul corporativa (`#1d4ed8`) delimitando seções temáticas.
- **Datas e Períodos:** Alinhamento estrito à direita através de Flexbox (`justify-content: space-between`), garantindo escaneabilidade rápida em 6 segundos.
- **Seções Suportadas:**
  1. Objetivo (com cargo alvo destacado)
  2. Formação Acadêmica
  3. Experiência Profissional (bullets com impacto e conquistas)
  4. Cursos e Certificações
  5. Projetos de Destaque
  6. Habilidades Técnicas (Tech Skills)
  7. Idiomas com Proficiência
  8. Outras Habilidades
  9. Habilidades Interpessoais (Soft Skills explicadas)

### 2.2 Stack Tecnológica
- **Linguagem Estrutural:** HTML5 semântico com marcação padronizada.
- **Estilos:** Vanilla CSS moderno, sem dependências externas de frameworks pesados, garantindo carregamento instantâneo (< 200ms).
- **Lógica e Reatividade:** JavaScript puro (ES6+) desacoplado, com sanitização de inputs anti-XSS (`esc()`) e persistência segura em `localStorage`.
- **Nomenclatura de Código:** Código-fonte 100% em Inglês (variáveis, funções, IDs e classes CSS), documentação e comentários em Português do Brasil (PT-BR).

---

## 3. Histórico de Versões e Modificações

### [v2.0.0] - 2026-09-18
- **Definição de Modelo Principal:** Adoção do modelo 'Padrão 8 Entrevistas (ATS Tech)' como default absoluto da aplicação.
- **Expansão do Formulário:** Suporte nativo para Objetivo com Cargo Alvo, Cursos & Certificações dinâmicos, Projetos de Destaque com métricas e tecnologias, Idiomas e Soft Skills detalhadas.
- **Motor de Renderização em Tempo Real:** Atualização reativa de todas as 10 seções ao digitar, com suporte a remoção e adição dinâmica de cards.
- **Template de Exemplo Idêntico:** O botão 'Carregar exemplo' foi calibrado com os dados reais do currículo de referência para servir de guia aos usuários.
- **Print CSS A4 Calibrado:** Otimização para impressão direta com preservação de cores de fundo e linhas via `print-color-adjust: exact`.
