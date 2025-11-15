<template>
  <div class="container py-4 finance-app">
    <!-- CABEÇALHO -->
    <div class="d-flex align-items-center justify-content-between mb-4 app-header">
      <div>
        <h1 class="h4 mb-1 text-white">
          <font-awesome-icon icon="wallet" class="me-2" />
          Controle Financeiro – {{ currentMonth }}
        </h1>
        <p class="mb-0 text-white-50 small">
          Acompanhe suas receitas, despesas e saldo do mês.
        </p>
      </div>

      <button class="btn btn-light btn-sm fw-semibold shadow-sm">
        <font-awesome-icon icon="plus-circle" class="me-2" />
        Nova movimentação
      </button>
    </div>

    <!-- CARDS RESUMO -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card resumo-card resumo-income h-100 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <span class="resumo-label">Receitas</span>
              <h2 class="resumo-value mb-0">{{ formatCurrency(totalIncome) }}</h2>
              <small class="text-muted">Salário, hora extra, gratificações…</small>
            </div>
            <font-awesome-icon icon="circle-arrow-down" class="resumo-icon" />
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card resumo-card resumo-expense h-100 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <span class="resumo-label">Despesas</span>
              <h2 class="resumo-value mb-0">-{{ formatCurrency(totalExpenses) }}</h2>
              <small class="text-muted">Contas fixas, cartões, empréstimos…</small>
            </div>
            <font-awesome-icon icon="circle-arrow-up" class="resumo-icon" />
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div
          class="card resumo-card h-100 shadow-sm"
          :class="balance >= 0 ? 'resumo-balance-positive' : 'resumo-balance-negative'"
        >
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <span class="resumo-label">Saldo do mês</span>
              <h2 class="resumo-value mb-0">
                {{ formatCurrency(balance) }}
              </h2>
              <small class="text-muted">
                Receitas - Despesas
              </small>
            </div>
            <font-awesome-icon icon="scale-balanced" class="resumo-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- FORMULÁRIO: ADICIONAR / EDITAR MOVIMENTAÇÃO -->
    <div class="card mb-3 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-semibold small text-muted text-uppercase">
            {{ isEditing ? "Editar movimentação" : "Adicionar movimentação" }}
          </span>
        </div>

        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label mb-1 small text-muted">Item</label>
            <input
              v-model="newTransaction.name"
              type="text"
              class="form-control form-control-sm"
              placeholder="Ex.: INSS, Salário, Cartão..."
            />
          </div>

          <div class="col-md-2">
            <label class="form-label mb-1 small text-muted">Tipo</label>
            <select
              v-model="newTransaction.kind"
              class="form-select form-select-sm"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
              <option value="emprestimo">Empréstimo</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label mb-1 small text-muted">Valor</label>
            <input
              v-model.number="newTransaction.amount"
              type="number"
              step="0.01"
              min="0"
              class="form-control form-control-sm"
              placeholder="0,00"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label mb-1 small text-muted">Categoria</label>
            <input
              v-model="newTransaction.category"
              type="text"
              class="form-control form-control-sm"
              placeholder="Ex.: Impostos, Cartão..."
              list="categoryOptions"
            />

            <!-- Categorias -->
            <datalist id="categoryOptions">
              <option value="Impostos"></option>
              <option value="Amazon Kdp"></option>
              <option value="Doação"></option>
              <option value="Empréstimo"></option>
            </datalist>
          </div>

          <div class="col-md-3">
            <label class="form-label mb-1 small text-muted">Observação</label>
            <input
              v-model="newTransaction.note"
              type="text"
              class="form-control form-control-sm"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div class="mt-3 text-end">
          <button
            v-if="isEditing"
            class="btn btn-outline-secondary btn-sm me-2"
            @click="cancelEdit"
          >
            Cancelar
          </button>

          <button
            class="btn btn-primary btn-sm fw-semibold"
            @click="isEditing ? saveEdit() : addTransaction()"
          >
            <font-awesome-icon
              :icon="isEditing ? 'floppy-disk' : 'plus-circle'"
              class="me-1"
            />
            {{ isEditing ? "Salvar edição" : "Adicionar" }}
          </button>
        </div>
      </div>
    </div>

    <!-- TABELA DE MOVIMENTAÇÕES -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="fw-semibold">
          Movimentações do mês ({{ filteredTransactions.length }})
        </span>
        <span class="badge bg-light text-dark">
          Saldo atual: <strong>{{ formatCurrency(balance) }}</strong>
        </span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Item</th>
              <th class="text-center">Tipo</th>
              <th>Categoria</th>
              <th class="text-end">Valor</th>
              <th class="d-none d-md-table-cell">Observação</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="t in filteredTransactions"
              :key="t.id"
              :class="rowClass(t)"
            >
              <td>
                <div class="d-flex align-items-center">
                  <font-awesome-icon
                    :icon="t.type === 'income' ? 'circle-arrow-down' : 'circle-arrow-up'"
                    class="me-2 small-icon"
                  />
                  <span class="fw-semibold">{{ t.name }}</span>
                </div>
              </td>

              <td class="text-center">
                <span
                  class="badge"
                  :class="badgeClass(t)"
                >
                  {{ displayType(t) }}
                </span>
              </td>

              <td>{{ t.category }}</td>

              <td class="text-end">
                <span
                  :class="t.type === 'income'
                    ? 'text-success fw-semibold'
                    : 'text-danger fw-semibold'"
                >
                  {{ t.type === 'income'
                    ? formatCurrency(t.amount)
                    : '-' + formatCurrency(t.amount)
                  }}
                </span>
              </td>

              <td class="d-none d-md-table-cell text-muted small">
                <div class="d-flex justify-content-between align-items-center">
                  <span>{{ t.note || "—" }}</span>

                  <span class="ms-2">
                    <!-- EDITAR -->
                    <button
                      class="btn btn-sm btn-link text-secondary p-0 me-2"
                      @click="startEdit(t)"
                      title="Editar"
                    >
                      ✏️
                    </button>

                    <!-- APAGAR (desativado se for fixo) -->
                    <button
                      class="btn btn-sm btn-link p-0"
                      :class="t.fixed ? 'text-muted' : 'text-danger'"
                      :disabled="t.fixed"
                      @click="deleteTransaction(t)"
                      :title="t.fixed ? 'Movimentação fixa não pode ser apagada' : 'Excluir'"
                    >
                      🗑
                    </button>
                  </span>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredTransactions.length">
              <td colspan="5" class="text-center text-muted py-4">
                Nenhuma movimentação encontrada.
              </td>
            </tr>
          </tbody>

          <tfoot class="table-light">
            <tr>
              <th colspan="3" class="text-end">Total receitas:</th>
              <th class="text-end text-success">{{ formatCurrency(totalIncome) }}</th>
              <th></th>
            </tr>

            <tr>
              <th colspan="3" class="text-end">Total despesas:</th>
              <th class="text-end text-danger">-{{ formatCurrency(totalExpenses) }}</th>
              <th></th>
            </tr>

            <tr>
              <th colspan="3" class="text-end">Saldo:</th>
              <th
                class="text-end"
                :class="balance >= 0 ? 'text-success' : 'text-danger'"
              >
                {{ formatCurrency(balance) }}
              </th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
