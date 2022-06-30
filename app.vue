<script setup>
const DEFAULT_QUOTE = "AUD";
const DEFAULT_FIAT = "RUB";

const inputData = reactive({
  quote: DEFAULT_QUOTE,
  fiat: DEFAULT_FIAT,
});

const currenciesData = {
  buying: [
    "AUD",
    "GBP",
    "USDC",
    "IDRT",
    "BIDR",
    "BRL",
    "RUB",
    "TRY",
    "DAI",
    "UAH",
    "NGN",
    "EUR",
    "VAI",
  ],
  selling: [
    "AUD",
    "GBP",
    "USDC",
    "IDRT",
    "BIDR",
    "BRL",
    "RUB",
    "TRY",
    "DAI",
    "UAH",
    "NGN",
    "EUR",
    "VAI",
  ],
};

const symbols = ref([]);

getNewPrices({ symbols, inputData });

watch(inputData, async (newData, oldData) => {
  console.debug("INPUT CHANGED:", newData, oldData);
  getNewPrices({ symbols, inputData });
});

async function refreshData() {
  getNewPrices({ symbols, inputData });
}
function calcExchangeRate({ symbol, price }, p2pPrice) {
  if (symbol.startsWith(inputData.quote)) {
    return price * p2pPrice;
  } else {
    return p2pPrice / price;
  }
}
async function getNewPrices({ symbols, inputData }) {
  symbols.value = [];
  let tickers = await $fetch("/api/get_ticker_prices", {
    params: {
      quote: inputData.quote,
      fiat: inputData.fiat,
    },
  });
  console.debug("got quotes ", tickers);
  const p2pPrices = await Promise.all(
    tickers.map(async (sym) => {
      const data = await $fetch("/api/get_p2p_price", {
        params: {
          symbol: sym.symbol,
          quote: inputData.quote,
          fiat: inputData.fiat,
        },
      });
      console.debug("Get result", data);
      const p2pPrice = data.price;
      return {
        ...sym,
        key: sym + sym.price,
        p2pPrice,
        baseSymbol: sym.symbol.replace(inputData.quote, ""),
        exchangeRate: calcExchangeRate(sym, p2pPrice),
      };
    })
  );
  symbols.value = p2pPrices.sort((a, b) => b.exchangeRate - a.exchangeRate);
}

const people = [
  { id: 1, name: "Durward Reynolds", unavailable: false },
  { id: 2, name: "Kenton Towne", unavailable: false },
  { id: 3, name: "Therese Wunsch", unavailable: false },
  { id: 4, name: "Benedict Kessler", unavailable: true },
  { id: 5, name: "Katelyn Rohan", unavailable: false },
];
const selectedPerson = ref(people[0]);
</script>
<template>
  <div class="bg-gray-100 h-screen p-6">
    <header class="_text:center">
      <h1>Exchange Currency via Crypto</h1>
    </header>
    <form>
      <CurrencySelector
        :selectedModel="inputData.quote"
        :selectedDisplay="inputData.quote"
        :options="currenciesData.buying"
      />

      <button @click="refreshData">Refresh Data</button>
    </form>

    <h2 v-if="symbols.length === 0">Loading...</h2>
    <ul>
      <li style="list-style: none" v-for="sym in symbols" :key="sym.key">
        <h3>{{ sym.baseSymbol }}</h3>
        <p>Price to buy with {{ inputData.quote }}: {{ sym.price }}</p>
        <p>Price to sell on p2p to {{ inputData.fiat }}: {{ sym.p2pPrice }}</p>
        <p>
          Exchange Rate: <b>{{ sym.exchangeRate }}</b>
        </p>
      </li>
    </ul>
  </div>
</template>

