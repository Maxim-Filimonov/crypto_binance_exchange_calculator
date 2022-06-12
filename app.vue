<script setup>
const DEFAULT_QUOTE = "AUD";
const DEFAULT_FIAT = "RUB";

const inputData = reactive({
  quote: DEFAULT_QUOTE,
  fiat: DEFAULT_FIAT,
});

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
</script>
<template>
  <div>
    <h1>Crypto Fiat Exchange</h1>
    <label>
      Buying crypto with:
      <select v-model="inputData.quote">
        <option>AUD</option>
        <option>GBP</option>
        <!-- <option>USDC</option> -->
        <option>IDRT</option>
        <option>BIDR</option>
        <option>BRL</option>
        <option>RUB</option>
        <option>TRY</option>
        <option>DAI</option>
        <option>UAH</option>
        <option>NGN</option>
        <!-- <option>USDP</option> -->
        <option>EUR</option>
        <!-- <option>TUSD</option> -->
        <option>VAI</option>
      </select>
    </label>
    <br />
    <label>
      Selling crypto to:
      <select v-model="inputData.fiat">
        <option>AUD</option>
        <option>GBP</option>
        <!-- <option>USDC</option> -->
        <option>IDRT</option>
        <option>BIDR</option>
        <option>BRL</option>
        <option>RUB</option>
        <option>TRY</option>
        <option>DAI</option>
        <option>UAH</option>
        <option>NGN</option>
        <!-- <option>USDP</option> -->
        <option>EUR</option>
        <!-- <option>TUSD</option> -->
        <option>VAI</option>
      </select>
    </label>
    <br />
    <button @click="refreshData">Refresh Data</button>

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