const STORAGE_KEY = "finance_transactions_v1";

export default {
  data() {
    return {
      currentMonth: "Novembro",

      // controle de edição
      editingId: null,

      // Formulário de nova movimentação / edição
      newTransaction: {
        name: "",
        kind: "despesa", // 'receita' | 'despesa' | 'emprestimo'
        amount: null,
        category: "",
        note: ""
      },

      // valor padrão (caso não tenha nada salvo ainda)
      transactions: [
        { id: 1, name: "Salário Base",     type: "income", amount: 1730.45, category: "Salário",       fixed: true },
        { id: 2, name: "Quinquênio",       type: "income", amount: 86.52,   category: "Adicional",    fixed: true },
        { id: 3, name: "Gratificação 50%", type: "income", amount: 865.23,  category: "Gratificação", fixed: true }
      ]
    };
  },

  computed: {
    isEditing() {
      return this.editingId !== null;
    },

    totalIncome() {
      return this.transactions
        .filter(t => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
    },

    totalExpenses() {
      return this.transactions
        .filter(t => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
    },

    balance() {
      return this.totalIncome - this.totalExpenses;
    },

    filteredTransactions() {
      return this.transactions;
    }
  },

  methods: {
    // salva no localStorage
    saveTransactions() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
      } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
      }
    },

    formatCurrency(v) {
      return v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
    },

    rowClass(t) {
      return t.type === "income"
        ? "row-income"
        : "row-expense";
    },

    // Texto da badge de tipo
    displayType(t) {
      if (t.kind === "emprestimo") return "Empréstimo";
      return t.type === "income" ? "Receita" : "Despesa";
    },

    // Classe da badge (cores)
    badgeClass(t) {
      return t.type === "income"
        ? "bg-success-subtle text-success"
        : "bg-danger-subtle text-danger";
    },

    resetForm() {
      this.newTransaction = {
        name: "",
        kind: "despesa",
        amount: null,
        category: "",
        note: ""
      };
      this.editingId = null;
    },

    // Adicionar nova movimentação
    addTransaction() {
      if (!this.newTransaction.name || !this.newTransaction.amount || !this.newTransaction.kind) {
        return;
      }

      const type = this.newTransaction.kind === "receita" ? "income" : "expense";

      this.transactions.push({
        id: Date.now(),
        name: this.newTransaction.name,
        type,
        kind: this.newTransaction.kind,
        amount: this.newTransaction.amount,
        category:
          this.newTransaction.category ||
          (this.newTransaction.kind === "emprestimo" ? "Empréstimo" : ""),
        note: this.newTransaction.note || "",
        fixed: false
      });

      this.saveTransactions();
      this.resetForm();
    },

    // Começar edição
    startEdit(t) {
      this.editingId = t.id;
      this.newTransaction = {
        name: t.name,
        kind: t.kind || (t.type === "income" ? "receita" : "despesa"),
        amount: t.amount,
        category: t.category || "",
        note: t.note || ""
      };
    },

    // Salvar edição
    saveEdit() {
      if (this.editingId === null) return;

      const idx = this.transactions.findIndex(t => t.id === this.editingId);
      if (idx === -1) return;

      const type = this.newTransaction.kind === "receita" ? "income" : "expense";

      this.transactions[idx] = {
        ...this.transactions[idx],
        name: this.newTransaction.name,
        type,
        kind: this.newTransaction.kind,
        amount: this.newTransaction.amount,
        category:
          this.newTransaction.category ||
          (this.newTransaction.kind === "emprestimo" ? "Empréstimo" : ""),
        note: this.newTransaction.note || ""
      };

      this.saveTransactions();
      this.resetForm();
    },

    cancelEdit() {
      this.resetForm();
    },

    // Excluir movimentação (somente não fixas)
    deleteTransaction(t) {
      if (t.fixed) {
        alert("Essa movimentação é fixa e não pode ser apagada. Você pode editar o valor se precisar.");
        return;
      }

      if (!confirm("Deseja realmente apagar esta movimentação?")) return;

      this.transactions = this.transactions.filter(tr => tr.id !== t.id);

      if (this.editingId === t.id) {
        this.resetForm();
      }

      this.saveTransactions();
    }
  },

  mounted() {
    // Carregar do localStorage na inicialização
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          this.transactions = parsed;
        }
      }
    } catch (e) {
      console.error("Erro ao carregar do localStorage:", e);
    }
  }
};
</script>

<style scoped>
.finance-app {
  max-width: 960px;
  margin: auto;
}

/* Cabeçalho */
.app-header {
  background: linear-gradient(135deg, #198754, #0d6efd);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
}

/* Cards */
.resumo-card {
  border: none;
  border-radius: 1rem;
}

.resumo-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: #6c757d;
}

.resumo-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.resumo-icon {
  font-size: 2.3rem;
  opacity: 0.2;
}

/* Cores */
.resumo-income {
  background: #e9f7ef;
}

.resumo-expense {
  background: #fbe9e7;
}

.resumo-balance-positive {
  background: #e8f5e9;
}

.resumo-balance-negative {
  background: #ffebee;
}

.row-income {
  background-color: #f5fff7;
}

.row-expense {
  background-color: #fff7f5;
}

.small-icon {
  font-size: 0.9rem;
}
</style>
