

const campoAno = document.getElementById('ano')
const tabela = document.getElementById('tabelaFeriados')
const mensagem = document.getElementById('mensagem')
const total = document.getElementById('total')
const proximo = document.getElementById('proximo')

const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

campoAno.value = new Date().getFullYear()

function consultarFeriados() {
    const ano = campoAno.value
    tabela.innerHTML = ''
    mensagem.innerHTML = ''
    total.innerHTML = ''
    proximo.innerHTML = ''

    fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error(`Não foi possível encontrar feriados para o ano "${ano}". Digite um ano válido.`)
            }
            return resposta.json()
        })
        .then(feriados => {
            console.log(feriados)

            total.innerHTML = `${ano} tem <strong>${feriados.length}</strong> feriados nacionais.`

            feriados.forEach(feriado => {
                const data = new Date(feriado.date + 'T12:00:00')

                const dataBR = data.toLocaleDateString('pt-BR')
                const diaSemana = diasDaSemana[data.getDay()]
                const fimDeSemana = data.getDay() === 0 || data.getDay() === 6

                tabela.innerHTML += `
                    <tr class="${fimDeSemana ? 'fim-de-semana' : ''}">
                        <td>${dataBR}</td>
                        <td>${diaSemana}</td>
                        <td>${feriado.name}</td>
                    </tr>`
            })

            mostrarProximoFeriado(feriados)
        })
        .catch(erro => {
            mensagem.innerHTML = erro.message === 'Failed to fetch'
                ? 'Não foi possível conectar à API. Verifique sua internet e tente novamente.'
                : erro.message
            mensagem.className = 'erro'
            console.log(erro)
        })
}

function mostrarProximoFeriado(feriados) {
    const hoje = new Date()
    hoje.setHours(12, 0, 0, 0)

    const proximoFeriado = feriados.find(feriado => new Date(feriado.date + 'T12:00:00') >= hoje)

    if (!proximoFeriado) {
        return
    }

    const data = new Date(proximoFeriado.date + 'T12:00:00')
    const diasFaltando = Math.round((data - hoje) / (1000 * 60 * 60 * 24))

    let quando = `faltam <strong>${diasFaltando}</strong> dias`
    if (diasFaltando === 0) quando = '<strong>é hoje!</strong>'
    if (diasFaltando === 1) quando = 'falta <strong>1</strong> dia'

    proximo.innerHTML = `
        <span class="rotulo">Próximo feriado</span>
        <span class="nome">${proximoFeriado.name}</span>
        <span>${data.toLocaleDateString('pt-BR')} (${diasDaSemana[data.getDay()]}) — ${quando}</span>`
}

document.getElementById('btnConsultar').addEventListener('click', consultarFeriados)

campoAno.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') consultarFeriados()
})

consultarFeriados()
