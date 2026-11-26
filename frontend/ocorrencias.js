
/* =========================================================
   ESSÊNCIA NOVA
   Cadastro e gerenciamento de ocorrências de trânsito
   Frontend conectado à API FastAPI + Supabase
   ========================================================= */

   const API_URL = 'http://127.0.0.1:8000/ocorrencias';

   /* =========================================================
      ELEMENTOS HTML
      ========================================================= */
   
   const formulario = document.querySelector('#form-ocorrencia');
   const campoId = document.querySelector('#id-ocorrencia');
   const campoLocal = document.querySelector('#local-ocorrencia');
   const campoTipo = document.querySelector('#tipo-ocorrencia');
   const campoData = document.querySelector('#data-ocorrencia');
   const campoBairro = document.querySelector('#bairro-ocorrencia');
   const campoGravidade = document.querySelector('#gravidade-ocorrencia');
   const campoDescricao = document.querySelector('#descricao-ocorrencia');
   
   const lista = document.querySelector('#lista-ocorrencias');
   const mensagem = document.querySelector('#mensagem');
   const botaoSalvar = document.querySelector('#botao-salvar');
   const buscaId = document.querySelector('#busca-id');
   
   const tituloFormulario = document.querySelector('#titulo-formulario');
   const totalOcorrencias = document.querySelector('#total-ocorrencias');
   const formularioBusca = document.querySelector('#form-busca');
   const botaoLimpar = document.querySelector('#botao-limpar');
   const botaoListar = document.querySelector('#botao-listar');
   
   /* =========================================================
      METADADOS
      A tabela Supabase atual não tem colunas específicas
      para data da ocorrência e gravidade.
   
      Guardaremos esses dados dentro da descrição usando
      marcadores próprios, para recuperá-los na edição/listagem.
      ========================================================= */
   
   const MARCADOR_DATA = '[[DATA_OCORRENCIA]]';
   const MARCADOR_GRAVIDADE = '[[GRAVIDADE]]';
   
   /* =========================================================
      MENSAGENS
      ========================================================= */
   
   function mostrarMensagem(texto, erro = false) {
       if (!mensagem) return;
   
       mensagem.textContent = texto;
       mensagem.className = erro
           ? 'mensagem erro'
           : 'mensagem';
   
       mensagem.hidden = false;
   }
   
   function ocultarMensagem() {
       if (!mensagem) return;
   
       mensagem.hidden = true;
       mensagem.textContent = '';
   }
   
   /* =========================================================
      TRATAMENTO DOS DADOS
      ========================================================= */
   
   function obterId(ocorrencia) {
       return ocorrencia.id ?? ocorrencia.id_ocorrencia ?? '';
   }
   
   function obterLocal(ocorrencia) {
       return ocorrencia.endereco
           ?? ocorrencia.local_ocorrencia
           ?? '';
   }
   
   function obterCategoria(ocorrencia) {
       return ocorrencia.categoria
           ?? ocorrencia.tipo_ocorrencia
           ?? '';
   }
   
   function obterBairro(ocorrencia) {
       return ocorrencia.bairro ?? '';
   }
   
   function obterDescricaoOriginal(descricao) {
       if (!descricao) return '';
   
       return descricao
           .split(MARCADOR_DATA)[0]
           .split(MARCADOR_GRAVIDADE)[0]
           .trim();
   }
   
   function obterData(ocorrencia) {
       if (ocorrencia.data_ocorrencia) {
           return ocorrencia.data_ocorrencia;
       }
   
       const descricao = ocorrencia.descricao || '';
   
       const resultado = descricao.match(
           /\[\[DATA_OCORRENCIA\]\]\s*(\d{4}-\d{2}-\d{2})/
       );
   
       return resultado ? resultado[1] : '';
   }
   
   function obterGravidade(ocorrencia) {
       if (ocorrencia.gravidade) {
           return ocorrencia.gravidade;
       }
   
       const descricao = ocorrencia.descricao || '';
   
       const resultado = descricao.match(
           /\[\[GRAVIDADE\]\]\s*(Baixa|Moderada|Alta|Crítica)/i
       );
   
       if (resultado) {
           return resultado[1];
       }
   
       return 'Não informada';
   }
   
   function obterDescricao(ocorrencia) {
       return obterDescricaoOriginal(ocorrencia.descricao || '');
   }
   
   /* =========================================================
      LIMPAR FORMULÁRIO
      ========================================================= */
   
   function limparFormulario() {
       if (!formulario) return;
   
       formulario.reset();
   
       if (campoId) {
           campoId.value = '';
       }
   
       if (tituloFormulario) {
           tituloFormulario.textContent = 'Nova ocorrência';
       }
   
       if (botaoSalvar) {
           botaoSalvar.textContent = 'Salvar ocorrência';
       }
   
       ocultarMensagem();
   }
   
   /* =========================================================
      COMUNICAÇÃO COM A API
      ========================================================= */
   
   async function requisicao(
       caminho = '',
       metodo = 'GET',
       dados = null
   ) {
       const opcoes = {
           method: metodo
       };
   
       if (dados !== null) {
           opcoes.headers = {
               'Content-Type': 'application/json'
           };
   
           opcoes.body = JSON.stringify(dados);
       }
   
       let resposta;
   
       try {
           resposta = await fetch(API_URL + caminho, opcoes);
       } catch (erro) {
           throw new Error(
               'Não foi possível acessar o backend. ' +
               'Verifique se o FastAPI está funcionando na porta 8000.'
           );
       }
   
       if (resposta.status === 204) {
           return null;
       }
   
       const textoResposta = await resposta.text();
   
       let conteudo = null;
   
       if (textoResposta) {
           try {
               conteudo = JSON.parse(textoResposta);
           } catch {
               conteudo = textoResposta;
           }
       }
   
       if (!resposta.ok) {
           let detalhe = conteudo?.detail
               ?? conteudo?.message
               ?? conteudo;
   
           if (Array.isArray(detalhe)) {
               detalhe = detalhe
                   .map(item => {
                       const campo = Array.isArray(item.loc)
                           ? item.loc.join('.')
                           : 'Campo';
   
                       return `${campo}: ${item.msg}`;
                   })
                   .join(' | ');
           }
   
           throw new Error(
               detalhe || 'Não foi possível concluir a operação.'
           );
       }
   
       return conteudo;
   }
   
   /* =========================================================
      CONVERTER FORMULÁRIO PARA O MODELO DO BACKEND
   
      Campos esperados pelo backend:
      titulo
      descricao
      categoria
      bairro
      endereco
      status
      ========================================================= */
   
   function montarDadosFormulario() {
       const local = campoLocal.value.trim();
       const categoria = campoTipo.value;
       const bairro = campoBairro.value.trim();
       const data = campoData.value;
       const gravidade = campoGravidade.value;
       const descricaoOriginal = campoDescricao.value.trim();
   
       const titulo = `${categoria} - ${local}`.slice(0, 150);
   
       const descricaoCompleta = [
           descricaoOriginal,
           '',
           `${MARCADOR_DATA} ${data}`,
           `${MARCADOR_GRAVIDADE} ${gravidade}`
       ].join('\n');
   
       return {
           titulo: titulo,
           descricao: descricaoCompleta,
           categoria: categoria,
           bairro: bairro,
           endereco: local,
           status: 'Aberta'
       };
   }
   
   /* =========================================================
      LISTAGEM DE OCORRÊNCIAS
      ========================================================= */
   
   function exibirOcorrencias(ocorrencias) {
       if (!lista) return;
   
       lista.replaceChildren();
   
       if (totalOcorrencias) {
           totalOcorrencias.textContent =
               `${ocorrencias.length} ocorrência(s)`;
       }
   
       if (ocorrencias.length === 0) {
           const linha = lista.insertRow();
           const celula = linha.insertCell();
   
           celula.colSpan = 7;
           celula.className = 'vazio';
           celula.textContent = 'Nenhuma ocorrência encontrada.';
   
           return;
       }
   
       for (const ocorrencia of ocorrencias) {
           const linha = lista.insertRow();
   
           const data = obterData(ocorrencia);
           const gravidade = obterGravidade(ocorrencia);
   
           const valores = [
               obterId(ocorrencia),
               obterLocal(ocorrencia),
               obterCategoria(ocorrencia),
               data
                   ? data.split('-').reverse().join('/')
                   : 'Não informada',
               obterBairro(ocorrencia),
               gravidade
           ];
   
           for (const valor of valores) {
               const celula = linha.insertCell();
   
               celula.textContent =
                   valor !== null && valor !== undefined
                       ? String(valor)
                       : '';
           }
   
           /* Ações */
           const acoes = linha.insertCell();
   
           const editar = document.createElement('button');
   
           editar.type = 'button';
           editar.className = 'botao botao-principal';
           editar.textContent = 'Editar';
   
           editar.addEventListener('click', () => {
               editarOcorrencia(ocorrencia);
           });
   
           const excluir = document.createElement('button');
   
           excluir.type = 'button';
           excluir.className = 'botao botao-secundario';
           excluir.textContent = 'Excluir';
   
           excluir.addEventListener('click', () => {
               excluirOcorrencia(ocorrencia, excluir);
           });
   
           acoes.append(editar, excluir);
       }
   }
   
   /* =========================================================
      BUSCAR TODAS AS OCORRÊNCIAS
      ========================================================= */
   
   async function listarOcorrencias() {
       const resultado = await requisicao();
   
       const ocorrencias = Array.isArray(resultado)
           ? resultado
           : Array.isArray(resultado?.data)
               ? resultado.data
               : [];
   
       exibirOcorrencias(ocorrencias);
   
       return ocorrencias;
   }
   
   /* =========================================================
      EDITAR OCORRÊNCIA
      ========================================================= */
   
   function editarOcorrencia(ocorrencia) {
       if (!ocorrencia) return;
   
       campoId.value = obterId(ocorrencia);
       campoLocal.value = obterLocal(ocorrencia);
       campoTipo.value = obterCategoria(ocorrencia);
       campoBairro.value = obterBairro(ocorrencia);
       campoData.value = obterData(ocorrencia);
       campoGravidade.value = obterGravidade(ocorrencia);
       campoDescricao.value = obterDescricao(ocorrencia);
   
       if (tituloFormulario) {
           tituloFormulario.textContent =
               `Editar ocorrência #${obterId(ocorrencia)}`;
       }
   
       botaoSalvar.textContent = 'Salvar alterações';
   
       campoLocal.focus();
   
       mostrarMensagem(
           `Editando ocorrência #${obterId(ocorrencia)}.`
       );
   }
   
   /* =========================================================
      EXCLUIR OCORRÊNCIA
      ========================================================= */
   
   async function excluirOcorrencia(ocorrencia, botao) {
       const id = obterId(ocorrencia);
   
       const confirmado = confirm(
           `Deseja excluir a ocorrência #${id} em ${obterLocal(ocorrencia)}?`
       );
   
       if (!confirmado) return;
   
       botao.disabled = true;
   
       try {
           await requisicao(`/${id}`, 'DELETE');
   
           if (campoId.value === String(id)) {
               limparFormulario();
           }
   
           mostrarMensagem('Ocorrência excluída com sucesso.');
   
           await listarOcorrencias();
   
       } catch (erro) {
           mostrarMensagem(erro.message, true);
   
       } finally {
           botao.disabled = false;
       }
   }
   
   /* =========================================================
      CADASTRAR E ATUALIZAR
      ========================================================= */
   
   if (formulario) {
       formulario.addEventListener('submit', async evento => {
           evento.preventDefault();
   
           ocultarMensagem();
   
           const local = campoLocal.value.trim();
           const bairro = campoBairro.value.trim();
           const descricao = campoDescricao.value.trim();
   
           if (!local) {
               mostrarMensagem(
                   'Informe o local da ocorrência.',
                   true
               );
   
               campoLocal.focus();
               return;
           }
   
           if (!campoTipo.value) {
               mostrarMensagem(
                   'Selecione o tipo do problema.',
                   true
               );
   
               campoTipo.focus();
               return;
           }
   
           if (!campoData.value) {
               mostrarMensagem(
                   'Informe a data da ocorrência.',
                   true
               );
   
               campoData.focus();
               return;
           }
   
           if (!bairro) {
               mostrarMensagem(
                   'Informe o bairro da ocorrência.',
                   true
               );
   
               campoBairro.focus();
               return;
           }
   
           if (!campoGravidade.value) {
               mostrarMensagem(
                   'Selecione o nível de gravidade.',
                   true
               );
   
               campoGravidade.focus();
               return;
           }
   
           if (!descricao) {
               mostrarMensagem(
                   'Descreva o problema.',
                   true
               );
   
               campoDescricao.focus();
               return;
           }
   
           const id = campoId.value.trim();
   
           const dados = montarDadosFormulario();
   
           botaoSalvar.disabled = true;
   
           try {
               await requisicao(
                   id ? `/${id}` : '',
                   id ? 'PUT' : 'POST',
                   dados
               );
   
               limparFormulario();
   
               mostrarMensagem(
                   id
                       ? 'Ocorrência atualizada com sucesso.'
                       : 'Ocorrência registrada com sucesso.'
               );
   
               await listarOcorrencias();
   
           } catch (erro) {
               mostrarMensagem(erro.message, true);
   
           } finally {
               botaoSalvar.disabled = false;
           }
       });
   }
   
   /* =========================================================
      BUSCAR OCORRÊNCIA POR ID
   
      Busca na lista retornada pelo GET, sem depender de uma
      rota GET /ocorrencias/{id} no backend.
      ========================================================= */
   
   if (formularioBusca) {
       formularioBusca.addEventListener('submit', async evento => {
           evento.preventDefault();
   
           const id = buscaId.value.trim();
   
           if (!id) {
               mostrarMensagem(
                   'Informe o ID da ocorrência.',
                   true
               );
   
               buscaId.focus();
               return;
           }
   
           try {
               const ocorrencias = await listarOcorrencias();
   
               const encontrada = ocorrencias.find(
                   ocorrencia => String(obterId(ocorrencia)) === id
               );
   
               if (!encontrada) {
                   exibirOcorrencias([]);
   
                   mostrarMensagem(
                       `Ocorrência #${id} não encontrada.`,
                       true
                   );
   
                   return;
               }
   
               exibirOcorrencias([encontrada]);
   
               mostrarMensagem(
                   `Ocorrência #${id} encontrada.`
               );
   
           } catch (erro) {
               exibirOcorrencias([]);
   
               mostrarMensagem(erro.message, true);
           }
       });
   }
   
   /* =========================================================
      BOTÃO LIMPAR
      ========================================================= */
   
   if (botaoLimpar) {
       botaoLimpar.addEventListener('click', limparFormulario);
   }
   
   /* =========================================================
      BOTÃO ATUALIZAR LISTA
      ========================================================= */
   
   if (botaoListar) {
       botaoListar.addEventListener('click', async () => {
           try {
               await listarOcorrencias();
   
               if (buscaId) {
                   buscaId.value = '';
               }
   
               mostrarMensagem('Lista atualizada com sucesso.');
   
           } catch (erro) {
               mostrarMensagem(erro.message, true);
           }
       });
   }
   
   /* =========================================================
      INICIALIZAÇÃO
      ========================================================= */
   
   listarOcorrencias().catch(erro => {
       if (totalOcorrencias) {
           totalOcorrencias.textContent = 'Erro ao carregar';
       }
   
       if (lista) {
           lista.replaceChildren();
   
           const linha = lista.insertRow();
           const celula = linha.insertCell();
   
           celula.colSpan = 7;
           celula.className = 'vazio';
           celula.textContent =
               'Não foi possível carregar as ocorrências.';
       }
   
       mostrarMensagem(erro.message, true);
   });
   