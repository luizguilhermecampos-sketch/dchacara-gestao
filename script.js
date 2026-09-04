/* =========================================================
   D'CHÁCARA EMPÓRIO
   SCRIPT.JS - PROTÓTIPO FUNCIONAL COM LOCALSTORAGE
========================================================= */

const USUARIO_VALIDO = "luiz.silva";
const SENHA_VALIDA = "12345";
const SESSION_KEY = "dchacara_logado";

const STORAGE = {
    produtos: "dchacara_produtos",
    vendas: "dchacara_vendas",
    entradas: "dchacara_entradas",
    fiados: "dchacara_fiados",
    despesas: "dchacara_despesas"
};

let carrinho = [];
let categoriaAtiva = "Todos";

/* =========================================================
   HELPERS
========================================================= */

function readJSON(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function numberBR(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    });
}

function nowISO() {
    return new Date().toISOString();
}

function localDateTime(iso) {
    if (!iso) return "-";

    return new Date(iso).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function localDate(dateString) {
    if (!dateString) return "-";

    const [y, m, d] = dateString.split("-");
    return `${d}/${m}/${y}`;
}

function todayKey() {
    const d = new Date();
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}

function monthKeyFromISO(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sameDayISO(iso) {
    const d = new Date(iso);

    return (
        d.getFullYear() === new Date().getFullYear() &&
        d.getMonth() === new Date().getMonth() &&
        d.getDate() === new Date().getDate()
    );
}

function categoryIcon(category) {
    const map = {
        "Rações": "🐄",
        "Medicamentos": "💊",
        "Utensílios": "🪣",
        "Ferramentas": "🛠️"
    };

    return map[category] || "📦";
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.className = `toast ${type === "error" ? "error" : ""} show`;

    clearTimeout(window.__toastTimer);

    window.__toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function setEmptyVisibility(emptyId, shouldShow) {
    const el = document.getElementById(emptyId);

    if (el) {
        el.style.display = shouldShow ? "" : "none";
    }
}


/* =========================================================
   MENU LATERAL ÚNICO
   Toda alteração no menu é feita SOMENTE aqui.
   Assim todas as páginas mostram exatamente as mesmas abas.
========================================================= */

const APP_MENU = [
    { page: "dashboard",    href: "dashboard.html",    icon: "🏠", label: "Início" },
    { page: "vendas",       href: "vendas.html",       icon: "🛒", label: "Vendas" },
    { page: "estoque",      href: "estoque.html",      icon: "📦", label: "Estoque" },
    { page: "entradas",     href: "entradas.html",     icon: "📥", label: "Entradas" },
    { page: "fiados",       href: "fiados.html",       icon: "🧾", label: "Fiados" },
    { page: "despesas",     href: "despesas.html",     icon: "💸", label: "Despesas" },
    { page: "indicadores",  href: "indicadores.html",  icon: "📊", label: "Indicadores" },
    { page: "resumo",       href: "resumo.html",       icon: "📄", label: "Resumo" }
];

function renderSidebar() {
    const sidebar = document.getElementById("appSidebar");

    if (!sidebar) return;

    const activePage = document.body.dataset.page || "";

    const links = APP_MENU.map(item => `
        <a
            href="${item.href}"
            class="menu-link ${item.page === activePage ? "active" : ""}"
        >
            <span class="menu-icon">${item.icon}</span>
            <span>${item.label}</span>
        </a>
    `).join("");

    sidebar.innerHTML = `
        <div class="sidebar-brand">
            <div class="sidebar-logo">D’</div>

            <div>
                <strong>D'Chácara</strong>
                <span>Empório • Gestão</span>
            </div>
        </div>

        <nav class="menu">
            ${links}
        </nav>

        <div class="sidebar-bottom">
            <div class="sidebar-tip">
                <span>🌾</span>

                <p>
                    Campo forte,<br>
                    gestão organizada.
                </p>
            </div>

            <button
                id="btnSair"
                class="sidebar-logout"
                type="button"
            >
                ↪ Sair do sistema
            </button>
        </div>
    `;
}


/* =========================================================
   LOGIN / AUTENTICAÇÃO
========================================================= */

function initLogin() {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");
    const loginMessage = document.getElementById("loginMessage");
    const toggleSenha = document.getElementById("toggleSenha");

    toggleSenha?.addEventListener("click", () => {
        const visivel = senhaInput.type === "text";
        senhaInput.type = visivel ? "password" : "text";
        toggleSenha.textContent = visivel ? "👁" : "🙈";
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const usuario = usuarioInput.value.trim();
        const senha = senhaInput.value;

        loginMessage.className = "login-message";

        if (usuario === USUARIO_VALIDO && senha === SENHA_VALIDA) {
            sessionStorage.setItem(SESSION_KEY, "true");

            loginMessage.classList.add("success");
            loginMessage.textContent = "Acesso autorizado. Abrindo o painel...";

            setTimeout(() => {
                window.location.href = "./dashboard.html";
            }, 450);

            return;
        }

        loginMessage.classList.add("error");
        loginMessage.textContent = "Usuário ou senha incorretos.";

        senhaInput.value = "";
        senhaInput.focus();
    });
}

function protectApp() {
    const page = document.body.dataset.page;

    if (!page) return true;

    const logado = sessionStorage.getItem(SESSION_KEY) === "true";

    if (!logado) {
        window.location.replace("./index.html");
        return false;
    }

    document.getElementById("btnSair")?.addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("./index.html");
    });

    return true;
}

/* =========================================================
   DASHBOARD
========================================================= */

function initDashboard() {
    if (document.body.dataset.page !== "dashboard") return;

    const produtos = readJSON(STORAGE.produtos);
    const vendas = readJSON(STORAGE.vendas);
    const fiados = readJSON(STORAGE.fiados);

    const vendasHoje = vendas.filter(v => sameDayISO(v.data));
    const faturamentoHoje = vendasHoje.reduce((s, v) => s + Number(v.total || 0), 0);
    const estoqueBaixo = produtos.filter(p => Number(p.estoque) <= Number(p.minimo));
    const saldoFiados = fiados.reduce((s, f) => s + Math.max(0, Number(f.saldo || 0)), 0);

    document.getElementById("kpiFaturamentoHoje").textContent = money(faturamentoHoje);
    document.getElementById("kpiVendasHoje").textContent = vendasHoje.length;
    document.getElementById("kpiEstoqueBaixo").textContent = estoqueBaixo.length;
    document.getElementById("kpiFiados").textContent = money(saldoFiados);

    const vendasBody = document.getElementById("dashboardVendasBody");
    const ultimasVendas = [...vendas]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 7);

    vendasBody.innerHTML = ultimasVendas.map(v => `
        <tr>
            <td>${localDateTime(v.data)}</td>
            <td>${v.cliente || "Consumidor"}</td>
            <td>${v.pagamento}</td>
            <td>${v.itens.reduce((s, item) => s + Number(item.qtd), 0)}</td>
            <td class="right"><strong>${money(v.total)}</strong></td>
        </tr>
    `).join("");

    setEmptyVisibility("dashboardVendasEmpty", ultimasVendas.length === 0);

    const estoqueList = document.getElementById("dashboardEstoqueBaixo");

    estoqueList.innerHTML = estoqueBaixo
        .sort((a, b) => Number(a.estoque) - Number(b.estoque))
        .slice(0, 6)
        .map(p => `
            <div class="alert-item">
                <div>
                    <strong>${p.nome}</strong>
                    <small>${p.categoria}</small>
                </div>

                <strong>${numberBR(p.estoque)} ${p.unidade || "un."}</strong>
            </div>
        `).join("");

    setEmptyVisibility("dashboardEstoqueEmpty", estoqueBaixo.length === 0);
}

/* =========================================================
   ESTOQUE
========================================================= */

function initEstoque() {
    if (document.body.dataset.page !== "estoque") return;

    const form = document.getElementById("produtoForm");
    const busca = document.getElementById("estoqueBusca");
    const cancelar = document.getElementById("btnCancelarEdicao");

    document.querySelectorAll(".category-card").forEach(btn => {
        btn.addEventListener("click", () => {
            categoriaAtiva = btn.dataset.category;

            document.querySelectorAll(".category-card").forEach(b => {
                b.classList.toggle("active", b === btn);
            });

            renderEstoque();
        });
    });

    busca.addEventListener("input", renderEstoque);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const produtos = readJSON(STORAGE.produtos);
        const id = document.getElementById("produtoId").value;

        const produtoExistente = id
            ? produtos.find(p => p.id === id)
            : null;

        const item = {
            id: id || uid("prod"),
            nome: document.getElementById("produtoNome").value.trim(),
            categoria: document.getElementById("produtoCategoria").value,
            unidade: document.getElementById("produtoUnidade").value,
            codigo: document.getElementById("produtoCodigo").value.trim(),

            // No cadastro usamos o saldo inicial.
            // Em edição preservamos o saldo atual para não "furar" o histórico.
            estoque: produtoExistente
                ? Number(produtoExistente.estoque || 0)
                : Number(document.getElementById("produtoEstoque").value || 0),

            minimo: Number(document.getElementById("produtoMinimo").value || 0),
            custo: Number(document.getElementById("produtoCusto").value || 0),
            preco: Number(document.getElementById("produtoPreco").value || 0),
            atualizadoEm: nowISO()
        };

        if (!item.nome) {
            showToast("Informe o nome do produto.", "error");
            return;
        }

        if (id) {
            const index = produtos.findIndex(p => p.id === id);

            if (index >= 0) {
                produtos[index] = item;
            }

            showToast("Produto atualizado com sucesso.");
        } else {
            produtos.push(item);
            showToast("Produto cadastrado com sucesso.");
        }

        writeJSON(STORAGE.produtos, produtos);
        resetProdutoForm();
        renderEstoque();
    });

    cancelar.addEventListener("click", resetProdutoForm);

    renderEstoque();
}

