## Possible pitfalls

1. `Wallet.calculateBalance()`: what if there are multiple transactions created by the same wallet in a single block?
    This could cause a problem because each created transaction's output would have different numbers for the "new" balance of that wallet.
    It currently looks like this case is not handled by the system.