function renderEstoque() {
    const produtos = readJSON(STORAGE.produtos);
    const termo = (document.getElementById("estoqueBusca")?.value || "").trim().toLowerCase();

    const counts = {
        "Rações": produtos.filter(p => p.categoria === "Rações").length,
        "Medicamentos": produtos.filter(p => p.categoria === "Medicamentos").length,
        "Utensílios": produtos.filter(p => p.categoria === "Utensílios").length,
        "Ferramentas": produtos.filter(p => p.categoria === "Ferramentas").length
    };

    document.getElementById("catTodosQtd").textContent = `${produtos.length} produtos`;
    document.getElementById("catRacoesQtd").textContent = `${counts["Rações"]} produtos`;
    document.getElementById("catMedicamentosQtd").textContent = `${counts["Medicamentos"]} produtos`;
    document.getElementById("catUtensiliosQtd").textContent = `${counts["Utensílios"]} produtos`;
    document.getElementById("catFerramentasQtd").textContent = `${counts["Ferramentas"]} produtos`;

    const baixos = produtos.filter(p => Number(p.estoque) <= Number(p.minimo));
    const zerados = produtos.filter(p => Number(p.estoque) <= 0);
    const valor = produtos.reduce((s, p) => s + Number(p.estoque || 0) * Number(p.custo || 0), 0);

    document.getElementById("estoqueTotalProdutos").textContent = produtos.length;
    document.getElementById("estoqueBaixoQtd").textContent = baixos.length;
    document.getElementById("estoqueZeradoQtd").textContent = zerados.length;
    document.getElementById("estoqueValorTotal").textContent = money(valor);

    let filtrados = produtos.filter(p => {
        const catOK = categoriaAtiva === "Todos" || p.categoria === categoriaAtiva;
        const texto = `${p.nome} ${p.codigo || ""} ${p.categoria}`.toLowerCase();
        const buscaOK = !termo || texto.includes(termo);

        return catOK && buscaOK;
    });

    filtrados = filtrados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const body = document.getElementById("estoqueBody");

    body.innerHTML = filtrados.map(p => {
        const estoque = Number(p.estoque || 0);
        const minimo = Number(p.minimo || 0);

        let statusClass = "status-ok";
        let statusText = "Normal";

        if (estoque <= 0) {
            statusClass = "status-out";
            statusText = "Sem estoque";
        } else if (estoque <= minimo) {
            statusClass = "status-low";
            statusText = "Estoque baixo";
        }

        return `
            <tr>
                <td>
                    <div class="product-cell">
                        <span class="product-cell-icon">${categoryIcon(p.categoria)}</span>
                        <div>
                            <strong>${p.nome}</strong>
                            <small>${p.codigo || "Sem código"}</small>
                        </div>
                    </div>
                </td>
                <td>${p.categoria}</td>
                <td><strong>${numberBR(estoque)} ${p.unidade || "un."}</strong></td>
                <td>${numberBR(minimo)}</td>
                <td>${money(p.preco)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="right">
                    <div class="table-actions">
                        <button class="mini-button" onclick="editarProduto('${p.id}')">Editar</button>
                        <button class="mini-button danger" onclick="excluirProduto('${p.id}')">Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    setEmptyVisibility("estoqueEmpty", filtrados.length === 0);
}

function editarProduto(id) {
    const produtos = readJSON(STORAGE.produtos);
    const p = produtos.find(x => x.id === id);

    if (!p) return;

    document.getElementById("produtoId").value = p.id;
    document.getElementById("produtoNome").value = p.nome;
    document.getElementById("produtoCategoria").value = p.categoria;
    document.getElementById("produtoUnidade").value = p.unidade || "un.";
    document.getElementById("produtoCodigo").value = p.codigo || "";
    document.getElementById("produtoEstoque").value = p.estoque;
    document.getElementById("produtoEstoque").disabled = true;

    const estoqueHelp = document.getElementById("produtoEstoqueHelp");
    if (estoqueHelp) {
        estoqueHelp.textContent =
            "Saldo bloqueado na edição. Para aumentar, use Entradas; para reduzir, registre uma Venda.";
    }
    document.getElementById("produtoMinimo").value = p.minimo;
    document.getElementById("produtoCusto").value = p.custo;
    document.getElementById("produtoPreco").value = p.preco;

    document.getElementById("produtoFormTitulo").textContent = "Editar produto";
    document.getElementById("btnCancelarEdicao").classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetProdutoForm() {
    const form = document.getElementById("produtoForm");

    if (!form) return;

    form.reset();

    document.getElementById("produtoId").value = "";
    document.getElementById("produtoEstoque").disabled = false;
    document.getElementById("produtoEstoque").value = 0;

    const estoqueHelp = document.getElementById("produtoEstoqueHelp");
    if (estoqueHelp) {
        estoqueHelp.textContent =
            "Usado somente no primeiro cadastro. Depois, altere o saldo por Entradas ou Vendas.";
    }
    document.getElementById("produtoMinimo").value = 1;
    document.getElementById("produtoCusto").value = 0;
    document.getElementById("produtoPreco").value = 0;
    document.getElementById("produtoFormTitulo").textContent = "Novo produto";
    document.getElementById("btnCancelarEdicao").classList.add("hidden");
}

function excluirProduto(id) {
    const produtos = readJSON(STORAGE.produtos);
    const p = produtos.find(x => x.id === id);

    if (!p) return;

    const confirmar = confirm(`Excluir "${p.nome}" do cadastro?`);

    if (!confirmar) return;

    writeJSON(
        STORAGE.produtos,
        produtos.filter(x => x.id !== id)
    );

    showToast("Produto excluído.");
    renderEstoque();
}

/* =========================================================
   VENDAS
========================================================= */

function initVendas() {
    if (document.body.dataset.page !== "vendas") return;

    const selectProduto = document.getElementById("vendaProduto");
    const pagamento = document.getElementById("vendaPagamento");

    populateVendaProdutos();
    renderCarrinho();
    renderVendasHistorico();
    updateProdutoVendaInfo();

    selectProduto.addEventListener("change", updateProdutoVendaInfo);

    pagamento.addEventListener("change", () => {
        document.getElementById("fiadoExtras")
            .classList.toggle("hidden", pagamento.value !== "Fiado");
    });

    document.getElementById("btnAdicionarCarrinho").addEventListener("click", adicionarAoCarrinho);
    document.getElementById("btnFinalizarVenda").addEventListener("click", finalizarVenda);
}

function populateVendaProdutos() {
    const produtos = readJSON(STORAGE.produtos)
        .filter(p => Number(p.estoque) > 0)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const select = document.getElementById("vendaProduto");

    select.innerHTML = produtos.length
        ? produtos.map(p => `
            <option value="${p.id}">
                ${p.nome} • ${numberBR(p.estoque)} ${p.unidade || "un."}
            </option>
        `).join("")
        : `<option value="">Nenhum produto com estoque disponível</option>`;
}

function updateProdutoVendaInfo() {
    const id = document.getElementById("vendaProduto")?.value;
    const info = document.getElementById("produtoVendaInfo");

    if (!info) return;

    const p = readJSON(STORAGE.produtos).find(x => x.id === id);

    if (!p) {
        info.textContent = "Cadastre produtos no estoque antes de registrar uma venda.";
        return;
    }

    info.innerHTML = `
        <strong>${categoryIcon(p.categoria)} ${p.nome}</strong><br>
        Estoque disponível: <strong>${numberBR(p.estoque)} ${p.unidade || "un."}</strong>
        &nbsp;•&nbsp; Preço: <strong>${money(p.preco)}</strong>
    `;
}

function adicionarAoCarrinho() {
    const produtoId = document.getElementById("vendaProduto").value;
    const qtd = Number(document.getElementById("vendaQtd").value || 0);

    if (!produtoId) {
        showToast("Nenhum produto disponível para venda.", "error");
        return;
    }

    if (qtd <= 0) {
        showToast("Informe uma quantidade válida.", "error");
        return;
    }

    const produto = readJSON(STORAGE.produtos).find(p => p.id === produtoId);

    if (!produto) return;

    const existente = carrinho.find(item => item.produtoId === produtoId);
    const qtdCarrinho = existente ? Number(existente.qtd) : 0;

    if (qtdCarrinho + qtd > Number(produto.estoque)) {
        showToast("Quantidade maior que o estoque disponível.", "error");
        return;
    }

    if (existente) {
        existente.qtd += qtd;
        existente.subtotal = existente.qtd * existente.preco;
    } else {
        carrinho.push({
            produtoId: produto.id,
            nome: produto.nome,
            categoria: produto.categoria,
            unidade: produto.unidade || "un.",
            qtd,
            preco: Number(produto.preco || 0),
            custo: Number(produto.custo || 0),
            subtotal: qtd * Number(produto.preco || 0)
        });
    }

    document.getElementById("vendaQtd").value = 1;

    renderCarrinho();
    showToast("Produto adicionado à venda.");
}

function renderCarrinho() {
    const body = document.getElementById("carrinhoBody");

    if (!body) return;

    body.innerHTML = carrinho.map(item => `
        <tr>
            <td>
                <div class="product-cell">
                    <span class="product-cell-icon">${categoryIcon(item.categoria)}</span>
                    <div>
                        <strong>${item.nome}</strong>
                        <small>${item.categoria}</small>
                    </div>
                </div>
            </td>
            <td>${numberBR(item.qtd)} ${item.unidade}</td>
            <td>${money(item.preco)}</td>
            <td class="right"><strong>${money(item.subtotal)}</strong></td>
            <td class="right">
                <button class="mini-button danger" onclick="removerCarrinho('${item.produtoId}')">
                    Remover
                </button>
            </td>
        </tr>
    `).join("");

    const total = carrinho.reduce((s, item) => s + Number(item.subtotal), 0);

    document.getElementById("carrinhoTotal").textContent = money(total);
    setEmptyVisibility("carrinhoEmpty", carrinho.length === 0);
}

function removerCarrinho(produtoId) {
    carrinho = carrinho.filter(item => item.produtoId !== produtoId);
    renderCarrinho();
}

function finalizarVenda() {
    if (carrinho.length === 0) {
        showToast("Adicione pelo menos um produto à venda.", "error");
        return;
    }

    const pagamento = document.getElementById("vendaPagamento").value;
    const cliente = document.getElementById("vendaCliente").value.trim();
    const telefone = document.getElementById("vendaTelefone")?.value.trim() || "";
    const vencimento = document.getElementById("vendaVencimento")?.value || "";

    if (pagamento === "Fiado" && !cliente) {
        showToast("Informe o nome do cliente para venda fiada.", "error");
        return;
    }

    const produtos = readJSON(STORAGE.produtos);

    for (const item of carrinho) {
        const p = produtos.find(x => x.id === item.produtoId);

        if (!p || Number(p.estoque) < Number(item.qtd)) {
            showToast(`Estoque insuficiente para ${item.nome}.`, "error");
            return;
        }
    }

    carrinho.forEach(item => {
        const p = produtos.find(x => x.id === item.produtoId);
        p.estoque = Number(p.estoque) - Number(item.qtd);
        p.atualizadoEm = nowISO();
    });

    writeJSON(STORAGE.produtos, produtos);

    const total = carrinho.reduce((s, item) => s + Number(item.subtotal), 0);

    const venda = {
        id: uid("venda"),
        data: nowISO(),
        cliente: cliente || "Consumidor",
        pagamento,
        total,
        itens: carrinho.map(item => ({ ...item }))
    };

    const vendas = readJSON(STORAGE.vendas);
    vendas.push(venda);
    writeJSON(STORAGE.vendas, vendas);

    if (pagamento === "Fiado") {
        const fiados = readJSON(STORAGE.fiados);

        fiados.push({
            id: uid("fiado"),
            vendaId: venda.id,
            cliente,
            telefone,
            descricao: `Venda com ${carrinho.length} item(ns)`,
            data: nowISO(),
            vencimento,
            total,
            pago: 0,
            saldo: total,
            status: "Em aberto",
            historico: []
        });

        writeJSON(STORAGE.fiados, fiados);
    }

    carrinho = [];

    document.getElementById("vendaCliente").value = "";
    document.getElementById("vendaPagamento").value = "Dinheiro";
    document.getElementById("fiadoExtras").classList.add("hidden");

    renderCarrinho();
    populateVendaProdutos();
    updateProdutoVendaInfo();
    renderVendasHistorico();

    showToast("Venda finalizada e estoque atualizado.");
}

function renderVendasHistorico() {
    const vendas = readJSON(STORAGE.vendas)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

    const body = document.getElementById("vendasHistoricoBody");

    if (!body) return;

    body.innerHTML = vendas.slice(0, 20).map(v => `
        <tr>
            <td>${localDateTime(v.data)}</td>
            <td>${v.cliente || "Consumidor"}</td>
            <td>${v.pagamento}</td>
            <td>${v.itens.reduce((s, item) => s + Number(item.qtd), 0)}</td>
            <td class="right"><strong>${money(v.total)}</strong></td>
        </tr>
    `).join("");

    setEmptyVisibility("vendasHistoricoEmpty", vendas.length === 0);

    const vendasHoje = vendas.filter(v => sameDayISO(v.data));

    const resumo = document.getElementById("vendasHojeResumo");

    if (resumo) {
        resumo.textContent = vendasHoje.length;
    }
}

/* =========================================================
   ENTRADAS
========================================================= */

function initEntradas() {
    if (document.body.dataset.page !== "entradas") return;

    const form = document.getElementById("entradaForm");
    const produtoSelect = document.getElementById("entradaProduto");

    populateEntradaProdutos();
    updateEntradaProdutoInfo();
    renderEntradas();

    produtoSelect.addEventListener("change", updateEntradaProdutoInfo);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const produtoId = produtoSelect.value;
        const qtd = Number(document.getElementById("entradaQtd").value || 0);
        const custo = Number(document.getElementById("entradaCusto").value || 0);
        const fornecedor = document.getElementById("entradaFornecedor").value.trim();
        const obs = document.getElementById("entradaObs").value.trim();

        if (!produtoId) {
            showToast("Cadastre um produto antes de lançar a entrada.", "error");
            return;
        }

        if (qtd <= 0) {
            showToast("Informe a quantidade recebida.", "error");
            return;
        }

        const produtos = readJSON(STORAGE.produtos);
        const p = produtos.find(x => x.id === produtoId);

        if (!p) return;

        p.estoque = Number(p.estoque || 0) + qtd;

        if (custo > 0) {
            p.custo = custo;
        }

        p.atualizadoEm = nowISO();

        writeJSON(STORAGE.produtos, produtos);

        const entradas = readJSON(STORAGE.entradas);

        entradas.push({
            id: uid("entrada"),
            data: nowISO(),
            produtoId: p.id,
            nome: p.nome,
            categoria: p.categoria,
            unidade: p.unidade || "un.",
            qtd,
            custo: custo > 0 ? custo : Number(p.custo || 0),
            fornecedor,
            obs
        });

        writeJSON(STORAGE.entradas, entradas);

        form.reset();

        populateEntradaProdutos();
        updateEntradaProdutoInfo();
        renderEntradas();

        showToast("Entrada registrada e estoque atualizado.");
    });
}

function populateEntradaProdutos() {
    const produtos = readJSON(STORAGE.produtos)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const select = document.getElementById("entradaProduto");

    if (!select) return;

    select.innerHTML = produtos.length
        ? produtos.map(p => `
            <option value="${p.id}">
                ${p.nome} • ${p.categoria}
            </option>
        `).join("")
        : `<option value="">Nenhum produto cadastrado</option>`;
}

function updateEntradaProdutoInfo() {
    const id = document.getElementById("entradaProduto")?.value;
    const info = document.getElementById("entradaProdutoInfo");

    if (!info) return;

    const p = readJSON(STORAGE.produtos).find(x => x.id === id);

    if (!p) {
        info.textContent = "Cadastre produtos na aba Estoque antes de registrar uma entrada.";
        return;
    }

    info.innerHTML = `
        ${categoryIcon(p.categoria)} <strong>${p.nome}</strong><br>
        Estoque atual: <strong>${numberBR(p.estoque)} ${p.unidade || "un."}</strong>
        &nbsp;•&nbsp; Custo atual: <strong>${money(p.custo)}</strong>
    `;
}

function renderEntradas() {
    const entradas = readJSON(STORAGE.entradas)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

    const body = document.getElementById("entradasBody");

    if (!body) return;

    body.innerHTML = entradas.slice(0, 30).map(e => `
        <tr>
            <td>${localDateTime(e.data)}</td>
            <td>
                <div class="product-cell">
                    <span class="product-cell-icon">${categoryIcon(e.categoria)}</span>
                    <div>
                        <strong>${e.nome}</strong>
                        <small>${e.categoria}</small>
                    </div>
                </div>
            </td>
            <td>${numberBR(e.qtd)} ${e.unidade}</td>
            <td>${e.fornecedor || "-"}</td>
            <td class="right">${money(e.custo)}</td>
        </tr>
    `).join("");

    setEmptyVisibility("entradasEmpty", entradas.length === 0);

    const mes = currentMonthKey();
    const entradasMes = entradas.filter(e => monthKeyFromISO(e.data) === mes);

    const resumo = document.getElementById("entradasMesResumo");

    if (resumo) {
        resumo.textContent = entradasMes.length;
    }
}

/* =========================================================
   FIADOS
========================================================= */

function initFiados() {
    if (document.body.dataset.page !== "fiados") return;

    const manualForm = document.getElementById("fiadoManualForm");
    const pagamentoForm = document.getElementById("fiadoPagamentoForm");
    const busca = document.getElementById("fiadoBusca");

    if (!manualForm || !pagamentoForm) {
        console.error("A página de fiados está incompleta.");
        return;
    }

    busca?.addEventListener("input", renderFiados);

    manualForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const cliente = document.getElementById("fiadoCliente").value.trim();
        const telefone = document.getElementById("fiadoTelefone").value.trim();
        const descricao = document.getElementById("fiadoDescricao").value.trim();
        const valor = Number(document.getElementById("fiadoValor").value || 0);
        const vencimento = document.getElementById("fiadoVencimento").value;

        if (!cliente || valor <= 0) {
            showToast("Informe o cliente e um valor válido.", "error");
            return;
        }

        const fiados = readJSON(STORAGE.fiados);

        fiados.push({
            id: uid("fiado"),
            vendaId: null,
            cliente,
            telefone,
            descricao,
            data: nowISO(),
            vencimento,
            total: valor,
            pago: 0,
            saldo: valor,
            status: "Em aberto",
            historico: []
        });

        writeJSON(STORAGE.fiados, fiados);

        manualForm.reset();

        renderFiados();
        populateFiadosPagamento();

        showToast("Fiado registrado.");
    });

    pagamentoForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fiadoId = document.getElementById("pagamentoFiado").value;
        const valor = Number(document.getElementById("pagamentoValor").value || 0);
        const forma = document.getElementById("pagamentoForma").value;

        if (!fiadoId) {
            showToast("Nenhum fiado em aberto para receber.", "error");
            return;
        }

        const fiados = readJSON(STORAGE.fiados);
        const f = fiados.find(x => x.id === fiadoId);

        if (!f) return;

        if (valor <= 0) {
            showToast("Informe um valor de recebimento.", "error");
            return;
        }

        const saldoAtual = Number(f.saldo || 0);

        if (valor > saldoAtual + 0.0001) {
            showToast("O valor recebido não pode ser maior que o saldo.", "error");
            return;
        }

        f.pago = Number(f.pago || 0) + valor;
        f.saldo = Math.max(0, saldoAtual - valor);
        f.status = f.saldo <= 0 ? "Quitado" : "Em aberto";

        f.historico = Array.isArray(f.historico) ? f.historico : [];

        f.historico.push({
            id: uid("pag"),
            data: nowISO(),
            valor,
            forma
        });

        writeJSON(STORAGE.fiados, fiados);

        pagamentoForm.reset();

        renderFiados();
        populateFiadosPagamento();

        showToast(f.saldo <= 0 ? "Fiado quitado com sucesso." : "Pagamento registrado.");
    });

    renderFiados();
    populateFiadosPagamento();
}

function fiadoStatus(f) {
    if (Number(f.saldo || 0) <= 0) {
        return {
            className: "status-paid",
            text: "Quitado"
        };
    }

    if (f.vencimento) {
        const hoje = todayKey();

        if (f.vencimento < hoje) {
            return {
                className: "status-overdue",
                text: "Vencido"
            };
        }
    }

    return {
        className: "status-low",
        text: "Em aberto"
    };
}

function renderFiados() {
    const termo = (document.getElementById("fiadoBusca")?.value || "").trim().toLowerCase();
    const fiados = readJSON(STORAGE.fiados)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

    const filtrados = fiados.filter(f => {
        const texto = `${f.cliente} ${f.telefone || ""} ${f.descricao || ""}`.toLowerCase();
        return !termo || texto.includes(termo);
    });

    const body = document.getElementById("fiadosBody");

    if (!body) return;

    body.innerHTML = filtrados.map(f => {
        const status = fiadoStatus(f);

        return `
            <tr>
                <td>
                    <div class="product-cell">
                        <span class="product-cell-icon">👤</span>
                        <div>
                            <strong>${f.cliente}</strong>
                            <small>${f.telefone || f.descricao || "Sem observação"}</small>
                        </div>
                    </div>
                </td>
                <td>${localDateTime(f.data)}</td>
                <td>${localDate(f.vencimento)}</td>
                <td>${money(f.total)}</td>
                <td>${money(f.pago)}</td>
                <td><strong>${money(f.saldo)}</strong></td>
                <td><span class="status-badge ${status.className}">${status.text}</span></td>
            </tr>
        `;
    }).join("");

    setEmptyVisibility("fiadosEmpty", filtrados.length === 0);

    const emAberto = fiados.filter(f => Number(f.saldo || 0) > 0);
    const totalAberto = emAberto.reduce((s, f) => s + Number(f.saldo || 0), 0);
    const vencidos = emAberto.filter(f => f.vencimento && f.vencimento < todayKey());

    const clientes = new Set(
        emAberto.map(f => f.cliente.trim().toLowerCase()).filter(Boolean)
    );

    const quitados = fiados.filter(f => Number(f.saldo || 0) <= 0);

    document.getElementById("fiadosTotalAberto").textContent = money(totalAberto);
    document.getElementById("fiadosVencidos").textContent = vencidos.length;
    document.getElementById("fiadosClientes").textContent = clientes.size;
    document.getElementById("fiadosQuitados").textContent = quitados.length;
}

function populateFiadosPagamento() {
    const fiados = readJSON(STORAGE.fiados)
        .filter(f => Number(f.saldo || 0) > 0)
        .sort((a, b) => a.cliente.localeCompare(b.cliente, "pt-BR"));

    const select = document.getElementById("pagamentoFiado");

    if (!select) return;

    select.innerHTML = fiados.length
        ? fiados.map(f => `
            <option value="${f.id}">
                ${f.cliente} • saldo ${money(f.saldo)}
            </option>
        `).join("")
        : `<option value="">Nenhum fiado em aberto</option>`;
}



/* =========================================================
   FINANCEIRO / LUCRO
========================================================= */

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function isDespesaOperacional(despesa) {
    const categoria =
        normalizeText(
            despesa?.categoria
        );

    // Evita descontar compra de estoque duas vezes.
    return ![
        "mercadoria",
        "compra de mercadoria",
        "compras de mercadoria",
        "estoque"
    ].includes(categoria);
}

function custoUnitarioDaVenda(
    item,
    produtosAtuais
) {
    const custoRegistrado =
        Number(item?.custo);

    // Vendas novas já guardam o custo do momento da venda.
    if (
        Number.isFinite(
            custoRegistrado
        ) &&
        custoRegistrado > 0
    ) {
        return {
            custo: custoRegistrado,
            estimado: false
        };
    }

    // Para vendas antigas, tenta usar o custo atual cadastrado.
    const produtoAtual =
        produtosAtuais.find(
            p =>
                p.id ===
                item?.produtoId
        );

    const custoAtual =
        Number(
            produtoAtual?.custo ||
            0
        );

    if (custoAtual > 0) {
        return {
            custo: custoAtual,
            estimado: true
        };
    }

    return {
        custo: 0,
        estimado: true
    };
}

function calcularFinanceiroVendas(
    vendas
) {
    const produtosAtuais =
        readJSON(
            STORAGE.produtos
        );

    let cmv = 0;
    let itensSemCustoHistorico = 0;
    let itensSemCustoTotal = 0;

    vendas.forEach(venda => {

        (venda.itens || [])
            .forEach(item => {

                const qtd =
                    Number(
                        item.qtd ||
                        0
                    );

                const custoInfo =
                    custoUnitarioDaVenda(
                        item,
                        produtosAtuais
                    );

                cmv +=
                    qtd *
                    custoInfo.custo;

                if (
                    custoInfo.estimado
                ) {
                    itensSemCustoHistorico += 1;

                    if (
                        custoInfo.custo <= 0
                    ) {
                        itensSemCustoTotal += 1;
                    }
                }
            });
    });

    return {
        cmv,
        itensSemCustoHistorico,
        itensSemCustoTotal
    };
}

function percentual(
    parte,
    total
) {
    if (!Number(total || 0)) {
        return 0;
    }

    return (
        Number(parte || 0) /
        Number(total || 0)
    ) * 100;
}

function percentualBR(value) {
    return (
        Number(value || 0)
            .toFixed(1)
            .replace(".", ",") +
        "%"
    );
}

function applyProfitClass(
    elementId,
    value
) {
    const el =
        document.getElementById(
            elementId
        );

    if (!el) return;

    el.classList.remove(
        "profit-positive-text",
        "profit-negative-text"
    );

    el.classList.add(
        Number(value || 0) >= 0
            ? "profit-positive-text"
            : "profit-negative-text"
    );
}


/* =========================================================
   DESPESAS
========================================================= */

function initDespesas() {
    if (document.body.dataset.page !== "despesas") return;

    const form = document.getElementById("despesaForm");
    const filtro = document.getElementById("despesasMesFiltro");
    const dataInput = document.getElementById("despesaData");

    if (!form || !filtro) return;

    filtro.value = currentMonthKey();
    dataInput.value = todayKey();

    filtro.addEventListener("change", renderDespesas);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = dataInput.value;
        const descricao = document.getElementById("despesaDescricao").value.trim();
        const categoria = document.getElementById("despesaCategoria").value;
        const valor = Number(document.getElementById("despesaValor").value || 0);
        const pagamento = document.getElementById("despesaPagamento").value;
        const obs = document.getElementById("despesaObs").value.trim();

        if (!data || !descricao || valor <= 0) {
            showToast("Informe data, descrição e valor da despesa.", "error");
            return;
        }

        const despesas = readJSON(STORAGE.despesas);

        despesas.push({
            id: uid("desp"),
            data,
            descricao,
            categoria,
            valor,
            pagamento,
            obs,
            criadoEm: nowISO()
        });

        writeJSON(STORAGE.despesas, despesas);

        form.reset();
        dataInput.value = todayKey();

        renderDespesas();
        showToast("Despesa registrada.");
    });

    renderDespesas();
}

function renderDespesas() {
    const filtro =
        document.getElementById(
            "despesasMesFiltro"
        );

    const mes =
        filtro?.value ||
        currentMonthKey();

    const despesas =
        readJSON(
            STORAGE.despesas
        )
        .filter(
            d =>
                String(
                    d.data ||
                    ""
                ).slice(
                    0,
                    7
                ) === mes
        )
        .filter(
            isDespesaOperacional
        )
        .sort(
            (a, b) =>
                String(
                    b.data
                ).localeCompare(
                    String(
                        a.data
                    )
                )
        );

    const body =
        document.getElementById(
            "despesasBody"
        );

    if (!body) return;

    body.innerHTML =
        despesas.map(d => `
            <tr>
                <td>
                    ${localDate(d.data)}
                </td>

                <td>
                    <div class="product-cell">
                        <span class="product-cell-icon">
                            💸
                        </span>

                        <div>
                            <strong>
                                ${d.descricao}
                            </strong>

                            <small>
                                ${d.obs || "Sem observação"}
                            </small>
                        </div>
                    </div>
                </td>

                <td>
                    ${d.categoria}
                </td>

                <td>
                    ${d.pagamento}
                </td>

                <td class="right">
                    <strong>
                        ${money(d.valor)}
                    </strong>
                </td>

                <td class="right">
                    <button
                        class="mini-button danger"
                        onclick="excluirDespesa('${d.id}')"
                    >
                        Excluir
                    </button>
                </td>
            </tr>
        `).join("");

    setEmptyVisibility(
        "despesasEmpty",
        despesas.length === 0
    );

    const total =
        despesas.reduce(
            (s, d) =>
                s +
                Number(
                    d.valor ||
                    0
                ),
            0
        );

    const maior =
        despesas.length
            ? Math.max(
                ...despesas.map(
                    d =>
                        Number(
                            d.valor ||
                            0
                        )
                )
            )
            : 0;

    const media =
        despesas.length
            ? total /
              despesas.length
            : 0;

    document.getElementById(
        "despesasMesTotal"
    ).textContent =
        money(total);

    document.getElementById(
        "despesasMesQtd"
    ).textContent =
        despesas.length;

    document.getElementById(
        "despesaMaior"
    ).textContent =
        money(maior);

    document.getElementById(
        "despesaMedia"
    ).textContent =
        money(media);
}

function excluirDespesa(id) {
    const despesas = readJSON(STORAGE.despesas);
    const item = despesas.find(d => d.id === id);

    if (!item) return;

    if (!confirm(`Excluir a despesa "${item.descricao}"?`)) return;

    writeJSON(
        STORAGE.despesas,
        despesas.filter(d => d.id !== id)
    );

    renderDespesas();
    showToast("Despesa excluída.");
}

/* =========================================================
   INDICADORES
========================================================= */

function initIndicadores() {
    if (document.body.dataset.page !== "indicadores") return;

    const mesInput = document.getElementById("indicadoresMes");

    if (!mesInput) return;

    mesInput.value = currentMonthKey();
    mesInput.addEventListener("change", renderIndicadores);

    renderIndicadores();
}

function renderIndicadores() {
    const mes =
        document.getElementById(
            "indicadoresMes"
        )?.value ||
        currentMonthKey();

    const vendas =
        readJSON(
            STORAGE.vendas
        )
        .filter(
            v =>
                monthKeyFromISO(
                    v.data
                ) === mes
        );

    const despesas =
        readJSON(
            STORAGE.despesas
        )
        .filter(
            d =>
                String(
                    d.data ||
                    ""
                ).slice(
                    0,
                    7
                ) === mes
        )
        .filter(
            isDespesaOperacional
        );

    const faturamento =
        vendas.reduce(
            (s, v) =>
                s +
                Number(
                    v.total ||
                    0
                ),
            0
        );

    const financeiro =
        calcularFinanceiroVendas(
            vendas
        );

    const cmv =
        financeiro.cmv;

    const lucroBruto =
        faturamento -
        cmv;

    const despesasTotal =
        despesas.reduce(
            (s, d) =>
                s +
                Number(
                    d.valor ||
                    0
                ),
            0
        );

    const lucroLiquido =
        lucroBruto -
        despesasTotal;

    const margemBruta =
        percentual(
            lucroBruto,
            faturamento
        );

    const margemLiquida =
        percentual(
            lucroLiquido,
            faturamento
        );

    const qtdVendas =
        vendas.length;

    const ticket =
        qtdVendas
            ? faturamento /
              qtdVendas
            : 0;

    const itensVendidos =
        vendas.reduce(
            (s, v) =>
                s +
                (v.itens || [])
                    .reduce(
                        (s2, item) =>
                            s2 +
                            Number(
                                item.qtd ||
                                0
                            ),
                        0
                    ),
            0
        );

    const fiadoGerado =
        vendas
            .filter(
                v =>
                    v.pagamento ===
                    "Fiado"
            )
            .reduce(
                (s, v) =>
                    s +
                    Number(
                        v.total ||
                        0
                    ),
                0
            );

    const produtosAtuais =
        readJSON(
            STORAGE.produtos
        );

    const produtoMap = {};
    const categoriaMap = {};
    const pagamentoMap = {};
    const diaMap = {};

    vendas.forEach(v => {

        pagamentoMap[
            v.pagamento
        ] =
            (
                pagamentoMap[
                    v.pagamento
                ] ||
                0
            ) +
            Number(
                v.total ||
                0
            );

        const d =
            new Date(
                v.data
            );

        const dia =
            String(
                d.getDate()
            ).padStart(
                2,
                "0"
            );

        diaMap[dia] =
            (
                diaMap[dia] ||
                0
            ) +
            Number(
                v.total ||
                0
            );

        (v.itens || [])
            .forEach(item => {

                const key =
                    item.produtoId ||
                    item.nome;

                if (
                    !produtoMap[
                        key
                    ]
                ) {
                    produtoMap[
                        key
                    ] = {
                        nome:
                            item.nome,

                        categoria:
                            item.categoria ||
                            "Outros",

                        qtd: 0,

                        faturamento: 0,

                        cmv: 0
                    };
                }

                const qtd =
                    Number(
                        item.qtd ||
                        0
                    );

                const faturamentoItem =
                    Number(
                        item.subtotal ||
                        (
                            qtd *
                            Number(
                                item.preco ||
                                0
                            )
                        )
                    );

                const custoInfo =
                    custoUnitarioDaVenda(
                        item,
                        produtosAtuais
                    );

                const cmvItem =
                    qtd *
                    custoInfo.custo;

                produtoMap[
                    key
                ].qtd +=
                    qtd;

                produtoMap[
                    key
                ].faturamento +=
                    faturamentoItem;

                produtoMap[
                    key
                ].cmv +=
                    cmvItem;

                const categoria =
                    item.categoria ||
                    "Outros";

                categoriaMap[
                    categoria
                ] =
                    (
                        categoriaMap[
                            categoria
                        ] ||
                        0
                    ) +
                    faturamentoItem;
            });
    });

    const produtos =
        Object.values(
            produtoMap
        )
        .map(p => ({
            ...p,

            lucroBruto:
                p.faturamento -
                p.cmv,

            margem:
                percentual(
                    p.faturamento -
                    p.cmv,
                    p.faturamento
                )
        }))
        .sort(
            (a, b) =>
                b.qtd -
                a.qtd
        );

    const maisVendido =
        produtos[0];

    /* CARDS */

    document.getElementById(
        "indFaturamento"
    ).textContent =
        money(
            faturamento
        );

    document.getElementById(
        "indCMV"
    ).textContent =
        money(cmv);

    document.getElementById(
        "indLucroBruto"
    ).textContent =
        money(
            lucroBruto
        );

    document.getElementById(
        "indMargemBruta"
    ).textContent =
        percentualBR(
            margemBruta
        );

    document.getElementById(
        "indDespesas"
    ).textContent =
        money(
            despesasTotal
        );

    document.getElementById(
        "indLucroLiquido"
    ).textContent =
        money(
            lucroLiquido
        );

    document.getElementById(
        "indMargemLiquida"
    ).textContent =
        percentualBR(
            margemLiquida
        );

    document.getElementById(
        "indQtdVendas"
    ).textContent =
        qtdVendas;

    document.getElementById(
        "indItensVendidos"
    ).textContent =
        numberBR(
            itensVendidos
        );

    document.getElementById(
        "indTicket"
    ).textContent =
        money(ticket);

    document.getElementById(
        "indMaisVendido"
    ).textContent =
        maisVendido
            ? maisVendido.nome
            : "-";

    document.getElementById(
        "indMaisVendidoQtd"
    ).textContent =
        maisVendido
            ? `${numberBR(
                maisVendido.qtd
            )} unidade(s)`
            : "Sem vendas";

    document.getElementById(
        "indFiadoGerado"
    ).textContent =
        money(
            fiadoGerado
        );

    applyProfitClass(
        "indLucroBruto",
        lucroBruto
    );

    applyProfitClass(
        "indLucroLiquido",
        lucroLiquido
    );

    /* FLUXO */

    document.getElementById(
        "flowFaturamento"
    ).textContent =
        money(
            faturamento
        );

    document.getElementById(
        "flowCMV"
    ).textContent =
        money(cmv);

    document.getElementById(
        "flowLucroBruto"
    ).textContent =
        money(
            lucroBruto
        );

    document.getElementById(
        "flowDespesas"
    ).textContent =
        money(
            despesasTotal
        );

    document.getElementById(
        "flowLucroLiquido"
    ).textContent =
        money(
            lucroLiquido
        );

    applyProfitClass(
        "flowLucroLiquido",
        lucroLiquido
    );

    const warning =
        document.getElementById(
            "costDataWarning"
        );

    if (
        financeiro
            .itensSemCustoHistorico >
        0
    ) {
        warning.classList.remove(
            "hidden"
        );

        if (
            financeiro
                .itensSemCustoTotal >
            0
        ) {
            warning.innerHTML =
                `⚠️ Existem <strong>${financeiro.itensSemCustoTotal}</strong> item(ns) de vendas sem custo disponível. O lucro pode estar superestimado.`;
        } else {
            warning.innerHTML =
                `ℹ️ Existem <strong>${financeiro.itensSemCustoHistorico}</strong> item(ns) de vendas antigas sem custo gravado na venda. Para eles foi usado o custo atual do cadastro.`;
        }
    } else {
        warning.classList.add(
            "hidden"
        );

        warning.textContent =
            "";
    }

    /* GRÁFICOS */

    renderDayBars(
        diaMap
    );

    renderMetricList(
        "paymentBreakdown",
        pagamentoMap,
        money
    );

    renderMetricList(
        "expenseBreakdown",
        despesas.reduce(
            (acc, d) => {

                acc[
                    d.categoria
                ] =
                    (
                        acc[
                            d.categoria
                        ] ||
                        0
                    ) +
                    Number(
                        d.valor ||
                        0
                    );

                return acc;
            },
            {}
        ),
        money
    );

    renderMetricList(
        "categoryBreakdown",
        categoriaMap,
        money
    );

    /* PRODUTOS */

    const topBody =
        document.getElementById(
            "topProductsBody"
        );

    topBody.innerHTML =
        produtos
            .slice(
                0,
                20
            )
            .map(
                (
                    p,
                    index
                ) => `
                    <tr>

                        <td>
                            <strong>
                                ${index + 1}º
                            </strong>
                        </td>

                        <td>
                            <div class="product-cell">

                                <span class="product-cell-icon">
                                    ${categoryIcon(
                                        p.categoria
                                    )}
                                </span>

                                <div>
                                    <strong>
                                        ${p.nome}
                                    </strong>

                                    <small>
                                        ${p.categoria}
                                    </small>
                                </div>

                            </div>
                        </td>

                        <td>
                            ${p.categoria}
                        </td>

                        <td>
                            ${numberBR(
                                p.qtd
                            )}
                        </td>

                        <td class="right">
                            <strong>
                                ${money(
                                    p.faturamento
                                )}
                            </strong>
                        </td>

                        <td class="right">
                            ${money(
                                p.cmv
                            )}
                        </td>

                        <td class="right">
                            <strong class="${
                                p.lucroBruto >=
                                0
                                    ? "profit-positive-text"
                                    : "profit-negative-text"
                            }">
                                ${money(
                                    p.lucroBruto
                                )}
                            </strong>
                        </td>

                        <td class="right">
                            <span class="margin-pill ${
                                p.margem >= 0
                                    ? "positive"
                                    : "negative"
                            }">
                                ${percentualBR(
                                    p.margem
                                )}
                            </span>
                        </td>

                    </tr>
                `
            )
            .join("");

    setEmptyVisibility(
        "topProductsEmpty",
        produtos.length ===
        0
    );

    /* RESUMO */

    const resumo =
        document.getElementById(
            "indicatorSummary"
        );

    resumo.innerHTML = `
        <div class="summary-line">
            💰 Faturamento:
            <strong>
                ${money(
                    faturamento
                )}
            </strong>.
        </div>

        <div class="summary-line">
            📦 CMV:
            <strong>
                ${money(cmv)}
            </strong>
            (${percentualBR(
                percentual(
                    cmv,
                    faturamento
                )
            )} do faturamento).
        </div>

        <div class="summary-line">
            📈 Lucro bruto:
            <strong>
                ${money(
                    lucroBruto
                )}
            </strong>,
            margem bruta de
            <strong>
                ${percentualBR(
                    margemBruta
                )}
            </strong>.
        </div>

        <div class="summary-line">
            💸 Despesas operacionais:
            <strong>
                ${money(
                    despesasTotal
                )}
            </strong>.
        </div>

        <div class="summary-line">
            ${
                lucroLiquido >=
                0
                    ? "✅"
                    : "⚠️"
            }
            Lucro líquido estimado:
            <strong>
                ${money(
                    lucroLiquido
                )}
            </strong>,
            margem líquida de
            <strong>
                ${percentualBR(
                    margemLiquida
                )}
            </strong>.
        </div>

        <div class="summary-line">
            🏆 Produto líder:
            <strong>
                ${
                    maisVendido
                        ? maisVendido.nome
                        : "sem vendas"
                }
            </strong>.
        </div>
    `;
}

function renderDayBars(diaMap) {
    const chart = document.getElementById("salesDayChart");
    if (!chart) return;

    const entries = Object.entries(diaMap)
        .sort((a, b) => Number(a[0]) - Number(b[0]));

    const maxValue = entries.length
        ? Math.max(...entries.map(([, value]) => Number(value)))
        : 0;

    chart.innerHTML = entries.map(([day, value]) => {
        const h = maxValue > 0 ? Math.max(8, (Number(value) / maxValue) * 155) : 8;

        return `
            <div class="day-bar-wrap">
                <div class="day-bar-value">${money(value)}</div>
                <div class="day-bar" style="height:${h}px"></div>
                <div class="day-bar-label">${day}</div>
            </div>
        `;
    }).join("");

    setEmptyVisibility("salesDayEmpty", entries.length === 0);
}

function renderMetricList(elementId, dataMap, formatter) {
    const el = document.getElementById(elementId);

    if (!el) return;

    const entries = Object.entries(dataMap)
        .sort((a, b) => Number(b[1]) - Number(a[1]));

    const total = entries.reduce((s, [, value]) => s + Number(value || 0), 0);

    if (!entries.length) {
        el.innerHTML = `
            <div class="empty-state compact">
                <span>📊</span>
                <strong>Sem dados</strong>
                <p>Nenhum registro no período selecionado.</p>
            </div>
        `;
        return;
    }

    el.innerHTML = entries.map(([label, value]) => {
        const pct = total > 0 ? (Number(value) / total) * 100 : 0;

        return `
            <div class="metric-item">
                <div class="metric-row">
                    <strong>${label}</strong>
                    <span>${formatter(value)}</span>
                </div>

                <div class="metric-track">
                    <div class="metric-fill" style="width:${pct}%"></div>
                </div>
            </div>
        `;
    }).join("");
}



/* =========================================================
   RESUMO / RELATÓRIO POR PERÍODO
========================================================= */

function dateKeyFromISO(iso) {
    if (!iso) return "";

    const d = new Date(iso);

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}

function firstDayOfCurrentMonth() {
    const d = new Date();

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        "01"
    ].join("-");
}

function dateInRange(dateKey, start, end) {
    if (!dateKey) return false;

    return dateKey >= start && dateKey <= end;
}

function formatPeriodDate(dateString) {
    if (!dateString) return "-";

    const [y, m, d] = dateString.split("-");

    return `${d}/${m}/${y}`;
}

function initResumo() {
    if (document.body.dataset.page !== "resumo") return;

    const inicio = document.getElementById("resumoDataInicial");
    const fim = document.getElementById("resumoDataFinal");
    const gerar = document.getElementById("btnGerarResumo");
    const imprimir = document.getElementById("btnImprimirResumo");

    if (!inicio || !fim || !gerar) return;

    inicio.value = firstDayOfCurrentMonth();
    fim.value = todayKey();

    gerar.addEventListener("click", gerarResumo);

    imprimir?.addEventListener("click", () => {
        gerarResumo();
        setTimeout(() => window.print(), 120);
    });

    gerarResumo();
}

function gerarResumo() {
    const inicio =
        document.getElementById(
            "resumoDataInicial"
        )?.value;

    const fim =
        document.getElementById(
            "resumoDataFinal"
        )?.value;

    if (!inicio || !fim) {
        showToast(
            "Informe a data inicial e a data final.",
            "error"
        );

        return;
    }

    if (inicio > fim) {
        showToast(
            "A data inicial não pode ser maior que a data final.",
            "error"
        );

        return;
    }

    const vendas =
        readJSON(
            STORAGE.vendas
        )
        .filter(
            v =>
                dateInRange(
                    dateKeyFromISO(
                        v.data
                    ),
                    inicio,
                    fim
                )
        )
        .sort(
            (a, b) =>
                new Date(
                    a.data
                ) -
                new Date(
                    b.data
                )
        );

    const despesas =
        readJSON(
            STORAGE.despesas
        )
        .filter(
            d =>
                dateInRange(
                    String(
                        d.data ||
                        ""
                    ).slice(
                        0,
                        10
                    ),
                    inicio,
                    fim
                )
        )
        .filter(
            isDespesaOperacional
        )
        .sort(
            (a, b) =>
                String(
                    a.data
                ).localeCompare(
                    String(
                        b.data
                    )
                )
        );

    const entradas =
        readJSON(
            STORAGE.entradas
        )
        .filter(
            e =>
                dateInRange(
                    dateKeyFromISO(
                        e.data
                    ),
                    inicio,
                    fim
                )
        )
        .sort(
            (a, b) =>
                new Date(
                    a.data
                ) -
                new Date(
                    b.data
                )
        );

    const todosFiados =
        readJSON(
            STORAGE.fiados
        );

    const fiadosGerados =
        todosFiados
            .filter(
                f =>
                    dateInRange(
                        dateKeyFromISO(
                            f.data
                        ),
                        inicio,
                        fim
                    )
            )
            .sort(
                (a, b) =>
                    new Date(
                        a.data
                    ) -
                    new Date(
                        b.data
                    )
            );

    const recebimentos = [];

    todosFiados.forEach(f => {

        (
            Array.isArray(
                f.historico
            )
                ? f.historico
                : []
        ).forEach(pag => {

            if (
                dateInRange(
                    dateKeyFromISO(
                        pag.data
                    ),
                    inicio,
                    fim
                )
            ) {
                recebimentos.push({
                    fiadoId:
                        f.id,

                    cliente:
                        f.cliente ||
                        "Cliente",

                    data:
                        pag.data,

                    valor:
                        Number(
                            pag.valor ||
                            0
                        ),

                    forma:
                        pag.forma ||
                        "-"
                });
            }
        });
    });

    recebimentos.sort(
        (a, b) =>
            new Date(
                a.data
            ) -
            new Date(
                b.data
            )
    );

    /* TOTAIS */

    const faturamento =
        vendas.reduce(
            (s, v) =>
                s +
                Number(
                    v.total ||
                    0
                ),
            0
        );

    const financeiro =
        calcularFinanceiroVendas(
            vendas
        );

    const cmv =
        financeiro.cmv;

    const lucroBruto =
        faturamento -
        cmv;

    const despesasTotal =
        despesas.reduce(
            (s, d) =>
                s +
                Number(
                    d.valor ||
                    0
                ),
            0
        );

    const lucroLiquido =
        lucroBruto -
        despesasTotal;

    const margemBruta =
        percentual(
            lucroBruto,
            faturamento
        );

    const margemLiquida =
        percentual(
            lucroLiquido,
            faturamento
        );

    const qtdVendas =
        vendas.length;

    const itensVendidos =
        vendas.reduce(
            (s, v) =>
                s +
                (v.itens || [])
                    .reduce(
                        (
                            s2,
                            item
                        ) =>
                            s2 +
                            Number(
                                item.qtd ||
                                0
                            ),
                        0
                    ),
            0
        );

    const ticketMedio =
        qtdVendas > 0
            ? faturamento /
              qtdVendas
            : 0;

    const fiadosGeradosTotal =
        fiadosGerados.reduce(
            (s, f) =>
                s +
                Number(
                    f.total ||
                    0
                ),
            0
        );

    const fiadosRecebidosTotal =
        recebimentos.reduce(
            (s, p) =>
                s +
                Number(
                    p.valor ||
                    0
                ),
            0
        );

    const qtdRecebida =
        entradas.reduce(
            (s, e) =>
                s +
                Number(
                    e.qtd ||
                    0
                ),
            0
        );

    const valorEntradas =
        entradas.reduce(
            (s, e) =>
                s +
                Number(
                    e.qtd ||
                    0
                ) *
                Number(
                    e.custo ||
                    0
                ),
            0
        );

    /* CABEÇALHO */

    document.getElementById(
        "reportPeriodo"
    ).textContent =
        `${formatPeriodDate(
            inicio
        )} a ${formatPeriodDate(
            fim
        )}`;

    document.getElementById(
        "reportGeradoEm"
    ).textContent =
        `Gerado em ${new Date().toLocaleString(
            "pt-BR"
        )}`;

    /* KPIs */

    document.getElementById(
        "relFaturamento"
    ).textContent =
        money(
            faturamento
        );

    document.getElementById(
        "relCMV"
    ).textContent =
        money(cmv);

    document.getElementById(
        "relLucroBruto"
    ).textContent =
        money(
            lucroBruto
        );

    document.getElementById(
        "relMargemBruta"
    ).textContent =
        percentualBR(
            margemBruta
        );

    document.getElementById(
        "relDespesas"
    ).textContent =
        money(
            despesasTotal
        );

    document.getElementById(
        "relLucroLiquido"
    ).textContent =
        money(
            lucroLiquido
        );

    document.getElementById(
        "relMargemLiquida"
    ).textContent =
        percentualBR(
            margemLiquida
        );

    document.getElementById(
        "relQtdVendas"
    ).textContent =
        qtdVendas;

    document.getElementById(
        "relItensVendidos"
    ).textContent =
        numberBR(
            itensVendidos
        );

    document.getElementById(
        "relTicketMedio"
    ).textContent =
        money(
            ticketMedio
        );

    document.getElementById(
        "relFiadosGerados"
    ).textContent =
        money(
            fiadosGeradosTotal
        );

    document.getElementById(
        "relFiadosRecebidos"
    ).textContent =
        money(
            fiadosRecebidosTotal
        );

    document.getElementById(
        "relQtdEntradas"
    ).textContent =
        entradas.length;

    document.getElementById(
        "relQtdRecebida"
    ).textContent =
        numberBR(
            qtdRecebida
        );

    document.getElementById(
        "relValorEntradas"
    ).textContent =
        money(
            valorEntradas
        );

    applyProfitClass(
        "relLucroBruto",
        lucroBruto
    );

    applyProfitClass(
        "relLucroLiquido",
        lucroLiquido
    );

    /* PRODUTOS / PAGAMENTOS */

    const produtosAtuais =
        readJSON(
            STORAGE.produtos
        );

    const produtoMap = {};
    const pagamentoMap = {};
    const diaMap = {};

    vendas.forEach(v => {

        pagamentoMap[
            v.pagamento
        ] =
            (
                pagamentoMap[
                    v.pagamento
                ] ||
                0
            ) +
            Number(
                v.total ||
                0
            );

        const dia =
            dateKeyFromISO(
                v.data
            );

        diaMap[dia] =
            (
                diaMap[
                    dia
                ] ||
                0
            ) +
            Number(
                v.total ||
                0
            );

        (v.itens || [])
            .forEach(item => {

                const key =
                    item.produtoId ||
                    `${item.nome}-${item.categoria}`;

                if (
                    !produtoMap[
                        key
                    ]
                ) {
                    produtoMap[
                        key
                    ] = {
                        nome:
                            item.nome,

                        categoria:
                            item.categoria ||
                            "Outros",

                        qtd: 0,

                        faturamento: 0,

                        cmv: 0
                    };
                }

                const qtd =
                    Number(
                        item.qtd ||
                        0
                    );

                const faturamentoItem =
                    Number(
                        item.subtotal ||
                        (
                            qtd *
                            Number(
                                item.preco ||
                                0
                            )
                        )
                    );

                const custoInfo =
                    custoUnitarioDaVenda(
                        item,
                        produtosAtuais
                    );

                produtoMap[
                    key
                ].qtd +=
                    qtd;

                produtoMap[
                    key
                ].faturamento +=
                    faturamentoItem;

                produtoMap[
                    key
                ].cmv +=
                    qtd *
                    custoInfo.custo;
            });
    });

    const produtos =
        Object.values(
            produtoMap
        )
        .map(p => ({
            ...p,

            lucroBruto:
                p.faturamento -
                p.cmv,

            margem:
                percentual(
                    p.faturamento -
                    p.cmv,
                    p.faturamento
                )
        }))
        .sort(
            (a, b) =>
                b.qtd -
                a.qtd
        );

    const maisVendido =
        produtos[0];

    /* TEXTO EXECUTIVO */

    const executive =
        document.getElementById(
            "reportExecutiveText"
        );

    executive.innerHTML = `
        <strong>
            Leitura do período:
        </strong>

        foram registradas
        <b>
            ${qtdVendas} venda(s)
        </b>,
        totalizando
        <b>
            ${money(
                faturamento
            )}
        </b>
        em faturamento.

        O CMV foi de
        <b>
            ${money(cmv)}
        </b>,
        resultando em lucro bruto de
        <b>
            ${money(
                lucroBruto
            )}
        </b>
        e margem bruta de
        <b>
            ${percentualBR(
                margemBruta
            )}
        </b>.

        As despesas operacionais
        somaram
        <b>
            ${money(
                despesasTotal
            )}
        </b>.

        O lucro líquido estimado foi de
        <b>
            ${money(
                lucroLiquido
            )}
        </b>,
        com margem líquida de
        <b>
            ${percentualBR(
                margemLiquida
            )}
        </b>.

        ${
            maisVendido
                ? `O produto com maior quantidade vendida foi <b>${maisVendido.nome}</b>, com <b>${numberBR(maisVendido.qtd)}</b> unidade(s).`
                : "Não houve produtos vendidos no período."
        }

        ${
            financeiro
                .itensSemCustoTotal >
            0
                ? `<br><br>⚠️ <b>Atenção:</b> existem ${financeiro.itensSemCustoTotal} item(ns) de venda sem custo disponível. O lucro pode estar superestimado.`
                : financeiro
                    .itensSemCustoHistorico >
                  0
                    ? `<br><br>ℹ️ Em ${financeiro.itensSemCustoHistorico} item(ns) de vendas antigas foi usado o custo atual do cadastro para estimar o CMV.`
                    : ""
        }
    `;

    /* GRÁFICO */

    renderReportDayBars(
        diaMap
    );

    /* PRODUTOS */

    const topBody =
        document.getElementById(
            "reportTopProductsBody"
        );

    topBody.innerHTML =
        produtos.map(
            (
                p,
                index
            ) => `
                <tr>

                    <td>
                        <strong>
                            ${index + 1}º
                        </strong>
                    </td>

                    <td>
                        <div class="product-cell">

                            <span class="product-cell-icon">
                                ${categoryIcon(
                                    p.categoria
                                )}
                            </span>

                            <div>
                                <strong>
                                    ${p.nome}
                                </strong>

                                <small>
                                    ${p.categoria}
                                </small>
                            </div>

                        </div>
                    </td>

                    <td>
                        ${p.categoria}
                    </td>

                    <td>
                        ${numberBR(
                            p.qtd
                        )}
                    </td>

                    <td class="right">
                        <strong>
                            ${money(
                                p.faturamento
                            )}
                        </strong>
                    </td>

                    <td class="right">
                        ${money(
                            p.cmv
                        )}
                    </td>

                    <td class="right">
                        <strong class="${
                            p.lucroBruto >= 0
                                ? "profit-positive-text"
                                : "profit-negative-text"
                        }">
                            ${money(
                                p.lucroBruto
                            )}
                        </strong>
                    </td>

                    <td class="right">
                        ${percentualBR(
                            p.margem
                        )}
                    </td>

                </tr>
            `
        ).join("");

    setEmptyVisibility(
        "reportTopProductsEmpty",
        produtos.length ===
        0
    );

    /* PAGAMENTOS */

    renderMetricList(
        "reportPaymentBreakdown",
        pagamentoMap,
        money
    );

    /* DESPESAS */

    const despesaCategoriaMap =
        despesas.reduce(
            (
                acc,
                d
            ) => {

                const cat =
                    d.categoria ||
                    "Outros";

                acc[
                    cat
                ] =
                    (
                        acc[
                            cat
                        ] ||
                        0
                    ) +
                    Number(
                        d.valor ||
                        0
                    );

                return acc;
            },
            {}
        );

    renderMetricList(
        "reportExpenseBreakdown",
        despesaCategoriaMap,
        money
    );

    /* ENTRADAS */

    const entradasBody =
        document.getElementById(
            "reportEntradasBody"
        );

    entradasBody.innerHTML =
        entradas.map(e => `
            <tr>

                <td>
                    ${localDateTime(
                        e.data
                    )}
                </td>

                <td>
                    <div class="product-cell">

                        <span class="product-cell-icon">
                            ${categoryIcon(
                                e.categoria
                            )}
                        </span>

                        <div>
                            <strong>
                                ${e.nome}
                            </strong>

                            <small>
                                ${e.categoria}
                            </small>
                        </div>

                    </div>
                </td>

                <td>
                    ${numberBR(
                        e.qtd
                    )}
                    ${e.unidade || "un."}
                </td>

                <td>
                    ${e.fornecedor || "-"}
                </td>

                <td class="right">
                    ${money(
                        Number(
                            e.qtd ||
                            0
                        ) *
                        Number(
                            e.custo ||
                            0
                        )
                    )}
                </td>

            </tr>
        `).join("");

    setEmptyVisibility(
        "reportEntradasEmpty",
        entradas.length ===
        0
    );

    /* FIADOS GERADOS */

    const fiadosBody =
        document.getElementById(
            "reportFiadosBody"
        );

    fiadosBody.innerHTML =
        fiadosGerados.map(f => `
            <tr>

                <td>
                    ${f.cliente || "Cliente"}
                </td>

                <td>
                    ${localDateTime(
                        f.data
                    )}
                </td>

                <td class="right">
                    <strong>
                        ${money(
                            f.total
                        )}
                    </strong>
                </td>

            </tr>
        `).join("");

    setEmptyVisibility(
        "reportFiadosEmpty",
        fiadosGerados.length ===
        0
    );

    /* RECEBIMENTOS DE FIADOS */

    const recebimentosBody =
        document.getElementById(
            "reportRecebimentosBody"
        );

    recebimentosBody.innerHTML =
        recebimentos.map(p => `
            <tr>

                <td>
                    ${p.cliente}
                </td>

                <td>
                    ${localDateTime(
                        p.data
                    )}
                </td>

                <td>
                    ${p.forma}
                </td>

                <td class="right">
                    <strong>
                        ${money(
                            p.valor
                        )}
                    </strong>
                </td>

            </tr>
        `).join("");

    setEmptyVisibility(
        "reportRecebimentosEmpty",
        recebimentos.length ===
        0
    );

    showToast(
        "Relatório atualizado."
    );
}

function renderReportDayBars(diaMap) {
    const chart =
        document.getElementById("reportSalesChart");

    if (!chart) return;

    const entries =
        Object.entries(diaMap)
            .sort((a, b) =>
                String(a[0]).localeCompare(String(b[0]))
            );

    const maxValue =
        entries.length
            ? Math.max(
                ...entries.map(
                    ([, value]) => Number(value)
                )
            )
            : 0;

    chart.innerHTML =
        entries.map(([dayKey, value]) => {
            const h =
                maxValue > 0
                    ? Math.max(
                        10,
                        (Number(value) / maxValue) * 155
                    )
                    : 10;

            const dia =
                dayKey.split("-")[2];

            return `
                <div class="day-bar-wrap">
                    <div class="day-bar-value">
                        ${money(value)}
                    </div>

                    <div
                        class="day-bar"
                        style="height:${h}px"
                    ></div>

                    <div class="day-bar-label">
                        ${dia}
                    </div>
                </div>
            `;
        }).join("");

    setEmptyVisibility(
        "reportSalesChartEmpty",
        entries.length === 0
    );
}


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initLogin();

    // Cria o mesmo menu lateral em todas as páginas do sistema.
    renderSidebar();

    if (!protectApp()) {
        return;
    }

    initDashboard();
    initEstoque();
    initVendas();
    initEntradas();
    initFiados();
    initDespesas();
    initIndicadores();
    initResumo();
});
